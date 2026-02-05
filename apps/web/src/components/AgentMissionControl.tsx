/**
 * AgentMissionControl Component
 *
 * Enhanced orchestrator status display with real-time agent monitoring,
 * resource usage gauges, and mission control capabilities.
 * Connects directly to useProjectWebSocket for live updates.
 */

import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Chip,
  Avatar,
  Button,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import {
  Pause as PauseIcon,
  PlayCircle as ResumeIcon,
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
  onPauseAll,
  onResumeAll,
  isLoading = false,
}: AgentMissionControlProps) {
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

  const { state, message, codingAgents, testingAgents, maxConcurrency, readyCount, blockedCount } = orchestratorStatus;

  const totalActive = codingAgents + testingAgents;

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
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: 'action.hover',
                    transform: 'translateY(-2px)',
                    boxShadow: 1,
                  },
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
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                    #{agent.featureIds ? agent.featureIds[0] : agent.featureId}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    {agent.featureName}
                  </Typography>
                  
                  {/* Resource Usage Mini Bars */}
                  <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flex: 1 }}>
                      <CpuIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                      <LinearProgress
                        variant="determinate"
                        value={agent.cpuUsage}
                        sx={{ 
                          flex: 1, 
                          height: 4, 
                          borderRadius: 1,
                          bgcolor: 'action.hover',
                        }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flex: 1 }}>
                      <MemoryIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                      <LinearProgress
                        variant="determinate"
                        value={(agent.memoryUsage / 500) * 100}
                        sx={{ 
                          flex: 1, 
                          height: 4, 
                          borderRadius: 1,
                          bgcolor: 'action.hover',
                        }}
                      />
                    </Box>
                  </Box>
                  
                  {/* Stats Row */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                    <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.secondary' }}>
                      {agent.tasksCompleted} tasks
                    </Typography>
                  </Box>
                  
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
                        mt: 0.5,
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

      {/* Orchestrator Controls */}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {onPauseAll && state !== 'idle' && state !== 'complete' && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<PauseIcon />}
            onClick={onPauseAll}
            disabled={isLoading}
          >
            Pause All
          </Button>
        )}
        {onResumeAll && (state === 'idle' || state === 'complete') && (
          <Button
            variant="contained"
            size="small"
            startIcon={<ResumeIcon />}
            onClick={onResumeAll}
            disabled={isLoading}
          >
            Resume All
          </Button>
        )}
      </Box>
    </Box>
  );
}

