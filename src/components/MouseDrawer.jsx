import React from "react";
import {
  Box, Button, Chip, Divider, Drawer, IconButton, List, ListItem, ListItemText,
  MenuItem, Stack, Tab, Tabs, TextField, Typography
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { DRUGS, TEST_TYPES, getCohort, getGroup } from "../models/cohorts";
import EventDialog from "./EventDialog";

function fmt(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function EventChip({ e }) {
  const color =
    e.category === "INJECTION" ? "info" :
    e.category === "CARE" ? "success" :
    e.category === "KILL" ? "error" :
    e.category === "TEST" ? "primary" : "default";
  const label = e.category === "TEST"
    ? (e.type === "Custom" ? (e.fields?.customName || "Custom") : e.type)
    : e.category;
  return <Chip size="small" color={color} label={label} sx={{ mr: 1 }} />;
}

export default function MouseDrawer({ open, onClose, cage, mouse, events, api }) {
  const cohort = getCohort(cage.cohortId);
  const group = getGroup(cage.cohortId, cage.groupId);

  const [tab, setTab] = React.useState(0);
  const [eventDialogOpen, setEventDialogOpen] = React.useState(false);

  React.useEffect(() => {
    if (open) setTab(0);
  }, [open]);

  const mouseEvents = React.useMemo(() => {
    return (events || [])
      .filter(e => e.mouseId === mouse.id)
      .sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
  }, [events, mouse.id]);

  const setMouse = (patch) => api.updateMouse(mouse.id, patch);

  const markKilled = () => {
    const ts = new Date().toISOString();
    setMouse({ status: "KILLED", killedAt: ts });
    api.addEvent({
      mouseId: mouse.id,
      category: "KILL",
      type: "Kill",
      datetime: ts,
      fields: {},
      trials: [],
      notes: "Marked as KILLED",
    });
  };

  const title = mouse.mouseId ? mouse.mouseId : `Mouse slot ${mouse.slot}`;

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 520, p: 2, display: "flex", flexDirection: "column", height: "100%" }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h6">{title}</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {cage.name} • {cohort.name} • {group.name}
            </Typography>
          </Box>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
          {mouse.status === "KILLED" ? <Chip color="error" label="KILLED" /> : <Chip color="success" label="ALIVE" />}
          {mouse.drug ? <Chip color="info" label={mouse.drug} /> : <Chip variant="outlined" label="Drug: (unset)" />}
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Stack spacing={1}>
          <Stack direction="row" spacing={1}>
            <TextField
              label="Mouse ID"
              size="small"
              value={mouse.mouseId}
              onChange={(e) => setMouse({ mouseId: e.target.value })}
              sx={{ flex: 1 }}
            />
            <TextField
              label="Genotype"
              size="small"
              value={mouse.genotype}
              onChange={(e) => setMouse({ genotype: e.target.value })}
              sx={{ flex: 1 }}
            />
          </Stack>
          <Stack direction="row" spacing={1}>
            <TextField
              select
              label="Drug"
              size="small"
              value={mouse.drug || ""}
              onChange={(e) => setMouse({ drug: e.target.value })}
              sx={{ flex: 1 }}
            >
              <MenuItem value="">(unset)</MenuItem>
              {DRUGS.map(d => <MenuItem key={d.value} value={d.value}>{d.label}</MenuItem>)}
            </TextField>

            <Button
              variant="outlined"
              color="error"
              disabled={mouse.status === "KILLED"}
              onClick={markKilled}
              sx={{ whiteSpace: "nowrap" }}
            >
              Mark KILLED
            </Button>
          </Stack>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
            <Tab label="Timeline" />
            <Tab label="Care" />
            <Tab label="Injections" />
            <Tab label="Tests" />
          </Tabs>

          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setEventDialogOpen(true)}>
            Add Event
          </Button>
        </Stack>

        <Box sx={{ flex: 1, overflow: "auto", mt: 1 }}>
          {tab === 0 ? (
            <List dense>
              {mouseEvents.length === 0 ? (
                <Typography variant="body2" sx={{ color: "text.secondary", mt: 2 }}>
                  No events yet. Click “Add Event”.
                </Typography>
              ) : null}

              {mouseEvents.map(e => (
                <ListItem key={e.id} alignItems="flex-start"
                  secondaryAction={
                    <IconButton edge="end" aria-label="delete" onClick={() => api.deleteEvent(e.id)}>
                      <DeleteIcon />
                    </IconButton>
                  }
                  sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, mb: 1 }}
                >
                  <ListItemText
                    primary={
                      <Stack direction="row" alignItems="center">
                        <EventChip e={e} />
                        <Typography variant="subtitle2">{fmt(e.datetime)}</Typography>
                      </Stack>
                    }
                    secondary={
                      <Box sx={{ mt: 0.5 }}>
                        {e.category === "CARE" ? (
                          <Typography variant="body2">
                            <b>{e.fields?.careKind || "Care"}</b> — value: {e.fields?.value || "(none)"} — {e.fields?.careNotes || ""}
                          </Typography>
                        ) : null}

                        {e.category === "INJECTION" ? (
                          <Typography variant="body2">
                            <b>{e.fields?.injectionKind || "Injection"}</b> — {e.fields?.drug || "(drug unset)"} {e.notes ? `— ${e.notes}` : ""}
                          </Typography>
                        ) : null}

                        {e.category === "TEST" ? (
                          <Box>
                            <Typography variant="body2">
                              <b>{e.type === "Custom" ? (e.fields?.customName || "Custom") : e.type}</b>
                              {e.notes ? ` — ${e.notes}` : ""}
                            </Typography>
                            {(e.trials || []).length ? (
                              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                Trials: {(e.trials || []).map((t, idx) => `#${idx + 1}=${t.value}`).join(", ")}
                              </Typography>
                            ) : null}
                          </Box>
                        ) : null}

                        {e.category === "KILL" ? (
                          <Typography variant="body2"><b>KILL</b> {e.notes ? `— ${e.notes}` : ""}</Typography>
                        ) : null}

                        {e.category === "NOTE" ? (
                          <Typography variant="body2">{e.notes}</Typography>
                        ) : null}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : null}

          {tab === 1 ? (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
                Add care entries (numeric value + notes). Use “Add Event” and choose Care.
              </Typography>
              <Typography variant="body2">
                Common entries after 6-OHDA: weight (g), food amount, handling notes.
              </Typography>
            </Box>
          ) : null}

          {tab === 2 ? (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
                Add injection events (Virus/Drug). Use “Add Event” and choose Injection.
              </Typography>
              {cohort.requires?.virus ? (
                <Chip color="warning" label="Cohort requires virus injection (day -21)" sx={{ mb: 1 }} />
              ) : null}
            </Box>
          ) : null}

          {tab === 3 ? (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
                Add test / recording events. Each test supports any number of trials.
              </Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                {TEST_TYPES.filter(t => t.value !== "Custom").map(t => <Chip key={t.value} label={t.label} />)}
              </Stack>
            </Box>
          ) : null}
        </Box>

        <EventDialog
          open={eventDialogOpen}
          onClose={() => setEventDialogOpen(false)}
          onCreate={api.addEvent}
          mouse={mouse}
          cohort={cohort}
          group={group}
        />
      </Box>
    </Drawer>
  );
}
