/**
 * EventDialogV2 - V2 Component for adding events
 * 
 * Simplified event creation that works with V2 data model and templates
 */

import React from "react";
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  MenuItem, Stack, TextField, Typography
} from "@mui/material";

function isoToLocalInput(iso) {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function localInputToIso(val) {
  const d = new Date(val);
  return d.toISOString();
}

const DEFAULT_EVENT_TYPES = [
  { value: 'injection', label: 'Injection' },
  { value: 'test', label: 'Test/Assay' },
  { value: 'care', label: 'Care/Monitoring' },
  { value: 'death', label: 'Death/Endpoint' },
  { value: 'note', label: 'Note' }
];

export default function EventDialogV2({
  open,
  onClose,
  onCreate,
  subject,
  template,
  experiment
}) {
  const [category, setCategory] = React.useState("note");
  const [type, setType] = React.useState("");
  const [datetime, setDatetime] = React.useState(() => new Date().toISOString());
  const [notes, setNotes] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    setCategory("note");
    setType("");
    setDatetime(new Date().toISOString());
    setNotes("");
  }, [open]);

  const handleCreate = () => {
    onCreate({
      subjectId: subject.id,
      eventTypeId: `${category}-${type || 'general'}`,
      datetime,
      fieldValues: {
        category,
        type: type || 'General'
      },
      notes
    });
    onClose();
  };

  // Get event types from experiment config first, then template, then defaults
  const configuredEventTypes = experiment?.config?.eventTypes || [];
  const eventTypes = configuredEventTypes.length > 0
    ? configuredEventTypes.map(et => ({ value: et.category, label: et.name }))
    : (template?.eventTypes || DEFAULT_EVENT_TYPES);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Event</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Subject: <b>{subject?.subjectId || `Slot ${subject?.slot}`}</b>
          </Typography>

          <TextField
            select
            label="Event Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            fullWidth
          >
            {eventTypes.map(et => (
              <MenuItem key={et.value} value={et.value}>{et.label}</MenuItem>
            ))}
          </TextField>

          <TextField
            label="Event Type/Name"
            value={type}
            onChange={(e) => setType(e.target.value)}
            placeholder="e.g., RotaRod, Weight Check, Drug A"
            fullWidth
          />

          <TextField
            label="Date & Time"
            type="datetime-local"
            value={isoToLocalInput(datetime)}
            onChange={(e) => setDatetime(localInputToIso(e.target.value))}
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <TextField
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            multiline
            rows={3}
            fullWidth
            placeholder="Additional details about this event..."
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleCreate}>Add Event</Button>
      </DialogActions>
    </Dialog>
  );
}

// Made with Bob
