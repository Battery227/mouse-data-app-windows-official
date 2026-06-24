/**
 * Template Selector Component
 * Allows users to select from built-in templates or create custom ones
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Card,
  CardContent,
  CardActions,
  Typography,
  Grid,
  Chip,
  Stack,
  Box,
  TextField,
  Tab,
  Tabs,
  IconButton,
  Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { BUILT_IN_TEMPLATES } from '../core/schema/builtInTemplates';
import { GENERIC_TEMPLATES } from '../core/schema/genericTemplates';
import TemplateBuilderDialog from './TemplateBuilder';

function TemplateCard({ template, onSelect, selected }) {
  return (
    <Card 
      variant={selected ? 'elevation' : 'outlined'}
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        border: selected ? 2 : 1,
        borderColor: selected ? 'primary.main' : 'divider',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: 2
        }
      }}
      onClick={() => onSelect(template)}
    >
      <CardContent sx={{ flex: 1 }}>
        <Stack direction="row" spacing={1} sx={{ mb: 1, alignItems: "center" }}>
          {template.species?.icon && (
            <Typography variant="h4">{template.species.icon}</Typography>
          )}
          <Typography variant="h6" component="div">
            {template.name}
          </Typography>
        </Stack>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {template.description}
        </Typography>

        <Stack direction="row" spacing={0.5} sx={{ mb: 1, flexWrap: "wrap" }}>
          {template.species && (
            <Chip 
              label={template.species.pluralName} 
              size="small" 
              color="primary" 
              variant="outlined"
            />
          )}
          {template.isBuiltIn && (
            <Chip label="Built-in" size="small" color="success" variant="outlined" />
          )}
          {template.tags?.slice(0, 3).map(tag => (
            <Chip key={tag} label={tag} size="small" variant="outlined" />
          ))}
        </Stack>

        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            {template.eventTypes?.length || 0} event types • {template.protocols?.length || 0} protocols
          </Typography>
        </Box>
      </CardContent>

      <CardActions>
        <Button size="small" onClick={() => onSelect(template)}>
          {selected ? 'Selected' : 'Select'}
        </Button>
      </CardActions>
    </Card>
  );
}

export default function TemplateSelector({ open, onClose, onSelect, currentTemplateId, customTemplates = [] }) {
  const [tab, setTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [builderOpen, setBuilderOpen] = useState(false);

  // Combine all templates (built-in, generic, and custom)
  const allTemplates = [...BUILT_IN_TEMPLATES, ...GENERIC_TEMPLATES, ...customTemplates];
  
  // Filter templates based on tab and search
  const filteredTemplates = allTemplates.filter(template => {
    // Tab filter
    if (tab === 0) {
      // All templates
    } else if (tab === 1) {
      // Species-specific
      if (template.species?.type === 'custom') return false;
    } else if (tab === 2) {
      // Generic
      if (template.species?.type !== 'custom') return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        template.tags?.some(tag => tag.toLowerCase().includes(query)) ||
        template.species?.name.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const handleSelect = () => {
    if (selectedTemplate) {
      onSelect(selectedTemplate);
      onClose();
    }
  };

  const handleCreateCustom = () => {
    setBuilderOpen(true);
  };

  const handleSaveCustomTemplate = (newTemplate) => {
    // Add the new template to the list and select it
    setSelectedTemplate(newTemplate);
    setBuilderOpen(false);
  };

  return (
    <>
      <TemplateBuilderDialog
        open={builderOpen}
        onClose={() => setBuilderOpen(false)}
        onSave={handleSaveCustomTemplate}
      />
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{ sx: { height: '80vh' } }}
    >
      <DialogTitle>
        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h5">Select Experiment Template</Typography>
          <Tooltip title="Create custom template">
            <IconButton onClick={handleCreateCustom} color="primary">
              <AddIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2}>
          {/* Search */}
          <TextField
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            slotProps={{
              input: {
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }
            }}
          />

          {/* Tabs */}
          <Tabs value={tab} onChange={(_, v) => setTab(v)}>
            <Tab label="All Templates" />
            <Tab label="Species-Specific" />
            <Tab label="Generic" />
          </Tabs>

          {/* Template Grid */}
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {filteredTemplates.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">
                  No templates found. Try a different search or create a custom template.
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {filteredTemplates.map((template) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={template.id}>
                    <TemplateCard
                      template={template}
                      onSelect={setSelectedTemplate}
                      selected={selectedTemplate?.id === template.id}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>

          {/* Selected Template Info */}
          {selectedTemplate && (
            <Card variant="outlined" sx={{ bgcolor: 'primary.50' }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Selected: {selectedTemplate.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This template includes {selectedTemplate.eventTypes?.length || 0} event types,{' '}
                  {selectedTemplate.protocols?.length || 0} protocols, and{' '}
                  {selectedTemplate.species?.defaultFields?.length || 0} subject fields.
                </Typography>
              </CardContent>
            </Card>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          variant="contained" 
          onClick={handleSelect}
          disabled={!selectedTemplate}
        >
          Use This Template
        </Button>
      </DialogActions>
    </Dialog>
    </>
  );
}

// Made with Bob
