/**
 * New Project Wizard Page
 * 
 * Step-by-step project creation flow.
 */

'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  Stepper,
  Step,
  StepLabel,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const steps = ['Project Details', 'Configuration', 'Review & Create'];

export default function NewProjectPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    path: '',
    concurrency: 3,
  });

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handleCreate();
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleCreate = async () => {
    setLoading(true);
    setError(null);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Navigate to the project
    router.push(`/?project=${formData.name}`);
  };

  const isStepValid = () => {
    switch (activeStep) {
      case 0:
        return formData.name.length > 0 && formData.path.length > 0;
      case 1:
        return formData.concurrency >= 1 && formData.concurrency <= 5;
      default:
        return true;
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ mb: 3 }}>
        <Link href="/projects" passHref style={{ textDecoration: 'none' }}>
          <Button startIcon={<ArrowBackIcon />} color="inherit">
            Back to Projects
          </Button>
        </Link>
      </Box>

      <Typography variant="h4" fontWeight={600} gutterBottom>
        Create New Project
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper sx={{ p: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {activeStep === 0 && (
          <Stack spacing={3}>
            <Typography variant="h6" gutterBottom>
              Project Details
            </Typography>
            <TextField
              label="Project Name"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              helperText="A unique name for your project"
            />
            <TextField
              label="Project Path"
              fullWidth
              value={formData.path}
              onChange={(e) => setFormData({ ...formData, path: e.target.value })}
              helperText="Absolute path to the project directory"
              placeholder="/home/user/projects/my-app"
            />
          </Stack>
        )}

        {activeStep === 1 && (
          <Stack spacing={3}>
            <Typography variant="h6" gutterBottom>
              Configuration
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Default Concurrency</InputLabel>
              <Select
                value={formData.concurrency}
                label="Default Concurrency"
                onChange={(e) => setFormData({ ...formData, concurrency: Number(e.target.value) })}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <MenuItem key={n} value={n}>
                    {n} concurrent agent{n > 1 ? 's' : ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography variant="body2" color="text.secondary">
              Number of AI agents to run simultaneously when coding features.
            </Typography>
          </Stack>
        )}

        {activeStep === 2 && (
          <Stack spacing={3}>
            <Typography variant="h6" gutterBottom>
              Review & Create
            </Typography>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Project Name
              </Typography>
              <Typography variant="body1" gutterBottom>
                {formData.name}
              </Typography>
              
              <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
                Project Path
              </Typography>
              <Typography variant="body1" gutterBottom>
                {formData.path}
              </Typography>
              
              <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
                Default Concurrency
              </Typography>
              <Typography variant="body1">
                {formData.concurrency} agents
              </Typography>
            </Paper>
          </Stack>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0 || loading}
            onClick={handleBack}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={!isStepValid() || loading}
            endIcon={loading ? <CircularProgress size={20} /> : activeStep === steps.length - 1 ? <CheckIcon /> : <ArrowForwardIcon />}
          >
            {activeStep === steps.length - 1 ? 'Create Project' : 'Next'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
