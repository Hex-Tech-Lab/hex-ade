/**
 * ChatFlyover Component
 * 
 * A sliding drawer chat interface for interacting with the LLM.
 * Pushes/compresses the main layout rather than overlaying it.
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Stack,
  Divider,
} from '@mui/material';
import {
  Close as CloseIcon,
  Send as SendIcon,
  SmartToy as RobotIcon,
} from '@mui/icons-material';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatFlyoverProps {
  open: boolean;
  onClose: () => void;
  messages: Message[];
  onSendMessage: (text: string) => void;
}

export function ChatFlyover({ open, onClose, messages, onSendMessage }: ChatFlyoverProps) {
  const [inputValue, setInputValue] = useState('');

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  return (
    <Box
      sx={{
        width: open ? 380 : 0,
        height: '100%',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        borderLeft: open ? '1px solid' : 'none',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <RobotIcon color="primary" fontSize="small" />
          <Typography variant="subtitle2" fontWeight={600}>
            Project Assistant
          </Typography>
        </Stack>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      <Divider />

      {/* Messages */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {messages.map((msg) => (
          <Box
            key={msg.id}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '90%',
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: msg.role === 'user' ? 'primary.main' : 'rgba(255,255,255,0.05)',
                color: msg.role === 'user' ? 'primary.contrastText' : 'text.primary',
                border: msg.role === 'assistant' ? '1px solid' : 'none',
                borderColor: 'divider',
              }}
            >
              <Typography variant="body2">{msg.content}</Typography>
            </Box>
            <Typography variant="caption" sx={{ mt: 0.5, color: 'text.secondary', px: 0.5 }}>
              {msg.timestamp}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Input */}
      <Divider />
      <Box sx={{ p: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Type a message..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          InputProps={{
            endAdornment: (
              <IconButton size="small" color="primary" onClick={handleSend}>
                <SendIcon fontSize="small" />
              </IconButton>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: 'rgba(0,0,0,0.2)',
            },
          }}
        />
      </Box>
    </Box>
  );
}
