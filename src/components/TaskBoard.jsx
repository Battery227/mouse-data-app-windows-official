/**
 * TaskBoard - "what needs doing" across ALL animals in the active experiment.
 *
 * Pulls every subject's scheduled items (group timeline + start date), buckets them
 * into Overdue / Today / This week, and lets you check each off in place. The daily
 * driver for bench work.
 */
import React from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, Typography,
  Box, Chip, Checkbox, List, ListItem
} from "@mui/material";
import { computeSubjectTimeline, EVENT_COLORS } from "../core/schedule";
import TimelineNoteField from "./TimelineNoteField";

function startOfDay(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
function fmtDate(d) {
  return new Date(d).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function TaskBoard({ open, onClose, subjects = [], housingUnits = [], experiment, onToggleComplete, onSetNote }) {
  const cageById = React.useMemo(() => {
    const m = {};
    housingUnits.forEach(h => { m[h.id] = h; });
    return m;
  }, [housingUnits]);

  const { overdue, today, week } = React.useMemo(() => {
    const t = startOfDay(new Date());
    const rows = [];
    subjects.forEach(subject => {
      computeSubjectTimeline(subject, experiment).forEach(item => {
        const d = startOfDay(item.scheduledDate);
        const diff = Math.round((d - t) / 86400000);
        let bucket = null;
        if (diff < 0 && !item.completed) bucket = 'overdue';
        else if (diff === 0) bucket = 'today';
        else if (diff >= 1 && diff <= 7) bucket = 'week';
        if (bucket) rows.push({ subject, item, date: d, bucket });
      });
    });
    rows.sort((a, b) => a.date - b.date || String(a.subject.subjectId).localeCompare(String(b.subject.subjectId)));
    return {
      overdue: rows.filter(r => r.bucket === 'overdue'),
      today: rows.filter(r => r.bucket === 'today'),
      week: rows.filter(r => r.bucket === 'week')
    };
  }, [subjects, experiment]);

  const renderRow = (row) => {
    const { subject, item } = row;
    const cage = cageById[subject.housingUnitId];
    return (
      <ListItem
        key={subject.id + ':' + item.id}
        sx={{
          border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 0.5,
          borderLeft: `5px solid ${EVENT_COLORS[item.category] || EVENT_COLORS.note}`
        }}
      >
        <Checkbox
          checked={item.completed}
          onChange={(e) => onToggleComplete(subject.id, item.id, e.target.checked)}
          sx={{ mr: 0.5 }}
        />
        <Box sx={{ flex: 1 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography variant="body2" fontWeight="bold" sx={{ textDecoration: item.completed ? 'line-through' : 'none' }}>
              {item.name}
            </Typography>
            <Chip label={item.category} size="small" variant="outlined" />
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {subject.subjectId}{cage ? ` · ${cage.name}` : ''} · Day {item.day} · {fmtDate(item.scheduledDate)}
          </Typography>
          <Box sx={{ mt: 0.5 }}>
            <TimelineNoteField value={item.note} onSave={(note) => onSetNote(subject.id, item.id, note)} />
          </Box>
        </Box>
      </ListItem>
    );
  };

  const Section = ({ title, rows, color }) => (
    rows.length > 0 ? (
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ color, mb: 0.5 }}>{title} ({rows.length})</Typography>
        <List dense disablePadding>{rows.map(renderRow)}</List>
      </Box>
    ) : null
  );

  const nothing = overdue.length + today.length + week.length === 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Tasks — {experiment?.name}</DialogTitle>
      <DialogContent>
        {nothing ? (
          <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
            Nothing scheduled in the next 7 days. Add a group schedule from a subject's
            Timeline tab (Edit group schedule).
          </Typography>
        ) : (
          <>
            <Section title="Overdue" rows={overdue} color="error.main" />
            <Section title="Today" rows={today} color="primary.main" />
            <Section title="This week" rows={week} color="text.secondary" />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

// Made with Bob
