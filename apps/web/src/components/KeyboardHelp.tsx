/**
 * KeyboardHelp Component
 *
 * Interactive keyboard shortcuts reference modal.
 * Shows all available shortcuts categorized by function.
 * Triggered by '?' key, searchable and scrollable.
 */

import React, { useState, useCallback, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  InputAdornment,
  Stack,
  Paper,
  Divider,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material'
import {
  Search as SearchIcon,
  Close as CloseIcon,
  Keyboard as KeyboardIcon,
} from '@mui/icons-material'

interface KeyboardHelpProps {
  open: boolean
  onClose: () => void
}

interface Shortcut {
  key: string
  description: string
  category: string
  altKey?: string
}

const SHORTCUTS: Shortcut[] = [
  // Navigation
  { key: 'E', description: 'Show Expand Project modal', category: 'Navigation' },
  { key: 'M', description: 'Toggle Mission Control', category: 'Navigation' },
  { key: 'D', description: 'Toggle Dependency Graph', category: 'Navigation' },
  { key: '?', description: 'Show keyboard shortcuts', category: 'Navigation' },
  { key: 'S', description: 'Open Spec Creation modal', category: 'Navigation' },
  { key: 'P', description: 'Pin current message', category: 'Navigation' },

  // Agent Control
  { key: 'Ctrl+Alt+Space', description: 'Start/Stop all agents', category: 'Agent Control' },
  { key: 'Ctrl+Alt+P', description: 'Pause all agents', category: 'Agent Control' },
  { key: 'Ctrl+Alt+R', description: 'Resume all agents', category: 'Agent Control' },

  // Chat & Input
  { key: 'Enter', description: 'Send message (chat)', category: 'Chat & Input' },
  { key: 'Shift+Enter', description: 'New line (chat)', category: 'Chat & Input' },
  { key: 'Ctrl+Z', description: 'Undo last action', category: 'Chat & Input' },
  { key: 'Ctrl+Y', description: 'Redo last action', category: 'Chat & Input' },

  // Debug Panel
  { key: 'Tab', description: 'Switch to next tab (Debug Panel)', category: 'Debug Panel' },
  { key: 'L', description: 'Switch to Logs tab', category: 'Debug Panel' },
  { key: 'T', description: 'Switch to Terminal tab', category: 'Debug Panel' },
  { key: 'P', description: 'Switch to Performance tab', category: 'Debug Panel' },

  // File Operations
  { key: 'Ctrl+O', description: 'Open file', category: 'File Operations' },
  { key: 'Ctrl+S', description: 'Save current file', category: 'File Operations' },
  { key: 'Ctrl+N', description: 'New file/project', category: 'File Operations' },
  { key: 'Ctrl+Shift+S', description: 'Save all files', category: 'File Operations' },

  // Search & Find
  { key: 'Ctrl+F', description: 'Find in current file', category: 'Search & Find' },
  { key: 'Ctrl+H', description: 'Replace in current file', category: 'Search & Find' },
  { key: 'Ctrl+Shift+F', description: 'Find in project', category: 'Search & Find' },
  { key: 'F3', description: 'Find next match', category: 'Search & Find' },

  // Project Management
  { key: 'Ctrl+Shift+P', description: 'Switch between projects', category: 'Project Management' },
  { key: 'Ctrl+Shift+D', description: 'Duplicate project', category: 'Project Management' },
  { key: 'Delete', description: 'Delete selected feature (confirm)', category: 'Project Management' },
]

const CATEGORIES = [
  'All',
  'Navigation',
  'Agent Control',
  'Chat & Input',
  'Debug Panel',
  'File Operations',
  'Search & Find',
  'Project Management',
]

export function KeyboardHelp({
  open,
  onClose,
}: KeyboardHelpProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!open) return

      if (event.key === '?') {
        event.preventDefault()
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [open, onClose])

  const filteredShortcuts = SHORTCUTS.filter(shortcut => {
    const matchesSearch = shortcut.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         shortcut.key.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || shortcut.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleCategoryChange = useCallback((_event: React.SyntheticEvent, newValue: string) => {
    setSelectedCategory(newValue)
  }, [])

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: '#0f172a',
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <KeyboardIcon sx={{ color: '#38bdf8' }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#f8fafc' }}>
            Keyboard Shortcuts
          </Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
            Press '?' to close this dialog
          </Typography>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2}>
          {/* Search */}
          <TextField
            fullWidth
            size="small"
            placeholder="Search shortcuts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#94a3b8' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: '#1e293b',
                '& fieldset': {
                  borderColor: '#334155',
                },
              },
              '& .MuiInputBase-input': {
                color: '#f8fafc',
              },
            }}
          />

          {/* Category Tabs */}
          <Tabs
            value={selectedCategory}
            onChange={handleCategoryChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                color: '#94a3b8',
                '&.Mui-selected': {
                  color: '#38bdf8',
                },
              },
              '& .MuiTabs-indicator': {
                bgcolor: '#38bdf8',
              },
            }}
          >
            {CATEGORIES.map(category => (
              <Tab
                key={category}
                label={`${category} (${category === 'All' ?
                  SHORTCUTS.length :
                  SHORTCUTS.filter(s => s.category === category).length})`}
                value={category}
              />
            ))}
          </Tabs>

          {/* Shortcuts List */}
          {filteredShortcuts.length === 0 ? (
            <Typography sx={{ color: '#94a3b8', textAlign: 'center', py: 4 }}>
              No shortcuts found for "{searchQuery}" in category "{selectedCategory}"
            </Typography>
          ) : (
            <Paper
              sx={{
                bgcolor: '#020617',
                border: '1px solid #1e293b',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              {CATEGORIES.slice(1).map(category =>
                filteredShortcuts.filter(s => s.category === category).length > 0 && (
                  <Box key={category}>
                    <Box
                      sx={{
                        px: 2,
                        py: 1.5,
                        bgcolor: '#1e293b',
                        borderBottom: '1px solid #334155',
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#f8fafc' }}>
                        {category}
                      </Typography>
                    </Box>
                    <List dense disablePadding>
                      {filteredShortcuts
                        .filter(shortcut => shortcut.category === category)
                        .map((shortcut, index) => (
                          <ListItem
                            key={`${shortcut.key}-${index}`}
                            sx={{
                              px: 2,
                              py: 1,
                              borderBottom: index < filteredShortcuts.filter(s => s.category === category).length - 1
                                ? '1px solid #1e293b' : 'none',
                            }}
                          >
                            <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%' }}>
                              <Chip
                                label={shortcut.key}
                                size="small"
                                sx={{
                                  bgcolor: '#38bdf8',
                                  color: '#fff',
                                  fontWeight: 600,
                                  fontFamily: 'monospace',
                                  minWidth: 60,
                                }}
                              />
                              <Typography sx={{ color: '#e2e8f0', flex: 1 }}>
                                {shortcut.description}
                              </Typography>
                            </Stack>
                          </ListItem>
                        ))}
                    </List>
                  </Box>
                )
              )}
            </Paper>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={onClose} sx={{ color: '#38bdf8' }}>
          Got it!
        </Button>
      </DialogActions>
    </Dialog>
  )
}