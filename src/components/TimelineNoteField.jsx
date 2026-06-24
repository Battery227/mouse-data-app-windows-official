/**
 * TimelineNoteField - small inline field to record a note/measurement on a scheduled
 * task (weight, trial times, etc.). Commits on blur to avoid churn while typing.
 */
import React from "react";
import { TextField } from "@mui/material";

export default function TimelineNoteField({ value, onSave, placeholder }) {
  const [v, setV] = React.useState(value || '');

  React.useEffect(() => { setV(value || ''); }, [value]);

  return (
    <TextField
      size="small"
      fullWidth
      multiline
      maxRows={3}
      variant="standard"
      value={v}
      onChange={(e) => setV(e.target.value)}
      onBlur={() => { if (v !== (value || '')) onSave(v); }}
      placeholder={placeholder || 'Note / measurement (e.g., 25.3 g, trials 4.2 / 4.5 / 4.1 s)'}
    />
  );
}

// Made with Bob
