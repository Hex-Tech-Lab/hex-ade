/**
 * DevServerControl Component
 * 
 * MUI IconButton toolbar for dev server control.
 * Clean, compact design with tooltips.
 */

import React from 'react';
import {
  IconButton,
  Tooltip,
  Box,
  Button,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Public as GlobeIcon,
  Stop as StopIcon,
  OpenInNew as OpenInNewIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import type { DevServerStatus } from '@/lib/types';

export type { DevServerStatus };

interface DevServerControlProps {
  projectName?: string | null;
  status: DevServerStatus;
  url: string | null;
  onStart: () => void;
  onStop: () => void;
  isLoading?: boolean;
}

export function DevServerControl({
  status,
  url,
  onStart,
  onStop,
  isLoading = false,
}: DevServerControlProps) {
  const isStopped = status === 'stopped' || status === 'crashed';
  const isRunning = status === 'running';
  const isCrashed = status === 'crashed';

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      {isStopped ? (
        <Tooltip
          title={isCrashed ? 'Dev Server Crashed - Click to Restart' : 'Start Dev Server'}
        >
          <IconButton
            onClick={onStart}
            disabled={isLoading}
            size="small"
            color={isCrashed ? 'error' : 'default'}
            sx={{
              border: '1px solid',
              borderColor: isCrashed ? 'error.main' : 'divider',
            }}
          >
            {isLoading ? (
              <CircularProgress size={18} />
            ) : isCrashed ? (
              <WarningIcon fontSize="small" />
            ) : (
              <GlobeIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Stop Dev Server">
          <IconButton
            onClick={onStop}
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

      {/* URL Link when running */}
      {isRunning && url && (
        <Button
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          size="small"
          endIcon={<OpenInNewIcon fontSize="small" />}
          sx={{
            textTransform: 'none',
            fontFamily: 'monospace',
            fontSize: '0.75rem',
          }}
        >
          {url.replace(/^https?:\/\//, '')}
        </Button>
      )}

      {/* Status indicator */}
      <Chip
        size="small"
        label={isRunning ? 'Running' : isCrashed ? 'Crashed' : 'Stopped'}
        color={isRunning ? 'success' : isCrashed ? 'error' : 'default'}
        sx={{
          height: 20,
          fontSize: '0.65rem',
          '& .MuiChip-label': { px: 1 },
        }}
      />
    </Box>
  );
}
