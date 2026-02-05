/**
 * ExpandProjectChat Component
 *
 * Chat interface for bulk feature generation/expansion.
 * Similar to SpecCreationChat but simpler - no image attachments.
 * Shows "Features created: X" message on completion.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  IconButton,
  Paper,
  Typography,
  TextField,
  Avatar,
  Tooltip,
  CircularProgress,
  Chip,
  Stack,
} from '@mui/material';
import {
  Close as CloseIcon,
  ArrowBack as BackIcon,
  Send as SendIcon,
  FlashOn as FlashOnIcon,
} from '@mui/icons-material';

interface ExpandProjectChatProps {
  open: boolean;
  onClose: () => void;
  projectName: string | null;
}

export type { ExpandProjectChatProps };

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  featuresCreated?: number;
}

export function ExpandProjectChat({
  open,
  onClose,
  projectName,
}: ExpandProjectChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    if (!projectName) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // WebSocket connection for real-time streaming
    const ws = new WebSocket(`wss://ade-api.getmytestdrive.com/api/expand/ws/${encodeURIComponent(projectName)}`);
    
    // Send expand message
    const expandMessage = {
      type: 'expand',
      prompt: inputValue,
    };
    ws.send(JSON.stringify(expandMessage));
    
    // Handle incoming messages
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'text':
          // Stream text response
          setMessages(prev => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage?.role === 'assistant') {
              return [
                ...prev.slice(0, -1),
                {
                  ...lastMessage,
                  content: lastMessage.content + data.content,
                },
              ];
            } else {
              return [
                ...prev,
                {
                  id: Date.now().toString(),
                  role: 'assistant',
                  content: data.content,
                  timestamp: new Date(),
                },
              ];
            }
          });
          break;
        
        case 'features_created':
          // Features were created
          setMessages(prev => [
            ...prev,
            {
              id: Date.now().toString(),
              role: 'assistant',
              content: `Features created: ${data.count}`,
              timestamp: new Date(),
              featuresCreated: data.count,
            },
          ]);
          break;
        
        case 'expansion_complete':
          // Expansion complete
          setMessages(prev => [
            ...prev,
            {
              id: Date.now().toString(),
              role: 'assistant',
              content: 'Expansion complete! New features have been added to your project.',
              timestamp: new Date(),
            },
          ]);
          setIsLoading(false);
          ws.close();
          break;
        
        case 'error':
          // Error occurred
          setMessages(prev => [
            ...prev,
            {
              id: Date.now().toString(),
              role: 'assistant',
              content: `Error: ${data.content}`,
              timestamp: new Date(),
            },
          ]);
          setIsLoading(false);
          ws.close();
          break;
      }
    };
    
    // Handle connection errors
    ws.onerror = () => {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Connection error. Please try again.',
          timestamp: new Date(),
        },
      ]);
      setIsLoading(false);
    };
    
    // Handle connection close
    ws.onclose = () => {
      setIsLoading(false);
    };
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleExitToProject = () => {
    onClose();
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: 'rgba(2, 6, 23, 0.9)',
        display: open ? 'flex' : 'none',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      <Paper
        sx={{
          width: '100%',
          height: '100%',
          maxWidth: '1400px',
          maxHeight: '900px',
          bgcolor: '#0f172a',
          borderRadius: 0,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.5)',
        }}
      >
        <Box
          sx={{
            p: 1.5,
            borderBottom: '1px solid #1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: '#1e293b',
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <IconButton onClick={handleExitToProject} color="primary">
              <BackIcon fontSize="small" />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#f8fafc' }}>
              Expand Project
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Typography variant="body2" sx={{ color: '#cbd5e1' }}>
              Project: {projectName ?? 'Unnamed Project'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#f8fafc' }}>
              {new Date().toLocaleTimeString()}
            </Typography>
          </Stack>

          <IconButton onClick={onClose} color="primary">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box
          ref={messagesEndRef}
          sx={{
            flex: 1,
            overflowY: 'auto',
            p: 1.5,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            bgcolor: '#020617',
          }}
        >
          {messages.length === 0 && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                textAlign: 'center',
                gap: 2,
              }}
            >
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: '#0f172a',
                  border: '2px solid #6366f1',
                }}
              >
                <Typography variant="h4" sx={{ color: '#38bdf8' }}>
                  🚀
                </Typography>
              </Avatar>
              <Typography variant="body1" sx={{ color: '#cbd5e1', maxWidth: 600 }}>
                Ready to expand your project with new features!
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#f8fafc' }}>
                {projectName ?? 'Unnamed Project'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8', maxWidth: 500 }}>
                 Describe the features you want to add, and I&apos;ll help create them
                 in bulk. You can say things like &quot;Add user authentication&quot;, &quot;Implement
                 payment flow&quot;, &quot;Create dashboard&quot;, etc.
              </Typography>
            </Box>
          )}

          {messages.map(message => (
            <Box
              key={message.id}
              sx={{
                display: 'flex',
                gap: 1,
                mb: 1,
                alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '70%',
              }}
            >
              {message.role === 'user' && (
                <Avatar sx={{ width: 32, height: 32, bgcolor: '#10b981' }}>
                  👤
                </Avatar>
              )}
              <Paper
                sx={{
                  p: 1.5,
                  bgcolor: message.role === 'user' ? '#1e293b' : '#0f172a',
                  border: '1px solid #374151',
                  borderRadius: 2,
                  maxWidth: '100%',
                }}
              >
                {message.content && (
                  <Typography
                    variant="body2"
                    sx={{
                      color: message.role === 'user' ? '#f8fafc' : '#e2e8f0',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {message.content}
                  </Typography>
                )}
                {message.featuresCreated !== undefined && (
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ mt: 1 }}
                  >
                    <Chip
                      icon={<FlashOnIcon style={{ fontSize: '14px', color: '#fbbf24' }} />}
                      label={`Features created: ${message.featuresCreated}`}
                      size="small"
                      sx={{
                        bgcolor: '#10b981',
                        color: '#fff',
                        '& .MuiChip-label': {
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          px: 1,
                          py: 0.5,
                        },
                      }}
                    />
                  </Stack>
                )}
              </Paper>
              {message.role === 'assistant' && (
                <Avatar sx={{ width: 32, height: 32, bgcolor: '#10b981' }}>
                  🤖
                </Avatar>
              )}
            </Box>
          ))}

          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={24} sx={{ color: '#38bdf8' }} />
            </Box>
          )}
        </Box>

        <Box
          sx={{
            p: 1.5,
            borderTop: '1px solid #1e293b',
            bgcolor: '#0f172a',
          }}
        >
          <TextField
            fullWidth
            multiline
            maxRows={3}
            minRows={1}
            placeholder="Describe features to add..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            sx={{
              bgcolor: '#1e293b',
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '& fieldset': {
                  border: '1px solid #6366f1',
                  borderColor: inputValue ? '#10b981' : '#6366f1',
                },
              },
              '& .MuiOutlinedInput-input': {
                color: '#f8fafc',
              },
              '& .MuiInputLabel-root': {
                color: '#94a3b8',
              },
            }}
            InputProps={{
              endAdornment: (
                <Stack direction="row" spacing={1}>
                  <Tooltip title="Send (Enter)">
                    <IconButton
                      size="small"
                      onClick={handleSend}
                      disabled={isLoading || !inputValue.trim()}
                      sx={{
                        bgcolor: '#10b981',
                        color: '#fff',
                        '&:hover': {
                          bgcolor: '#0ea5e9',
                        },
                        '&.Mui-disabled': {
                          bgcolor: '#4b5563',
                          color: '#94a3b8',
                        },
                      }}
                    >
                      {isLoading ? <CircularProgress size={16} color="inherit" /> : <SendIcon fontSize="small" />}
                    </IconButton>
                  </Tooltip>
                </Stack>
              ),
            }}
          />
        </Box>
      </Paper>
    </Box>
  );
}
