import React from "react";
import { ThemeProvider } from "@mui/material/styles";
import { Box, CssBaseline, AppBar, Toolbar, Typography, IconButton, Chip, Stack, Tooltip, Button, Alert, AlertTitle } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DownloadIcon from "@mui/icons-material/Download";
import UploadIcon from "@mui/icons-material/Upload";
import SettingsIcon from "@mui/icons-material/Settings";
import ScienceIcon from "@mui/icons-material/Science";
import { theme } from "./theme";
import { useAppState } from "./storage/useAppState";
import { getEnvironmentName } from "./storage/environment";
import CageSidebar from "./components/CageSidebar";
import CageView from "./components/CageView";
import MouseDrawer from "./components/MouseDrawer";
import EnhancedExport from "./components/EnhancedExport";
import ExperimentSetupWizard from "./components/ExperimentSetupWizard";

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

export default function App() {
  const { state, api, saveStatus } = useAppState();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [storageEnv] = React.useState(() => getEnvironmentName());
  const [selectedCageId, setSelectedCageId] = React.useState(null);
  const [selectedMouse, setSelectedMouse] = React.useState(null);
  const [exportDialogOpen, setExportDialogOpen] = React.useState(false);
  const [experimentConfig, setExperimentConfig] = React.useState(() => {
    // Clean up old template system data
    localStorage.removeItem('selectedTemplate');
    localStorage.removeItem('customTemplates');
    
    const saved = localStorage.getItem('experimentConfig');
    return saved ? JSON.parse(saved) : null;
  });
  
  // Show setup wizard if no experiment config exists
  const [setupWizardOpen, setSetupWizardOpen] = React.useState(!experimentConfig);

  const handleSaveExperimentConfig = (config) => {
    setExperimentConfig(config);
    localStorage.setItem('experimentConfig', JSON.stringify(config));
    setSetupWizardOpen(false);
  };

  const handleAddCage = (name, cohortId) => {
    const newId = api.addCage(name, cohortId);
    setSelectedCageId(newId);
    // keep sidebar open so you can keep adding/selecting cages
    return newId;
  };

  const handleDeleteCage = (cageId) => {
    const cages = state?.cages || [];
    const cage = cages.find(c => c.id === cageId);
    const ok = window.confirm(`Delete cage "${cage?.name || cageId}" and ALL mice/events inside it? This cannot be undone.`);
    if (!ok) return;
    api.deleteCage(cageId);
    // if deleting selected cage, select another one
    if (selectedCageId === cageId) {
      const remaining = cages.filter(c => c.id !== cageId);
      setSelectedCageId(remaining[0]?.id || null);
      setSelectedMouse(null);
    }
  };

  React.useEffect(() => {
    if (state && !selectedCageId) {
      setSelectedCageId(state.cages[0]?.id || null);
    }
  }, [state, selectedCageId]);

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

  const cages = state.cages || [];
  const selectedCage = cages.find(c => c.id === selectedCageId) || cages[0];
  const mice = state.mice || [];
  const events = state.events || [];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex", height: "100vh" }}>
        <AppBar position="fixed" elevation={0} sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
          <Toolbar>
            <Tooltip title={sidebarOpen ? "Hide cages" : "Show cages"}>
              <IconButton
                edge="start"
                color="inherit"
                onClick={() => setSidebarOpen(v => !v)}
                sx={{ mr: 1 }}
                aria-label={sidebarOpen ? "Hide cages sidebar" : "Show cages sidebar"}
              >
                <MenuIcon />
              </IconButton>
            </Tooltip>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
              <Typography variant="h6">
                InVivo Research Manager
              </Typography>
              {experimentConfig && (
                <Chip
                  label={`🔬 ${experimentConfig.name}`}
                  color="primary"
                  size="small"
                  onClick={() => setSetupWizardOpen(true)}
                  sx={{ cursor: 'pointer' }}
                />
              )}
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <Tooltip title={experimentConfig ? "Edit Experiment Setup" : "Setup Experiment"}>
                <IconButton
                  color="inherit"
                  onClick={() => setSetupWizardOpen(true)}
                  size="small"
                >
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
                          api.importJsonMerge(data);
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

        {/* Storage Error Warning Banner */}
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
            You are running in <strong>{storageEnv}</strong> mode without persistent storage. All data will be lost when you close or reload this page.
            <strong> Export your data immediately using the Export button above.</strong>
            {storageEnv === 'browser' && ' To use persistent storage, run the desktop app via: npm run tauri dev'}
          </Alert>
        )}

        <CageSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          cages={cages}
          selectedCageId={selectedCage?.id}
          onSelectCage={(id) => { setSelectedCageId(id); setSelectedMouse(null); }}
          onAddCage={(name, cohortId) => handleAddCage(name, cohortId)}
          onDeleteCage={(cageId) => handleDeleteCage(cageId)}
          experimentConfig={experimentConfig}
        />

        <Box sx={{
          flex: 1,
          mt: saveStatus === "error" ? 16 : 8,
          ml: sidebarOpen ? "320px" : 0,
          transition: "margin-left 150ms ease, margin-top 150ms ease"
        }}>
          {selectedCage ? (
            <CageView
              cage={selectedCage}
              mice={mice}
              onSelectMouse={(m) => setSelectedMouse(m)}
              api={api}
              experimentConfig={experimentConfig}
            />
          ) : (
            <Box sx={{ p: 3 }}>
              <Typography>No cage selected.</Typography>
            </Box>
          )}
        </Box>

        {selectedCage && selectedMouse ? (
          <MouseDrawer
            open={Boolean(selectedMouse)}
            onClose={() => setSelectedMouse(null)}
            cage={selectedCage}
            mouse={mice.find(x => x.id === selectedMouse.id) || selectedMouse}
            events={events}
            api={api}
            experimentConfig={experimentConfig}
          />
        ) : null}

        <EnhancedExport
          open={exportDialogOpen}
          onClose={() => setExportDialogOpen(false)}
          state={state}
          experiments={[]}
          templates={[]}
        />

        <ExperimentSetupWizard
          open={setupWizardOpen}
          onClose={() => setSetupWizardOpen(false)}
          onSave={handleSaveExperimentConfig}
          editingExperiment={experimentConfig}
        />
      </Box>
    </ThemeProvider>
  );
}