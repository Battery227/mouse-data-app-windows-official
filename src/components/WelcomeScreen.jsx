/**
 * Welcome Screen - First-run experience
 * Shows template selection and explains customization
 */

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  Stack,
  Chip,
  Alert
} from '@mui/material';
import ScienceIcon from '@mui/icons-material/Science';
import { BUILT_IN_TEMPLATES } from '../core/schema/builtInTemplates';
import { GENERIC_TEMPLATES } from '../core/schema/genericTemplates';

export default function WelcomeScreen({ open, onSelectTemplate, onSkip }) {
  const [selectedTemplate, setSelectedTemplate] = React.useState(null);
  
  const allTemplates = [...BUILT_IN_TEMPLATES, ...GENERIC_TEMPLATES];

  const handleContinue = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate);
    }
  };

  return (
    <Dialog 
      open={open} 
      maxWidth="lg" 
      fullWidth
      disableEscapeKeyDown
    >
      <DialogTitle>
        <Stack direction="row" spacing={2} alignItems="center">
          <ScienceIcon fontSize="large" color="primary" />
          <Box>
            <Typography variant="h5">Welcome to InVivo Research Manager</Typography>
            <Typography variant="body2" color="text.secondary">
              Choose a template to get started, or use the generic template for maximum flexibility
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3}>
          <Alert severity="info">
            <Typography variant="body2">
              <strong>New!</strong> This app now supports ANY species and ANY research type. 
              Choose a template below or start with a generic template and customize it to your needs.
            </Typography>
          </Alert>

          <Typography variant="h6">Select Your Research Type:</Typography>

          <Grid container spacing={2}>
            {allTemplates.map((template) => (
              <Grid item xs={12} sm={6} md={4} key={template.id}>
                <Card 
                  variant={selectedTemplate?.id === template.id ? 'elevation' : 'outlined'}
                  sx={{
                    height: '100%',
                    border: selectedTemplate?.id === template.id ? 2 : 1,
                    borderColor: selectedTemplate?.id === template.id ? 'primary.main' : 'divider'
                  }}
                >
                  <CardActionArea 
                    onClick={() => setSelectedTemplate(template)}
                    sx={{ height: '100%' }}
                  >
                    <CardContent>
                      <Stack spacing={1}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          {template.species?.icon && (
                            <Typography variant="h3">{template.species.icon}</Typography>
                          )}
                          <Typography variant="h6" component="div">
                            {template.name}
                          </Typography>
                        </Stack>

                        <Typography variant="body2" color="text.secondary" sx={{ minHeight: 60 }}>
                          {template.description}
                        </Typography>

                        <Stack direction="row" spacing={0.5} flexWrap="wrap">
                          <Chip 
                            label={template.species?.pluralName || 'Generic'} 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                          />
                          {template.isBuiltIn && (
                            <Chip label="Built-in" size="small" color="success" variant="outlined" />
                          )}
                        </Stack>

                        <Typography variant="caption" color="text.secondary">
                          {template.eventTypes?.length || 0} event types • {template.protocols?.length || 0} protocols
                        </Typography>
                      </Stack>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>

          {selectedTemplate && (
            <Alert severity="success">
              <Typography variant="body2">
                <strong>Selected:</strong> {selectedTemplate.name}
              </Typography>
              <Typography variant="caption">
                You can customize this template later by adding custom fields, event types, and protocols.
              </Typography>
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onSkip} color="inherit">
          Skip (Use Default)
        </Button>
        <Button 
          variant="contained" 
          onClick={handleContinue}
          disabled={!selectedTemplate}
          size="large"
        >
          Continue with {selectedTemplate?.name || 'Selected Template'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Made with Bob
