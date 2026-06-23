import React from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Typography,
  Chip
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ExperimentSetupWizard from "./ExperimentSetupWizard";

export default function ExperimentSwitcher({
  open,
  onClose,
  experiments,
  activeExperimentId,
  onSelectExperiment,
  onAddExperiment,
  onUpdateExperiment,
  onDeleteExperiment
}) {
  const [showSetupWizard, setShowSetupWizard] = React.useState(false);
  const [editingExperiment, setEditingExperiment] = React.useState(null);

  const handleSaveExperiment = (experimentConfig) => {
    if (editingExperiment) {
      // Update existing experiment
      onUpdateExperiment(editingExperiment.id, experimentConfig);
      setEditingExperiment(null);
    } else {
      // Create new experiment with the full config
      const expId = onAddExperiment(experimentConfig.name, null, experimentConfig);
    }
    setShowSetupWizard(false);
  };

  const handleEditExperiment = (exp) => {
    setEditingExperiment(exp);
    setShowSetupWizard(true);
  };

  const handleDelete = (expId, expName) => {
    if (experiments.length <= 1) {
      alert("Cannot delete the last experiment");
      return;
    }
    const confirm = window.confirm(
      `Delete experiment "${expName}" and all its data? This cannot be undone.`
    );
    if (confirm) {
      onDeleteExperiment(expId);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6">Experiments</Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={() => setShowSetupWizard(true)}
              variant="contained"
              size="small"
            >
              New Experiment
            </Button>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <List>
            {experiments.map(exp => (
              <ListItem
                key={exp.id}
                secondaryAction={
                  <Stack direction="row" spacing={0.5}>
                    <IconButton
                      edge="end"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditExperiment(exp);
                      }}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      onClick={() => handleDelete(exp.id, exp.name)}
                      disabled={experiments.length <= 1}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                }
                disablePadding
              >
                <ListItemButton
                  selected={exp.id === activeExperimentId}
                  onClick={() => {
                    onSelectExperiment(exp.id);
                    onClose();
                  }}
                >
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                        <Typography>{exp.name}</Typography>
                        {exp.id === activeExperimentId && (
                          <CheckCircleIcon color="primary" fontSize="small" />
                        )}
                      </Stack>
                    }
                    secondary={
                      <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                        <Chip
                          label={exp.status}
                          size="small"
                          color={exp.status === 'active' ? 'success' : 'default'}
                        />
                        <Typography variant="caption" color="text.secondary">
                          Created: {new Date(exp.createdAt).toLocaleDateString()}
                        </Typography>
                      </Stack>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>

      <ExperimentSetupWizard
        open={showSetupWizard}
        onClose={() => {
          setShowSetupWizard(false);
          setEditingExperiment(null);
        }}
        onSave={handleSaveExperiment}
        editingExperiment={editingExperiment}
      />
    </>
  );
}

// Made with Bob
