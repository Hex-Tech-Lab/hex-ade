"""
Agent Scheduler Service
=======================

APScheduler-based service for automated agent scheduling.
Manages time-based start/stop of agents with crash recovery and manual override tracking.
Now backed by Supabase PostgreSQL for persistent schedule storage.
"""

import asyncio
import logging
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Optional

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

logger = logging.getLogger(__name__)

# Constants
MAX_CRASH_RETRIES = 3
CRASH_BACKOFF_BASE = 10  # seconds


class SchedulerService:
    """
    APScheduler-based service for automated agent scheduling.
    """

    def __init__(self):
        from datetime import timezone as dt_timezone

        # CRITICAL: Use UTC timezone since all schedule times are stored in UTC
        self.scheduler = AsyncIOScheduler(timezone=dt_timezone.utc)
        self._started = False

    async def start(self):
        """Start the scheduler and load all existing schedules."""
        if self._started:
            return

        self.scheduler.start()
        self._started = True
        logger.info("Scheduler service started")

        # Check for active schedule windows on startup
        await self._check_missed_windows_on_startup()

        # Load all schedules from Supabase
        await self._load_all_schedules()

    async def stop(self):
        """Shutdown the scheduler gracefully."""
        if not self._started:
            return

        self.scheduler.shutdown(wait=False)
        self._started = False
        logger.info("Scheduler service stopped")

    async def _load_all_schedules(self):
        """Load schedules for all registered projects."""
        from ..agents.registry import list_registered_projects

        try:
            projects = list_registered_projects()
            total_loaded = 0
            for project_name, info in projects.items():
                project_path = Path(info.get("path", ""))
                if project_path.exists():
                    count = await self._load_project_schedules(project_name, project_path)
                    total_loaded += count
            if total_loaded > 0:
                logger.info(f"Loaded {total_loaded} schedule(s) across all projects")
        except Exception as e:
            logger.error(f"Error loading schedules: {e}")

    async def _load_project_schedules(self, project_name: str, project_dir: Path) -> int:
        """Load schedules for a single project. Returns count of schedules loaded.
        
        Now queries Supabase Postgres for schedules by project_name.
        """
        from ..api.database import Schedule, create_database

        try:
            _, SessionLocal = create_database(project_dir)
            db = SessionLocal()
            try:
                schedules = db.query(Schedule).filter(
                    Schedule.project_name == project_name,
                    Schedule.enabled == True,  # noqa: E712
                ).all()

                for schedule in schedules:
                    await self.add_schedule(project_name, schedule, project_dir)

                if schedules:
                    logger.info(f"Loaded {len(schedules)} schedule(s) for project '{project_name}'")
                return len(schedules)
            finally:
                db.close()
        except Exception as e:
            logger.error(f"Error loading schedules for {project_name}: {e}")
            return 0

    async def add_schedule(self, project_name: str, schedule, project_dir: Path):
        """Create APScheduler jobs for a schedule."""
        try:
            days = self._bitfield_to_cron_days(schedule.days_of_week)
            hour, minute = map(int, schedule.start_time.split(":"))
            start_dt = datetime.strptime(schedule.start_time, "%H:%M")
            end_dt = start_dt + timedelta(minutes=schedule.duration_minutes)
            crosses_midnight = end_dt.date() != start_dt.date()
            end_hour = end_dt.hour
            end_minute = end_dt.minute

            start_job_id = f"schedule_{schedule.id}_start"
            start_trigger = CronTrigger(hour=hour, minute=minute, day_of_week=days, timezone=timezone.utc)
            self.scheduler.add_job(
                self._handle_scheduled_start,
                start_trigger,
                id=start_job_id,
                args=[project_name, schedule.id, str(project_dir)],
                replace_existing=True,
                misfire_grace_time=300,
            )

            stop_job_id = f"schedule_{schedule.id}_stop"
            if crosses_midnight:
                shifted_bitfield = self._shift_days_forward(schedule.days_of_week)
                stop_days = self._bitfield_to_cron_days(shifted_bitfield)
            else:
                stop_days = days

            stop_trigger = CronTrigger(hour=end_hour, minute=end_minute, day_of_week=stop_days, timezone=timezone.utc)
            self.scheduler.add_job(
                self._handle_scheduled_stop,
                stop_trigger,
                id=stop_job_id,
                args=[project_name, schedule.id, str(project_dir)],
                replace_existing=True,
                misfire_grace_time=300,
            )

            start_job = self.scheduler.get_job(start_job_id)
            stop_job = self.scheduler.get_job(stop_job_id)
            logger.info(
                f"Registered schedule {schedule.id} for {project_name}: "
                f"start at {hour:02d}:{minute:02d} UTC (next: {start_job.next_run_time}), "
                f"stop at {end_hour:02d}:{end_minute:02d} UTC (next: {stop_job.next_run_time})"
            )

        except Exception as e:
            logger.error(f"Error adding schedule {schedule.id}: {e}")

    def remove_schedule(self, schedule_id: int):
        """Remove APScheduler jobs for a schedule."""
        start_job_id = f"schedule_{schedule_id}_start"
        stop_job_id = f"schedule_{schedule_id}_stop"

        removed = []
        try:
            self.scheduler.remove_job(start_job_id)
            removed.append("start")
        except Exception:
            pass

        try:
            self.scheduler.remove_job(stop_job_id)
            removed.append("stop")
        except Exception:
            pass

        if removed:
            logger.info(f"Removed schedule {schedule_id} jobs: {', '.join(removed)}")
        else:
            logger.warning(f"No jobs found to remove for schedule {schedule_id}")

    async def _handle_scheduled_start(
        self, project_name: str, schedule_id: int, project_dir_str: str
    ):
        """Handle scheduled agent start."""
        logger.info(f"Scheduled start triggered for {project_name} (schedule {schedule_id})")
        project_dir = Path(project_dir_str)

        try:
            from ..api.database import Schedule, ScheduleOverride, create_database

            _, SessionLocal = create_database(project_dir)
            db = SessionLocal()

            try:
                schedule = db.query(Schedule).filter(Schedule.id == schedule_id).first()
                if not schedule or not schedule.enabled:
                    return

                now = datetime.now(timezone.utc)
                override = db.query(ScheduleOverride).filter(
                    ScheduleOverride.schedule_id == schedule_id,
                    ScheduleOverride.override_type == "stop",
                    ScheduleOverride.expires_at > now,
                ).first()

                if override:
                    logger.info(
                        f"Skipping scheduled start for {project_name}: "
                        f"manual stop override active until {override.expires_at}"
                    )
                    return

                schedule.crash_count = 0
                db.commit()

                await self._start_agent(project_name, project_dir, schedule)

            finally:
                db.close()

        except Exception as e:
            logger.error(f"Error in scheduled start for {project_name}: {e}")

    async def _handle_scheduled_stop(
        self, project_name: str, schedule_id: int, project_dir_str: str
    ):
        """Handle scheduled agent stop."""
        logger.info(f"Scheduled stop triggered for {project_name} (schedule {schedule_id})")
        project_dir = Path(project_dir_str)

        try:
            from ..api.database import Schedule, ScheduleOverride, create_database

            _, SessionLocal = create_database(project_dir)
            db = SessionLocal()

            try:
                schedule = db.query(Schedule).filter(Schedule.id == schedule_id).first()
                if not schedule:
                    logger.warning(f"Schedule {schedule_id} not found in database")
                    return

                if self._other_schedules_still_active(db, project_name, schedule_id):
                    logger.info(
                        f"Skipping scheduled stop for {project_name}: "
                        f"other schedules still active (latest stop wins)"
                    )
                    return

                now = datetime.now(timezone.utc)
                db.query(ScheduleOverride).filter(
                    ScheduleOverride.schedule_id == schedule_id,
                    ScheduleOverride.expires_at <= now,
                ).delete()
                db.commit()

                active_start_override = db.query(ScheduleOverride).filter(
                    ScheduleOverride.schedule_id == schedule_id,
                    ScheduleOverride.override_type == "start",
                    ScheduleOverride.expires_at > now,
                ).first()

                if active_start_override:
                    logger.info(
                        f"Skipping scheduled stop for {project_name}: "
                        f"active manual-start override (expires {active_start_override.expires_at})"
                    )
                    return

                await self._stop_agent(project_name, project_dir)

            finally:
                db.close()

        except Exception as e:
            logger.error(f"Error in scheduled stop for {project_name}: {e}")

    def _other_schedules_still_active(
        self, db, project_name: str, ending_schedule_id: int
    ) -> bool:
        """Check if any other schedule windows are still active."""
        from ..api.database import Schedule

        now = datetime.now(timezone.utc)
        schedules = db.query(Schedule).filter(
            Schedule.project_name == project_name,
            Schedule.enabled == True,  # noqa: E712
            Schedule.id != ending_schedule_id,
        ).all()

        for schedule in schedules:
            if self._is_within_window(schedule, now):
                return True
        return False

    def _is_within_window(self, schedule, now: datetime) -> bool:
        """Check if current time is within schedule window."""
        start_hour, start_minute = map(int, schedule.start_time.split(":"))
        start_time = now.replace(hour=start_hour, minute=start_minute, second=0, microsecond=0)
        end_time = start_time + timedelta(minutes=schedule.duration_minutes)
        crosses_midnight = end_time < start_time or end_time.date() != start_time.date()

        if crosses_midnight:
            if schedule.is_active_on_day(now.weekday()) and now >= start_time:
                return True
            yesterday = (now.weekday() - 1) % 7
            if schedule.is_active_on_day(yesterday):
                yesterday_start = start_time - timedelta(days=1)
                yesterday_end = end_time - timedelta(days=1)
                if yesterday_start <= now < yesterday_end:
                    return True
            return False
        else:
            return schedule.is_active_on_day(now.weekday()) and start_time <= now < end_time

    async def _start_agent(self, project_name: str, project_dir: Path, schedule):
        """Start the agent for a project."""
        from .process_manager import get_manager

        root_dir = Path(__file__).parent.parent.parent
        manager = get_manager(project_name, project_dir, root_dir)

        if manager.status in ("running", "paused"):
            logger.info(f"Agent already running for {project_name}, skipping scheduled start")
            return

        async def on_status_change(status: str):
            if status == "crashed":
                logger.info(f"Crash detected for {project_name}, attempting recovery")
                await self.handle_crash_during_window(project_name, project_dir)

        manager.add_status_callback(on_status_change)

        logger.info(
            f"Starting agent for {project_name} "
            f"(schedule {schedule.id}, yolo={schedule.yolo_mode}, concurrency={schedule.max_concurrency})"
        )
        success, msg = await manager.start(
            yolo_mode=schedule.yolo_mode,
            model=schedule.model,
            max_concurrency=schedule.max_concurrency,
        )

        if success:
            logger.info(f"✓ Agent started successfully for {project_name}")
        else:
            logger.error(f"✗ Failed to start agent for {project_name}: {msg}")
            manager.remove_status_callback(on_status_change)

    async def _stop_agent(self, project_name: str, project_dir: Path):
        """Stop the agent for a project."""
        from .process_manager import get_manager

        root_dir = Path(__file__).parent.parent.parent
        manager = get_manager(project_name, project_dir, root_dir)

        if manager.status not in ("running", "paused"):
            logger.info(f"Agent not running for {project_name}, skipping scheduled stop")
            return

        logger.info(f"Stopping agent for {project_name} (scheduled)")
        success, msg = await manager.stop()

        if success:
            logger.info(f"✓ Agent stopped successfully for {project_name}")
        else:
            logger.error(f"✗ Failed to stop agent for {project_name}: {msg}")

    async def handle_crash_during_window(self, project_name: str, project_dir: Path):
        """Called when agent crashes. Attempt restart with backoff."""
        from ..api.database import Schedule, create_database

        _, SessionLocal = create_database(project_dir)
        db = SessionLocal()

        try:
            now = datetime.now(timezone.utc)
            schedules = db.query(Schedule).filter(
                Schedule.project_name == project_name,
                Schedule.enabled == True,  # noqa: E712
            ).all()

            for schedule in schedules:
                if not self._is_within_window(schedule, now):
                    continue

                if schedule.crash_count >= MAX_CRASH_RETRIES:
                    logger.warning(
                        f"Max crash retries ({MAX_CRASH_RETRIES}) reached for "
                        f"schedule {schedule.id} on {project_name}"
                    )
                    continue

                schedule.crash_count += 1
                db.commit()

                delay = CRASH_BACKOFF_BASE * (3 ** (schedule.crash_count - 1))
                logger.info(
                    f"Restarting agent for {project_name} in {delay}s "
                    f"(attempt {schedule.crash_count})"
                )

                await asyncio.sleep(delay)
                await self._start_agent(project_name, project_dir, schedule)
                return 

        finally:
            db.close()

    def notify_manual_start(self, project_name: str, project_dir: Path):
        """Record manual start to prevent auto-stop."""
        logger.info(f"Manual start detected for {project_name}, creating override to prevent auto-stop")
        self._create_override_for_active_schedules(project_name, project_dir, "start")

    def notify_manual_stop(self, project_name: str, project_dir: Path):
        """Record manual stop to prevent auto-start."""
        logger.info(f"Manual stop detected for {project_name}, creating override to prevent auto-start")
        self._create_override_for_active_schedules(project_name, project_dir, "stop")

    def _create_override_for_active_schedules(
        self, project_name: str, project_dir: Path, override_type: str
    ):
        """Create overrides for all active schedule windows."""
        from ..api.database import Schedule, ScheduleOverride, create_database

        try:
            _, SessionLocal = create_database(project_dir)
            db = SessionLocal()

            try:
                now = datetime.now(timezone.utc)
                schedules = db.query(Schedule).filter(
                    Schedule.project_name == project_name,
                    Schedule.enabled == True,  # noqa: E712
                ).all()

                overrides_created = 0
                for schedule in schedules:
                    if not self._is_within_window(schedule, now):
                        continue

                    window_end = self._calculate_window_end(schedule, now)

                    deleted = db.query(ScheduleOverride).filter(
                        ScheduleOverride.schedule_id == schedule.id,
                        ScheduleOverride.override_type == override_type,
                    ).delete()

                    if deleted:
                        logger.debug(
                            f"Removed {deleted} existing '{override_type}' override(s) "
                            f"for schedule {schedule.id}"
                        )

                    override = ScheduleOverride(
                        schedule_id=schedule.id,
                        override_type=override_type,
                        expires_at=window_end,
                    )
                    db.add(override)
                    overrides_created += 1
                    logger.info(
                        f"Created '{override_type}' override for schedule {schedule.id} "
                        f"(expires at {window_end})"
                    )

                db.commit()
                if overrides_created > 0:
                    logger.info(f"Created {overrides_created} override(s) for {project_name}")

            finally:
                db.close()

        except Exception as e:
            logger.error(f"Error creating override for {project_name}: {e}")

    def _calculate_window_end(self, schedule, now: datetime) -> datetime:
        """Calculate when the current window ends."""
        start_hour, start_minute = map(int, schedule.start_time.split(":"))
        window_start = now.replace(
            hour=start_hour, minute=start_minute, second=0, microsecond=0
        )
        if now.replace(tzinfo=None) < window_start.replace(tzinfo=None):
            window_start = window_start - timedelta(days=1)

        window_end = window_start + timedelta(minutes=schedule.duration_minutes)
        return window_end

    async def _check_missed_windows_on_startup(self):
        """Called on server start. Start agents for any active windows."""
        from ..agents.registry import list_registered_projects

        try:
            now = datetime.now(timezone.utc)
            projects = list_registered_projects()

            for project_name, info in projects.items():
                project_dir = Path(info.get("path", ""))
                if not project_dir.exists():
                    continue

                await self._check_project_on_startup(project_name, project_dir, now)

        except Exception as e:
            logger.error(f"Error checking missed windows on startup: {e}")

    async def _check_project_on_startup(
        self, project_name: str, project_dir: Path, now: datetime
    ):
        """Check if a project should be started on server startup."""
        from ..api.database import Schedule, ScheduleOverride, create_database

        try:
            _, SessionLocal = create_database(project_dir)
            db = SessionLocal()

            try:
                schedules = db.query(Schedule).filter(
                    Schedule.project_name == project_name,
                    Schedule.enabled == True,  # noqa: E712
                ).all()

                for schedule in schedules:
                    if not self._is_within_window(schedule, now):
                        continue

                    override = db.query(ScheduleOverride).filter(
                        ScheduleOverride.schedule_id == schedule.id,
                        ScheduleOverride.override_type == "stop",
                        ScheduleOverride.expires_at > now,
                    ).first()

                    if override:
                        logger.info(
                            f"Skipping startup start for {project_name}: "
                            f"manual stop override active"
                        )
                        continue

                    logger.info(
                        f"Starting {project_name} for active schedule {schedule.id} "
                        f"(server startup)"
                    )
                    await self._start_agent(project_name, project_dir, schedule)
                    return 

            finally:
                db.close()

        except Exception as e:
            logger.error(f"Error checking startup for {project_name}: {e}")

    @staticmethod
    def _shift_days_forward(bitfield: int) -> int:
        """
        Shift the 7-bit day mask forward by one day for midnight-crossing schedules.
        """
        shifted = 0
        if bitfield & 1: shifted |= 2
        if bitfield & 2: shifted |= 4
        if bitfield & 4: shifted |= 8
        if bitfield & 8: shifted |= 16
        if bitfield & 16: shifted |= 32
        if bitfield & 32: shifted |= 64
        if bitfield & 64: shifted |= 1
        return shifted

    @staticmethod
    def _bitfield_to_cron_days(bitfield: int) -> str:
        """Convert days bitfield to APScheduler cron format."""
        days = []
        day_map = [
            (1, "mon"), (2, "tue"), (4, "wed"), (8, "thu"),
            (16, "fri"), (32, "sat"), (64, "sun"),
        ]
        for bit, name in day_map:
            if bitfield & bit:
                days.append(name)
        return ",".join(days) if days else "mon-sun"


_scheduler: Optional[SchedulerService] = None


def get_scheduler() -> SchedulerService:
    """Get the global scheduler instance."""
    global _scheduler
    if _scheduler is None:
        _scheduler = SchedulerService()
    return _scheduler


async def cleanup_scheduler():
    """Clean up scheduler on shutdown."""
    global _scheduler
    if _scheduler is not None:
        await _scheduler.stop()
        _scheduler = None