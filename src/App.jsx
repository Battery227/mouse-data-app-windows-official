import React from "react";
import { ThemeProvider } from "@mui/material/styles";
import { Box, CssBaseline, AppBar, Toolbar, Typography, IconButton, Chip, Stack, Tooltip } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { theme } from "./theme";
import { useAppState } from "./storage/useAppState";
import CageSidebar from "./components/CageSidebar";
import CageView from "./components/CageView";
import MouseDrawer from "./components/MouseDrawer";
import ImportExport from "./components/ImportExport";

function SaveChip({ saveStatus }) {
  if (saveStatus === "loading") return <Chip label="Loading…" size="small" />;
  if (saveStatus === "saving") return <Chip label="Saving…" size="small" color="warning" />;
  if (saveStatus === "error") return <Chip label="Save error" size="small" color="error" />;
  return <Chip label="Saved ✓" size="small" color="success" />;
}

export default function App() {
  const { state, api, saveStatus } = useAppState();

  const handleAddCage = (name, cohortId) => {
    const newId = api.addCage(name, cohortId);
    setSelectedCageId(newId);
    // keep sidebar open so you can keep adding/selecting cages
    return newId;
  };

  const handleDeleteCage = (cageId) => {
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
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [selectedCageId, setSelectedCageId] = React.useState(null);
  const [selectedMouse, setSelectedMouse] = React.useState(null);

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
            <Typography variant="h6" sx={{ flex: 1 }}>
              Mouse Colony Manager
            </Typography>

            <Stack direction="row" spacing={1} alignItems="center">
              <SaveChip saveStatus={saveStatus} />
              <ImportExport
                onExport={() => api.exportJson()}
                onImport={(payload) => api.importJsonMerge(payload)}
              />
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
      </Box>
    </ThemeProvider>
  );
}