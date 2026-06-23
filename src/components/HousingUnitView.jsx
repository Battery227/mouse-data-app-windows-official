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

export default function HousingUnitView({ 
  housingUnit, 
  subjects, 
  template,
  onSelectSubject, 
  onAddSubject,
  onDeleteSubject 
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
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5">{housingUnit.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {currentCount} / {capacity} subjects
            {template && ` • ${template.species?.name || 'Generic'} Template`}
          </Typography>
        </Box>
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

      <Grid container spacing={2}>
        {slots.map(({ slot, subject }) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={slot}>
            <Card
              sx={{
                cursor: subject ? 'pointer' : 'default',
                opacity: subject ? 1 : 0.5,
                border: subject ? '2px solid' : '1px dashed',
                borderColor: subject ? 'primary.main' : 'divider',
                '&:hover': subject ? {
                  boxShadow: 3,
                  borderColor: 'primary.dark'
                } : {}
              }}
              onClick={() => subject && onSelectSubject(subject)}
            >
              <CardContent>
                <Stack spacing={1}>
                  {subject ? (
                    <>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
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
                          {Object.entries(subject.customFieldValues).slice(0, 2).map(([key, value]) => (
                            value && (
                              <Typography key={key} variant="caption" display="block" color="text.secondary">
                                {key}: {String(value).substring(0, 20)}
                              </Typography>
                            )
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
    </Box>
  );
}

// Made with Bob
