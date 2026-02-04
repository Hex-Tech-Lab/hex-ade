/**
 * hex-ade Main Dashboard Page - 10x World Class Engineering
 * 
 * Re-engineered for extreme density, sleek dark theme, and modern 2026 aesthetics.
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Box, AppBar, Toolbar, Typography, IconButton, Stack, CircularProgress, Alert,
} from '@mui/material';
import {
  PlayArrow as PlayIcon, Stop as StopIcon,
  Chat as ChatIcon,
  Dashboard as DashIcon, Layers as LayersIcon,
} from '@mui/icons-material';
import type { ProjectStats } from '@/lib/types';
import { ProjectSelector } from '@/components/ProjectSelector';
import { DevServerControl } from '@/components/DevServerControl';
import { MetricsBar } from '@/components/MetricsBar';
import { KanbanBoard } from '@/components/KanbanBoard';
import { DebugPanel } from '@/components/DebugPanel';
import { FeedbackPanel } from '@/components/FeedbackPanel';
import { ChatFlyover } from '@/components/ChatFlyover';
import { useProjects, useFeatures } from '@/hooks/useProjects';
import { useProjectWebSocket } from '@/hooks/useWebSocket';
import { useAssistantChat } from '@/hooks/useAssistantChat';

const mockFeedback = [
  'ATLAS-VM: Step 4 ASSEMBLE complete. Selected GPT-4o-mini for role "Frontend Specialist".',
  'SCAN: Found 0 critical vulnerabilities in generated components.',
  'VALIDATE: PR-Sweeper identified "Refactor" class. Merging to develop...',
  'MEMORY: Learning persisted. "MUI v6" patterns indexed for future tasks.'
];

export default function Home() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [agentStatus, setAgentStatus] = useState<'stopped' | 'running'>('stopped');
  const [chatOpen, setChatOpen] = useState(false);
  
  // Load real projects from API
  const { data: apiData, isLoading: projectsLoading, error: projectsError } = useProjects();
  
  // Load features for selected project
  const { data: featuresData, isLoading: featuresLoading } = useFeatures(selectedProject);
  
  // WebSocket for real-time updates
  const { progress, logs, isConnected } = useProjectWebSocket(selectedProject);

  // Assistant Chat hook
  const { 
    messages: chatMessages, 
    sendMessage: sendChatMessage, 
    start: startChat,
    disconnect: disconnectChat 
  } = useAssistantChat({
    projectName: selectedProject || '',
  });

  // Start chat when project is selected
  useEffect(() => {
    if (selectedProject) {
      startChat();
    } else {
      disconnectChat();
    }
    return () => disconnectChat();
  }, [selectedProject, startChat, disconnectChat]);
  
  // Calculate stats from real data
  const allFeatures = featuresData 
    ? [...featuresData.pending, ...featuresData.in_progress, ...featuresData.done]
    : [];
  const stats: ProjectStats = featuresData ? {
    passing: allFeatures.filter(f => f.passes).length,
    in_progress: allFeatures.filter(f => f.in_progress).length,
    total: allFeatures.length,
    percentage: allFeatures.length > 0 
      ? (allFeatures.filter(f => f.passes).length / allFeatures.length) * 100 
      : 0
  } : { passing: 0, in_progress: 0, total: 0, percentage: 0 };
  
  // Show loading state
  if (projectsLoading) {
    return (
      <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', bgcolor: '#020617' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Show error state
  if (projectsError) {
    return (
      <Box sx={{ p: 3, bgcolor: '#020617', height: '100vh' }}>
        <Alert severity="error">
          Failed to load projects: {projectsError.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', width: '100%', bgcolor: '#020617', color: '#f8fafc' }}>
      {/* Side Slim Rail */}
      <Box sx={{ width: 48, borderRight: '1px solid #1e293b', display: { xs: 'none', md: 'flex' }, flexDirection: 'column', alignItems: 'center', py: 2, gap: 3, bgcolor: '#0f172a' }}>
         <DashIcon sx={{ color: 'primary.main', fontSize: 24 }} />
         <LayersIcon sx={{ color: '#64748b', fontSize: 20 }} />
      </Box>

      {/* Main Column */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Bar (40px) */}
        <AppBar position="static" elevation={0} sx={{ height: 40, bgcolor: '#0f172a', borderBottom: '1px solid #1e293b', justifyContent: 'center' }}>
          <Toolbar variant="dense" sx={{ minHeight: '40px !important', px: 1.5 }}>
            <Typography variant="overline" sx={{ fontWeight: 900, color: 'primary.main', mr: 2, fontSize: '0.7rem' }}>HEX-ADE</Typography>
            
            <Box sx={{ flex: 1 }} />
            
            <Stack direction="row" spacing={1} alignItems="center">
              <DevServerControl projectName={selectedProject} status="stopped" url={null} onStart={()=>{}} onStop={()=>{}} />
              <Box sx={{ width: 1, height: 16, bgcolor: '#1e293b' }} />
              <ProjectSelector 
                projects={apiData?.projects || []} 
                selectedProject={selectedProject} 
                onSelectProject={setSelectedProject} 
                isLoading={projectsLoading} 
              />
              <IconButton size="small" color={agentStatus === 'running' ? 'error' : 'primary'} onClick={() => setAgentStatus(agentStatus === 'running' ? 'stopped' : 'running')} sx={{ '&:focus': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 } }}>
                {agentStatus === 'running' ? <StopIcon fontSize="small" /> : <PlayIcon fontSize="small" />}
              </IconButton>
              <IconButton size="small" onClick={() => setChatOpen(!chatOpen)} color={chatOpen ? 'primary' : 'default'} sx={{ '&:focus': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 } }}>
                <ChatIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Toolbar>
        </AppBar>

        {/* Dense Info Stack */}
        <MetricsBar 
          stats={stats} 
          statusMessage={isConnected ? `Connected: ${selectedProject || 'No project'}` : 'Disconnected'} 
          budgetUsed={0.42} 
        />
        <FeedbackPanel messages={mockFeedback} />

        {/* Board */}
        <Box sx={{ flex: 1, p: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5, overflow: 'auto' }}>
          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            <KanbanBoard 
              pending={featuresData?.pending || []} 
              inProgress={featuresData?.in_progress || []} 
              done={featuresData?.done || []} 
              onFeatureClick={()=>{}} 
              activeAgents={[]}
            />
          </Box>
          <DebugPanel logs={logs.map(l => ({ ...l, type: 'output' as const }))} />
        </Box>
      </Box>

      {/* Flyover (Glassmorphic) */}
      <ChatFlyover 
        open={chatOpen} 
        onClose={() => setChatOpen(false)} 
        messages={chatMessages.map(m => ({
          id: m.id,
          role: m.role as 'user' | 'assistant',
          content: m.content,
          timestamp: m.timestamp.toLocaleTimeString()
        }))} 
        onSendMessage={sendChatMessage} 
      />
    </Box>
  );
}
