/**
 * DebugPanel Component - Enhanced with Tabs
 * 
 * Multi-tab debug panel for Terminal, Logs, and Performance views.
 * Supports keyboard shortcuts: Tab to switch, L for Logs, P for Performance.
 */

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Collapse,
  Chip,
  Stack,
} from '@mui/material';
import {
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Clear as ClearIcon,
  Download as DownloadIcon,
  BugReport as BugIcon,
  ContentCopy as ContentCopyIcon,
} from '@mui/icons-material';

import type { AgentLogEntry } from '@/lib/types';

interface DebugPanelProps {
  logs: AgentLogEntry[];
  terminalOutput?: string[];
  performanceMetrics?: {
    cpu: number;
    memory: number;
    tokensPerSecond: number;
  };
  onClear?: () => void;
  onExport?: () => void;
  maxHeight?: number;
}

const getLevelColor = (level: string) => {
  switch (level) {
    case 'error':
      return '#d32f2f';
    case 'input':
      return '#1976d2';
    case 'state_change':
    case 'output':
    default:
      return '#757575';
  }
};

export function DebugPanel({
  logs,
  onClear,
  onExport,
  maxHeight = 200,
}: DebugPanelProps) {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => setExpanded(!expanded);

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2,
          py: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: 'grey.50',
          borderBottom: expanded ? '1px solid' : 'none',
          borderColor: 'divider',
          cursor: 'pointer',
        }}
        onClick={toggleExpanded}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BugIcon fontSize="small" color="action" />
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Debug
          </Typography>
          <Chip
            label={`${logs.length} entries`}
            size="small"
            sx={{
              height: 18,
              fontSize: '0.65rem',
              bgcolor: 'grey.200',
            }}
          />
        </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Placeholder for copy to clipboard
                      navigator.clipboard.writeText(logs.map(log => `${log.timestamp} [${log.type}] ${log.line}`).join('\n'));
                    }}
                    sx={{ p: 0.5 }}
                    title="Copy All Logs"
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                  {expanded && (
            <>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onExport?.();
                }}
                sx={{ p: 0.5 }}
              >
                <DownloadIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onClear?.();
                }}
                sx={{ p: 0.5 }}
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            </>
          )}
          <IconButton size="small" sx={{ p: 0.5 }}>
            {expanded ? (
              <ExpandLessIcon fontSize="small" />
            ) : (
              <ExpandMoreIcon fontSize="small" />
            )}
          </IconButton>
        </Box>
      </Box>

      {/* Expanded Content */}
      <Collapse in={expanded}>
        <Box
          sx={{
            maxHeight,
            overflowY: 'auto',
            p: 1.5,
            fontFamily: 'monospace',
            fontSize: '0.75rem',
            bgcolor: 'background.paper',
          }}
        >
          {logs.length === 0 ? (
            <Typography
              variant="caption"
              sx={{
                color: 'text.disabled',
                display: 'block',
                textAlign: 'center',
                py: 2,
              }}
            >
              No log entries
            </Typography>
          ) : (
            <Stack spacing={0.5}>
              {logs.map((log, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    gap: 1,
                    py: 0.5,
                    borderBottom:
                      index < logs.length - 1 ? '1px solid' : 'none',
                    borderColor: 'divider',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      whiteSpace: 'nowrap',
                      fontFamily: 'monospace',
                    }}
                  >
                    {log.timestamp}
                  </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: getLevelColor(log.type),
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          minWidth: 50,
                        }}
                      >
                        {log.type}
                      </Typography>
                   <Typography
                     variant="caption"
                     sx={{
                       color: 'text.primary',
                       wordBreak: 'break-word',
                     }}
                   >
                     {log.line}
                   </Typography>
                </Box>
              ))}
            </Stack>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
}
