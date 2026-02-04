/**
 * Projects List Page
 * 
 * Displays all projects in a list/grid format.
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  Chip,
  IconButton,
  Grid,
  Card,
  CardContent,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Folder as FolderIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import type { ProjectSummary } from '@/lib/types';

// Mock projects for initial display
const mockProjects: ProjectSummary[] = [
  {
    name: 'hex-ade',
    path: '/home/kellyb_dev/projects/hex-ade',
    has_spec: true,
    stats: { passing: 23, in_progress: 1, total: 40, percentage: 57.5 },
    default_concurrency: 3,
  },
  {
    name: 'example-app',
    path: '/workspace/example-app',
    has_spec: false,
    stats: { passing: 0, in_progress: 0, total: 10, percentage: 0 },
    default_concurrency: 2,
  },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectSummary[]>(mockProjects);
  const [loading, setLoading] = useState(false);

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={600}>
          Projects
        </Typography>
        <Link href="/projects/new" passHref>
          <Button variant="contained" startIcon={<AddIcon />}>
            New Project
          </Button>
        </Link>
      </Box>

      <Grid container spacing={3}>
        {projects.map((project) => (
          <Grid item xs={12} md={6} key={project.name}>
            <Card 
              component={Link}
              href={`/?project=${project.name}`}
              sx={{ 
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 3,
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <FolderIcon color="primary" sx={{ fontSize: 40 }} />
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6" fontWeight={600}>
                        {project.name}
                      </Typography>
                      <ChevronRightIcon color="action" />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {project.path}
                    </Typography>
                    
                    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                      <Chip 
                        size="small" 
                        label={project.has_spec ? 'Has Spec' : 'No Spec'} 
                        color={project.has_spec ? 'success' : 'default'}
                        variant="outlined"
                      />
                      <Chip 
                        size="small" 
                        label={`Concurrency: ${project.default_concurrency}`}
                        variant="outlined"
                      />
                    </Stack>

                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Progress
                        </Typography>
                        <Typography variant="caption" fontWeight={600}>
                          {Math.round(project.stats.percentage)}%
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={project.stats.percentage} 
                        sx={{ height: 6, borderRadius: 1 }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        {project.stats.passing} / {project.stats.total} features complete
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {projects.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No projects yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Get started by creating your first project
          </Typography>
          <Link href="/projects/new" passHref>
            <Button variant="contained" startIcon={<AddIcon />}>
              Create Project
            </Button>
          </Link>
        </Paper>
      )}
    </Box>
  );
}
