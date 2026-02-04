/**
 * FeatureCard Component - High Density
 * 
 * Minimalist design for fitting 10-20 cards in a column.
 */

import React from 'react';
import { Card, Box, Typography, Chip, Tooltip, useTheme } from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Circle as PendingIcon,
  Block as BlockIcon,
} from '@mui/icons-material';
import type { Feature, ActiveAgent } from '../lib/types';

interface FeatureCardProps {
  feature: Feature;
  onClick: () => void;
  isInProgress?: boolean;
  activeAgent?: ActiveAgent;
  allFeatures?: Feature[];
}

const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    FUNCTIONAL: '#38bdf8',
    API: '#818cf8',
    UI: '#10b981',
    SECURITY: '#ef4444',
  };
  return colors[category] || '#94a3b8';
};

export function FeatureCard({ feature, onClick, isInProgress, activeAgent, allFeatures }: FeatureCardProps) {
  const theme = useTheme();
  const categoryColor = getCategoryColor(feature.category);
  const isBlocked = feature.blocked || (feature.blocking_dependencies && feature.blocking_dependencies.length > 0);

  return (
    <Card
      onClick={onClick}
      sx={{
        p: 1,
        mb: 0.5,
        cursor: 'pointer',
        bgcolor: isInProgress ? 'rgba(56, 189, 248, 0.05)' : 'background.paper',
        border: '1px solid',
        borderColor: isInProgress ? 'primary.main' : 'divider',
        transition: 'all 0.1s ease',
        '&:hover': {
          borderColor: 'primary.light',
          transform: 'translateX(2px)',
        },
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
        {/* Status Dot */}
        <Box sx={{ mt: 0.3 }}>
          {feature.passes ? (
            <CheckIcon sx={{ fontSize: 14, color: 'success.main' }} />
          ) : isBlocked ? (
            <BlockIcon sx={{ fontSize: 14, color: 'error.main' }} />
          ) : (
            <PendingIcon sx={{ fontSize: 14, color: isInProgress ? 'primary.main' : 'text.disabled' }} />
          )}
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.2 }}>
             <Typography sx={{ fontSize: '0.65rem', color: categoryColor, fontWeight: 700, letterSpacing: 0.5 }}>
               {feature.category}
             </Typography>
             <Typography sx={{ fontSize: '0.6rem', color: 'text.secondary', fontFamily: 'monospace' }}>
               #{feature.priority}
             </Typography>
          </Box>
          
          <Typography noWrap sx={{ fontSize: '0.8rem', fontWeight: 600, color: 'text.primary', mb: 0.2 }}>
            {feature.name}
          </Typography>

          <Typography noWrap sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
            {feature.description}
          </Typography>
        </Box>
      </Box>

      {/* Mini Agent Indicator */}
      {activeAgent && (
        <Box sx={{ position: 'absolute', top: 0, right: 0, width: 4, height: '100%', bgcolor: 'primary.main' }} />
      )}
    </Card>
  );
}
