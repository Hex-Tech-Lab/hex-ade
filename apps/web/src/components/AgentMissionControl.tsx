/**
 * AgentMissionControl Component
 *
 * Enhanced orchestrator status display with real-time agent monitoring,
 * resource usage gauges, and mission control capabilities.
 * Connects directly to useProjectWebSocket for live updates.
 */

import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Button,
  CircularProgress,
  LinearProgress,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  PlayArrow as StartIcon,
  Stop as StopIcon,
  Pause as PauseIcon,
  PlayCircle as ResumeIcon,
  Timeline as TimelineIcon,
  Storage as MemoryIcon,
  Speed as CpuIcon,
} from '@mui/icons-material';
import type {
  ActiveAgent,
  OrchestratorStatus,
  AgentState,
} from '@/lib/types';

interface AgentWithMetrics extends ActiveAgent {
  cpuUsage: number;        // 0-100%
  memoryUsage: number;     // MB
  tasksCompleted: number;
  currentTask: string;
  uptime: number;          // seconds
}

interface AgentMissionControlProps {
  orchestratorStatus: OrchestratorStatus | null;
  activeAgents: AgentWithMetrics[];
  projectName: string | null;
  onAgentClick?: (agentId: string) => void;
  onPauseAll?: () => void;
  onResumeAll?: () => void;
  isLoading?: boolean;
}

const STATE_COLORS: Record<AgentState, string> = {
  idle: 'default',
  thinking: 'info',
  working: 'primary',
  testing: 'warning',
  success: 'success',
  error: 'error',
  struggling: 'error',
};

const STATE_ICONS: Record<AgentState, string> = {
  idle: '○',
  thinking: '⟳',
  working: '⟳',
  testing: '⚙',
  success: '✓',
  error: '✗',
  struggling: '⚠',
};

export function AgentMissionControl({
  orchestratorStatus,
  activeAgents,
  projectName,
  onAgentClick,
  onPauseAll,
  onResumeAll,
  isLoading = false,
}: AgentMissionControlProps) {
  const [selectedAgent, setSelectedAgent] = useState<AgentWithMetrics | null>(null);
  const [agentDetailOpen, setAgentDetailOpen] = useState(false);

  if (!orchestratorStatus) {
    return (
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          bgcolor: 'background.paper',
          minHeight: 120,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isLoading ? (
          <CircularProgress size={24} />
        ) : (
          <Typography variant="body2" color="text.secondary">
            Loading mission control...
          </Typography>
        )}
      </Paper>
    );
  }

  const { state, message, codingAgents, testingAgents, maxConcurrency, readyCount, blockedCount, recentEvents } = orchestratorStatus;

  const totalActive = codingAgents + testingAgents;

  const handleAgentClick = (agent: AgentWithMetrics) => {
    setSelectedAgent(agent);
    setAgentDetailOpen(true);
    onAgentClick?.(agent.agentIndex.toString());
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {/* Orchestrator Status Card */}
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          bgcolor: 'background.paper',
          borderLeft: '4px solid',
          borderLeftColor: state === 'monitoring' ? 'success.main' : 'primary.main',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
            MISSION CONTROL
          </Typography>
          <Chip
            label={state}
            size="small"
            color={state === 'idle' || state === 'complete' ? 'default' : 'primary'}
            sx={{ fontWeight: 600, fontSize: '0.7rem' }}
          />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          {message}
        </Typography>
        <Grid container spacing={2}>
          <Grid size={3}>
            <Typography variant="caption" color="text.secondary">State</Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>{state}</Typography>
          </Grid>
          <Grid size={3}>
            <Typography variant="caption" color="text.secondary">Coding</Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>{codingAgents}/{maxConcurrency}</Typography>
          </Grid>
          <Grid size={3}>
            <Typography variant="caption" color="text.secondary">Testing</Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>{testingAgents}</Typography>
          </Grid>
          <Grid size={3}>
            <Typography variant="caption" color="text.secondary">Ready</Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>{readyCount}</Typography>
          </Grid>
          {blockedCount > 0 && (
            <Grid size={12} sx={{ mt: 1 }}>
              <Typography variant="caption" color="error.main">
                {blockedCount} feature{blockedCount > 1 ? 's are' : ' is'} blocked
              </Typography>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Active Agents Grid */}
      {totalActive > 0 && (
        <Grid container spacing={1}>
           {activeAgents.slice(0, maxConcurrency).map((agent) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={agent.agentIndex}>
              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  bgcolor: 'background.paper',
                  height: '100%',
                  borderLeft: '3px solid',
                  borderLeftColor: STATE_COLORS[agent.state],
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Avatar
                    sx={{
                      width: 28,
                      height: 28,
                      fontSize: '0.75rem',
                      bgcolor: agent.agentType === 'coding' ? 'purple.light' : 'blue.light',
                    }}
                  >
                    {agent.agentName[0]}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.7rem' }}>
                      Agent {agent.agentIndex}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                      {agent.agentType === 'coding' ? 'Coding' : 'Testing'}
                    </Typography>
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{ fontSize: '0.8rem', color: STATE_COLORS[agent.state] }}
                  >
                    {STATE_ICONS[agent.state]}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                    #{agent.featureIds ? agent.featureIds[0] : agent.featureId}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    {agent.featureName}
                  </Typography>
                  {agent.thought && (
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: '0.7rem',
                        fontStyle: 'italic',
                        color: 'text.secondary',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                     >
                       &ldquo;{agent.thought}&rdquo;
                     </Typography>
                  )}
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Activity Feed */}
      {recentEvents && recentEvents.length > 0 && (
        <Paper
          variant="outlined"
          sx={{
            p: 1.5,
            bgcolor: 'background.paper',
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.8rem', mb: 1 }}>
            Activity Feed (last 5 events)
          </Typography>
          <List dense disablePadding>
            {recentEvents.slice(0, 5).map((event, eventIdx) => (
              <React.Fragment key={event.timestamp}>
                <ListItem disableGutters sx={{ px: 0, py: 0.5 }}>
                  <ListItemText
                    primary={
                      <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                        {event.eventType}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        {event.featureName ? `#${event.featureId} ${event.featureName}: ` : ''}{event.message}
                      </Typography>
                    }
                  />
                </ListItem>
                {eventIdx < Math.min(recentEvents.length, 5) - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
}
