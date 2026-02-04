/**
 * FeatureModal Component
 *
 * View component for feature details.
 * No real-time updates (uses REST data).
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Grid,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  IconButton,
} from '@mui/material';
import {
  Close as CloseIcon,
  CheckCircle as CheckIcon,
  RadioButtonUnchecked as PendingIcon,
  Sync as InProgressIcon,
  Block as BlockedIcon,
  Delete as DeleteIcon,
  SkipNext as SkipIcon,
} from '@mui/icons-material';
import type { Feature } from '@/lib/types';

interface FeatureModalProps {
  feature: Feature | null;
  open: boolean;
  onClose: () => void;
  onUpdate?: (featureId: number, update: { category?: string; name?: string; description?: string; steps?: string[]; priority?: number }) => void;
  onDelete?: (featureId: number) => void;
  onSkip?: (featureId: number) => void;
}

type TabValue = 'details' | 'dependencies' | 'actions';

export function FeatureModal({ feature, open, onClose, onUpdate, onDelete, onSkip }: FeatureModalProps) {
  const [tab, setTab] = useState<TabValue>('details');
  const [editMode, setEditMode] = useState(false);
  const [editedFeature, setEditedFeature] = useState(feature);

  if (!feature) return null;

  const STATUS_CONFIG = {
    pending: { icon: <PendingIcon />, color: 'default', label: 'Pending' },
    in_progress: { icon: <InProgressIcon />, color: 'primary', label: 'In Progress' },
    done: { icon: <CheckIcon />, color: 'success', label: 'Done' },
    blocked: { icon: <BlockedIcon />, color: 'error', label: 'Blocked' },
  };

  const status = feature.in_progress ? 'in_progress' : feature.passes ? 'done' : (feature.blocked ? 'blocked' : 'pending');

  const handleSave = () => {
    if (editMode && onUpdate && editedFeature) {
      onUpdate(feature.id, {
        category: editedFeature.category,
        name: editedFeature.name,
        description: editedFeature.description,
        steps: editedFeature.steps,
        priority: editedFeature.priority,
      });
    }
    setEditMode(false);
  };

  const handleCancel = () => {
    setEditedFeature(feature);
    setEditMode(false);
  };

  const renderDetails = () => {
    const displayFeature = (editMode ? editedFeature : feature) ?? feature;

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Category & Priority */}
        <Grid container spacing={2}>
          <Grid size={6}>
            {editMode ? (
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={displayFeature.category}
                  onChange={(e) => setEditedFeature({ ...displayFeature, category: e.target.value })}
                  label="Category"
                >
                  <MenuItem value="FUNCTIONAL">Functional</MenuItem>
                  <MenuItem value="API">API</MenuItem>
                  <MenuItem value="UI">UI</MenuItem>
                  <MenuItem value="SECURITY">Security</MenuItem>
                </Select>
              </FormControl>
            ) : (
              <Box>
                <Typography variant="caption" color="text.secondary">Category</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>{displayFeature.category}</Typography>
              </Box>
            )}
          </Grid>
          <Grid size={6}>
            {editMode ? (
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={displayFeature.priority}
                  onChange={(e) => setEditedFeature({ ...displayFeature, priority: Number(e.target.value) })}
                  label="Priority"
                >
                  <MenuItem value={0}>P0 - Critical</MenuItem>
                  <MenuItem value={1}>P1 - High</MenuItem>
                  <MenuItem value={2}>P2 - Medium</MenuItem>
                  <MenuItem value={3}>P3 - Low</MenuItem>
                </Select>
              </FormControl>
            ) : (
              <Box>
                <Typography variant="caption" color="text.secondary">Priority</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>P{displayFeature.priority}</Typography>
              </Box>
            )}
          </Grid>
        </Grid>

        {/* Name */}
        {editMode ? (
          <TextField
            fullWidth
            label="Feature Name"
            value={displayFeature.name}
            onChange={(e) => setEditedFeature({ ...displayFeature, name: e.target.value })}
            variant="outlined"
          />
        ) : (
          <Box>
            <Typography variant="caption" color="text.secondary">Feature Name</Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>{displayFeature.name}</Typography>
          </Box>
        )}

        {/* Description */}
        {editMode ? (
          <TextField
            fullWidth
            label="Description"
            value={displayFeature.description}
            onChange={(e) => setEditedFeature({ ...displayFeature, description: e.target.value })}
            multiline
            rows={3}
            variant="outlined"
          />
        ) : (
          <Box>
            <Typography variant="caption" color="text.secondary">Description</Typography>
            <Typography variant="body2">{displayFeature.description}</Typography>
          </Box>
        )}

        {/* Implementation Steps */}
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Implementation Steps
          </Typography>
          {editMode ? (
            <TextField
              fullWidth
              label="Steps (one per line)"
              value={displayFeature.steps.join('\n')}
              onChange={(e) => setEditedFeature({ 
                ...displayFeature, 
                steps: e.target.value.split('\n').filter(s => s.trim()) 
              })}
              multiline
              rows={5}
              variant="outlined"
              helperText="Enter each step on a new line"
            />
          ) : (
            <List dense disablePadding>
              {displayFeature.steps.map((step, idx) => (
                <ListItem key={idx} disableGutters>
                  <ListItemIcon sx={{ minWidth: 24 }}>
                    {feature.passes ? <CheckIcon color="success" fontSize="small" /> : <PendingIcon fontSize="small" />}
                  </ListItemIcon>
                  <ListItemText primary={step} />
                </ListItem>
              ))}
            </List>
          )}
        </Box>

        {/* Status Badge */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" color="text.secondary">Status:</Typography>
            <Chip
            icon={STATUS_CONFIG[status].icon}
            label={STATUS_CONFIG[status].label}
            color={STATUS_CONFIG[status].color as 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'}
            size="small"
          />
          {feature.blocking_dependencies && feature.blocking_dependencies.length > 0 && (
            <Alert severity="warning" sx={{ flex: 1 }}>
              Blocked by: {feature.blocking_dependencies.join(', ')}
            </Alert>
          )}
        </Box>
      </Box>
    );
  };

  const renderDependencies = () => {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {feature.dependencies && feature.dependencies.length > 0 ? (
          <Alert severity="info">
            This feature depends on {feature.dependencies.length} other feature{feature.dependencies.length > 1 ? 's' : ''}
          </Alert>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No dependencies configured for this feature.
          </Typography>
        )}
        {feature.blocking_dependencies && feature.blocking_dependencies.length > 0 && (
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Blocking Features
            </Typography>
            <List dense>
              {feature.blocking_dependencies.map((depId) => (
                <ListItem key={depId}>
                  <ListItemText primary={`Feature #${depId}`} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Box>
    );
  };

  const renderActions = () => {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Alert severity="info">
          Actions for this feature
        </Alert>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {onSkip && !feature.passes && !feature.in_progress && (
            <Button
              startIcon={<SkipIcon />}
              onClick={() => onSkip(feature.id)}
              variant="outlined"
              size="small"
            >
              Skip Feature
            </Button>
          )}
          {onDelete && (
            <Button
              startIcon={<DeleteIcon />}
              onClick={() => onDelete(feature.id)}
              variant="outlined"
              color="error"
              size="small"
            >
              Delete Feature
            </Button>
          )}
        </Box>
      </Box>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { bgcolor: 'background.default' },
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Feature #{feature.id}: {feature.name}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {editMode ? (
            <>
              <Button onClick={handleCancel} size="small">Cancel</Button>
              <Button onClick={handleSave} variant="contained" size="small">Save</Button>
            </>
          ) : (
            <Button onClick={() => setEditMode(true)} variant="outlined" size="small">
              Edit
            </Button>
          )}
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pb: 0 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Details" value="details" />
          <Tab label="Dependencies" value="dependencies" />
          <Tab label="Actions" value="actions" />
        </Tabs>

        <Box sx={{ pt: 2 }}>
          {tab === 'details' && renderDetails()}
          {tab === 'dependencies' && renderDependencies()}
          {tab === 'actions' && renderActions()}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
