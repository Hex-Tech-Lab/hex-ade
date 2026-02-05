/**
 * hex-ade Main Dashboard Page - 10x World Class Engineering
 * 
 * Re-engineered for extreme density, sleek dark theme, and modern 2026 aesthetics.
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, AppBar, Toolbar, Typography, IconButton, Stack, CircularProgress, Alert, Tooltip,
} from '@mui/material';
import {
  Chat as ChatIcon,
  Dashboard as DashIcon, Layers as LayersIcon,
  AutoFixHigh as MagicIcon,
  Terminal as TerminalIcon,
} from '@mui/icons-material';
import type { ProjectStats } from '@/lib/types';
import { ProjectSelector } from '@/components/ProjectSelector';
import { AgentControl } from '@/components/AgentControl';
import { AgentMissionControl } from '@/components/AgentMissionControl';

import { MetricsBar } from '@/components/MetricsBar';
import { KanbanBoard } from '@/components/KanbanBoard';
import { DebugPanel } from '@/components/DebugPanel';
import { FeedbackPanel } from '@/components/FeedbackPanel';
import { ChatFlyover } from '@/components/ChatFlyover';
import { SpecCreationChat } from '@/components/SpecCreationChat';
import { ExpandProjectModal } from '@/components/ExpandProjectModal';
import { DependencyGraph } from '@/components/DependencyGraph';
import { useProjects, useFeatures } from '@/hooks/useProjects';
import { useProjectWebSocket } from '@/hooks/useWebSocket';
import { useAssistantChat } from '@/hooks/useAssistantChat';
import { getAgentStatus, startAgent, stopAgent } from '@/lib/api';

const mockFeedback = [
  'ATLAS-VM: Step 4 ASSEMBLE complete. Selected GPT-4o-mini for role "Frontend Specialist".',
  'SCAN: Found 0 critical vulnerabilities in generated components.',
  'VALIDATE: PR-Sweeper identified "Refactor" class. Merging to develop...',
  'MEMORY: Learning persisted. "MUI v6" patterns indexed for future tasks.'
];

export default function Home() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [agentStatus, setAgentStatus] = useState<'stopped' | 'running' | 'paused' | 'loading' | 'crashed'>('stopped');
  const [chatOpen, setChatOpen] = useState(false);
  const [agentLoading, setAgentLoading] = useState(false);
  const [currentConcurrency, setCurrentConcurrency] = useState<number | null>(null);
  const [yoloMode, setYoloMode] = useState(false);
  
  const [specCreationOpen, setSpecCreationOpen] = useState(false);
  const [expandProjectOpen, setExpandProjectOpen] = useState(false);
  const [dependencyGraphOpen, setDependencyGraphOpen] = useState(false);
  const [missionControlOpen, setMissionControlOpen] = useState(false);



  const handleSpecCreation = useCallback(() => {
    setSpecCreationOpen(true);
  }, []);

  const handleDependencyGraph = useCallback(() => {
    setDependencyGraphOpen(prev => !prev);
  }, []);

  const handleMissionControl = useCallback(() => {
    setMissionControlOpen(prev => !prev);
  }, []);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'e' && !event.shiftKey && !event.metaKey && !event.ctrlKey) {
        setExpandProjectOpen(prev => !prev);
      }
      if (event.key === 'm' && !event.shiftKey && !event.metaKey && !event.ctrlKey) {
        setMissionControlOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);
  
  // Load real projects from API
  const { data: apiData, isLoading: projectsLoading, error: projectsError } = useProjects();
  
  // Load features for selected project
  const { data: featuresData } = useFeatures(selectedProject);
  
  // WebSocket for real-time updates
  const { logs, isConnected, activeAgents, orchestratorStatus, progress } = useProjectWebSocket(selectedProject);

  // Map ActiveAgent to AgentWithMetrics with default metrics
  const agentsWithMetrics = activeAgents.map(agent => ({
    ...agent,
    cpuUsage: Math.floor(Math.random() * 30) + 10, // 10-40% simulated
    memoryUsage: Math.floor(Math.random() * 200) + 50, // 50-250MB simulated
    tasksCompleted: Math.floor(Math.random() * 10),
    currentTask: agent.featureName || 'Idle',
    uptime: Math.floor(Math.random() * 3600), // 0-1 hour simulated
  }));
  
  // Assistant Chat hook
  const { 
    messages: chatMessages, 
    sendMessage: sendChatMessage, 
    start: startChat,
    disconnect: disconnectChat 
  } = useAssistantChat({
    projectName: selectedProject || '',
  });

  // Fetch agent status when project changes
  useEffect(() => {
    const fetchAgentStatus = async () => {
      if (!selectedProject) return;
      
      try {
        const response = await getAgentStatus(selectedProject);
        setAgentStatus(response.status);
        setCurrentConcurrency(response.max_concurrency || 3);
        setYoloMode(response.yolo_mode || false);
      } catch (error) {
        console.error('Failed to fetch agent status:', error);
      }
    };

    fetchAgentStatus();
  }, [selectedProject]);

  // Start chat when project is selected
  useEffect(() => {
    if (selectedProject) {
      startChat();
    } else {
      disconnectChat();
    }
    return () => disconnectChat();
  }, [selectedProject, startChat, disconnectChat]);

  // Handle agent start
  const handleAgentStart = async (concurrency: number, yolo: boolean) => {
    if (!selectedProject) return;
    
    setAgentLoading(true);
    setAgentStatus('loading');
    
    try {
      await startAgent(selectedProject, {
        yoloMode: yolo,
        maxConcurrency: concurrency,
      });
      setCurrentConcurrency(concurrency);
      setYoloMode(yolo);
    } catch (error) {
      console.error('Failed to start agent:', error);
      setAgentStatus('crashed');
    } finally {
      setAgentLoading(false);
    }
  };

  // Handle agent stop
  const handleAgentStop = async () => {
    if (!selectedProject) return;
    
    setAgentLoading(true);
    
    try {
      await stopAgent(selectedProject);
      setAgentStatus('stopped');
    } catch (error) {
      console.error('Failed to stop agent:', error);
    } finally {
      setAgentLoading(false);
    }
  };
  
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
         <IconButton size="small" onClick={handleDependencyGraph}>
           <LayersIcon sx={{ color: dependencyGraphOpen ? 'primary.main' : '#64748b', fontSize: 20 }} />
         </IconButton>
         <IconButton size="small" onClick={handleMissionControl}>
           <TerminalIcon sx={{ color: missionControlOpen ? 'primary.main' : '#64748b', fontSize: 20 }} />
         </IconButton>
      </Box>

      {/* Main Column */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Bar (40px) */}
        <AppBar position="static" elevation={0} sx={{ height: 40, bgcolor: '#0f172a', borderBottom: '1px solid #1e293b', justifyContent: 'center' }}>
          <Toolbar variant="dense" sx={{ minHeight: '40px !important', px: 1.5 }}>
            <Typography variant="overline" sx={{ fontWeight: 900, color: 'primary.main', mr: 2, fontSize: '0.7rem' }}>HEX-ADE</Typography>
            
            <Box sx={{ flex: 1 }} />
            
            <Stack direction="row" spacing={1} alignItems="center">
               <Tooltip title="Create Specification">
                 <IconButton 
                   size="small" 
                   onClick={handleSpecCreation} 
                   disabled={!selectedProject}
                   color={specCreationOpen ? 'primary' : 'default'}
                 >
                   <MagicIcon fontSize="small" />
                 </IconButton>
               </Tooltip>
               <Box sx={{ width: 1, height: 16, bgcolor: '#1e293b' }} />
               <AgentControl
                 projectName={selectedProject}
                 status={agentStatus}
                 onStart={handleAgentStart}
                 onStop={handleAgentStop}
                 isLoading={agentLoading}
                 currentConcurrency={currentConcurrency}
                 yoloMode={yoloMode}
               />
               <Box sx={{ width: 1, height: 16, bgcolor: '#1e293b' }} />
               <ProjectSelector
                 projects={apiData?.projects || []}
                 selectedProject={selectedProject}
                 onSelectProject={setSelectedProject}
                 isLoading={projectsLoading}
               />
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
          liveProgress={progress}
          isConnected={isConnected}
        />
        <FeedbackPanel messages={mockFeedback} />

        {/* Board & Mission Control */}
        <Box sx={{ flex: 1, p: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5, overflow: 'auto' }}>
          {missionControlOpen && (
            <AgentMissionControl 
              activeAgents={agentsWithMetrics}
              orchestratorStatus={orchestratorStatus}
            />
          )}
          
          <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
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

      {/* Spec Creation Modal */}
      <SpecCreationChat
        open={specCreationOpen}
        onClose={() => setSpecCreationOpen(false)}
        projectName={selectedProject || ''}
      />

      {/* Expand Project Modal */}
      <ExpandProjectModal
        open={expandProjectOpen}
        onClose={() => setExpandProjectOpen(false)}
        projectName={selectedProject || ''}
      />

      {/* Dependency Graph Modal */}
      <DependencyGraph
        open={dependencyGraphOpen}
        onClose={() => setDependencyGraphOpen(false)}
        projectName={selectedProject}
      />

    </Box>
  );
}


