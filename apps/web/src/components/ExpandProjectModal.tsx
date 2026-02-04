/**
 * ExpandProjectModal Component
 *
 * Modal wrapper for ExpandProjectChat component.
 * Triggered by keyboard shortcut 'E' or clicking expand button in KanbanBoard header.
 */

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stack,
} from '@mui/material';
import {
  Close as CloseIcon,
} from '@mui/icons-material';
import { ExpandProjectChat } from './ExpandProjectChat';

interface ExpandProjectModalProps {
  open: boolean;
  onClose: () => void;
  projectName: string | null;
}

export type { ExpandProjectModalProps };

export function ExpandProjectModal({
  open,
  onClose,
  projectName,
}: ExpandProjectModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: '#0f172a',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          bgcolor: '#0f172a',
          borderBottom: '1px solid #1e293b',
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#f8fafc' }}>
            Expand Project
          </Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
            {projectName || 'No project selected'}
          </Typography>
        </Stack>
      </DialogTitle>

      <DialogContent
        sx={{
          p: 0,
          bgcolor: '#020617',
          minHeight: 500,
        }}
      >
        <Box
          sx={{
            height: '100%',
            bgcolor: '#020617',
          }}
        >
          {projectName ? (
            <ExpandProjectChat
              open={true}
              projectName={projectName}
              onClose={onClose}
            />
          ) : (
            <Stack
              sx={{
                height: '100%',
                alignItems: 'center',
                justifyContent: 'center',
              gap: 2,
              textAlign: 'center',
              p: 4,
              bgcolor: '#020617',
              borderRadius: 2,
                border: '1px dashed #334155',
              }}
            >
              <Typography variant="h4" sx={{ color: '#38bdf8' }}>
                No Project Selected
              </Typography>
              <Typography variant="body1" sx={{ color: '#94a3b8', maxWidth: 600 }}>
                Please select a project from the dropdown before expanding features.
              </Typography>
            </Stack>
          )}
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          p: 2,
          bgcolor: '#0f172a',
          borderTop: '1px solid #1e293b',
          justifyContent: 'space-between',
        }}
      >
        <Button onClick={onClose} color="primary" startIcon={<CloseIcon />}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
