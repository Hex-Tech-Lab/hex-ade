/**
 * KanbanBoard Component
 * 
 * 3-column Kanban board with MUI Paper columns.
 * Subtle colors, professional corporate look.
 */

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Stack,
  useTheme,
} from '@mui/material';
import {
  Schedule as PendingIcon,
  Autorenew as ProgressIcon,
  CheckCircle as CompleteIcon,
} from '@mui/icons-material';
import type { Feature, ActiveAgent } from '@/lib/types';
import { FeatureCard } from './FeatureCard';

interface KanbanColumn {
  id: string;
  title: string;
  features: Feature[];
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

interface KanbanBoardProps {
  pending: Feature[];
  inProgress: Feature[];
  done: Feature[];
  onFeatureClick: (feature: Feature) => void;
  activeAgents?: ActiveAgent[];
}

export function KanbanBoard({
  pending,
  inProgress,
  done,
  onFeatureClick,
  activeAgents = [],
}: KanbanBoardProps) {
  const theme = useTheme();

  // Find active agent for a feature
  const getActiveAgentForFeature = (featureId: number): ActiveAgent | undefined => {
    return activeAgents.find((agent) => agent.featureId === featureId);
  };

  const columns: KanbanColumn[] = [
    {
      id: 'pending',
      title: 'Pending',
      features: pending,
      icon: <PendingIcon fontSize="small" />,
      color: '#757575',
      bgColor: '#f5f5f5',
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      features: inProgress,
      icon: <ProgressIcon fontSize="small" sx={{ animation: 'spin 2s linear infinite' }} />,
      color: '#1976d2',
      bgColor: '#e3f2fd',
    },
    {
      id: 'completed',
      title: 'Completed',
      features: done,
      icon: <CompleteIcon fontSize="small" />,
      color: '#2e7d32',
      bgColor: '#e8f5e9',
    },
  ];

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 2,
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {columns.map((column) => (
        <Paper
          key={column.id}
          elevation={0}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            overflow: 'hidden',
          }}
        >
          {/* Column Header */}
          <Box
            sx={{
              p: 1.5,
              bgcolor: column.bgColor,
              borderBottom: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ color: column.color }}>{column.icon}</Box>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  color: column.color,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                {column.title}
              </Typography>
            </Box>
            <Chip
              label={column.features.length}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.75rem',
                fontWeight: 600,
                bgcolor: `${column.color}20`,
                color: column.color,
              }}
            />
          </Box>

          {/* Column Content */}
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              p: 1.5,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
            }}
          >
            {column.features.length === 0 ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 100,
                  color: 'text.disabled',
                }}
              >
                <Typography variant="caption">No features</Typography>
              </Box>
            ) : (
              <Stack spacing={1.5}>
                {column.features.map((feature) => (
                  <FeatureCard
                    key={feature.id}
                    feature={feature}
                    onClick={() => onFeatureClick(feature)}
                    isInProgress={column.id === 'in-progress'}
                    allFeatures={[...pending, ...inProgress, ...done]}
                    activeAgent={getActiveAgentForFeature(feature.id)}
                  />
                ))}
              </Stack>
            )}
          </Box>
        </Paper>
      ))}
    </Box>
  );
}
