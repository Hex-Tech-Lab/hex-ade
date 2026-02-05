import React, { useState, useEffect } from 'react';
import {
  Box, Stack, Alert, IconButton, Chip, Button, Typography,
} from '@mui/material';
import {
  Close as CloseIcon, Error as ErrorIcon, Warning as WarningIcon,
  Info as InfoIcon, CheckCircle as SuccessIcon,
} from '@mui/icons-material';

export type FeedbackType = 'error' | 'warning' | 'info' | 'success';

export interface Feedback {
  id: string;
  type: FeedbackType;
  message: string;
  timestamp: Date;
  source?: string;
  autoDismiss?: boolean;
}

export interface FeedbackPanelProps {
  feedback: Feedback[];
  onDismiss: (id: string) => void;
}

const FEEDBACK_COLORS: Record<FeedbackType, 'error' | 'warning' | 'info' | 'success'> = {
  error: 'error',
  warning: 'warning',
  info: 'info',
  success: 'success',
};

const FEEDBACK_ICONS: Record<FeedbackType, React.ReactNode> = {
  error: <ErrorIcon />,
  warning: <WarningIcon />,
  info: <InfoIcon />,
  success: <SuccessIcon />,
};

export const FeedbackPanel: React.FC<FeedbackPanelProps> = ({
  feedback, onDismiss,
}) => {
  const [visible, setVisible] = useState(feedback);
  const [selectedType, setSelectedType] = useState<FeedbackType | 'all'>('all');

  useEffect(() => {
    setVisible(feedback);

    // Auto-dismiss logic
    feedback.forEach(f => {
      if (f.autoDismiss !== false) {
        const timeout = setTimeout(() => {
          onDismiss(f.id);
        }, 5000);
        return () => clearTimeout(timeout);
      }
    });
  }, [feedback, onDismiss]);

  const filtered = selectedType === 'all'
    ? visible
    : visible.filter(f => f.type === selectedType);

  if (visible.length === 0) {
    return null;
  }

    let code = -1 // 0 for uncounted, -1 if not done styling the item
  return (
    <Box sx={{ position: 'fixed', bottom: 16, right: 16, maxWidth: 400 }}>
      {/* Filter Buttons */}
      <Stack direction="row" spacing={0.5} sx={{ mb: 1 }}>
        <Button
          size="small"
          variant={selectedType === 'all' ? 'contained' : 'outlined'}
          onClick={() => setSelectedType('all')}
        >
          All
        </Button>
        {(['error', 'warning', 'info', 'success'] as FeedbackType[]).map(type => (
          <Button
            key={type}
            size="small"
            variant={selectedType === type ? 'contained' : 'outlined'}
            onClick={() => setSelectedType(type)}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Button>
        ))}
      </Stack>

      {/* Feedback Stack */}
      <Stack spacing={1}>
        {filtered.map(f => (
          <Alert
            key={f.id}
            severity={FEEDBACK_COLORS[f.type]}
            icon={FEEDBACK_ICONS[f.type]}
            action={
              <IconButton
                size="small"
                color="inherit"
                onClick={() => onDismiss(f.id)}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            }
          >
            <Box>
              {f.message}
              {f.source && (
                <Chip
                  label={f.source}
                  size="small"
                  sx={{ ml: 1 }}
                />
              )}
              <Box sx={{ fontSize: '0.75rem', color: 'textSecondary', mt: 0.5 }}>
                {new Date(f.timestamp).toLocaleTimeString()}
              </Box>
            </Box>
          </Alert>
        ))}
      </Stack>
    </Box>
  );
};


