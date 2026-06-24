/**
 * BulkEventDialog - record the same event for every animal in a cage/group at once
 * ("once is enough"). Calls onSubmit with the event fields; the caller fans it out.
 */
import React from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, TextField,
  MenuItem, Typography
} from "@mui/material";

const CATEGORIES = [
  { value: 'injection', label: 'Injection' },
  { value: 'test', label: 'Test/Assay' },
  { value: 'care', label: 'Care/Monitoring' },
  { value: 'death', label: 'Death' },
  { value: 'note', label: 'Note' }
];

function nowLocalInput() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export default function BulkEventDialog({ open, onClose, count, targetLabel, onSubmit }) {
  const [category, setCategory] = React.useState('care');
  const [name, setName] = React.useState('');
  const [datetime, setDatetime] = React.useState(nowLocalInput());
  const [notes, setNotes] = React.useState('');

  React.useEffect(() => {
    if (open) { setCategory('care'); setName(''); setDatetime(nowLocalInput()); setNotes(''); }
  }, [open]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit({ category, name: name.trim(), datetime: new Date(datetime).toISOString(), notes });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Log event for all — {targetLabel}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Records the same event for all {count} animal(s) in {targetLabel}. You can still
          edit or delete it per animal afterward.
        </Typography>
        <Stack spacing={2}>
          <TextField select label="Category" value={category} onChange={(e) => setCategory(e.target.value)} fullWidth>
            {CATEGORIES.map(c => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
          </TextField>
          <TextField label="Event name" value={name} onChange={(e) => setName(e.target.value)} fullWidth placeholder="e.g., Weigh, Drug A injection" />
          <TextField
            label="Date & time"
            type="datetime-local"
            value={datetime}
            onChange={(e) => setDatetime(e.target.value)}
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} fullWidth multiline rows={2} placeholder="Optional" />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!name.trim() || count === 0}>
          Log for all {count}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Made with Bob
