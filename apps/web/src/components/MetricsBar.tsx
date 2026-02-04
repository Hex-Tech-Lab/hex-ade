/**
 * MetricsBar Component - World Class 10x Density
 * 
 * Redesigned to be an ultra-slim status bar (Kimi style).
 */

import React from 'react';
import { Box, Typography, LinearProgress, CircularProgress, useTheme } from '@mui/material';
import {
  AccountBalanceWallet as WalletIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import type { ProjectStats } from '../lib/types';

interface MetricsBarProps {
  stats: ProjectStats;
  statusMessage?: string;
  budgetUsed?: number;
  budgetTotal?: number;
}

export function MetricsBar({
  stats,
  statusMessage = 'Ready',
  budgetUsed = 0,
  budgetTotal = 10,
}: MetricsBarProps) {
  const theme = useTheme();
  const budgetPercentage = (budgetUsed / budgetTotal) * 100;

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
      {/* Progress */}
      <Stack direction="row" spacing={1} alignItems="center">
        <CircularProgress
          variant="determinate"
          value={stats.percentage}
          size={14}
          thickness={6}
          color="primary"
        />
        <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.7rem', color: 'text.primary' }}>
          {Math.round(stats.percentage)}%
        </Typography>
      </Stack>

      <Divider orientation="vertical" flexItem sx={{ my: 1 }} />

      {/* Features */}
      <Stack direction="row" spacing={0.5} alignItems="center">
        <Typography variant="caption" color="text.secondary">Features:</Typography>
        <Typography variant="caption" sx={{ fontWeight: 600 }}>{stats.passing}/{stats.total}</Typography>
      </Stack>

      <Divider orientation="vertical" flexItem sx={{ my: 1 }} />

      {/* Budget */}
      <Stack direction="row" spacing={1} alignItems="center">
        <WalletIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
        <Typography variant="caption" sx={{ fontWeight: 600 }}>${budgetUsed.toFixed(2)}</Typography>
        <Box sx={{ width: 40 }}>
           <LinearProgress variant="determinate" value={budgetPercentage} sx={{ height: 2, borderRadius: 1 }} />
        </Box>
      </Stack>

      <Divider orientation="vertical" flexItem sx={{ my: 1 }} />

      {/* Ticker-style Status */}
      <Typography
        variant="caption"
        sx={{
          color: 'primary.light',
          fontWeight: 500,
          fontFamily: 'monospace',
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}
      >
        {statusMessage}
      </Typography>
    </Box>
  );
}

import { Stack, Divider } from '@mui/material';
