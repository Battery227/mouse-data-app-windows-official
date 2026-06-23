import React from "react";
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  MenuItem, Stack, TextField, Typography, Alert
} from "@mui/material";
import { DRUGS, EVENT_TYPES, TEST_TYPES } from "../models/cohorts";
import TrialsEditor from "./TrialsEditor";

function isoToLocalInput(iso) {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function localInputToIso(val) {
  // val is yyyy-mm-ddThh:mm
  const d = new Date(val);
  return d.toISOString();
}

export default function EventDialog({ open, onClose, onCreate, mouse, cohort, group, experimentConfig }) {
  const [category, setCategory] = React.useState("TEST");
  const [type, setType] = React.useState("RotaRod");
  const [datetime, setDatetime] = React.useState(() => new Date().toISOString());
  const [notes, setNotes] = React.useState("");
  const [fields, setFields] = React.useState({});
  const [trials, setTrials] = React.useState([]);

  // Get event types from experiment config if available
  const availableEventTypes = experimentConfig?.config?.eventTypes || [];
  const hasCustomEventTypes = availableEventTypes.length > 0;

  React.useEffect(() => {
    if (!open) return;
    setCategory("TEST");
    // Set initial type based on available event types
    if (hasCustomEventTypes) {
      const testEvents = availableEventTypes.filter(et => et.category === 'test');
      setType(testEvents[0]?.name || "RotaRod");
    } else {
      setType("RotaRod");
    }
    setDatetime(new Date().toISOString());
    setNotes("");
    setFields({});
    setTrials([]);
  }, [open, hasCustomEventTypes, availableEventTypes]);

  // Update type when category changes to ensure valid selection
  React.useEffect(() => {
    if (category === "TEST") {
      if (hasCustomEventTypes) {
        const testEvents = availableEventTypes.filter(et => et.category === 'test');
        if (testEvents.length > 0 && !testEvents.find(et => et.name === type)) {
          setType(testEvents[0].name);
        }
      } else if (!TEST_TYPES.find(t => t.value === type)) {
        setType("RotaRod");
      }
    }
  }, [category, type, hasCustomEventTypes, availableEventTypes]);

  const handleCreate = () => {
    onCreate({
      mouseId: mouse.id,
      category,
      type,
      datetime,
      notes,
      fields,
      trials,
    });
    onClose();
  };

  const showTrials = category === "TEST";
  const showDrug = category === "INJECTION";
  const showCare = category === "CARE";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Add Event for {mouse.mouseId || `Slot ${mouse.slot}`}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Alert severity="info" sx={{ mb: 1 }}>
            Recording event for <b>{mouse.mouseId || `Slot ${mouse.slot}`}</b> in <b>{cohort.name}</b> • <b>{group.name}</b>
          </Alert>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              sx={{ flex: 1 }}
            >
              {EVENT_TYPES.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
            </TextField>

            <TextField
              label="Date & time"
              type="datetime-local"
              value={isoToLocalInput(datetime)}
              onChange={(e) => setDatetime(localInputToIso(e.target.value))}
              sx={{ flex: 1 }}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>

          {category === "TEST" ? (
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                select
                label="Test type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                sx={{ flex: 1 }}
                SelectProps={{
                  displayEmpty: false
                }}
                helperText={hasCustomEventTypes ? "From experiment setup" : "Default test types"}
              >
                {hasCustomEventTypes ? (
                  // Use experiment-defined event types
                  availableEventTypes
                    .filter(et => et.category === 'test')
                    .map(et => (
                      <MenuItem key={et.id} value={et.name}>
                        {et.name}
                      </MenuItem>
                    ))
                ) : (
                  // Fall back to default TEST_TYPES
                  TEST_TYPES.map(o => (
                    <MenuItem key={o.value} value={o.value}>
                      {o.label}
                    </MenuItem>
                  ))
                )}
              </TextField>
              {type === "Custom" ? (
                <TextField
                  label="Custom test name"
                  value={fields.customName || ""}
                  onChange={(e) => setFields(prev => ({ ...prev, customName: e.target.value }))}
                  sx={{ flex: 1 }}
                  placeholder="Enter test name"
                  required
                />
              ) : null}
            </Stack>
          ) : null}

          {showDrug ? (
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                select
                label="Injection type"
                value={fields.injectionKind || "Drug"}
                onChange={(e) => setFields(prev => ({ ...prev, injectionKind: e.target.value }))}
                sx={{ flex: 1 }}
              >
                <MenuItem value="Drug">Drug</MenuItem>
                <MenuItem value="Virus">Virus</MenuItem>
              </TextField>
              <TextField
                select
                label="Drug"
                value={fields.drug || ""}
                onChange={(e) => setFields(prev => ({ ...prev, drug: e.target.value }))}
                sx={{ flex: 1 }}
              >
                <MenuItem value="">(none)</MenuItem>
                {DRUGS.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
              </TextField>
            </Stack>
          ) : null}

          {showCare ? (
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                select
                label="Care type"
                value={fields.careKind || "Weight"}
                onChange={(e) => setFields(prev => ({ ...prev, careKind: e.target.value }))}
                sx={{ flex: 1 }}
              >
                <MenuItem value="Weight">Weight</MenuItem>
                <MenuItem value="Feeding">Feeding</MenuItem>
                <MenuItem value="Handling">Handling</MenuItem>
              </TextField>
              <TextField
                label="Numeric value"
                value={fields.value || ""}
                onChange={(e) => setFields(prev => ({ ...prev, value: e.target.value }))}
                sx={{ flex: 1 }}
                placeholder="e.g., weight in g, food amount"
              />
              <TextField
                label="Notes"
                value={fields.careNotes || ""}
                onChange={(e) => setFields(prev => ({ ...prev, careNotes: e.target.value }))}
                sx={{ flex: 2 }}
              />
            </Stack>
          ) : null}

          {category === "KILL" ? (
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              This will add a Kill event. You can also mark the mouse as KILLED from the mouse details panel.
            </Typography>
          ) : null}

          {showTrials ? (
            <TrialsEditor trials={trials} setTrials={setTrials} />
          ) : null}

          <TextField
            label="Event notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            multiline
            minRows={2}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleCreate}
          disabled={category === "TEST" && type === "Custom" && !fields.customName}
        >
          Add Event
        </Button>
      </DialogActions>
    </Dialog>
  );
}
