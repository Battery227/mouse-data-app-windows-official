import React from "react";
import {
  Box, Button, Chip, Divider, Drawer, IconButton, List, ListItem, ListItemText,
  Stack, Tab, Tabs, TextField, Typography, Card, CardContent, Alert, LinearProgress,
  FormControl, InputLabel, Select, MenuItem
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ScheduleIcon from "@mui/icons-material/Schedule";
import { SUBJECT_STATUS } from "../models/constants";
import DynamicField from "./DynamicField";
import EventDialogV2 from "./EventDialogV2";

function fmt(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function EventChip({ e }) {
  const category = e.fieldValues?.category || 'note';
  const color =
    category === "injection" ? "info" :
    category === "care" ? "success" :
    category === "death" ? "error" :
    category === "test" ? "primary" : "default";
  return <Chip size="small" color={color} label={category} sx={{ mr: 1 }} />;
}

const EVENT_COLORS = {
  injection: '#2196f3',
  test: '#4caf50',
  care: '#ff9800',
  death: '#f44336',
  note: '#9e9e9e'
};

export default function SubjectDrawerV2({ 
  open, 
  onClose, 
  subject, 
  housingUnit,
  experiment,
  template,
  events, 
  api 
}) {
  const [tab, setTab] = React.useState(0);
  const [eventDialogOpen, setEventDialogOpen] = React.useState(false);
  const [fieldValues, setFieldValues] = React.useState(subject?.customFieldValues || {});
  const subjectIdRef = React.useRef(subject?.id);

  // Only reset fieldValues when opening drawer or switching to a different subject
  React.useEffect(() => {
    if (open && subject?.id !== subjectIdRef.current) {
      setTab(0);
      setFieldValues(subject?.customFieldValues || {});
      subjectIdRef.current = subject?.id;
    }
  }, [open, subject?.id, subject?.customFieldValues]);

  const subjectEvents = React.useMemo(() => {
    return (events || [])
      .filter(e => e.subjectId === subject?.id)
      .sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
  }, [events, subject?.id]);

  // Calculate timeline based on subject's group
  const subjectTimeline = React.useMemo(() => {
    if (!subject?.cohortId || !subject?.groupId || !experiment?.config?.cohorts) {
      return [];
    }

    const cohort = experiment.config.cohorts.find(c => c.id === subject.cohortId);
    if (!cohort) return [];

    const group = cohort.groups.find(g => g.id === subject.groupId);
    if (!group || !group.timeline) return [];

    const startDate = subject.startDate ? new Date(subject.startDate) : new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return group.timeline.map(event => {
      const scheduledDate = new Date(startDate);
      scheduledDate.setDate(scheduledDate.getDate() + event.day);
      scheduledDate.setHours(0, 0, 0, 0);

      // Check if this event has been completed (exists in subjectEvents)
      const completed = subjectEvents.some(e =>
        e.fieldValues?.category === event.category &&
        e.notes?.includes(event.name)
      );

      const daysSinceStart = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
      const status = completed ? 'completed' :
                     daysSinceStart >= event.day ? 'overdue' :
                     daysSinceStart === event.day - 1 ? 'due-soon' : 'upcoming';

      return {
        ...event,
        scheduledDate,
        status,
        daysSinceStart,
        completed
      };
    }).sort((a, b) => a.day - b.day);
  }, [subject, experiment, subjectEvents]);

  const handleFieldChange = (fieldId, value) => {
    // Update local state immediately for responsive UI
    const newValues = { ...fieldValues, [fieldId]: value };
    setFieldValues(newValues);
    // Save to backend
    api.updateSubjectFields(subject.id, { [fieldId]: value });
  };

  const markDeceased = () => {
    const ts = new Date().toISOString();
    api.updateSubject(subject.id, {
      status: 'deceased',
      statusDate: ts
    });
    // Record Date of Death in the subject's fields (pre-filled, editable afterward)
    api.updateSubjectFields(subject.id, { dod: ts.split('T')[0] });
    setFieldValues(prev => ({ ...prev, dod: ts.split('T')[0] }));
    api.addEvent({
      subjectId: subject.id,
      eventTypeId: 'death',
      datetime: ts,
      fieldValues: { category: 'death', type: 'Death' },
      notes: "Marked as deceased"
    });
  };

  const handleDelete = () => {
    const confirm = window.confirm(
      `Delete ${subject.subjectId} and all its events? This cannot be undone.`
    );
    if (confirm) {
      api.deleteSubject(subject.id);
      onClose();
    }
  };

  if (!subject) return null;

  const title = subject.subjectId || `Subject ${subject.slot}`;
  // Use experiment config fields if available, otherwise fall back to template fields
  const subjectFields = experiment?.config?.subjectFields || template?.species?.defaultFields || [];

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 520, p: 2, display: "flex", flexDirection: "column", height: "100%" }}>
        <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
          <Box>
            <Typography variant="h6">{title}</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {[housingUnit?.name, experiment?.name].filter(Boolean).join("  •  ")}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <IconButton onClick={handleDelete} color="error" title="Delete this subject">
              <DeleteIcon />
            </IconButton>
            <IconButton onClick={onClose}><CloseIcon /></IconButton>
          </Stack>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
          {subject.status === 'deceased' ? (
            <Chip color="error" label="DECEASED" />
          ) : subject.status === 'removed' ? (
            <Chip color="warning" label="REMOVED" />
          ) : (
            <Chip color="success" label="ALIVE" />
          )}
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Tabs value={tab} onChange={(e, v) => setTab(v)}>
          <Tab label="Details" />
          <Tab label={`Events (${subjectEvents.length})`} />
          <Tab label={`Timeline (${subjectTimeline.length})`} />
        </Tabs>

        <Box sx={{ flex: 1, overflow: "auto", mt: 2, pt: 1 }}>
          {tab === 0 && (
            <Stack spacing={2}>
              <TextField
                label="Mouse ID"
                value={subject.subjectId}
                onChange={(e) => api.updateSubject(subject.id, { subjectId: e.target.value })}
                fullWidth
              />

              {/* Cohort and Group Selection */}
              {experiment?.config?.cohorts && experiment.config.cohorts.length > 0 && (
                <>
                  <FormControl fullWidth>
                    <InputLabel>Cohort</InputLabel>
                    <Select
                      value={subject.cohortId || ''}
                      onChange={(e) => {
                        api.updateSubject(subject.id, {
                          cohortId: e.target.value,
                          groupId: '' // Reset group when cohort changes
                        });
                      }}
                      label="Cohort"
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      {experiment.config.cohorts.map(cohort => (
                        <MenuItem key={cohort.id} value={cohort.id}>
                          {cohort.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {subject.cohortId && (
                    <FormControl fullWidth>
                      <InputLabel>Group</InputLabel>
                      <Select
                        value={subject.groupId || ''}
                        onChange={(e) => api.updateSubject(subject.id, { groupId: e.target.value })}
                        label="Group"
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        {experiment.config.cohorts
                          .find(c => c.id === subject.cohortId)
                          ?.groups.map(group => (
                            <MenuItem key={group.id} value={group.id}>
                              {group.name}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  )}

                  {subject.groupId && !subject.startDate && (
                    <Alert severity="warning">
                      Set a start date below to activate the timeline for this subject's group.
                    </Alert>
                  )}

                  <TextField
                    label="Start Date"
                    type="date"
                    value={subject.startDate ? subject.startDate.split('T')[0] : ''}
                    onChange={(e) => api.updateSubject(subject.id, { startDate: e.target.value ? new Date(e.target.value).toISOString() : null })}
                    fullWidth
                    slotProps={{ inputLabel: { shrink: true } }}
                    helperText="When this subject started in the experiment (for timeline tracking)"
                  />
                </>
              )}

              {subjectFields.map(field => (
                <DynamicField
                  key={field.id}
                  field={field}
                  value={fieldValues[field.id] ?? ''}
                  onChange={handleFieldChange}
                  allValues={fieldValues}
                />
              ))}

              <TextField
                label="Notes"
                value={subject.notes || ''}
                onChange={(e) => api.updateSubject(subject.id, { notes: e.target.value })}
                multiline
                rows={3}
                fullWidth
              />

              <Divider />

              {subject.status !== 'deceased' && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={markDeceased}
                  fullWidth
                >
                  Mark as Deceased
                </Button>
              )}
            </Stack>
          )}

          {tab === 1 && (
            <Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setEventDialogOpen(true)}
                fullWidth
                sx={{ mb: 2 }}
              >
                Add Event
              </Button>

              <List>
                {subjectEvents.map(event => (
                  <ListItem
                    key={event.id}
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                      mb: 1,
                      flexDirection: "column",
                      alignItems: "flex-start"
                    }}
                  >
                    <Stack direction="row" spacing={1} sx={{ width: "100%", mb: 1, alignItems: "center" }}>
                      <EventChip e={event} />
                      <Typography variant="body2" fontWeight="bold" sx={{ flex: 1 }}>
                        {event.fieldValues?.type || event.fieldValues?.category || "Event"}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => api.deleteEvent(event.id)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
                      {fmt(event.datetime)}
                    </Typography>
                    {event.notes && (
                      <Typography variant="body2" color="text.secondary">
                        {event.notes}
                      </Typography>
                    )}
                    {event.trials && event.trials.length > 0 && (
                      <Typography variant="caption" color="text.secondary">
                        {event.trials.length} trial(s)
                      </Typography>
                    )}
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {tab === 2 && (
            <Box>
              {subject.startDate ? (
                <>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Started: {new Date(subject.startDate).toLocaleDateString()}
                    ({Math.floor((new Date() - new Date(subject.startDate)) / (1000 * 60 * 60 * 24))} days ago)
                  </Alert>

                  {subjectTimeline.length === 0 ? (
                    <Card>
                      <CardContent>
                        <Typography color="text.secondary" align="center">
                          No timeline defined for this subject's group.
                        </Typography>
                      </CardContent>
                    </Card>
                  ) : (
                    <Stack spacing={2}>
                      {subjectTimeline.map((event) => {
                        const statusColor =
                          event.status === 'completed' ? 'success' :
                          event.status === 'overdue' ? 'error' :
                          event.status === 'due-soon' ? 'warning' : 'default';

                        return (
                          <Card
                            key={event.id}
                            sx={{
                              borderLeft: '4px solid',
                              borderLeftColor: EVENT_COLORS[event.category] || EVENT_COLORS.note,
                              bgcolor: event.status === 'completed' ? 'action.hover' : 'background.paper'
                            }}
                          >
                            <CardContent>
                              <Stack direction="row" sx={{ mb: 1, justifyContent: "space-between", alignItems: "flex-start" }}>
                                <Box sx={{ flex: 1 }}>
                                  <Stack direction="row" spacing={1} sx={{ mb: 0.5, alignItems: "center" }}>
                                    <Chip
                                      label={`Day ${event.day}`}
                                      size="small"
                                      sx={{
                                        bgcolor: EVENT_COLORS[event.category],
                                        color: 'white',
                                        fontWeight: 'bold'
                                      }}
                                    />
                                    <Chip
                                      label={event.category}
                                      size="small"
                                      variant="outlined"
                                    />
                                    {event.completed && (
                                      <CheckCircleIcon color="success" fontSize="small" />
                                    )}
                                  </Stack>
                                  <Typography variant="body1" fontWeight="bold">
                                    {event.name}
                                  </Typography>
                                  {event.description && (
                                    <Typography variant="body2" color="text.secondary">
                                      {event.description}
                                    </Typography>
                                  )}
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                    Scheduled: {event.scheduledDate.toLocaleDateString()}
                                  </Typography>
                                </Box>
                                <Chip
                                  icon={event.status === 'completed' ? <CheckCircleIcon /> : <ScheduleIcon />}
                                  label={
                                    event.status === 'completed' ? 'Done' :
                                    event.status === 'overdue' ? 'Overdue' :
                                    event.status === 'due-soon' ? 'Due Soon' : 'Upcoming'
                                  }
                                  color={statusColor}
                                  size="small"
                                />
                              </Stack>
                              {event.status !== 'completed' && event.daysSinceStart >= event.day && (
                                <LinearProgress
                                  variant="determinate"
                                  value={100}
                                  color={event.status === 'overdue' ? 'error' : 'primary'}
                                  sx={{ mt: 1 }}
                                />
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </Stack>
                  )}
                </>
              ) : (
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" align="center" sx={{ mb: 2 }}>
                      No start date set for this subject.
                    </Typography>
                    <TextField
                      label="Start Date"
                      type="date"
                      fullWidth
                      slotProps={{ inputLabel: { shrink: true } }}
                      onChange={(e) => api.updateSubject(subject.id, { startDate: e.target.value })}
                    />
                  </CardContent>
                </Card>
              )}
            </Box>
          )}
        </Box>

        <EventDialogV2
          open={eventDialogOpen}
          onClose={() => setEventDialogOpen(false)}
          onCreate={(eventData) => {
            api.addEvent(eventData);
            setEventDialogOpen(false);
          }}
          subject={subject}
          template={template}
          experiment={experiment}
        />
      </Box>
    </Drawer>
  );
}

// Made with Bob
