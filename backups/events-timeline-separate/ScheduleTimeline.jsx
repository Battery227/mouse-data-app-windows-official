/**
 * ScheduleTimeline - Simple timeline view for experiment schedules
 * 
 * Shows a number line format with scheduled events/tests
 * Editable per subject, group, or cohort level
 */

import React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
  Tooltip,
  MenuItem
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const EVENT_COLORS = {
  injection: '#2196f3',
  test: '#4caf50',
  care: '#ff9800',
  death: '#f44336',
  note: '#9e9e9e'
};

export default function ScheduleTimeline({
  experiment,
  subjects = [],
  onUpdateSchedule
}) {
  const [schedule, setSchedule] = React.useState(experiment?.schedule || []);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingEvent, setEditingEvent] = React.useState(null);
  const [formData, setFormData] = React.useState({
    day: 0,
    category: 'test',
    name: '',
    description: '',
    appliesToAll: true
  });

  // Calculate timeline range (including negative days)
  const minDay = Math.min(
    ...schedule.map(e => e.day),
    0
  );
  const maxDay = Math.max(
    ...schedule.map(e => e.day),
    experiment?.duration || 30,
    30
  );
  const totalRange = maxDay - minDay;

  const handleAddEvent = () => {
    setEditingEvent(null);
    setFormData({
      day: 0,
      category: 'test',
      name: '',
      description: '',
      appliesToAll: true
    });
    setDialogOpen(true);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setFormData(event);
    setDialogOpen(true);
  };

  const handleSave = () => {
    const newEvent = {
      ...formData,
      id: editingEvent?.id || `evt_${Date.now()}`,
      day: parseInt(formData.day)
    };

    let newSchedule;
    if (editingEvent) {
      newSchedule = schedule.map(e => e.id === editingEvent.id ? newEvent : e);
    } else {
      newSchedule = [...schedule, newEvent];
    }

    newSchedule.sort((a, b) => a.day - b.day);
    setSchedule(newSchedule);
    onUpdateSchedule?.(newSchedule);
    setDialogOpen(false);
  };

  const handleDelete = (eventId) => {
    const newSchedule = schedule.filter(e => e.id !== eventId);
    setSchedule(newSchedule);
    onUpdateSchedule?.(newSchedule);
  };

  // Group events by day
  const eventsByDay = schedule.reduce((acc, event) => {
    if (!acc[event.day]) acc[event.day] = [];
    acc[event.day].push(event);
    return acc;
  }, {});

  return (
    <Box>
      <Stack spacing={2} sx={{ mb: 3 }}>
        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6">Global Experiment Schedule</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddEvent}
            size="small"
          >
            Add Event
          </Button>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          This is a reference schedule for the entire experiment. For subject-specific timelines based on their start dates,
          use the per-group timelines in Experiment Setup (Edit button in Experiments menu).
        </Typography>
        {experiment?.config?.cohorts && experiment.config.cohorts.length > 0 && (
          <Card sx={{ bgcolor: 'info.light', color: 'info.contrastText' }}>
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Typography variant="body2">
                💡 <strong>Tip:</strong> This experiment has {experiment.config.cohorts.length} cohort(s) with group-specific timelines.
                Those timelines are relative to each subject's start date and appear in the subject's Timeline tab.
              </Typography>
            </CardContent>
          </Card>
        )}
      </Stack>

      {schedule.length === 0 ? (
        <Card>
          <CardContent>
            <Typography color="text.secondary" align="center">
              No scheduled events. Click "Add Event" to create a timeline.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ position: 'relative', pb: 4 }}>
          {/* Timeline axis */}
          <Box sx={{ 
            position: 'relative', 
            height: 60, 
            borderBottom: '2px solid',
            borderColor: 'divider',
            mb: 2
          }}>
            {/* Day markers */}
            {Array.from({ length: Math.ceil(totalRange / 7) + 2 }, (_, i) => minDay + (i * 7)).map(day => {
              if (day > maxDay) return null;
              const position = ((day - minDay) / totalRange) * 100;
              return (
                <Box
                  key={day}
                  sx={{
                    position: 'absolute',
                    left: `${position}%`,
                    bottom: 0,
                    transform: 'translateX(-50%)'
                  }}
                >
                  <Box sx={{
                    width: 2,
                    height: 10,
                    bgcolor: 'divider',
                    mb: 0.5
                  }} />
                  <Typography variant="caption" color="text.secondary">
                    Day {day}
                  </Typography>
                </Box>
              );
            })}
          </Box>

          {/* Events */}
          <Stack spacing={1}>
            {schedule.map((event, idx) => {
              const position = ((event.day - minDay) / totalRange) * 100;
              return (
                <Box
                  key={event.id}
                  sx={{
                    position: 'relative',
                    pl: `${position}%`,
                    transition: 'all 0.2s'
                  }}
                >
                  <Card 
                    sx={{ 
                      display: 'inline-block',
                      minWidth: 200,
                      maxWidth: 300,
                      borderLeft: '4px solid',
                      borderLeftColor: EVENT_COLORS[event.category] || EVENT_COLORS.note
                    }}
                  >
                    <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
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
                          </Stack>
                          <Typography variant="body2" fontWeight="bold">
                            {event.name}
                          </Typography>
                          {event.description && (
                            <Typography variant="caption" color="text.secondary">
                              {event.description}
                            </Typography>
                          )}
                        </Box>
                        <Stack direction="row" spacing={0.5}>
                          <IconButton size="small" onClick={() => handleEditEvent(event)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => handleDelete(event.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Box>
              );
            })}
          </Stack>
        </Box>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingEvent ? 'Edit' : 'Add'} Scheduled Event</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Day"
              type="number"
              value={formData.day}
              onChange={(e) => setFormData({ ...formData, day: e.target.value })}
              fullWidth
              helperText="Day number in experiment timeline (negative days = before experiment start)"
            />

            <TextField
              select
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              fullWidth
            >
              <MenuItem value="injection">Injection</MenuItem>
              <MenuItem value="test">Test/Assay</MenuItem>
              <MenuItem value="care">Care/Monitoring</MenuItem>
              <MenuItem value="death">Death</MenuItem>
              <MenuItem value="note">Note</MenuItem>
            </TextField>

            <TextField
              label="Event Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              placeholder="e.g., RotaRod Test, Drug Injection"
            />

            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={2}
              fullWidth
              placeholder="Additional details..."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSave} 
            variant="contained"
            disabled={!formData.name || formData.day === ''}
          >
            {editingEvent ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// Made with Bob
