/**
 * hex-ade Main Dashboard Page - 10x World Class Engineering
 * 
 * Re-engineered for extreme density, sleek dark theme, and modern 2026 aesthetics.
 */

'use client';

import React, { useState } from 'react';
import {
  Box, AppBar, Toolbar, Typography, IconButton, Stack,
} from '@mui/material';
import {
  PlayArrow as PlayIcon, Stop as StopIcon,
  Chat as ChatIcon,
  Dashboard as DashIcon, Layers as LayersIcon,
} from '@mui/icons-material';
import type { Feature, ProjectStats } from '../lib/types';
import { ProjectSelector } from '../components/ProjectSelector';
import { DevServerControl } from '../components/DevServerControl';
import { MetricsBar } from '../components/MetricsBar';
import { KanbanBoard } from '../components/KanbanBoard';
import { DebugPanel } from '../components/DebugPanel';
import { FeedbackPanel } from '../components/FeedbackPanel';
import { ChatFlyover } from '../components/ChatFlyover';

const mockStats: ProjectStats = { passing: 23, in_progress: 1, total: 190, percentage: 12.1 };

const mockFeatures: Feature[] = Array.from({ length: 40 }, (_, i) => ({
  id: i, priority: i, category: i % 2 === 0 ? 'FUNCTIONAL' : 'UI',
  name: `Feature ${i}: ${['Auth', 'DB', 'Layout', 'API', 'Docs'][i % 5]} Refinement`,
  description: 'High-density engineering task for 10x workflow.',
  steps: [], passes: i > 35, in_progress: i === 23,
}));

const mockFeedback = [
  'ATLAS-VM: Step 4 ASSEMBLE complete. Selected GPT-4o-mini for role "Frontend Specialist".',
  'SCAN: Found 0 critical vulnerabilities in generated components.',
  'VALIDATE: PR-Sweeper identified "Refactor" class. Merging to develop...',
  'MEMORY: Learning persisted. "MUI v6" patterns indexed for future tasks.'
];

export default function Home() {
  const [selectedProject, setSelectedProject] = useState<string | null>('hex-ade');
  const [agentStatus, setAgentStatus] = useState<'stopped' | 'running'>('stopped');
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', height: '100vh', width: '100vw', bgcolor: '#020617', color: '#f8fafc', overflow: 'hidden' }}>
      {/* Side Slim Rail */}
      <Box sx={{ width: 48, borderRight: '1px solid #1e293b', display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2, gap: 3, bgcolor: '#0f172a' }}>
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
              <ProjectSelector projects={[]} selectedProject={selectedProject} onSelectProject={setSelectedProject} isLoading={false} />
              <IconButton size="small" color={agentStatus === 'running' ? 'error' : 'primary'} onClick={() => setAgentStatus(agentStatus === 'running' ? 'stopped' : 'running')}>
                {agentStatus === 'running' ? <StopIcon fontSize="small" /> : <PlayIcon fontSize="small" />}
              </IconButton>
              <IconButton size="small" onClick={() => setChatOpen(!chatOpen)} color={chatOpen ? 'primary' : 'default'}>
                <ChatIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Toolbar>
        </AppBar>

        {/* Dense Info Stack */}
        <MetricsBar stats={mockStats} statusMessage="Active: [Spark] Refactoring Apps/Web/Page.tsx" budgetUsed={0.42} />
        <FeedbackPanel messages={mockFeedback} />

        {/* Board */}
        <Box sx={{ flex: 1, p: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5, overflow: 'hidden' }}>
          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            <KanbanBoard 
              pending={mockFeatures.filter(f => !f.passes && !f.in_progress)} 
              inProgress={mockFeatures.filter(f => f.in_progress)} 
              done={mockFeatures.filter(f => f.passes)} 
              onFeatureClick={()=>{}} 
              activeAgents={[{ agentIndex: 0, agentName: 'Spark', featureId: 23, featureIds: [23], agentType: 'coding', featureName: 'Feature 23', state: 'working', thought: 'Processing', timestamp: new Date().toISOString(), logs: [] }]}
            />
          </Box>
          <DebugPanel logs={[]} />
        </Box>
      </Box>

      {/* Flyover (Glassmorphic) */}
      <ChatFlyover open={chatOpen} onClose={() => setChatOpen(false)} messages={[]} onSendMessage={()=>{}} />
    </Box>
  );
}
