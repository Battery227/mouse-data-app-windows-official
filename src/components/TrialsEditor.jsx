import React from "react";
import { Box, Button, IconButton, Stack, TextField, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { uid } from "../utils/ids";

export default function TrialsEditor({ trials, setTrials }) {
  const addTrial = () => {
    setTrials([...(trials || []), { id: uid("trial"), value: "", notes: "" }]);
  };

  const updateTrial = (id, patch) => {
    setTrials((trials || []).map(t => t.id === id ? { ...t, ...patch } : t));
  };

  const deleteTrial = (id) => setTrials((trials || []).filter(t => t.id !== id));

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="subtitle2">Trials</Typography>
        <Button startIcon={<AddIcon />} onClick={addTrial}>Add Trial</Button>
      </Stack>

      <Stack spacing={1}>
        {(trials || []).length === 0 ? (
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            No trials yet. Click “Add Trial”.
          </Typography>
        ) : null}

        {(trials || []).map((t, idx) => (
          <Stack key={t.id} direction="row" spacing={1} alignItems="center">
            <TextField
              size="small"
              label={`Trial ${idx + 1} value`}
              value={t.value}
              onChange={(e) => updateTrial(t.id, { value: e.target.value })}
              sx={{ flex: 1 }}
              placeholder="e.g., 6.6 or Yes/No"
            />
            <TextField
              size="small"
              label="Notes"
              value={t.notes}
              onChange={(e) => updateTrial(t.id, { notes: e.target.value })}
              sx={{ flex: 2 }}
              placeholder="optional"
            />
            <IconButton onClick={() => deleteTrial(t.id)} aria-label="delete trial">
              <DeleteIcon />
            </IconButton>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}
