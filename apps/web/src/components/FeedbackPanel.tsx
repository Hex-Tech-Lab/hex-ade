/**
 * FeedbackPanel Component
 * 
 * A 3-4 line horizontal panel showing real-time updates from the LLM/Orchestrator.
 * Designed to look like a terminal ticker or system console.
 */

import React from 'react';
import { Box, Typography, keyframes } from '@mui/material';
import { Terminal as TerminalIcon } from '@mui/icons-material';

const scanline = keyframes`
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
`;

interface FeedbackPanelProps {
  messages: string[];
}

export function FeedbackPanel({ messages }: FeedbackPanelProps) {
  return (
    <Box
      sx={{
        mx: 2,
        mt: 1,
        p: 1.5,
        bgcolor: 'rgba(15, 23, 42, 0.6)',
        border: '1px solid',
        borderColor: 'rgba(56, 189, 248, 0.2)',
        borderRadius: 1,
        position: 'relative',
        overflow: 'hidden',
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03))',
          zIndex: 2,
          backgroundSize: '100% 2px, 3px 100%',
          pointerEvents: 'none',
        },
      }}
    >
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
        <TerminalIcon sx={{ fontSize: 18, color: 'primary.main', mt: 0.5 }} />
        <Box sx={{ flex: 1 }}>
          {messages.slice(0, 4).map((msg, idx) => (
            <Typography
              key={idx}
              variant="caption"
              sx={{
                display: 'block',
                fontFamily: 'monospace',
                color: idx === 0 ? 'primary.light' : 'text.secondary',
                fontSize: '0.75rem',
                lineHeight: 1.4,
                '&::before': {
                  content: '"> "',
                  opacity: 0.5,
                },
              }}
            >
              {msg}
            </Typography>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
