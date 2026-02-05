import React, { useState, useMemo } from 'react';
import {
  Box, Button, Stack, TextField, List, ListItem, ListItemText,
  IconButton, Tooltip, Chip, Typography, Divider,
} from '@mui/material';
import {
  PushPin as PinIcon, Search as SearchIcon,
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

  const filtered = useMemo(() => {
    return conversations.filter(conv => {
      const matchesSearch = conv.content.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [conversations, searchTerm]);

  const pinned = conversations.filter(c => c.pinned);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Project Header */}
      {projectName && (
        <Box sx={{ p: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Project: {projectName}
          </Typography>
        </Box>
      )}

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