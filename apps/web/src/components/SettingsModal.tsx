/**
 * SettingsModal Component
 *
 * Configuration form for agent settings.
 * Uses REST to save settings.
 */

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Paper,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  Chip,
} from '@mui/material';
import { Close as CloseIcon, Settings as SettingsIcon } from '@mui/icons-material';
import type { Settings, ModelInfo } from '@/lib/types';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  settings: Settings | null;
  availableModels: ModelInfo[] | null;
  onSave: (settings: Partial<Settings>) => Promise<void>;
  isLoading?: boolean;
}

export function SettingsModal({ open, onClose, settings, availableModels, onSave, isLoading = false }: SettingsModalProps) {
  const [yoloMode, setYoloMode] = React.useState(false);
  const [model, setModel] = React.useState('');
  const [testingAgentRatio, setTestingAgentRatio] = React.useState(1);
  const [playwrightHeadless, setPlaywrightHeadless] = React.useState(true);
  const [batchSize, setBatchSize] = React.useState(2);
  const [glmMode, setGlmMode] = React.useState(false);
  const [ollamaMode, setOllamaMode] = React.useState(false);

  React.useEffect(() => {
    if (settings) {
      setYoloMode(settings.yolo_mode);
      setModel(settings.model);
      setTestingAgentRatio(settings.testing_agent_ratio);
      setPlaywrightHeadless(settings.playwright_headless);
      setBatchSize(settings.batch_size);
      setGlmMode(settings.glm_mode);
      setOllamaMode(settings.ollama_mode);
    }
  }, [settings]);

  const handleSave = async () => {
    await onSave({
      yolo_mode: yoloMode,
      model,
      testing_agent_ratio: testingAgentRatio,
      playwright_headless: playwrightHeadless,
      batch_size: batchSize,
    });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { bgcolor: 'background.default' },
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SettingsIcon fontSize="small" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Settings
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" disabled={isLoading}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            {/* Agent Configuration */}
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.paper' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                AGENT CONFIGURATION
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* YOLO Mode */}
                <Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={yoloMode}
                        onChange={(e) => setYoloMode(e.target.checked)}
                        color="warning"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          YOLO Mode
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Skip test validation (faster, riskier)
                        </Typography>
                      </Box>
                    }
                  />
                </Box>

                {/* Model Selection */}
                <FormControl fullWidth>
                  <InputLabel>Claude Model</InputLabel>
                  <Select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    label="Claude Model"
                    disabled={!availableModels || availableModels.length === 0}
                  >
                    {availableModels?.map((m) => (
                      <MenuItem key={m.id} value={m.id}>
                        {m.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Testing Ratio */}
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Testing Agents per Coding Agent: {testingAgentRatio}
                  </Typography>
                  <Slider
                    value={testingAgentRatio}
                    onChange={(_, v) => setTestingAgentRatio(v as number)}
                    min={0}
                    max={3}
                    step={1}
                    marks={[
                      { value: 0, label: '0' },
                      { value: 1, label: '1' },
                      { value: 2, label: '2' },
                      { value: 3, label: '3' },
                    ]}
                    valueLabelDisplay="off"
                  />
                  <Typography variant="caption" color="text.secondary">
                    More testing agents = slower but safer
                  </Typography>
                </Box>

                {/* Batch Size */}
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Features per Agent Batch: {batchSize}
                  </Typography>
                  <Slider
                    value={batchSize}
                    onChange={(_, v) => setBatchSize(v as number)}
                    min={1}
                    max={3}
                    step={1}
                    marks={[
                      { value: 1, label: '1' },
                      { value: 2, label: '2' },
                      { value: 3, label: '3' },
                    ]}
                    valueLabelDisplay="off"
                  />
                  <Typography variant="caption" color="text.secondary">
                    Larger batches = faster but more complex tasks
                  </Typography>
                </Box>

                {/* Playwright Headless */}
                <Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={playwrightHeadless}
                        onChange={(e) => setPlaywrightHeadless(e.target.checked)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Playwright Headless
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Run browser tests invisibly
                        </Typography>
                      </Box>
                    }
                  />
                </Box>
              </Box>
            </Paper>

            {/* Environment Modes */}
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.paper' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                ENVIRONMENT MODES
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Chip
                  label={`GLM: ${glmMode ? 'ON' : 'OFF'}`}
                  size="small"
                  color={glmMode ? 'primary' : 'default'}
                  sx={{ fontWeight: 600 }}
                />
                <Chip
                  label={`Ollama: ${ollamaMode ? 'ON' : 'OFF'}`}
                  size="small"
                  color={ollamaMode ? 'primary' : 'default'}
                  sx={{ fontWeight: 600 }}
                />
              </Box>

              {yoloMode && (
                <Alert severity="warning" sx={{ mt: 1 }}>
                  YOLO Mode skips test validation. Use with caution.
                </Alert>
              )}
            </Paper>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={isLoading}>
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}
