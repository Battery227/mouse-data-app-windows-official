import React from "react";
import {
  Box, Button, Card, CardContent, Chip, Divider, MenuItem, Stack,
  TextField, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { COHORTS, DRUGS, getCohort, getGroup } from "../models/cohorts";

export default function CageView({ cage, mice, onSelectMouse, api, experimentConfig }) {
  // Try to get cohort/group from experiment config first, then fall back to COHORTS
  const availableCohorts = experimentConfig?.config?.cohorts || COHORTS;
  const cohort = availableCohorts.find(c => c.id === cage.cohortId) || getCohort(cage.cohortId);
  const group = cohort?.groups?.find(g => g.id === cage.groupId) || getGroup(cage.cohortId, cage.groupId);

  const updateCage = (patch) => api.updateCage(cage.id, patch);

  const cageMice = mice
    .filter(m => m.cageId === cage.id)
    .sort((a, b) => a.slot - b.slot);

  const capacity = cage.capacity || 10;
  const atCapacity = cageMice.length >= capacity;

  return (
    <Box sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Card>
          <CardContent>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }} justifyContent="space-between">
              <Box>
                <Typography variant="h5">{cage.name}</Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
                  <Chip label={cohort.name} />
                  <Chip label={group.name} variant="outlined" />
                  {cage.drug ? <Chip color="info" label={cage.drug} /> : <Chip variant="outlined" label="Drug: (unset)" />}
                </Stack>
              </Box>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ minWidth: 360 }}>
                <TextField
                  select
                  size="small"
                  label="Cohort"
                  value={cage.cohortId}
                  onChange={(e) => {
                    const newC = availableCohorts.find(c => c.id === e.target.value) || availableCohorts[0];
                    updateCage({ cohortId: newC.id, groupId: newC.groups[0].id });
                  }}
                  sx={{ flex: 1 }}
                >
                  {availableCohorts.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </TextField>

                <TextField
                  select
                  size="small"
                  label="Group"
                  value={cage.groupId}
                  onChange={(e) => updateCage({ groupId: e.target.value })}
                  sx={{ flex: 1 }}
                >
                  {(cohort?.groups || []).map(g => <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>)}
                </TextField>

                <TextField
                  select
                  size="small"
                  label="Drug (cage-level)"
                  value={cage.drug || ""}
                  onChange={(e) => updateCage({ drug: e.target.value })}
                  sx={{ flex: 1 }}
                >
                  <MenuItem value="">(unset)</MenuItem>
                  {DRUGS.map(d => <MenuItem key={d.value} value={d.value}>{d.label}</MenuItem>)}
                </TextField>
              </Stack>
            </Stack>

            <Divider sx={{ my: 2 }} />

            {cohort?.description && (
              <>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Cohort summary
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {cohort.description}
                </Typography>
              </>
            )}
            {group?.description && (
              <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
                <strong>Group:</strong> {group.description}
              </Typography>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Box>
                <Typography variant="h6">Subjects ({cageMice.length} / {capacity})</Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Click any row to view and edit subject details, add events, record measurements, and track treatments.
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => api.addMouse(cage.id)}
                size="small"
                disabled={atCapacity}
                title={atCapacity ? `Cage at capacity (${capacity})` : 'Add new subject'}
              >
                Add Subject
              </Button>
            </Stack>

            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Slot</TableCell>
                    <TableCell>Mouse ID</TableCell>
                    <TableCell>Genotype</TableCell>
                    <TableCell>Drug</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cageMice.map(m => (
                    <TableRow
                      key={m.id}
                      hover
                      onClick={() => onSelectMouse(m)}
                      sx={{
                        cursor: "pointer",
                        opacity: m.status === "KILLED" ? 0.65 : 1,
                      }}
                    >
                      <TableCell>{m.slot}</TableCell>
                      <TableCell>{m.mouseId || <em style={{ color: "#888" }}>(unset)</em>}</TableCell>
                      <TableCell>{m.genotype || <em style={{ color: "#888" }}>(unset)</em>}</TableCell>
                      <TableCell>{m.drug || cage.drug || <em style={{ color: "#888" }}>(unset)</em>}</TableCell>
                      <TableCell>
                        {m.status === "KILLED" ? <Chip size="small" color="error" label="KILLED" /> : <Chip size="small" color="success" label="ALIVE" />}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Typography variant="caption" sx={{ display: "block", mt: 1, color: "text.secondary" }}>
              Tip: You can set mouse-level drug in the mouse drawer, or set cage-level drug above.
            </Typography>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
