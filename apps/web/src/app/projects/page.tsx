/**
 * Projects List Page
 * 
 * Displays all projects in a list/grid format.
 * Wired to real API - uses useProjects and useDeleteProject hooks.
 */

'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  Chip,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Folder as FolderIcon,
  ChevronRight as ChevronRightIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { useProjects, useDeleteProject } from '@/hooks/useProjects';

export default function ProjectsPage() {
  const { data: projects, isLoading, error, refetch } = useProjects();
  const deleteProject = useDeleteProject();
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!projectToDelete) return;
    try {
      await deleteProject.mutateAsync(projectToDelete);
      setProjectToDelete(null);
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load projects: {error.message}
        </Alert>
        <Button variant="outlined" onClick={() => refetch()}>
          Retry
        </Button>
      </Box>
    );
  }

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
        {projects?.projects.map((project) => (
          <Grid size={{ xs: 12, md: 6 }} key={project.name}>
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ChevronRightIcon color="action" />
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setProjectToDelete(project.name);
                          }}
                          sx={{
                            p: 0.5,
                            color: 'text.secondary',
                            '&:hover': { color: 'error.main' },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
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
                        label={`Concurrency: ${project.default_concurrency || 3}`}
                        variant="outlined"
                      />
                    </Stack>

                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Progress
                        </Typography>
                        <Typography variant="caption" fontWeight={600}>
                          {Math.round(project.stats?.percentage || 0)}%
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={project.stats?.percentage || 0} 
                        sx={{ height: 6, borderRadius: 1 }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        {project.stats?.passing || 0} / {project.stats?.total || 0} features complete
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {projects?.projects.length === 0 && (
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={projectToDelete !== null}
        onClose={() => setProjectToDelete(null)}
      >
        <DialogTitle>Delete Project</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete &quot;{projectToDelete}&quot;?
            This will remove the project from the registry but preserve files on disk.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProjectToDelete(null)}>Cancel</Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            variant="contained"
            disabled={deleteProject.isPending}
          >
            {deleteProject.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
