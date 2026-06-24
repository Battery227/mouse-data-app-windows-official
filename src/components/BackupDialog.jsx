/**
 * BackupDialog - download/restore a backup file, plus automatic in-app snapshots
 * (restore points). Every restore first snapshots the current data so it's reversible.
 */
import React from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, Typography,
  List, ListItem, ListItemText, Divider, Alert
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import UploadIcon from "@mui/icons-material/Upload";
import RestoreIcon from "@mui/icons-material/Restore";
import { getSnapshots, pushSnapshot } from "../storage/backup";
import { exportToJson, downloadJson } from "../core/export/exportUtils";

export default function BackupDialog({ open, onClose, state, onRestore }) {
  const [snaps, setSnaps] = React.useState([]);
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState('');

  const refresh = React.useCallback(async () => {
    setSnaps(await getSnapshots());
  }, []);

  React.useEffect(() => { if (open) { setMsg(''); refresh(); } }, [open, refresh]);

  const handleBackupNow = async () => {
    setBusy(true);
    await pushSnapshot(state);
    await refresh();
    setMsg('Snapshot saved.');
    setBusy(false);
  };

  const handleDownload = () => {
    try {
      const json = exportToJson(state, { includeTemplates: true });
      downloadJson(json, `invivo-backup-${new Date().toISOString().split('T')[0]}.json`);
      setMsg('Backup file downloaded.');
    } catch (e) {
      setMsg('Download failed: ' + e.message);
    }
  };

  const looksValid = (data) =>
    data && typeof data === 'object' && (Array.isArray(data.experiments) || data.version === 2);

  const handleRestoreFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          if (!looksValid(data)) { setMsg('That does not look like a valid backup file.'); return; }
          if (!window.confirm('Restore will replace your current data. A snapshot of the current data is saved first so you can undo. Continue?')) return;
          await pushSnapshot(state);
          onRestore(data);
          await refresh();
          setMsg('Restored from file.');
        } catch (err) {
          setMsg('Failed to read file: ' + err.message);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleRestoreSnapshot = async (snap) => {
    if (!window.confirm(`Roll back to the snapshot from ${new Date(snap.at).toLocaleString()}? A snapshot of the current data is saved first.`)) return;
    await pushSnapshot(state);
    onRestore(snap.state);
    await refresh();
    setMsg('Rolled back to ' + new Date(snap.at).toLocaleString() + '.');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Backup &amp; Restore</DialogTitle>
      <DialogContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          Your data is stored on this machine. Download a backup file regularly for an
          off-machine copy. The snapshots below are automatic in-app restore points.
        </Alert>
        {msg && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMsg('')}>{msg}</Alert>}

        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Button variant="contained" startIcon={<DownloadIcon />} onClick={handleDownload}>Download backup file</Button>
          <Button variant="outlined" startIcon={<UploadIcon />} onClick={handleRestoreFile}>Restore from file</Button>
          <Button variant="outlined" onClick={handleBackupNow} disabled={busy}>Snapshot now</Button>
        </Stack>

        <Divider sx={{ mb: 1 }} />
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Snapshots ({snaps.length})</Typography>
        {snaps.length === 0 ? (
          <Typography variant="body2" color="text.secondary">No snapshots yet.</Typography>
        ) : (
          <List dense>
            {[...snaps].reverse().map((s, i) => (
              <ListItem
                key={s.at + i}
                sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 0.5 }}
                secondaryAction={
                  <Button size="small" startIcon={<RestoreIcon />} onClick={() => handleRestoreSnapshot(s)}>Restore</Button>
                }
              >
                <ListItemText
                  primary={new Date(s.at).toLocaleString()}
                  secondary={`${s.counts.subjects} subjects · ${s.counts.events} events · ${s.counts.housingUnits} cages`}
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

// Made with Bob
