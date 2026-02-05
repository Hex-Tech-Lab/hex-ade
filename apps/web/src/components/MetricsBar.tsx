/**
 * MetricsBar Component - World Class 10x Density with Real-Time Updates
 * 
 * Redesigned to be an ultra-slim status bar with live WebSocket data.
 */

import React from 'react';
import { Box, Typography, LinearProgress, CircularProgress, Stack, Chip, Tooltip, Divider } from '@mui/material';
import {
  AccountBalanceWallet as WalletIcon,
  TrendingUp as TrendingIcon,
  Speed as SpeedIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import type { ProjectStats, WSProgressMessage } from '@/lib/types';

interface MetricsBarProps {
  stats: ProjectStats;
  statusMessage?: string;
  budgetUsed?: number;
  budgetTotal?: number;
  liveProgress?: WSProgressMessage | null;
  isConnected?: boolean;
}

export function MetricsBar({
  stats,
  statusMessage = 'Ready',
  budgetUsed = 0,
  budgetTotal = 10,
  liveProgress,
  isConnected = false,
}: MetricsBarProps) {
  const budgetPercentage = (budgetUsed / budgetTotal) * 100;
  
  // Use live progress if available, otherwise fall back to stats
  const displayPercentage = liveProgress?.percentage ?? stats.percentage;
  const displayPassing = liveProgress?.passing ?? stats.passing;
  const displayTotal = liveProgress?.total ?? stats.total;
  const displayInProgress = liveProgress?.in_progress ?? stats.in_progress;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        px: 2,
        py: 0.5, // Ultra-slim
        bgcolor: 'background.default',
        borderBottom: '1px solid',
        borderColor: 'divider',
        height: 32, // Fixed height for consistency
      }}
    >
      {/* Live Connection Indicator */}
      <Tooltip title={isConnected ? "Connected - Live updates active" : "Disconnected - Reconnecting..."}>
        <Chip
          size="small"
          icon={isConnected ? <CheckIcon sx={{ fontSize: 12 }} /> : <TrendingIcon sx={{ fontSize: 12 }} />}
          label={isConnected ? "LIVE" : "OFFLINE"}
          color={isConnected ? "success" : "default"}
          sx={{
            height: 18,
            fontSize: '0.6rem',
            '& .MuiChip-label': { px: 0.5 },
          }}
        />
      </Tooltip>

      <Divider orientation="vertical" flexItem sx={{ my: 1 }} />

      {/* Progress with Live Updates */}
      <Stack direction="row" spacing={1} alignItems="center">
        <CircularProgress
          variant="determinate"
          value={displayPercentage}
          size={14}
          thickness={6}
          color={isConnected ? "success" : "primary"}
        />
        <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.7rem', color: isConnected ? 'success.main' : 'text.primary' }}>
          {Math.round(displayPercentage)}%
          {liveProgress && (
            <SpeedIcon sx={{ fontSize: 10, ml: 0.5, verticalAlign: 'middle', color: 'success.main' }} />
          )}
        </Typography>
      </Stack>

      <Divider orientation="vertical" flexItem sx={{ my: 1 }} />

      {/* Features - Real-time Count */}
      <Stack direction="row" spacing={0.5} alignItems="center">
        <Typography variant="caption" color="text.secondary">Features:</Typography>
        <Typography variant="caption" sx={{ fontWeight: 600 }}>
          {displayPassing}/{displayTotal}
        </Typography>
        {displayInProgress > 0 && (
          <Chip
            size="small"
            label={`${displayInProgress} in progress`}
            color="warning"
            sx={{
              height: 16,
              fontSize: '0.55rem',
              ml: 0.5,
            }}
          />
        )}
      </Stack>

      <Divider orientation="vertical" flexItem sx={{ my: 1 }} />

      {/* Budget */}
      <Stack direction="row" spacing={1} alignItems="center">
        <WalletIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
        <Typography variant="caption" sx={{ fontWeight: 600 }}>${budgetUsed.toFixed(2)}</Typography>
        <Box sx={{ width: 40 }}>
           <LinearProgress 
             variant="determinate" 
             value={budgetPercentage} 
             sx={{ 
               height: 2, 
               borderRadius: 1,
               bgcolor: budgetPercentage > 80 ? 'error.light' : 'action.hover',
             }} 
           />
        </Box>
      </Stack>

      <Divider orientation="vertical" flexItem sx={{ my: 1 }} />

      {/* Ticker-style Status with Live Indicator */}
      <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1 }}>
        <Typography
          variant="caption"
          sx={{
            color: liveProgress ? 'success.main' : 'primary.light',
            fontWeight: 500,
            fontFamily: 'monospace',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {liveProgress 
            ? `● ${liveProgress.passing}/${liveProgress.total} features complete (${Math.round(liveProgress.percentage)}%)`
            : statusMessage
          }
        </Typography>
      </Stack>
    </Box>
  );
}
