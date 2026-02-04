/**
 * NewProjectModal Component
 *
 * 4-step wizard for creating new projects.
 * Steps: Name → Folder → Spec Method → Confirm
 */

import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Stepper,
  Step,
  StepLabel,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Close as CloseIcon, Folder as FolderIcon } from '@mui/icons-material';

interface NewProjectModalProps {
  open: boolean;
  onClose: () => void;
  onCreateProject: (name: string, path: string, specMethod: 'claude' | 'manual') => Promise<void>;
  isLoading?: boolean;
}

type Step = 'name' | 'folder' | 'spec' | 'confirm';

export function NewProjectModal({ open, onClose, onCreateProject, isLoading = false }: NewProjectModalProps) {
  const [step, setStep] = useState<Step>('name');
  const [projectName, setProjectName] = useState('');
  const [folderPath, setFolderPath] = useState('');
  const [specMethod, setSpecMethod] = useState<'claude' | 'manual'>('claude');
  const [nameError, setNameError] = useState('');
  const [folderError, setFolderError] = useState('');

  const steps = ['Name', 'Folder', 'Spec Method', 'Confirm'];
  const currentStepIndex = steps.findIndex((s) => s.toLowerCase() === step);

  const validateName = useCallback((name: string): boolean => {
    if (!name.trim()) {
      setNameError('Project name is required');
      return false;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
      setNameError('Use only letters, numbers, dashes, and underscores');
      return false;
    }
    setNameError('');
    return true;
  }, []);

  const validateFolder = useCallback((path: string): boolean => {
    if (!path.trim()) {
      setFolderError('Folder path is required');
      return false;
    }
    if (!path.startsWith('/')) {
      setFolderError('Path must be absolute (start with /)');
      return false;
    }
    setFolderError('');
    return true;
  }, []);

  const handleNext = useCallback(() => {
    switch (step) {
      case 'name':
        if (validateName(projectName)) {
          setStep('folder');
        }
        break;
      case 'folder':
        if (validateFolder(folderPath)) {
          setStep('spec');
        }
        break;
      case 'spec':
        setStep('confirm');
        break;
      default:
        break;
    }
  }, [step, projectName, folderPath, validateName, validateFolder]);

  const handleBack = useCallback(() => {
    switch (step) {
      case 'folder':
        setStep('name');
        break;
      case 'spec':
        setStep('folder');
        break;
      case 'confirm':
        setStep('spec');
        break;
      default:
        break;
    }
  }, [step]);

  const handleCreate = useCallback(async () => {
    try {
      await onCreateProject(projectName, folderPath, specMethod);
      setStep('name');
      setProjectName('');
      setFolderPath('');
      setSpecMethod('claude');
      setNameError('');
      setFolderError('');
      onClose();
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  }, [projectName, folderPath, specMethod, onCreateProject, onClose]);

  const handleClose = useCallback(() => {
    setStep('name');
    setProjectName('');
    setFolderPath('');
    setSpecMethod('claude');
    setNameError('');
    setFolderError('');
    onClose();
  }, [onClose]);

  const handleBrowseFolder = useCallback(() => {
    setFolderPath('/home/user/projects/' + (projectName || 'my-app'));
  }, [projectName]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { bgcolor: 'background.default' },
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Create New Project
        </Typography>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Stepper activeStep={currentStepIndex} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {step === 'name' && (
          <Box sx={{ py: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Enter a unique project name (alphanumeric, dash, underscore)
            </Typography>
            <TextField
              autoFocus
              fullWidth
              label="Project Name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onBlur={() => validateName(projectName)}
              error={!!nameError}
              helperText={nameError || (projectName && !nameError ? '✓ Name is valid' : '')}
              placeholder="my-awesome-app"
              sx={{ mb: 2 }}
            />
          </Box>
        )}

        {step === 'folder' && (
          <Box sx={{ py: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Select the folder where your project will be created
            </Typography>
            <TextField
              fullWidth
              label="Project Folder"
              value={folderPath}
              onChange={(e) => setFolderPath(e.target.value)}
              onBlur={() => validateFolder(folderPath)}
              error={!!folderError}
              helperText={folderError || (folderPath && !folderError ? '✓ Folder is valid' : '')}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={handleBrowseFolder} size="small" edge="end">
                    <FolderIcon />
                  </IconButton>
                ),
              }}
              placeholder="/home/user/projects/my-app"
              sx={{ mb: 2 }}
            />
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.paper' }}>
              <Typography variant="caption" color="text.secondary">
                Selected: <strong>{folderPath || 'None'}</strong>
              </Typography>
            </Paper>
          </Box>
        )}

        {step === 'spec' && (
          <Box sx={{ py: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              How would you like to create your project specification?
            </Typography>
            <RadioGroup value={specMethod} onChange={(e) => setSpecMethod(e.target.value as 'claude' | 'manual')}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  mb: 2,
                  borderColor: specMethod === 'claude' ? 'primary.main' : 'divider',
                  bgcolor: specMethod === 'claude' ? 'action.hover' : 'background.paper',
                }}
              >
                <FormControlLabel
                  value="claude"
                  control={<Radio color="primary" />}
                  label={
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Create with Claude AI (Recommended)
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Interactive interview with Claude to define your app specification. Takes 5-10 minutes.
                      </Typography>
                    </Box>
                  }
                />
              </Paper>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderColor: specMethod === 'manual' ? 'primary.main' : 'divider',
                  bgcolor: specMethod === 'manual' ? 'action.hover' : 'background.paper',
                }}
              >
                <FormControlLabel
                  value="manual"
                  control={<Radio color="primary" />}
                  label={
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Manual (I&apos;ll Write It)
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Create empty project. You write spec.md manually in the prompts/ directory.
                      </Typography>
                    </Box>
                  }
                />
              </Paper>
            </RadioGroup>
          </Box>
        )}

        {step === 'confirm' && (
          <Box sx={{ py: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Review your project details before creating
            </Alert>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.paper' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Project Name:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{projectName}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Folder Path:</Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                    {folderPath}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Spec Method:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {specMethod === 'claude' ? 'Claude AI Interview' : 'Manual'}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        {step !== 'name' && (
          <Button onClick={handleBack} disabled={isLoading}>
            Back
          </Button>
        )}
        <Box sx={{ flex: 1 }} />
        <Button onClick={handleClose} disabled={isLoading}>
          Cancel
        </Button>
        {step === 'confirm' ? (
          <Button
            onClick={handleCreate}
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={16} /> : undefined}
          >
            Create Project
          </Button>
        ) : (
          <Button onClick={handleNext} variant="contained" disabled={isLoading || (step === 'name' && !!nameError) || (step === 'folder' && !!folderError)}>
            Next
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
