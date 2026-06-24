/**
 * CohortAssignDialog - assign a whole housing unit (cage) to a cohort + group.
 *
 * Supports creating cohorts/groups on the fly. Assigning applies to every animal
 * currently in the cage; individual animals can still be overridden afterward
 * from the subject details panel.
 */
import React from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, Typography,
  FormControl, InputLabel, Select, MenuItem, TextField, Box, Divider
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

function ColorDot({ color }) {
  return (
    <Box component="span" sx={{
      display: 'inline-block', width: 10, height: 10, borderRadius: '50%',
      bgcolor: color || 'grey.400', mr: 1, flexShrink: 0
    }} />
  );
}

export default function CohortAssignDialog({
  open,
  onClose,
  unitName,
  cohorts = [],
  currentCohortId = '',
  currentGroupId = '',
  onAssign,
  onAddCohort,
  onAddGroup
}) {
  const [cohortId, setCohortId] = React.useState(currentCohortId);
  const [groupId, setGroupId] = React.useState(currentGroupId);
  const [newCohort, setNewCohort] = React.useState('');
  const [newGroup, setNewGroup] = React.useState('');

  React.useEffect(() => {
    if (open) {
      setCohortId(currentCohortId);
      setGroupId(currentGroupId);
      setNewCohort('');
      setNewGroup('');
    }
  }, [open, currentCohortId, currentGroupId]);

  const selectedCohort = cohorts.find(c => c.id === cohortId);
  const groups = selectedCohort?.groups || [];

  const handleAddCohort = () => {
    const name = newCohort.trim();
    if (!name) return;
    const id = onAddCohort(name);
    setCohortId(id);
    setGroupId('');
    setNewCohort('');
  };

  const handleAddGroup = () => {
    const name = newGroup.trim();
    if (!name || !cohortId) return;
    const id = onAddGroup(cohortId, name);
    setGroupId(id);
    setNewGroup('');
  };

  const handleAssign = () => {
    onAssign(cohortId, groupId);
    onClose();
  };

  const handleClear = () => {
    onAssign('', '');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Assign {unitName}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Applies to all animals currently in this cage. You can still override an
          individual animal later from its details panel.
        </Typography>

        <Stack spacing={2} sx={{ mt: 0.5 }}>
          <FormControl fullWidth>
            <InputLabel>Cohort</InputLabel>
            <Select
              value={cohortId}
              label="Cohort"
              onChange={(e) => { setCohortId(e.target.value); setGroupId(''); }}
            >
              <MenuItem value=""><em>None</em></MenuItem>
              {cohorts.map(c => (
                <MenuItem key={c.id} value={c.id}>
                  <ColorDot color={c.color} />{c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Stack direction="row" spacing={1}>
            <TextField
              size="small"
              fullWidth
              label="New cohort"
              value={newCohort}
              onChange={(e) => setNewCohort(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddCohort(); }}
            />
            <Button onClick={handleAddCohort} startIcon={<AddIcon />} disabled={!newCohort.trim()}>
              Add
            </Button>
          </Stack>

          {cohortId && (
            <>
              <Divider />
              <FormControl fullWidth>
                <InputLabel>Group</InputLabel>
                <Select
                  value={groupId}
                  label="Group"
                  onChange={(e) => setGroupId(e.target.value)}
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  {groups.map(g => (
                    <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Stack direction="row" spacing={1}>
                <TextField
                  size="small"
                  fullWidth
                  label="New group"
                  value={newGroup}
                  onChange={(e) => setNewGroup(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddGroup(); }}
                />
                <Button onClick={handleAddGroup} startIcon={<AddIcon />} disabled={!newGroup.trim()}>
                  Add
                </Button>
              </Stack>
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={handleClear}>Clear</Button>
        <Box sx={{ flex: 1 }} />
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleAssign}>Assign</Button>
      </DialogActions>
    </Dialog>
  );
}

// Made with Bob
