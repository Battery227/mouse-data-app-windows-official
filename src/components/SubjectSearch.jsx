/**
 * SubjectSearch - find/filter animals across the active experiment by Mouse ID,
 * custom fields (genotype/strain/...), status, and cohort/group. Clicking a result
 * opens that subject. Covers both global search and the "filter by cohort" need.
 */
import React from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, TextField,
  MenuItem, List, ListItem, ListItemButton, ListItemText, Typography
} from "@mui/material";

const STATUSES = [
  { value: '', label: 'Any status' },
  { value: 'alive', label: 'Alive' },
  { value: 'deceased', label: 'Deceased' },
  { value: 'removed', label: 'Removed' },
  { value: 'transferred', label: 'Transferred' }
];

export default function SubjectSearch({ open, onClose, subjects = [], housingUnits = [], experiment, onSelect }) {
  const [query, setQuery] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [cohortId, setCohortId] = React.useState('');
  const [groupId, setGroupId] = React.useState('');

  React.useEffect(() => {
    if (open) { setQuery(''); setStatus(''); setCohortId(''); setGroupId(''); }
  }, [open]);

  const cohorts = experiment?.config?.cohorts || [];
  const cageById = React.useMemo(() => { const m = {}; housingUnits.forEach(h => { m[h.id] = h; }); return m; }, [housingUnits]);
  const cohortById = React.useMemo(() => { const m = {}; cohorts.forEach(c => { m[c.id] = c; }); return m; }, [cohorts]);
  const groupsOfCohort = cohortById[cohortId]?.groups || [];

  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return subjects.filter(s => {
      if (status && (s.status || 'alive') !== status) return false;
      if (cohortId && s.cohortId !== cohortId) return false;
      if (groupId && s.groupId !== groupId) return false;
      if (q) {
        const hay = [s.subjectId, ...Object.values(s.customFieldValues || {})].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [subjects, query, status, cohortId, groupId]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Find animals</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mb: 2 }}>
          <TextField
            autoFocus
            label="Search"
            placeholder="Mouse ID, genotype, strain..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            fullWidth
            size="small"
          />
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            <TextField select label="Status" value={status} onChange={(e) => setStatus(e.target.value)} size="small" sx={{ minWidth: 140 }}>
              {STATUSES.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
            </TextField>
            {cohorts.length > 0 && (
              <TextField select label="Cohort" value={cohortId} onChange={(e) => { setCohortId(e.target.value); setGroupId(''); }} size="small" sx={{ minWidth: 160 }}>
                <MenuItem value="">Any cohort</MenuItem>
                {cohorts.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
              </TextField>
            )}
            {cohortId && groupsOfCohort.length > 0 && (
              <TextField select label="Group" value={groupId} onChange={(e) => setGroupId(e.target.value)} size="small" sx={{ minWidth: 140 }}>
                <MenuItem value="">Any group</MenuItem>
                {groupsOfCohort.map(g => <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>)}
              </TextField>
            )}
          </Stack>
        </Stack>

        <Typography variant="caption" color="text.secondary">{results.length} result(s)</Typography>
        <List dense sx={{ maxHeight: 360, overflow: 'auto' }}>
          {results.map(s => {
            const cage = cageById[s.housingUnitId];
            const cohort = cohortById[s.cohortId];
            return (
              <ListItem
                key={s.id}
                disablePadding
                sx={{ borderLeft: cohort ? `5px solid ${cohort.color}` : '5px solid transparent', mb: 0.25 }}
              >
                <ListItemButton onClick={() => { onSelect(s); onClose(); }}>
                  <ListItemText
                    primary={s.subjectId}
                    secondary={`${cage ? cage.name : 'No cage'}${cohort ? ' · ' + cohort.name : ''} · ${s.status || 'alive'}`}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

// Made with Bob
