/**
 * SpecCreationChat Component
 *
 * Interactive chat with Claude for project specification creation.
 * Supports text messages, image attachments, and YOLO mode.
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
  Switch,
  Stack,
} from '@mui/material';
import {
  Close as CloseIcon,
  ArrowBack as BackIcon,
  Send as SendIcon,
  AttachFile as AttachIcon,
  FlashOn as FlashOnIcon,
} from '@mui/icons-material';

interface SpecCreationChatProps {
  open: boolean;
  onClose: () => void;
  projectName: string | null;
}

export type { SpecCreationChatProps };

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: string[];
}

export function SpecCreationChat({
  open,
  onClose,
  projectName,
}: SpecCreationChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [yoloMode, setYoloMode] = useState(false);
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() && attachedImages.length === 0) return;
    if (!projectName) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
      attachments: attachedImages,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setAttachedImages([]);
    setIsLoading(true);

    // WebSocket connection for real-time streaming
    const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const wsHost = isDev ? 'ws://localhost:8888' : 'wss://ade-api.getmytestdrive.com';
    const ws = new WebSocket(`${wsHost}/api/spec/ws/${encodeURIComponent(projectName)}`);
    
    // Handle incoming messages
    ws.onopen = () => {
      // Send start message
      const startMessage = {
        type: 'start',
        yolo_mode: yoloMode,
      };
      ws.send(JSON.stringify(startMessage));
      
      // Send user message
      const wsMessage = {
        type: 'message',
        content: inputValue,
        attachments: attachedImages,
      };
      ws.send(JSON.stringify(wsMessage));
    };

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
        
        case 'spec_complete':
          // Spec creation complete
          setMessages(prev => [
            ...prev,
            {
              id: Date.now().toString(),
              role: 'assistant',
              content: 'Specification creation complete! Your project is ready to go.',
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

  const handleAttachFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setAttachedImages(prev => [...prev, base64]);
    };
    reader.readAsDataURL(file);
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
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.3)',
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
              Exit to Project
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
              Project: {projectName ?? 'Unnamed Project'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#f8fafc' }}>
              {new Date().toLocaleTimeString()}
            </Typography>
            <Chip
              icon={<FlashOnIcon style={{ fontSize: '14px', color: '#fbbf24' }} />}
              label="YOLO Mode"
              size="small"
              sx={{
                bgcolor: yoloMode ? '#fbbf24' : '#334155',
                color: yoloMode ? '#fff' : '#fbbf24',
                '& .MuiChip-label': {
                  fontWeight: 600,
                fontSize: '0.7rem',
                px: 1,
                py: 0.5,
                  '& .MuiSvgIcon-root': {
                    color: yoloMode ? '#fff' : '#fbbf24',
                  },
              },
              }}
              onClick={() => setYoloMode(!yoloMode)}
              deleteIcon={
                <Switch
                  checked={yoloMode}
                  size="small"
                  sx={{
                    color: '#fbbf24',
                  '&.MuiSwitch-thumb': {
                    width: 12,
                    height: 12,
                  },
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setYoloMode(!yoloMode);
                  }}
                />
              }
            />
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
                  border: '2px solid #38bdf8',
                }}
              >
                <Typography variant="h4" sx={{ color: '#38bdf8' }}>
                  🤖
                </Typography>
              </Avatar>
              <Typography variant="body1" sx={{ color: '#f8fafc' }}>
                Hello! I&apos;ll help you create a specification for your
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#f8fafc' }}>
                {projectName ?? 'Unnamed Project'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8', maxWidth: 600 }}>
                Hello! I&apos;ll help you create a specification for your
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#f8fafc' }}>
                {projectName ?? 'Unnamed Project'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8', maxWidth: 600 }}>
                app. Let&apos;s start with the basics. What kind of
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
                <Avatar sx={{ width: 32, height: 32, bgcolor: '#64748b' }}>
                  👤
                </Avatar>
              )}
              <Paper
                sx={{
                  p: 1.5,
                  bgcolor: message.role === 'user' ? '#1e293b' : '#0f172a',
                  border: '1px solid #334155',
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
                {message.attachments && message.attachments.length > 0 && (
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    {message.attachments.map((img, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          position: 'relative',
                          width: 100,
                          height: 100,
                        }}
                      >
                        <Box
                          component="img"
                          src={img}
                          alt="attachment"
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: 1,
                          }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => {
                            const updatedMessages = [...messages];
                            const msgIndex = updatedMessages.findIndex(m => m.id === message.id);
                            if (msgIndex >= 0) {
                              updatedMessages[msgIndex] = {
                                ...updatedMessages[msgIndex],
                                attachments: updatedMessages[msgIndex].attachments?.filter((_, i) => i !== idx) || [],
                              };
                              setMessages(updatedMessages);
                            }
                          }}
                          sx={{
                            position: 'absolute',
                            top: -8,
                            right: -8,
                            bgcolor: '#dc2626',
                            color: '#fff',
                            width: 20,
                            height: 20,
                            '&:hover': {
                              bgcolor: '#ef4444',
                            },
                          }}
                        >
                          ×
                        </IconButton>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Paper>
              {message.role === 'assistant' && (
                <Avatar sx={{ width: 32, height: 32, bgcolor: '#0f172a' }}>
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
          <Stack direction="row" spacing={1.5} alignItems="flex-end">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

            {attachedImages.length > 0 && (
              <Chip
                label={`${attachedImages.length} image${attachedImages.length > 1 ? 's' : ''}`}
                size="small"
                onDelete={() => setAttachedImages([])}
                deleteIcon={<AttachIcon />}
                sx={{
                  bgcolor: '#38bdf8',
                  color: '#fff',
                  '& .MuiChip-deleteIcon': {
                    color: '#fff',
                  },
                }}
              />
            )}

            <TextField
              fullWidth
              multiline
              maxRows={3}
              minRows={1}
              placeholder="Type a message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              sx={{
                bgcolor: '#1e293b',
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                '& fieldset': {
                    border: '1px solid #334155',
                    borderColor: inputValue ? '#38bdf8' : '#334155',
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
                    <Tooltip title="Attach Image (max 5MB, JPEG/PNG)">
                      <IconButton size="small" onClick={handleAttachFile} disabled={isLoading}>
                        <AttachIcon fontSize="small" sx={{ color: '#94a3b8' }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Send (Enter)">
                      <IconButton
                        size="small"
                        onClick={handleSend}
                        disabled={isLoading || (!inputValue.trim() && attachedImages.length === 0)}
                        sx={{
                          bgcolor: '#38bdf8',
                          color: '#fff',
                          '&:hover': {
                            bgcolor: '#0ea5e9',
                          },
                          '&.Mui-disabled': {
                            bgcolor: '#334155',
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
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
