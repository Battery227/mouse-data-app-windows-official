import React from "react";
import { Button, Stack } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DownloadIcon from "@mui/icons-material/Download";

function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ImportExport({ onExport, onImport }) {
  const fileInputRef = React.useRef(null);

  const handleExport = () => {
    const payload = onExport();
    const ts = new Date().toISOString().slice(0, 19).replaceAll(":", "-");
    downloadJson(`mouse-colony-data_${ts}.json`, payload);
  };

  const handlePick = () => fileInputRef.current?.click();

  const handleFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const text = await f.text();
      const json = JSON.parse(text);
      onImport(json);
    } catch (err) {
      alert("Import failed. Make sure this is a valid JSON export from the app.");
      console.error(err);
    } finally {
      e.target.value = "";
    }
  };

  return (
    <Stack direction="row" spacing={1}>
      <Button color="inherit" variant="outlined" sx={{ borderColor: "rgba(255,255,255,0.4)" }} startIcon={<DownloadIcon />} onClick={handleExport}>
        Export
      </Button>
      <Button color="inherit" variant="contained" startIcon={<UploadFileIcon />} onClick={handlePick}>
        Import
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        style={{ display: "none" }}
        onChange={handleFile}
      />
    </Stack>
  );
}