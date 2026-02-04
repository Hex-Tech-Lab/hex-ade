/**
 * ProjectSelector Component
 * 
 * Clean MUI Select dropdown for project selection.
 * Redesigned from original DropdownMenu to use MUI Select.
 */

import React, { useState, useEffect } from 'react';
import {
  Select,
  type SelectChangeEvent,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
  useTheme,
} from '@mui/material';
import {
  FolderOpen as FolderOpenIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import type { ProjectSummary } from '@/lib/types';
import { useProjects } from '@/hooks/useProjects';

interface ProjectSelectorProps {
  projects: ProjectSummary[];
  selectedProject: string | null;
  onSelectProject: (name: string | null) => void;
  isLoading: boolean;
  onSpecCreatingChange?: (isCreating: boolean) => void;
}

export function ProjectSelector({
  projects,
  selectedProject,
  onSelectProject,
  isLoading,
  onSpecCreatingChange,
}: ProjectSelectorProps) {
  const theme = useTheme();
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  
  // Load projects from real API
  const { data: apiData } = useProjects();

  const allProjects = apiData?.projects || projects;

  const selectedProjectData = allProjects.find((p) => p.name === selectedProject);

  const handleChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    if (value === '__new__') {
      // Handle new project creation
      window.location.href = '/projects/new';
    } else {
      onSelectProject(value === '__none__' ? null : value);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, projectName: string) => {
    e.stopPropagation();
    setProjectToDelete(projectName);
  };

  const handleConfirmDelete = () => {
    if (!projectToDelete) return;
    // TODO: Implement delete mutation
    if (selectedProject === projectToDelete) {
      onSelectProject(null);
    }
    setProjectToDelete(null);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <FormControl sx={{ minWidth: 220 }} size="small">
        <InputLabel id="project-select-label">Project</InputLabel>
        <Select
          labelId="project-select-label"
          value={selectedProject || '__none__'}
          label="Project"
          onChange={handleChange}
          disabled={isLoading}
          sx={{
            '& .MuiSelect-select': {
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            },
          }}
        >
          {projects.length === 0 && (
            <MenuItem value="__none__" disabled>
              <Typography color="text.secondary">No projects yet</Typography>
            </MenuItem>
          )}

          {allProjects.map((project) => (
            <MenuItem
              key={project.name}
              value={project.name}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 2,
                py: 1,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                <FolderOpenIcon fontSize="small" color="action" />
                <Typography variant="body2">{project.name}</Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {project.stats.total > 0 && (
                  <Chip
                    label={`${project.stats.percentage}%`}
                    size="small"
                    color={project.stats.percentage === 100 ? 'success' : 'default'}
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                )}
                <IconButton
                  size="small"
                  onClick={(e) => handleDeleteClick(e, project.name)}
                  sx={{
                    p: 0.5,
                    color: 'text.secondary',
                    '&:hover': { color: 'error.main' },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </MenuItem>
          ))}

          <MenuItem
            value="__new__"
            sx={{
              borderTop: `1px solid ${theme.palette.divider}`,
              fontWeight: 600,
              color: 'primary.main',
            }}
          >
            <AddIcon fontSize="small" sx={{ mr: 1 }} />
            New Project
          </MenuItem>
        </Select>
      </FormControl>

      {selectedProjectData && selectedProjectData.stats.total > 0 && (
        <Chip
          label={`${selectedProjectData.stats.passing}/${selectedProjectData.stats.total}`}
          size="small"
          variant="outlined"
          sx={{ height: 24 }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={projectToDelete !== null}
        onClose={() => setProjectToDelete(null)}
      >
        <DialogTitle>Delete Project</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove &quot;{projectToDelete}&quot; from the registry?
            This will unregister the project but preserve its files on disk.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProjectToDelete(null)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
