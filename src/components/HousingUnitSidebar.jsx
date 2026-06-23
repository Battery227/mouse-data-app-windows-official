/**
 * HousingUnitSidebar - V2 Component
 * 
 * Sidebar for managing housing units in V2 data model.
 * 
 * @param {Object} props
 * @param {boolean} props.open - Whether sidebar is open
 * @param {Function} props.onClose - Callback to close sidebar
 * @param {V2HousingUnit[]} props.housingUnits - Array of housing units
 * @param {string} props.selectedUnitId - ID of currently selected unit
 * @param {Function} props.onSelectUnit - Callback when unit is selected: (unitId) => void
 * @param {Function} props.onAddUnit - Callback to add unit: (name) => string
 * @param {Function} props.onDeleteUnit - Callback to delete unit: (unitId) => void
 * @param {V2Subject[]} props.subjects - All subjects (for counting)
 */
import React from "react";
import {
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

export default function HousingUnitSidebar({
  open,
  onClose,
  housingUnits,
  selectedUnitId,
  onSelectUnit,
  onAddUnit,
  onDeleteUnit,
  onUpdateUnit,
  subjects
}) {
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [newUnitName, setNewUnitName] = React.useState("");
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [editingUnit, setEditingUnit] = React.useState(null);
  const [editUnitName, setEditUnitName] = React.useState("");

  const handleAdd = () => {
    if (newUnitName.trim()) {
      onAddUnit(newUnitName.trim());
      setNewUnitName("");
      setAddDialogOpen(false);
    }
  };

  const handleEdit = (unit) => {
    setEditingUnit(unit);
    setEditUnitName(unit.name);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (editUnitName.trim() && editingUnit) {
      onUpdateUnit(editingUnit.id, { name: editUnitName.trim() });
      setEditDialogOpen(false);
      setEditingUnit(null);
      setEditUnitName("");
    }
  };

  const getSubjectCount = (unitId) => {
    return subjects.filter(s => s.housingUnitId === unitId).length;
  };

  return (
    <>
      <Drawer
        variant="persistent"
        anchor="left"
        open={open}
        sx={{
          width: 320,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 320,
            boxSizing: 'border-box',
            top: 64,
            height: 'calc(100% - 64px)'
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6">Housing Units</Typography>
          </Stack>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddDialogOpen(true)}
            fullWidth
            sx={{ mb: 2 }}
          >
            Add Housing Unit
          </Button>

          <List>
            {housingUnits.length === 0 ? (
              <ListItem>
                <ListItemText
                  primary="No housing units"
                  secondary="Click 'Add Housing Unit' to create one"
                />
              </ListItem>
            ) : (
              housingUnits.map((unit) => {
                const subjectCount = getSubjectCount(unit.id);
                const capacity = unit.capacity || 10;
                
                return (
                  <ListItem
                    key={unit.id}
                    secondaryAction={
                      <Stack direction="row" spacing={0.5}>
                        <IconButton
                          edge="end"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(unit);
                          }}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          edge="end"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteUnit(unit.id);
                          }}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    }
                    disablePadding
                  >
                    <ListItemButton
                      selected={unit.id === selectedUnitId}
                      onClick={() => onSelectUnit(unit.id)}
                    >
                      <ListItemText
                        primary={unit.name}
                        slotProps={{ secondary: { component: 'div' } }}
                        secondary={
                          <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                            <Chip
                              label={`${subjectCount}/${capacity}`}
                              size="small"
                              color={subjectCount >= capacity ? 'warning' : 'default'}
                            />
                          </Stack>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })
            )}
          </List>
        </Box>
      </Drawer>

      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)}>
        <DialogTitle>Add Housing Unit</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Name"
            value={newUnitName}
            onChange={(e) => setNewUnitName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
            fullWidth
            sx={{ mt: 1 }}
            placeholder="e.g., Cage 1, Tank A, Vial 1"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAdd} variant="contained" disabled={!newUnitName.trim()}>
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Housing Unit</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Name"
            value={editUnitName}
            onChange={(e) => setEditUnitName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
            fullWidth
            sx={{ mt: 1 }}
            placeholder="e.g., Cage 1, Tank A, Vial 1"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained" disabled={!editUnitName.trim()}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

// Made with Bob
