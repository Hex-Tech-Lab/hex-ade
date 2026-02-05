import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Select, MenuItem, FormControlLabel, Switch, Stack, Box,
} from '@mui/material';

export interface UserSettings {
  theme: 'dark' | 'light' | 'auto';
  fontSize: 'small' | 'medium' | 'large';
  autoScroll: boolean;
  notifications: {
    errors: boolean;
    warnings: boolean;
    info: boolean;
  };
  webSocketReconnect: {
    maxRetries: number;
    initialDelay: number;
  };
}

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'dark',
  fontSize: 'medium',
  autoScroll: true,
  notifications: { errors: true, warnings: true, info: false },
  webSocketReconnect: { maxRetries: 5, initialDelay: 1000 },
};

export interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (settings: UserSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  open, onClose, onSave,
}) => {
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem('hex-ade-settings');
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const handleSave = () => {
    localStorage.setItem('hex-ade-settings', JSON.stringify(settings));
    onSave(settings);
    onClose();
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Settings</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          {/* Theme Selection */}
          <Box>
            <label>Theme</label>
            <Select
              fullWidth
              value={settings.theme}
              onChange={(e) => setSettings({ ...settings, theme: e.target.value as UserSettings['theme'] })}
            >
              <MenuItem value="dark">Dark (Default)</MenuItem>
              <MenuItem value="light">Light</MenuItem>
              <MenuItem value="auto">Auto (System)</MenuItem>
            </Select>
          </Box>

          {/* Font Size */}
          <Box>
            <label>Font Size</label>
            <Select
              fullWidth
              value={settings.fontSize}
              onChange={(e) => setSettings({ ...settings, fontSize: e.target.value as UserSettings['fontSize'] })}
            >
              <MenuItem value="small">Small</MenuItem>
              <MenuItem value="medium">Medium (Default)</MenuItem>
              <MenuItem value="large">Large</MenuItem>
            </Select>
          </Box>

          {/* Debug Settings */}
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.autoScroll}
                  onChange={(e) => setSettings({ ...settings, autoScroll: e.target.checked })}
                />
              }
              label="Auto-scroll debug panel"
            />
          </Box>

          {/* Notifications */}
          <Box>
            <label>Notifications</label>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifications.errors}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, errors: e.target.checked },
                    })
                  }
                />
              }
              label="Show errors"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifications.warnings}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, warnings: e.target.checked },
                    })
                  }
                />
              }
              label="Show warnings"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifications.info}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, info: e.target.checked },
                    })
                  }
                />
              }
              label="Show info"
            />
          </Box>

          {/* WebSocket Settings */}
          <Box>
            <label>WebSocket Reconnection</label>
            <TextField
              fullWidth
              label="Max retries"
              type="number"
              value={settings.webSocketReconnect.maxRetries}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  webSocketReconnect: {
                    ...settings.webSocketReconnect,
                    maxRetries: parseInt(e.target.value, 10),
                  },
                })
              }
              inputProps={{ min: 1, max: 10 }}
            />
            <TextField
              fullWidth
              label="Initial delay (ms)"
              type="number"
              value={settings.webSocketReconnect.initialDelay}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  webSocketReconnect: {
                    ...settings.webSocketReconnect,
                    initialDelay: parseInt(e.target.value, 10),
                  },
                })
              }
              inputProps={{ min: 100, max: 5000 }}
            />
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleReset}>Reset</Button>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
};
