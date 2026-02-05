import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Select, MenuItem, TextField, Box, Stack, Typography, Chip,
} from '@mui/material';

export interface ScheduleConfig {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  time: string;        // HH:mm
  timezone: string;
  cronExpression?: string;
  dayOfWeek?: number;  // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
}

const TIMEZONES = [
  'UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London',
  'Europe/Paris', 'Asia/Tokyo', 'Asia/Shanghai', 'Australia/Sydney',
];

const generateCronExpression = (config: ScheduleConfig): string => {
  const [hours, minutes] = config.time.split(':');

  switch (config.frequency) {
    case 'daily':
      return `${minutes} ${hours} * * *`;  // Every day at HH:mm
    case 'weekly':
      return `${minutes} ${hours} * * ${config.dayOfWeek || 1}`;  // Weekly on day
    case 'monthly':
      return `${minutes} ${hours} ${config.dayOfMonth || 1} * *`;  // Monthly on day
    case 'custom':
      return config.cronExpression || '* * * * *';
    default:
      return '* * * * *';
  }
};

export interface ScheduleModalProps {
  open: boolean;
  onClose: () => void;
  onSchedule: (config: ScheduleConfig) => void;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  open, onClose, onSchedule,
}) => {
  const [config, setConfig] = useState<ScheduleConfig>({
    enabled: false,
    frequency: 'daily',
    time: '09:00',
    timezone: 'UTC',
  });

  const cronExpression = generateCronExpression(config);

  const handleSchedule = () => {
    onSchedule({
      ...config,
      cronExpression,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Schedule Project Expansion</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          {/* Frequency */}
          <Box>
            <label>Frequency</label>
            <Select
              fullWidth
              value={config.frequency}
              onChange={(e) => setConfig({ ...config, frequency: e.target.value as ScheduleConfig['frequency'] })}
            >
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="custom">Custom (Cron)</MenuItem>
            </Select>
          </Box>

          {/* Time */}
          <Box>
            <label>Time (HH:mm)</label>
            <TextField
              fullWidth
              type="time"
              value={config.time}
              onChange={(e) => setConfig({ ...config, time: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          {/* Day of Week (for Weekly) */}
          {config.frequency === 'weekly' && (
            <Box>
              <label>Day of Week</label>
              <Select
                fullWidth
                value={config.dayOfWeek || 1}
                onChange={(e) => setConfig({ ...config, dayOfWeek: e.target.value as number })}
              >
                <MenuItem value={0}>Sunday</MenuItem>
                <MenuItem value={1}>Monday</MenuItem>
                <MenuItem value={2}>Tuesday</MenuItem>
                <MenuItem value={3}>Wednesday</MenuItem>
                <MenuItem value={4}>Thursday</MenuItem>
                <MenuItem value={5}>Friday</MenuItem>
                <MenuItem value={6}>Saturday</MenuItem>
              </Select>
            </Box>
          )}

          {/* Day of Month (for Monthly) */}
          {config.frequency === 'monthly' && (
            <Box>
              <label>Day of Month</label>
              <Select
                fullWidth
                value={config.dayOfMonth || 1}
                onChange={(e) => setConfig({ ...config, dayOfMonth: e.target.value as number })}
              >
                {[1, 2, 3, 4, 5, 10, 15, 20, 25, 28].map(day => (
                  <MenuItem key={day} value={day}>{day}</MenuItem>
                ))}
              </Select>
            </Box>
          )}

          {/* Timezone */}
          <Box>
            <label>Timezone</label>
            <Select
              fullWidth
              value={config.timezone}
              onChange={(e) => setConfig({ ...config, timezone: e.target.value })}
            >
              {TIMEZONES.map(tz => (
                <MenuItem key={tz} value={tz}>{tz}</MenuItem>
              ))}
            </Select>
          </Box>

          {/* Cron Expression (for Custom) */}
          {config.frequency === 'custom' && (
            <Box>
              <label>Cron Expression</label>
              <TextField
                fullWidth
                placeholder="* * * * * (minute hour day month dayOfWeek)"
                value={config.cronExpression || ''}
                onChange={(e) => setConfig({ ...config, cronExpression: e.target.value })}
              />
            </Box>
          )}

          {/* Cron Preview */}
          <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="caption">Cron Expression</Typography>
            <Chip label={cronExpression} color="primary" variant="outlined" />
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSchedule} variant="contained">Schedule</Button>
      </DialogActions>
    </Dialog>
  );
};