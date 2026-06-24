/**
 * HousingUnitView - V2 Component
 * 
 * Displays subjects in a housing unit using V2 data model.
 * 
 * CRITICAL V2 DATA STRUCTURE:
 * - subject.subjectId (NOT subject.subject.identifier)
 * - subject.status = 'alive' | 'deceased' | 'removed' | 'transferred' (lowercase)
 * - subject.customFieldValues = { genotype: '...', ... }
 * 
 * @param {Object} props
 * @param {V2HousingUnit} props.housingUnit - The housing unit to display
 * @param {V2Subject[]} props.subjects - Array of subjects in this unit
 * @param {V2Template} props.template - Template defining custom fields
 * @param {Function} props.onSelectSubject - Callback when subject is clicked
 * @param {Function} props.onAddSubject - Callback to add subject: (housingUnitId, slot) => string
 * @param {Function} props.onDeleteSubject - Callback to delete subject: (subjectId) => void
 */
import React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  Stack,
  Typography,
  Tooltip
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { SUBJECT_STATUS } from "../models/constants";
import CohortAssignDialog from "./CohortAssignDialog";
import BulkEventDialog from "./BulkEventDialog";

export default function HousingUnitView({
  housingUnit,
  subjects,
  template,
  cohorts = [],
  onSelectSubject,
  onAddSubject,
  onDeleteSubject,
  onAssignCohort,
  onAddCohort,
  onAddGroup,
  onLogEvent
}) {
  if (!housingUnit) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>No housing unit selected</Typography>
      </Box>
    );
  }

  const capacity = housingUnit.capacity || 10;
  
  // Count current subjects (use subjects array directly, not slots)
  const currentCount = subjects.length;
  const atCapacity = currentCount >= capacity;
  
  // Create slots for display
  const slots = Array.from({ length: capacity }, (_, i) => {
    const slot = i + 1;
    const subject = subjects.find(s => s.slot === slot);
    return { slot, subject };
  });

  const fieldLabels = React.useMemo(() => {
    const map = {};
    (template?.species?.defaultFields || []).forEach((f) => { map[f.id] = f.label; });
    return map;
  }, [template]);

  const cohortById = React.useMemo(() => {
    const m = {};
    (cohorts || []).forEach((c) => { m[c.id] = c; });
    return m;
  }, [cohorts]);
  const cageCohort = cohortById[housingUnit.cohortId];
  const cageGroup = cageCohort?.groups?.find((g) => g.id === housingUnit.groupId);
  const [cohortDialogOpen, setCohortDialogOpen] = React.useState(false);
  const [bulkOpen, setBulkOpen] = React.useState(false);

  const handleAddSubject = () => {
    if (atCapacity) return;
    // Find first empty slot
    const nextSlot = slots.find(s => !s.subject)?.slot;
    if (nextSlot) {
      onAddSubject(housingUnit.id, nextSlot);
    }
  };

  const getStatusColor = (status) => {
    if (!status || status === 'alive') return 'success';
    if (status === 'deceased') return 'error';
    if (status === 'removed') return 'warning';
    return 'default';
  };

  const getStatusLabel = (status) => {
    if (!status || status === 'alive') return 'ALIVE';
    if (status === 'deceased') return 'DECEASED';
    if (status === 'removed') return 'REMOVED';
    if (status === 'transferred') return 'TRANSFERRED';
    return status.toUpperCase();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" sx={{ mb: 3, justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h5">{housingUnit.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {currentCount} / {capacity} subjects
            {template && ` • ${template.species?.name || 'Generic'} Template`}
          </Typography>
          <Chip
            size="small"
            clickable
            onClick={() => setCohortDialogOpen(true)}
            variant={cageCohort ? 'filled' : 'outlined'}
            sx={{ mt: 1 }}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: cageCohort?.color || 'grey.400' }} />
                {cageCohort ? `${cageCohort.name}${cageGroup ? ' / ' + cageGroup.name : ''}` : 'Assign cohort / group'}
              </Box>
            }
          />
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            onClick={() => setBulkOpen(true)}
            disabled={subjects.length === 0}
          >
            Log for all
          </Button>
          <Tooltip title={atCapacity ? "Housing unit at capacity" : "Add new subject"}>
            <span>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddSubject}
                disabled={atCapacity}
              >
                Add Subject
              </Button>
            </span>
          </Tooltip>
        </Stack>
      </Stack>

      <Grid container spacing={2}>
        {slots.map(({ slot, subject }) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={slot}>
            <Card
              sx={{
                cursor: subject ? 'pointer' : 'default',
                opacity: subject ? 1 : 0.5,
                border: subject ? '1px solid' : '1px dashed',
                borderColor: 'divider',
                borderLeft: subject
                  ? `6px solid ${cohortById[subject.cohortId]?.color || '#bdbdbd'}`
                  : undefined,
                '&:hover': subject ? {
                  boxShadow: 3
                } : {}
              }}
              onClick={() => subject && onSelectSubject(subject)}
            >
              <CardContent>
                <Stack spacing={1}>
                  {subject ? (
                    <>
                      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="h6" component="div" fontWeight="bold">
                          {subject.subjectId || `Subject ${slot}`}
                        </Typography>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            const identifier = subject.subjectId || `Subject ${slot}`;
                            if (window.confirm(`Delete ${identifier}?`)) {
                              onDeleteSubject(subject.id);
                            }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                      
                      <Chip
                        label={getStatusLabel(subject.status)}
                        color={getStatusColor(subject.status)}
                        size="small"
                      />

                      {subject.customFieldValues && Object.keys(subject.customFieldValues).length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          {Object.entries(subject.customFieldValues)
                            .filter(([, value]) => value !== '' && value !== null && value !== undefined)
                            .slice(0, 2)
                            .map(([key, value]) => (
                              <Typography key={key} variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                {fieldLabels[key] || key}: {String(value).substring(0, 20)}
                              </Typography>
                            ))}
                        </Box>
                      )}
                    </>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Empty
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {atCapacity && (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
          <Typography variant="body2">
            ⚠️ Housing unit is at capacity ({capacity} subjects). 
            Delete a subject or increase capacity to add more.
          </Typography>
        </Box>
      )}

      <CohortAssignDialog
        open={cohortDialogOpen}
        onClose={() => setCohortDialogOpen(false)}
        unitName={housingUnit.name}
        cohorts={cohorts}
        currentCohortId={housingUnit.cohortId || ''}
        currentGroupId={housingUnit.groupId || ''}
        onAssign={(cohortId, groupId) => onAssignCohort(housingUnit.id, cohortId, groupId)}
        onAddCohort={onAddCohort}
        onAddGroup={onAddGroup}
      />

      <BulkEventDialog
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        count={subjects.length}
        targetLabel={housingUnit.name}
        onSubmit={(ev) => {
          subjects.forEach((s) => onLogEvent({
            subjectId: s.id,
            eventTypeId: `${ev.category}-${ev.name}`,
            datetime: ev.datetime,
            fieldValues: { category: ev.category, type: ev.name },
            notes: ev.notes
          }));
        }}
      />
    </Box>
  );
}

// Made with Bob
