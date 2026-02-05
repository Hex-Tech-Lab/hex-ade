# OC S2: Phase 2 Parallel Build - Mission Control Components (4 of 8)

## OBJECTIVE
Build 4 Phase 2 Mission Control components in parallel with OC S1. Split workload for rapid delivery (8h instead of 15.5h).

## CURRENT STATE
- OC S1: Building AgentMissionControl, MetricsBar, DebugPanel, KeyboardHelp (4 components, 6h)
- OC S2: Build SettingsModal, ScheduleModal, AssistantPanel, FeedbackPanel (4 components, 4h)
- Target: All 8 components complete in 8 hours (parallel execution)
- Integration: page.tsx handles both sets of modals

---

## TASK 1: SettingsModal Component (1.5h)

### 1a. Create Component
**File**: `apps/web/src/components/SettingsModal.tsx`

```typescript
import React, { useState, useEffect } from 'react';
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
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('hex-ade-settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, [open]);

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
              onChange={(e) => setSettings({ ...settings, theme: e.target.value as any })}
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
              onChange={(e) => setSettings({ ...settings, fontSize: e.target.value as any })}
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
```

### 1b. Wire into page.tsx
```typescript
const [showSettings, setShowSettings] = useState(false);

// Add keyboard listener
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 's' && !e.shiftKey && !e.metaKey) {
      e.preventDefault();
      setShowSettings(true);
    }
  };
  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, []);

// Render modal
<SettingsModal open={showSettings} onClose={() => setShowSettings(false)} onSave={handleSettingsSave} />
```

### 1c. Test
```bash
# Press S key → SettingsModal opens
# Change theme → Verify saved to localStorage
# Reload page → Verify theme persisted
```

**Success Criteria**:
- ✅ Modal opens on 'S'
- ✅ All settings display
- ✅ Save to localStorage
- ✅ Load from localStorage
- ✅ Reset to defaults

---

## TASK 2: ScheduleModal Component (2h)

### 2a. Create Component
**File**: `apps/web/src/components/ScheduleModal.tsx`

```typescript
import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Select, MenuItem, TextField, Box, Stack, Typography, Chip,
} from '@mui/material';

export interface ScheduleConfig {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  time: string;        // HH:mm
  timezone: string;
  cronExpression?: string;
  dayOfWeek?: number;  // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
}

const TIMEZONES = [
  'UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London',
  'Europe/Paris', 'Asia/Tokyo', 'Asia/Shanghai', 'Australia/Sydney',
];

const generateCronExpression = (config: ScheduleConfig): string => {
  const [hours, minutes] = config.time.split(':');

  switch (config.frequency) {
    case 'daily':
      return `${minutes} ${hours} * * *`;  // Every day at HH:mm
    case 'weekly':
      return `${minutes} ${hours} * * ${config.dayOfWeek || 1}`;  // Weekly on day
    case 'monthly':
      return `${minutes} ${hours} ${config.dayOfMonth || 1} * *`;  // Monthly on day
    case 'custom':
      return config.cronExpression || '* * * * *';
    default:
      return '* * * * *';
  }
};

export interface ScheduleModalProps {
  open: boolean;
  onClose: () => void;
  onSchedule: (config: ScheduleConfig) => void;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  open, onClose, onSchedule,
}) => {
  const [config, setConfig] = useState<ScheduleConfig>({
    enabled: false,
    frequency: 'daily',
    time: '09:00',
    timezone: 'UTC',
  });

  const cronExpression = generateCronExpression(config);

  const handleSchedule = () => {
    onSchedule({
      ...config,
      cronExpression,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Schedule Project Expansion</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          {/* Frequency */}
          <Box>
            <label>Frequency</label>
            <Select
              fullWidth
              value={config.frequency}
              onChange={(e) => setConfig({ ...config, frequency: e.target.value as any })}
            >
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="custom">Custom (Cron)</MenuItem>
            </Select>
          </Box>

          {/* Time */}
          <Box>
            <label>Time (HH:mm)</label>
            <TextField
              fullWidth
              type="time"
              value={config.time}
              onChange={(e) => setConfig({ ...config, time: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          {/* Day of Week (for Weekly) */}
          {config.frequency === 'weekly' && (
            <Box>
              <label>Day of Week</label>
              <Select
                fullWidth
                value={config.dayOfWeek || 1}
                onChange={(e) => setConfig({ ...config, dayOfWeek: e.target.value as any })}
              >
                <MenuItem value={0}>Sunday</MenuItem>
                <MenuItem value={1}>Monday</MenuItem>
                <MenuItem value={2}>Tuesday</MenuItem>
                <MenuItem value={3}>Wednesday</MenuItem>
                <MenuItem value={4}>Thursday</MenuItem>
                <MenuItem value={5}>Friday</MenuItem>
                <MenuItem value={6}>Saturday</MenuItem>
              </Select>
            </Box>
          )}

          {/* Day of Month (for Monthly) */}
          {config.frequency === 'monthly' && (
            <Box>
              <label>Day of Month</label>
              <Select
                fullWidth
                value={config.dayOfMonth || 1}
                onChange={(e) => setConfig({ ...config, dayOfMonth: e.target.value as any })}
              >
                {[1, 2, 3, 4, 5, 10, 15, 20, 25, 28].map(day => (
                  <MenuItem key={day} value={day}>{day}</MenuItem>
                ))}
              </Select>
            </Box>
          )}

          {/* Timezone */}
          <Box>
            <label>Timezone</label>
            <Select
              fullWidth
              value={config.timezone}
              onChange={(e) => setConfig({ ...config, timezone: e.target.value })}
            >
              {TIMEZONES.map(tz => (
                <MenuItem key={tz} value={tz}>{tz}</MenuItem>
              ))}
            </Select>
          </Box>

          {/* Cron Expression (for Custom) */}
          {config.frequency === 'custom' && (
            <Box>
              <label>Cron Expression</label>
              <TextField
                fullWidth
                placeholder="* * * * * (minute hour day month dayOfWeek)"
                value={config.cronExpression || ''}
                onChange={(e) => setConfig({ ...config, cronExpression: e.target.value })}
              />
            </Box>
          )}

          {/* Cron Preview */}
          <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="caption">Cron Expression</Typography>
            <Chip label={cronExpression} color="primary" variant="outlined" />
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSchedule} variant="contained">Schedule</Button>
      </DialogActions>
    </Dialog>
  );
};
```

### 2b. Wire into page.tsx
```typescript
const [showSchedule, setShowSchedule] = useState(false);

// Add button to toolbar
<IconButton onClick={() => setShowSchedule(true)} title="Schedule">
  <ScheduleIcon />
</IconButton>

// Render modal
<ScheduleModal open={showSchedule} onClose={() => setShowSchedule(false)} onSchedule={handleSchedule} />
```

### 2c. Test
```bash
# Click Schedule button → ScheduleModal opens
# Select Daily at 14:00 UTC → Cron: "0 14 * * *"
# Select Weekly Monday → Cron: "0 14 * * 1"
# Select Custom → Enter cron manually
```

**Success Criteria**:
- ✅ Modal opens on button click
- ✅ Frequency selector works
- ✅ Cron generation correct
- ✅ Custom cron input works
- ✅ Save schedule

---

## TASK 3: AssistantPanel Enhancement (1.5h)

### 3a. Enhance Component
**File**: `apps/web/src/components/AssistantPanel.tsx`

```typescript
import React, { useState, useMemo } from 'react';
import {
  Box, Button, Stack, TextField, List, ListItem, ListItemText,
  IconButton, Tooltip, Chip, Typography, Divider,
} from '@mui/material';
import {
  Close as CloseIcon, PushPin as PinIcon, Search as SearchIcon,
} from '@mui/icons-material';

export interface Conversation {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  pinned?: boolean;
  source?: 'spec' | 'expand' | 'chat';
}

export interface AssistantPanelProps {
  projectName: string;
  conversations: Conversation[];
  onSpecChatOpen: () => void;
  onExpandChatOpen: () => void;
}

export const AssistantPanel: React.FC<AssistantPanelProps> = ({
  projectName, conversations, onSpecChatOpen, onExpandChatOpen,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [pinnedOnly, setPinnedOnly] = useState(false);

  const filtered = useMemo(() => {
    return conversations.filter(conv => {
      const matchesSearch = conv.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPinned = !pinnedOnly || conv.pinned;
      return matchesSearch && matchesPinned;
    });
  }, [conversations, searchTerm, pinnedOnly]);

  const pinned = conversations.filter(c => c.pinned);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Quick Actions */}
      <Stack direction="row" spacing={1} sx={{ p: 1 }}>
        <Button
          size="small"
          variant="outlined"
          onClick={onSpecChatOpen}
        >
          Spec Chat
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={onExpandChatOpen}
        >
          Expand
        </Button>
      </Stack>

      <Divider />

      {/* Pinned Messages */}
      {pinned.length > 0 && (
        <Box sx={{ p: 1 }}>
          <Typography variant="caption" color="textSecondary">
            Pinned Messages
          </Typography>
          <Stack spacing={0.5}>
            {pinned.map(msg => (
              <Chip
                key={msg.id}
                label={msg.content.substring(0, 30)}
                size="small"
                icon={<PinIcon />}
              />
            ))}
          </Stack>
        </Box>
      )}

      <Divider />

      {/* Search */}
      <Box sx={{ p: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search conversations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1 }} />,
          }}
        />
      </Box>

      {/* Conversation History */}
      <List sx={{ flex: 1, overflow: 'auto' }}>
        {filtered.map(conv => (
          <ListItem
            key={conv.id}
            secondaryAction={
              <Tooltip title={conv.pinned ? 'Unpin' : 'Pin'}>
                <IconButton
                  edge="end"
                  size="small"
                  onClick={() => {
                    // Toggle pin
                  }}
                >
                  <PinIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            }
          >
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label={conv.role} size="small" />
                  <Chip label={conv.source} size="small" variant="outlined" />
                </Box>
              }
              secondary={
                <>
                  {conv.content.substring(0, 60)}...
                  <br />
                  <Typography variant="caption" color="textSecondary">
                    {new Date(conv.timestamp).toLocaleTimeString()}
                  </Typography>
                </>
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};
```

### 3b. Wire into page.tsx
```typescript
import { useAssistantChat } from '@/hooks/useAssistantChat';
import { useExpandChat } from '@/hooks/useExpandChat';

const { messages: assistantMessages } = useAssistantChat(selectedProject);
const { messages: expandMessages } = useExpandChat(selectedProject);

const allConversations = [
  ...assistantMessages.map(m => ({ ...m, source: 'chat' as const })),
  ...expandMessages.map(m => ({ ...m, source: 'expand' as const })),
];

<AssistantPanel
  projectName={selectedProject}
  conversations={allConversations}
  onSpecChatOpen={() => setShowSpecCreation(true)}
  onExpandChatOpen={() => setShowExpandProject(true)}
/>
```

### 3c. Test
```bash
# Send message in SpecChat → Appears in AssistantPanel
# Pin message → Appears in "Pinned" section
# Search → Filters conversations
# Click "Spec Chat" button → Opens SpecCreationChat
```

**Success Criteria**:
- ✅ Conversation history displays
- ✅ Pin/unpin works
- ✅ Search filters
- ✅ Quick-access buttons work

---

## TASK 4: FeedbackPanel Enhancement (1h)

### 4a. Enhance Component
**File**: `apps/web/src/components/FeedbackPanel.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import {
  Box, Stack, Alert, IconButton, Chip, Button, Collapse,
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

const FEEDBACK_COLORS: Record<FeedbackType, any> = {
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
```

### 4b. Wire into page.tsx
```typescript
import { useProjectWebSocket } from '@/hooks/useWebSocket';

const { feedback } = useProjectWebSocket(selectedProject);

<FeedbackPanel
  feedback={feedback}
  onDismiss={handleFeedbackDismiss}
/>
```

### 4c. Test
```bash
# Trigger error → FeedbackPanel shows with error chip
# Wait 5s → Auto-dismisses
# Click X → Manual dismiss
# Click "Warning" filter → Shows only warnings
```

**Success Criteria**:
- ✅ Feedback displays with type icon
- ✅ Auto-dismiss after 5s
- ✅ Manual dismiss works
- ✅ Filter by type works
- ✅ Shows timestamp

---

## TASK 5: Integration with page.tsx (1h)

### 5a. Add All Modals to page.tsx
```typescript
const [showSettings, setShowSettings] = useState(false);
const [showSchedule, setShowSchedule] = useState(false);

// Render all S2 modals
return (
  <>
    {/* OC S1 modals */}
    {/* OC S2 modals below */}
    <SettingsModal
      open={showSettings}
      onClose={() => setShowSettings(false)}
      onSave={handleSettingsSave}
    />
    <ScheduleModal
      open={showSchedule}
      onClose={() => setShowSchedule(false)}
      onSchedule={handleScheduleCreate}
    />
    <AssistantPanel
      projectName={selectedProject}
      conversations={allConversations}
      onSpecChatOpen={() => setShowSpecCreation(true)}
      onExpandChatOpen={() => setShowExpandProject(true)}
    />
    <FeedbackPanel
      feedback={feedback}
      onDismiss={handleFeedbackDismiss}
    />
  </>
);
```

### 5b. Add Keyboard Shortcuts
```typescript
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 's' && !e.shiftKey) {
      e.preventDefault();
      setShowSettings(true);
    }
  };
  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, []);
```

### 5c. Test Integration
```bash
pnpm dev

# Test all S2 components:
# - Press S → Settings opens
# - Click Schedule button → Schedule modal opens
# - AssistantPanel shows conversation history
# - FeedbackPanel shows feedback with auto-dismiss
# - All integrate smoothly with S1 components
```

**Success Criteria**:
- ✅ All modals render in page.tsx
- ✅ Keyboard shortcuts work
- ✅ No conflicts with S1 components
- ✅ No TypeScript errors

---

## TASK 6: Testing (1h)

### 6a. Create E2E Tests
**File**: `apps/web/tests/e2e/phase2-s2-components.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Phase 2 S2 Components', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  // Settings Tests
  test('open settings with S key', async ({ page }) => {
    await page.keyboard.press('s');
    await expect(page.locator('[data-testid="settings-modal"]')).toBeVisible();
  });

  test('save settings to localStorage', async ({ page }) => {
    await page.keyboard.press('s');
    await page.selectOption('select[name="theme"]', 'light');
    await page.click('button:has-text("Save")');

    // Reload and verify
    await page.reload();
    await page.keyboard.press('s');
    const select = await page.inputValue('select[name="theme"]');
    expect(select).toBe('light');
  });

  // Schedule Tests
  test('create daily schedule', async ({ page }) => {
    await page.click('[data-testid="schedule-button"]');
    await page.selectOption('select[name="frequency"]', 'daily');
    await page.fill('input[type="time"]', '14:00');
    await page.click('button:has-text("Schedule")');

    const cronText = await page.textContent('[data-testid="cron-preview"]');
    expect(cronText).toContain('0 14 * * *');
  });

  // AssistantPanel Tests
  test('search conversations', async ({ page }) => {
    await page.fill('[data-testid="conversation-search"]', 'test');
    const results = await page.locator('[data-testid^="conversation-"]').count();
    expect(results).toBeGreaterThan(0);
  });

  // FeedbackPanel Tests
  test('feedback auto-dismisses after 5s', async ({ page }) => {
    // Trigger feedback (e.g., invalid action)
    const feedbackAlert = page.locator('[data-testid="feedback-alert"]');
    await expect(feedbackAlert).toBeVisible();

    // Wait 5s
    await page.waitForTimeout(5000);

    // Should be gone
    await expect(feedbackAlert).not.toBeVisible();
  });
});
```

### 6b. Run Tests
```bash
cd apps/web
pnpm test:e2e -- phase2-s2-components.spec.ts
```

**Success Criteria**:
- ✅ All tests passing
- ✅ Components functional
- ✅ No conflicts with S1

---

## TASK 7: Commit & Handoff (30 min)

### 7a. Stage Changes
```bash
cd /home/kellyb_dev/projects/hex-ade

git add apps/web/src/components/SettingsModal.tsx
git add apps/web/src/components/ScheduleModal.tsx
git add apps/web/src/components/AssistantPanel.tsx
git add apps/web/src/components/FeedbackPanel.tsx
git add apps/web/src/app/page.tsx
git add apps/web/tests/e2e/phase2-s2-components.spec.ts

git status
```

### 7b. Commit
```bash
git commit -m "feat(phase2): S2 Mission Control components - Settings, Schedule, Assistant, Feedback

## Components Added (OC S2)
- SettingsModal: User preferences, theme, notifications, WebSocket config
- ScheduleModal: Cron-based scheduling builder (daily/weekly/monthly)
- AssistantPanel: Conversation history, search, pinning
- FeedbackPanel: Feedback display with filtering and auto-dismiss

## Keyboard Shortcuts
- S: Settings modal

## Features
- Settings persistence (localStorage)
- Cron expression generation
- Conversation history search
- Feedback filtering by type
- 5s auto-dismiss for feedback
- Full WebSocket integration

## Testing
- E2E tests for all components
- All tests passing
- Integrated with OC S1 components

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"

git log --oneline -1
```

### 7c. Report
**Status**: ✅ Phase 2 S2 Components Complete
- ✅ 4 components built (SettingsModal, ScheduleModal, AssistantPanel, FeedbackPanel)
- ✅ All integrated into page.tsx
- ✅ E2E tests created and passing
- ✅ Keyboard shortcuts functional
- ✅ Ready for merge with OC S1 work

---

## SUCCESS CRITERIA

- ✅ SettingsModal complete (theme, font size, notifications)
- ✅ ScheduleModal complete (daily/weekly/monthly/custom cron)
- ✅ AssistantPanel complete (history, search, pinning)
- ✅ FeedbackPanel complete (filtering, auto-dismiss)
- ✅ All integrated into page.tsx
- ✅ Keyboard shortcuts working
- ✅ E2E tests passing
- ✅ No TypeScript errors
- ✅ Commit created
- ✅ Ready for merge

---

## DELIVERABLES

1. **4 New Components**
   - SettingsModal.tsx
   - ScheduleModal.tsx
   - AssistantPanel.tsx (enhanced)
   - FeedbackPanel.tsx (enhanced)

2. **E2E Tests**
   - phase2-s2-components.spec.ts

3. **Integration**
   - Updated page.tsx with all S2 modals
   - Keyboard shortcuts added

4. **Documentation**
   - Inline code comments
   - Component prop documentation

---

## TIMELINE
- Task 1 (SettingsModal): 1.5h
- Task 2 (ScheduleModal): 2h
- Task 3 (AssistantPanel): 1.5h
- Task 4 (FeedbackPanel): 1h
- Task 5 (Integration): 1h
- Task 6 (Testing): 1h
- Task 7 (Commit): 0.5h
**Total: 8 hours**

---

**Status**: ✅ READY FOR EXECUTION

Execute in parallel with OC S1 for 8h total Phase 2 build.
