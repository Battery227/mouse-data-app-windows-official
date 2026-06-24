import React from "react";
import { ThemeProvider } from "@mui/material/styles";
import {
  Box, CssBaseline, AppBar, Toolbar, Typography, IconButton, Chip, Stack,
  Tooltip, Button, Alert, AlertTitle, Menu, MenuItem, Dialog, DialogContent, DialogTitle
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DownloadIcon from "@mui/icons-material/Download";
import UploadIcon from "@mui/icons-material/Upload";
import SettingsIcon from "@mui/icons-material/Settings";
import ScienceIcon from "@mui/icons-material/Science";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { theme } from "./theme";
import { useAppStateV2 } from "./storage/useAppStateV2";
import { getEnvironmentName } from "./storage/environment";
import HousingUnitSidebar from "./components/HousingUnitSidebar";
import HousingUnitView from "./components/HousingUnitView";
import SubjectDrawerV2 from "./components/SubjectDrawerV2";
import ExperimentSwitcher from "./components/ExperimentSwitcher";
import EnhancedExport from "./components/EnhancedExport";
import TemplateSelector from "./components/TemplateSelector";
import ScheduleTimeline from "./components/ScheduleTimeline";
import TemplateBuilderDialog from "./components/TemplateBuilder";
import { BUILT_IN_TEMPLATES } from "./core/schema/builtInTemplates";

function SaveChip({ saveStatus }) {
  if (saveStatus === "loading") return <Chip label="Loading…" size="small" />;
  if (saveStatus === "saving") return <Chip label="Saving…" size="small" color="warning" />;
  if (saveStatus === "error") {
    return (
      <Tooltip title="Storage unavailable - data will be lost on reload. Export your data immediately!">
        <Chip label="⚠️ NOT SAVED" size="small" color="error" />
      </Tooltip>
    );
  }
  return <Chip label="Saved ✓" size="small" color="success" />;
}

export default function AppV2() {
  const { state, api, saveStatus, activeExperimentId } = useAppStateV2();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [selectedHousingId, setSelectedHousingId] = React.useState(null);
  const [selectedSubject, setSelectedSubject] = React.useState(null);
  const [exportDialogOpen, setExportDialogOpen] = React.useState(false);
  const [experimentSwitcherOpen, setExperimentSwitcherOpen] = React.useState(false);
  const [templateSelectorOpen, setTemplateSelectorOpen] = React.useState(false);
  const [templateBuilderOpen, setTemplateBuilderOpen] = React.useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = React.useState(false);
  const [storageEnv] = React.useState(() => getEnvironmentName());
  const [expMenuAnchor, setExpMenuAnchor] = React.useState(null);

  const activeExperiment = state?.experiments?.find(e => e.id === activeExperimentId);
  const activeTemplate = state?.templates?.find(t => t.id === activeExperiment?.templateId) || BUILT_IN_TEMPLATES[0];
  
  // Get housing units for active experiment
  const housingUnits = React.useMemo(() => {
    return (state?.housingUnits || []).filter(h => h.experimentId === activeExperimentId);
  }, [state?.housingUnits, activeExperimentId]);

  // Get subjects for active experiment
  const subjects = React.useMemo(() => {
    return (state?.subjects || []).filter(s => s.experimentId === activeExperimentId);
  }, [state?.subjects, activeExperimentId]);

  // Get events for active experiment
  const events = React.useMemo(() => {
    return (state?.events || []).filter(e => e.experimentId === activeExperimentId);
  }, [state?.events, activeExperimentId]);

  const selectedHousing = housingUnits.find(h => h.id === selectedHousingId);

  const handleAddHousing = (name) => {
    const newId = api.addHousingUnit(name, activeExperimentId);
    setSelectedHousingId(newId);
    return newId;
  };

  const handleDeleteHousing = (housingId) => {
    const housing = housingUnits.find(h => h.id === housingId);
    const ok = window.confirm(
      `Delete "${housing?.name}" and ALL subjects/events inside it? This cannot be undone.`
    );
    if (!ok) return;
    api.deleteHousingUnit(housingId);
    if (selectedHousingId === housingId) {
      const remaining = housingUnits.filter(h => h.id !== housingId);
      setSelectedHousingId(remaining[0]?.id || null);
      setSelectedSubject(null);
    }
  };

  const handleExperimentMenu = (event) => {
    setExpMenuAnchor(event.currentTarget);
  };

  const handleCloseExpMenu = () => {
    setExpMenuAnchor(null);
  };

  React.useEffect(() => {
    if (state && !selectedHousingId && housingUnits.length > 0) {
      setSelectedHousingId(housingUnits[0].id);
    }
  }, [state, selectedHousingId, housingUnits]);

  if (!state || !api) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ p: 3 }}>
          <Typography>Loading…</Typography>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex", height: "100vh" }}>
        <AppBar position="fixed" elevation={0} sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
          <Toolbar>
            <Tooltip title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}>
              <IconButton
                edge="start"
                onClick={() => setSidebarOpen(v => !v)}
                sx={{
                  mr: 1.5,
                  bgcolor: 'background.paper',
                  color: 'primary.main',
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': { bgcolor: 'grey.100' }
                }}
              >
                <MenuIcon />
              </IconButton>
            </Tooltip>
            
            <Stack direction="row" spacing={2} sx={{ flex: 1, alignItems: "center" }}>
              <Typography variant="h6">InVivo Research Manager V2</Typography>
              
              {activeExperiment && (
                <Chip
                  icon={<ScienceIcon />}
                  label={activeExperiment.name}
                  color="primary"
                  size="small"
                  onClick={handleExperimentMenu}
                  sx={{ cursor: 'pointer' }}
                />
              )}
              
              <Menu
                anchorEl={expMenuAnchor}
                open={Boolean(expMenuAnchor)}
                onClose={handleCloseExpMenu}
              >
                <MenuItem onClick={() => { setExperimentSwitcherOpen(true); handleCloseExpMenu(); }}>
                  Switch Experiment
                </MenuItem>
                <MenuItem onClick={() => { setScheduleDialogOpen(true); handleCloseExpMenu(); }}>
                  View Schedule
                </MenuItem>
              </Menu>
            </Stack>
  
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <Tooltip title={api?.canUndo ? "Undo" : "Nothing to undo"}>
                <span>
                  <IconButton
                    color="inherit"
                    onClick={() => api?.undo()}
                    disabled={!api?.canUndo}
                    size="small"
                  >
                    <UndoIcon />
                  </IconButton>
                </span>
              </Tooltip>
              
              <Tooltip title={api?.canRedo ? "Redo" : "Nothing to redo"}>
                <span>
                  <IconButton
                    color="inherit"
                    onClick={() => api?.redo()}
                    disabled={!api?.canRedo}
                    size="small"
                  >
                    <RedoIcon />
                  </IconButton>
                </span>
              </Tooltip>
              
              <Tooltip title="Schedule">
                <IconButton color="inherit" onClick={() => setScheduleDialogOpen(true)} size="small">
                  <CalendarMonthIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Experiments">
                <IconButton color="inherit" onClick={() => setExperimentSwitcherOpen(true)} size="small">
                  <ScienceIcon />
                </IconButton>
              </Tooltip>
              
              <SaveChip saveStatus={saveStatus} />
              
              <Button
                variant="outlined"
                size="small"
                startIcon={<DownloadIcon />}
                onClick={() => setExportDialogOpen(true)}
              >
                Export
              </Button>
              
              <Button
                variant="outlined"
                size="small"
                startIcon={<UploadIcon />}
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.json';
                  input.onchange = (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        try {
                          const data = JSON.parse(event.target.result);
                          api.importJson(data);
                        } catch (err) {
                          alert('Failed to import: ' + err.message);
                        }
                      };
                      reader.readAsText(file);
                    }
                  };
                  input.click();
                }}
              >
                Import
              </Button>
            </Stack>
          </Toolbar>
        </AppBar>

        {saveStatus === "error" && (
          <Alert 
            severity="error" 
            sx={{ 
              position: 'fixed', 
              top: 64, 
              left: 0, 
              right: 0, 
              zIndex: 1200,
              borderRadius: 0,
              borderBottom: '2px solid',
              borderColor: 'error.dark'
            }}
          >
            <AlertTitle><strong>⚠️ Storage Unavailable - Data Will Be Lost!</strong></AlertTitle>
            You are running in <strong>{storageEnv}</strong> mode without persistent storage. 
            All data will be lost when you close or reload this page.
            <strong> Export your data immediately using the Export button above.</strong>
            {storageEnv === 'browser' && ' To use persistent storage, run: npm run tauri dev'}
          </Alert>
        )}

        <HousingUnitSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          housingUnits={housingUnits}
          selectedUnitId={selectedHousing?.id}
          onSelectUnit={(id) => { setSelectedHousingId(id); setSelectedSubject(null); }}
          onAddUnit={handleAddHousing}
          onUpdateUnit={api.updateHousingUnit}
          onDeleteUnit={handleDeleteHousing}
          subjects={subjects}
        />

        <Box sx={{ 
          flex: 1, 
          mt: saveStatus === "error" ? 16 : 8, 
          ml: sidebarOpen ? "320px" : 0, 
          transition: "margin-left 150ms ease, margin-top 150ms ease" 
        }}>
          {selectedHousing ? (
            <HousingUnitView
              housingUnit={selectedHousing}
              subjects={subjects.filter(s => s.housingUnitId === selectedHousing.id)}
              template={activeTemplate}
              cohorts={activeExperiment?.config?.cohorts || []}
              onSelectSubject={(s) => setSelectedSubject(s)}
              onAddSubject={(housingUnitId, slot) => {
                const newId = api.addSubject(housingUnitId, `Subject-${slot}`);
                return newId;
              }}
              onDeleteSubject={(subjectId) => {
                // HousingUnitView already confirms before calling this.
                api.deleteSubject(subjectId);
              }}
              onAssignCohort={api.assignHousingUnitCohort}
              onAddCohort={api.addCohort}
              onAddGroup={api.addGroup}
            />
          ) : (
            <Box sx={{ p: 3 }}>
              <Typography>No housing unit selected.</Typography>
              <Button 
                variant="contained" 
                onClick={() => handleAddHousing("Housing Unit 1")}
                sx={{ mt: 2 }}
              >
                Add First Housing Unit
              </Button>
            </Box>
          )}
        </Box>

        {selectedHousing && selectedSubject && (
          <SubjectDrawerV2
            open={Boolean(selectedSubject)}
            onClose={() => setSelectedSubject(null)}
            subject={subjects.find(s => s.id === selectedSubject.id) || selectedSubject}
            housingUnit={selectedHousing}
            experiment={activeExperiment}
            template={activeTemplate}
            events={events}
            api={api}
          />
        )}

        <EnhancedExport
          open={exportDialogOpen}
          onClose={() => setExportDialogOpen(false)}
          state={state}
          experiments={state.experiments}
          templates={state.templates}
        />

        <ExperimentSwitcher
          open={experimentSwitcherOpen}
          onClose={() => setExperimentSwitcherOpen(false)}
          experiments={state.experiments}
          activeExperimentId={activeExperimentId}
          onSelectExperiment={api.setActiveExperimentId}
          onAddExperiment={api.addExperiment}
          onUpdateExperiment={api.updateExperiment}
          onDeleteExperiment={api.deleteExperiment}
        />


        <Dialog
          open={scheduleDialogOpen}
          onClose={() => setScheduleDialogOpen(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            Experiment Schedule: {activeExperiment?.name}
          </DialogTitle>
          <DialogContent>
            <ScheduleTimeline
              experiment={activeExperiment}
              subjects={subjects}
              onUpdateSchedule={(schedule) => {
                if (activeExperiment) {
                  api.updateExperiment(activeExperiment.id, { schedule });
                }
              }}
            />
          </DialogContent>
        </Dialog>

        <TemplateBuilderDialog
          open={templateBuilderOpen}
          onClose={() => setTemplateBuilderOpen(false)}
          onSave={(template) => {
            // Add template to state
            const newTemplate = { ...template, id: `template_${Date.now()}` };
            api.updateState?.(prev => ({
              ...prev,
              templates: [...(prev.templates || []), newTemplate]
            }));
            setTemplateBuilderOpen(false);
          }}
        />
      </Box>
    </ThemeProvider>
  );
}

// Made with Bob
