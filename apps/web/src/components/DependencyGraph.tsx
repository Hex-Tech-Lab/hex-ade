/**
 * DependencyGraph Component
 *
 * Visual graph showing dependencies between features.
 * Supports drag to pan, scroll to zoom, and click to highlight.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Stack,
  Typography,
  Chip,
} from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  CenterFocusStrong as CenterIcon,
  Fullscreen as FullscreenIcon,
  Close as CloseIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { getDependencyGraph } from '@/lib/api';
import type { DependencyGraph as DependencyGraphType } from '@/lib/types';

interface DependencyGraphProps {
  projectName: string | null;
  open: boolean;
  onClose: () => void;
}

export type { DependencyGraphProps };

interface Node {
  id: number;
  featureId: number;
  featureName: string;
  status: 'done' | 'in_progress' | 'pending';
  x: number;
  y: number;
  radius: 20;
}

interface Edge {
  source: number;
  target: number;
}

interface AgentNode {
  id: number | string;
  agentIndex: number;
  x: number;
  y: number;
  radius: 18;
}

export function DependencyGraph({
  projectName,
  open,
  onClose,
}: DependencyGraphProps) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [agentNodes, setAgentNodes] = useState<AgentNode[]>([]);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<number | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const GRAPH_WIDTH = 800;
  const GRAPH_HEIGHT = 600;

  const layoutGraph = useCallback((data: DependencyGraphType) => {
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    const newAgentNodes: AgentNode[] = [];

    const nodePositions = new Map<number, { x: number; y: number }>();
    const layers: number[][] = [[], [], []];

    const graphNodes = data.nodes || data.features || [];
    const featureIds = graphNodes.map((f: { id: number }) => f.id);

    graphNodes.forEach((feature: { id: number; name: string; status: string; dependencies?: number[] }) => {
      const layerIndex = feature.status === 'done' ? 0 : feature.status === 'in_progress' ? 1 : 2;

      if (!nodePositions.has(feature.id)) {
        const x = 100 + (layers[layerIndex].length % 5) * 130;
        const y = 80 + Math.floor(layers[layerIndex].length / 5) * 120;
        nodePositions.set(feature.id, { x, y });
        layers[layerIndex].push(feature.id);

        const node: Node = {
          id: feature.id,
          featureId: feature.id,
          featureName: feature.name,
          status: feature.status as 'done' | 'in_progress' | 'pending',
          x,
          y,
          radius: 20,
        };
        newNodes.push(node);
      }

      feature.dependencies?.forEach(depId => {
        if (featureIds.includes(depId)) {
          newEdges.push({ source: depId, target: feature.id });
        }
      });
    });

    if (data.active_agents) {
      data.active_agents.forEach((agent, index) => {
        const x = 50 + (index % 3) * 120;
        const y = 350 + Math.floor(index / 3) * 80;

        const agentNode: AgentNode = {
          id: `agent_${agent.agentIndex}`,
          agentIndex: agent.agentIndex,
          x,
          y,
          radius: 18,
        };
        newAgentNodes.push(agentNode);
      });
    }

    setNodes(newNodes);
    setEdges(newEdges);
    setAgentNodes(newAgentNodes);
  }, []);

  useEffect(() => {
    const fetchGraph = async () => {
      if (!projectName) return;

      try {
        const data = await getDependencyGraph(projectName);
        layoutGraph(data);
      } catch (error) {
        console.error('Failed to fetch dependency graph:', error);
      }
    };

    fetchGraph();
  }, [projectName, layoutGraph]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    isDraggingRef.current = true;
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;

    setPan({ x: dx, y: dy });
  };

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    isDraggingRef.current = false;
  }, []);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();

    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.min(Math.max(scale * delta, 0.5), 3);

    setScale(newScale);
  };

  const handleZoomIn = () => {
    setScale(Math.min(scale * 1.2, 3));
  };

  const handleZoomOut = () => {
    setScale(Math.max(scale / 1.2, 0.5));
  };

  const handleCenter = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  const handleNodeClick = (nodeId: number) => {
    setSelectedNode(nodeId === selectedNode ? null : nodeId);
  };

  const getNodeColor = (status: Node['status']) => {
    switch (status) {
      case 'done':
        return '#22c55e';
      case 'in_progress':
        return '#eab308';
      case 'pending':
        return '#6b7280';
      default:
        return '#94a3b8';
    }
  };

  const getNodeIcon = (status: Node['status']) => {
    switch (status) {
      case 'done':
        return '✓';
      case 'in_progress':
        return '⟳';
      case 'pending':
        return '○';
      default:
        return '?';
    }
  };

  if (!open) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: 'rgba(2, 6, 23, 0.95)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: '1200px',
          maxHeight: '90%',
          bgcolor: '#0f172a',
          borderRadius: 2,
          boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
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
            <IconButton onClick={onClose} color="primary">
              <CloseIcon fontSize="small" />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#f8fafc' }}>
              Dependency Graph
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            {projectName && (
              <Chip
                label={`Project: ${projectName}`}
                size="small"
                sx={{
                  bgcolor: '#334155',
                  color: '#f8fafc',
                  fontSize: '0.7rem',
                }}
              />
            )}

            <Tooltip title="Zoom In">
              <IconButton size="small" onClick={handleZoomIn}>
                <ZoomInIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Zoom Out">
              <IconButton size="small" onClick={handleZoomOut}>
                <ZoomOutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Center View">
              <IconButton size="small" onClick={handleCenter}>
                <CenterIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Fullscreen">
              <IconButton size="small">
                <FullscreenIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Scroll to zoom">
              <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                <Typography variant="caption" sx={{ color: '#94a3b8', mr: 0.5 }}>
                  Scroll
                </Typography>
              </Box>
            </Tooltip>
          </Stack>
        </Box>

        <Box
          sx={{
            flex: 1,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <Box
            ref={canvasRef}
            sx={{
              width: GRAPH_WIDTH,
              height: GRAPH_HEIGHT,
              margin: 'auto',
              position: 'relative',
              bgcolor: '#020617',
              cursor: isDragging ? 'grabbing' : 'grab',
              transform: `scale(${scale}) translate(${pan.x}px, ${pan.y}px)`,
              transformOrigin: 'center center',
              transition: 'transform 0.1s ease-out',
            }}
            onWheel={handleWheel}
          >
            <svg width={GRAPH_WIDTH} height={GRAPH_HEIGHT}>
              {edges.map(edge => {
                const sourceNode = nodes.find(n => n.id === edge.source);
                const targetNode = nodes.find(n => n.id === edge.target);

                if (!sourceNode || !targetNode) return null;

                const x1 = sourceNode.x + GRAPH_WIDTH / 2;
                const y1 = sourceNode.y + GRAPH_HEIGHT / 2;
                const x2 = targetNode.x + GRAPH_WIDTH / 2;
                const y2 = targetNode.y + GRAPH_HEIGHT / 2;

                return (
                  <line
                    key={`${edge.source}-${edge.target}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#475569"
                    strokeWidth={2}
                    opacity={0.6}
                  />
                );
              })}

              {nodes.map(node => (
                <g key={node.id} onClick={() => handleNodeClick(node.id)}>
                  <circle
                    cx={node.x + GRAPH_WIDTH / 2}
                    cy={node.y + GRAPH_HEIGHT / 2}
                    r={node.radius}
                    fill={getNodeColor(node.status)}
                    stroke={selectedNode === node.id ? '#fbbf24' : '#1e293b'}
                    strokeWidth={selectedNode === node.id ? 3 : 1.5}
                    style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                  />
                  <text
                    x={node.x + GRAPH_WIDTH / 2}
                    y={node.y + GRAPH_HEIGHT / 2 + 4}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize="10"
                    fontWeight="600"
                  >
                    {getNodeIcon(node.status)}
                  </text>
                </g>
              ))}

              {agentNodes.map(agent => (
                <g key={agent.id}>
                  <circle
                    cx={agent.x + GRAPH_WIDTH / 2}
                    cy={agent.y + GRAPH_HEIGHT / 2}
                    r={agent.radius}
                    fill="#f59e0b"
                    stroke="#1e293b"
                    strokeWidth={2}
                  />
                  <text
                    x={agent.x + GRAPH_WIDTH / 2}
                    y={agent.y + GRAPH_HEIGHT / 2 + 4}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize="12"
                    fontWeight="600"
                  >
                    🔵
                  </text>
                </g>
              ))}
            </svg>

            {selectedNode !== null && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 16,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  bgcolor: '#1e293b',
                  padding: 1,
                  borderRadius: 1,
                  border: '1px solid #334155',
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2" sx={{ color: '#f8fafc' }}>
                    {nodes.find(n => n.id === selectedNode)?.featureName}
                  </Typography>
                  <Tooltip title="Status">
                    <Chip
                      size="small"
                      icon={<InfoIcon />}
                      label={
                        nodes.find(n => n.id === selectedNode)?.status === 'done'
                          ? 'Done'
                          : nodes.find(n => n.id === selectedNode)?.status === 'in_progress'
                            ? 'In Progress'
                            : 'Pending'
                      }
                      sx={{
                        bgcolor:
                          nodes.find(n => n.id === selectedNode)?.status === 'done'
                            ? '#22c55e'
                            : nodes.find(n => n.id === selectedNode)?.status === 'in_progress'
                              ? '#eab308'
                              : '#6b7280',
                        color: '#fff',
                      }}
                    />
                  </Tooltip>
                </Stack>
              </Box>
            )}
          </Box>
        </Box>

        <Box
          sx={{
            p: 1.5,
            borderTop: '1px solid #1e293b',
            bgcolor: '#0f172a',
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
              Legend:
            </Typography>
            <Stack direction="row" spacing={1.5}>
              <Chip
                label="Done"
                size="small"
                sx={{ bgcolor: '#22c55e', color: '#fff' }}
              />
              <Chip
                label="In Progress"
                size="small"
                sx={{ bgcolor: '#eab308', color: '#fff' }}
              />
              <Chip
                label="Pending"
                size="small"
                sx={{ bgcolor: '#6b7280', color: '#fff' }}
              />
              <Chip
                label="Agent Active"
                size="small"
                sx={{ bgcolor: '#f59e0b', color: '#fff' }}
              />
            </Stack>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
