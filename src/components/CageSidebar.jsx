import React from "react";
import {
  Box, Button, Divider, Drawer, List, ListItem, ListItemButton, ListItemText,
  Stack, Typography, TextField, MenuItem, Chip
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { IconButton } from "@mui/material";
import { COHORTS, getCohort } from "../models/cohorts";

export default function CageSidebar({
  open,
  onClose,
  cages,
  selectedCageId,
  onSelectCage,
  onAddCage,
  onDeleteCage,
  experimentConfig,
}) {
  const [name, setName] = React.useState("");
  
  // Use experiment config cohorts if available, otherwise fall back to COHORTS
  const availableCohorts = experimentConfig?.config?.cohorts || COHORTS;
  const [cohortId, setCohortId] = React.useState(availableCohorts[0]?.id || COHORTS[0].id);

  const handleAdd = () => {
    const cageName = name.trim() || `Cage ${cages.length + 1}`;
    const id = onAddCage(cageName, cohortId);
    setName("");
    onSelectCage(id);
  };

  return (
    <Drawer anchor="left" open={open} onClose={onClose} variant="persistent">
      <Box sx={{ width: 320, p: 2, height: "100%", display: "flex", flexDirection: "column", gap: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Cages</Typography>
          <IconButton aria-label="Close sidebar" onClick={onClose} size="small">
            {/* simple X using DeleteIcon would be confusing; use a text glyph */}
            <span style={{ fontSize: 18, lineHeight: 1 }}>×</span>
          </IconButton>
        </Stack>

        <Stack spacing={1}>
          <TextField
            size="small"
            label="New cage name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            select
            size="small"
            label="Cohort"
            value={cohortId}
            onChange={(e) => setCohortId(e.target.value)}
            helperText={experimentConfig ? "From experiment setup" : "Using defaults"}
          >
            {availableCohorts.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
          </TextField>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
            Add Cage
          </Button>
        </Stack>

        <Divider sx={{ my: 1 }} />

        <Box sx={{ flex: 1, overflow: "auto" }}>
          <List dense>
            {cages.map(c => {
              // Try to find cohort in experiment config first, then fall back to COHORTS
              const cohort = availableCohorts.find(co => co.id === c.cohortId) || getCohort(c.cohortId);
              return (
                <ListItem
                  key={c.id}
                  disablePadding
                  secondaryAction={
                    <IconButton
                      edge="end"
                      aria-label={`Delete ${c.name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteCage?.(c.id);
                      }}
                      size="small"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  }
                >
                  <ListItemButton
                    selected={c.id === selectedCageId}
                    onClick={() => onSelectCage(c.id)}
                    sx={{ borderRadius: 2, mb: 0.5, pr: 6 }}
                  >
                    <ListItemText
                      primary={c.name}
                      secondary={
                        <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: "wrap" }}>
                          <Chip size="small" label={cohort.name} />
                          {c.drug ? <Chip size="small" color="info" label={c.drug} /> : null}
                        </Stack>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>

        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          Tip: select a cage, then click a mouse row to edit details.
        </Typography>
      </Box>
    </Drawer>
  );
}