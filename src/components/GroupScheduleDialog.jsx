/**
 * GroupScheduleDialog - edit a group's scheduled events (its timeline).
 *
 * Supports adding a single day or repeating an event across a span of days in one
 * action. These scheduled events apply to every animal in the group (relative to each
 * animal's start date) and appear as checkable items in the subject Timeline.
 */
import React from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, Typography,
  TextField, MenuItem, IconButton, Chip, ToggleButton, ToggleButtonGroup, Divider,
  List, ListItem
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

const CATEGORIES = [
  { value: 'injection', label: 'Injection' },
  { value: 'test', label: 'Test/Assay' },
  { value: 'care', label: 'Care/Monitoring' },
  { value: 'death', label: 'Death' },
  { value: 'note', label: 'Note' }
];

const EVENT_COLORS = {
  injection: '#2196f3', test: '#4caf50', care: '#ff9800', death: '#f44336', note: '#9e9e9e'
};

export default function GroupScheduleDialog({
  open,
  onClose,
  groupName,
  timeline = [],
  onAdd,
  onDelete,
  onAddRecurring
}) {
  const [mode, setMode] = React.useState('single');
  const [single, setSingle] = React.useState({ day: 0, category: 'test', name: '', description: '' });
  const [recur, setRecur] = React.useState({ name: '', category: 'care', description: '', startDay: 0, endDay: 6, everyNDays: 1 });

  const sorted = [...timeline].sort((a, b) => a.day - b.day);

  const handleAddSingle = () => {
    if (!single.name.trim()) return;
    onAdd({ ...single, day: Number(single.day) || 0 });
    setSingle({ day: Number(single.day) || 0, category: single.category, name: '', description: '' });
  };

  const handleAddRecurring = () => {
    if (!recur.name.trim()) return;
    onAddRecurring(recur);
    setRecur({ ...recur, name: '' });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Schedule — {groupName}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          These scheduled events apply to every animal in this group (relative to each
          animal's start date) and show up as checkable items in their Timeline.
        </Typography>

        {sorted.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            No scheduled events yet.
          </Typography>
        ) : (
          <List dense sx={{ mb: 1 }}>
            {sorted.map(ev => (
              <ListItem
                key={ev.id}
                sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 0.5 }}
                secondaryAction={
                  <IconButton edge="end" size="small" color="error" onClick={() => onDelete(ev.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                }
              >
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                  <Chip label={`Day ${ev.day}`} size="small" sx={{ bgcolor: EVENT_COLORS[ev.category] || EVENT_COLORS.note, color: 'white' }} />
                  <Chip label={ev.category} size="small" variant="outlined" />
                  <Typography variant="body2">{ev.name}</Typography>
                </Stack>
              </ListItem>
            ))}
          </List>
        )}

        <Divider sx={{ my: 2 }} />

        <ToggleButtonGroup
          value={mode}
          exclusive
          size="small"
          onChange={(e, v) => v && setMode(v)}
          sx={{ mb: 2 }}
        >
          <ToggleButton value="single">Single day</ToggleButton>
          <ToggleButton value="recurring">Repeat over days</ToggleButton>
        </ToggleButtonGroup>

        {mode === 'single' ? (
          <Stack spacing={2}>
            <TextField
              label="Event name"
              value={single.name}
              onChange={e => setSingle({ ...single, name: e.target.value })}
              fullWidth
              placeholder="e.g., Weigh, Drug A injection"
            />
            <Stack direction="row" spacing={2}>
              <TextField
                label="Day"
                type="number"
                value={single.day}
                onChange={e => setSingle({ ...single, day: e.target.value })}
                sx={{ width: 120 }}
                helperText="0 = start day"
              />
              <TextField
                select
                label="Category"
                value={single.category}
                onChange={e => setSingle({ ...single, category: e.target.value })}
                fullWidth
              >
                {CATEGORIES.map(c => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
              </TextField>
            </Stack>
            <Button startIcon={<AddIcon />} variant="contained" onClick={handleAddSingle} disabled={!single.name.trim()}>
              Add to schedule
            </Button>
          </Stack>
        ) : (
          <Stack spacing={2}>
            <TextField
              label="Event name"
              value={recur.name}
              onChange={e => setRecur({ ...recur, name: e.target.value })}
              fullWidth
              placeholder="e.g., Daily weigh + handling"
            />
            <TextField
              select
              label="Category"
              value={recur.category}
              onChange={e => setRecur({ ...recur, category: e.target.value })}
              fullWidth
            >
              {CATEGORIES.map(c => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
            </TextField>
            <Stack direction="row" spacing={2}>
              <TextField label="From day" type="number" value={recur.startDay} onChange={e => setRecur({ ...recur, startDay: e.target.value })} fullWidth />
              <TextField label="To day" type="number" value={recur.endDay} onChange={e => setRecur({ ...recur, endDay: e.target.value })} fullWidth />
              <TextField label="Every N days" type="number" value={recur.everyNDays} onChange={e => setRecur({ ...recur, everyNDays: e.target.value })} fullWidth />
            </Stack>
            <Typography variant="caption" color="text.secondary">
              Creates one event per day from "From" to "To" (inclusive), stepping by N.
              E.g. 0 to 6 every 1 = 7 events.
            </Typography>
            <Button startIcon={<AddIcon />} variant="contained" onClick={handleAddRecurring} disabled={!recur.name.trim()}>
              Add repeated events
            </Button>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Done</Button>
      </DialogActions>
    </Dialog>
  );
}

// Made with Bob
