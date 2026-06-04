import React from "react";
import { ThemeProvider } from "@mui/material/styles";
import { Box, CssBaseline, AppBar, Toolbar, Typography, IconButton, Chip, Stack, Tooltip, Button } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DownloadIcon from "@mui/icons-material/Download";
import UploadIcon from "@mui/icons-material/Upload";
import SettingsIcon from "@mui/icons-material/Settings";
import { theme } from "./theme";
import { useAppState } from "./storage/useAppState";
import CageSidebar from "./components/CageSidebar";
import CageView from "./components/CageView";
import MouseDrawer from "./components/MouseDrawer";
import EnhancedExport from "./components/EnhancedExport";
import WelcomeScreen from "./components/WelcomeScreen";
import TemplateSelector from "./components/TemplateSelector";
import { BUILT_IN_TEMPLATES } from "./core/schema/builtInTemplates";

function SaveChip({ saveStatus }) {
  if (saveStatus === "loading") return <Chip label="Loading…" size="small" />;
  if (saveStatus === "saving") return <Chip label="Saving…" size="small" color="warning" />;
  if (saveStatus === "error") return <Chip label="Save error" size="small" color="error" />;
  return <Chip label="Saved ✓" size="small" color="success" />;
}

export default function App() {
  const { state, api, saveStatus } = useAppState();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [selectedCageId, setSelectedCageId] = React.useState(null);
  const [selectedMouse, setSelectedMouse] = React.useState(null);
  const [exportDialogOpen, setExportDialogOpen] = React.useState(false);
  const [templateSelectorOpen, setTemplateSelectorOpen] = React.useState(false);
  const [currentTemplate, setCurrentTemplate] = React.useState(() => {
    const saved = localStorage.getItem('selectedTemplate');
    return saved ? JSON.parse(saved) : null;
  });
  const [customTemplates, setCustomTemplates] = React.useState(() => {
    const saved = localStorage.getItem('customTemplates');
    return saved ? JSON.parse(saved) : [];
  });
  const [showWelcome, setShowWelcome] = React.useState(() => {
    return !localStorage.getItem('selectedTemplate');
  });

  const handleSelectTemplate = (template) => {
    setCurrentTemplate(template);
    localStorage.setItem('selectedTemplate', JSON.stringify(template));
    
    // If this is a new custom template, save it
    if (template.isCustom && !customTemplates.find(t => t.id === template.id)) {
      const newCustomTemplates = [...customTemplates, template];
      setCustomTemplates(newCustomTemplates);
      localStorage.setItem('customTemplates', JSON.stringify(newCustomTemplates));
    }
    
    setShowWelcome(false);
    setTemplateSelectorOpen(false);
  };

  const handleSkipWelcome = () => {
    const defaultTemplate = BUILT_IN_TEMPLATES[0];
    handleSelectTemplate(defaultTemplate);
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
              {currentTemplate && (
                <Chip
                  label={`${currentTemplate.species?.icon || '🔬'} ${currentTemplate.name}`}
                  color="primary"
                  size="small"
                  onClick={() => setTemplateSelectorOpen(true)}
                  sx={{ cursor: 'pointer' }}
                />
              )}
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <Tooltip title="Change Template">
                <IconButton
                  color="inherit"
                  onClick={() => setTemplateSelectorOpen(true)}
                  size="small"
                >
                  <SettingsIcon />
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

        <CageSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          cages={cages}
          selectedCageId={selectedCage?.id}
          onSelectCage={(id) => { setSelectedCageId(id); setSelectedMouse(null); }}
          onAddCage={(name, cohortId) => handleAddCage(name, cohortId)}
          onDeleteCage={(cageId) => handleDeleteCage(cageId)}
        />

        {/* Extra affordance: when sidebar is hidden, show a small button on the left edge */}
        {!sidebarOpen ? (
          <IconButton
            onClick={() => setSidebarOpen(true)}
            aria-label="Show cages sidebar"
            sx={{
              position: "fixed",
              top: 80,
              left: 8,
              zIndex: 1400,
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              boxShadow: 1,
            }}
          >
            <MenuIcon />
          </IconButton>
        ) : null}

        <Box sx={{ flex: 1, mt: 8, ml: sidebarOpen ? "320px" : 0, transition: "margin-left 150ms ease" }}>
          {selectedCage ? (
            <CageView
              cage={selectedCage}
              mice={mice}
              onSelectMouse={(m) => setSelectedMouse(m)}
              api={api}
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
          />
        ) : null}

        <EnhancedExport
          open={exportDialogOpen}
          onClose={() => setExportDialogOpen(false)}
          state={state}
          experiments={[]}
          templates={[]}
        />

        <WelcomeScreen
          open={showWelcome}
          onSelectTemplate={handleSelectTemplate}
          onSkip={handleSkipWelcome}
        />

        <TemplateSelector
          open={templateSelectorOpen}
          onClose={() => setTemplateSelectorOpen(false)}
          onSelect={handleSelectTemplate}
          currentTemplateId={currentTemplate?.id}
          customTemplates={customTemplates}
        />
      </Box>
    </ThemeProvider>
  );
}