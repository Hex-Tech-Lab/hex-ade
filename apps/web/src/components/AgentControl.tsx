/**
 * AgentControl Component
 *
 * Control panel for starting/stopping agents with concurrency slider.
 * Debounced save for settings updates.
 */

import React, { useState, useCallback } from 'react';
import {
  IconButton,
  Tooltip,
  Box,
  CircularProgress,
  Chip,
  Slider,
  Typography,
} from '@mui/material';
import {
  PlayArrow as StartIcon,
  Stop as StopIcon,
  Pause as PauseIcon,
  PlayCircle as PlayCircleIcon,
} from '@mui/icons-material';
import type { AgentStatus } from '@/lib/types';

interface AgentControlProps {
  projectName: string | null;
  status: AgentStatus;
  onStart: (concurrency: number, yoloMode: boolean) => void;
  onStop: () => void;
  onPause?: () => void;
  onResume?: () => void;
  isLoading?: boolean;
  currentConcurrency?: number | null;
  yoloMode?: boolean;
}

export type { AgentStatus };

export function AgentControl({
  projectName,
  status,
  onStart,
  onStop,
  onPause,
  onResume,
  isLoading = false,
  currentConcurrency = null,
  yoloMode = false,
}: AgentControlProps) {
  const [concurrency, setConcurrency] = useState(currentConcurrency || 3);

  const isStopped = status === 'stopped' || status === 'loading';
  const isRunning = status === 'running';
  const isPaused = status === 'paused';
  const isCrashed = status === 'crashed';

  const handleConcurrencyChange = useCallback((event: Event, newValue: number | number[]) => {
    const value = Array.isArray(newValue) ? newValue[0] : newValue;
    setConcurrency(value);
  }, []);

  const handleStart = useCallback(() => {
    if (projectName) {
      onStart(concurrency, yoloMode);
    }
  }, [concurrency, yoloMode, projectName, onStart]);

  const handleStop = useCallback(() => {
    onStop();
  }, [onStop]);

  const handlePause = useCallback(() => {
    if (onPause) {
      onPause();
    }
  }, [onPause]);

  const handleResume = useCallback(() => {
    if (onResume) {
      onResume();
    }
  }, [onResume]);

  const getStartTooltip = () => {
    if (isCrashed) return 'Agent Crashed - Click to Restart';
    if (isPaused) return 'Resume Agent';
    return 'Start Agent';
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      {isStopped || isPaused ? (
        <Tooltip title={getStartTooltip()}>
          <IconButton
            data-testid={isPaused ? "agent-resume-button" : "agent-start-button"}
            onClick={isPaused ? handleResume : handleStart}
            disabled={isLoading || !projectName}
            size="small"
            color={isCrashed ? 'error' : 'primary'}
            sx={{
              border: '1px solid',
              borderColor: isCrashed ? 'error.main' : 'divider',
            }}
          >
            {isLoading ? (
              <CircularProgress size={18} />
            ) : isPaused ? (
              <PlayCircleIcon fontSize="small" />
            ) : isCrashed ? (
              <StartIcon fontSize="small" />
            ) : (
              <StartIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Stop Agent">
          <IconButton
            data-testid="agent-stop-button"
            onClick={handleStop}
            disabled={isLoading}
            size="small"
            color="primary"
            sx={{
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
            }}
          >
            {isLoading ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <StopIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
      )}

      {isRunning && onPause && (
        <Tooltip title="Pause Agent">
          <IconButton
            data-testid="agent-pause-button"
            onClick={handlePause}
            disabled={isLoading}
            size="small"
            color="default"
          >
            <PauseIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      {projectName && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, minWidth: 120 }}>
          <Typography variant="caption" color="text.secondary">
            Concurrency
          </Typography>
          <Slider
            value={concurrency}
            onChange={handleConcurrencyChange}
            min={1}
            max={5}
            step={1}
            valueLabelDisplay="auto"
            marks={[
              { value: 1, label: '1' },
              { value: 2, label: '2' },
              { value: 3, label: '3' },
              { value: 4, label: '4' },
              { value: 5, label: '5' },
            ]}
            disabled={isLoading}
            sx={{
              height: 24,
              '& .MuiSlider-thumb': {
                width: 16,
                height: 16,
              },
            }}
          />
        </Box>
      )}

      <Tooltip title={isCrashed ? 'Agent Crashed' : isRunning ? 'Agent Running' : isPaused ? 'Agent Paused' : 'Agent Stopped'}>
        <Chip
          data-testid="agent-status-badge"
          size="small"
          label={isCrashed ? 'Crashed' : isRunning ? 'Running' : isPaused ? 'Paused' : 'Stopped'}
          color={isCrashed ? 'error' : isRunning ? 'success' : isPaused ? 'warning' : 'default'}
          sx={{
            height: 24,
            fontSize: '0.7rem',
            '& .MuiChip-label': { px: 1 },
          }}
        />
      </Tooltip>
    </Box>
  );
}
