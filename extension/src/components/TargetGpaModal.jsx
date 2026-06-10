import React, { useState, useMemo } from "react";
import PropTypes from "prop-types";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import {
  Typography,
  Dialog,
  DialogContent,
  DialogActions,
  CircularProgress,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@ellucian/react-design-system/core";

// ─── Icons ────────────────────────────────────────────────────────────────────
const ErrorCircleIcon = ({ style }) => (
  <svg style={style} viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
  </svg>
);
ErrorCircleIcon.propTypes = { style: PropTypes.object };
ErrorCircleIcon.defaultProps = { style: {} };

const CheckCircleIcon = ({ style }) => (
  <svg style={style} viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14l-4-4 1.41-1.41L10 13.17l6.59-6.59L18 8l-8 8z" />
  </svg>
);
CheckCircleIcon.propTypes = { style: PropTypes.object };
CheckCircleIcon.defaultProps = { style: {} };

const TrophyIcon = ({ style }) => (
  <svg style={style} viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor">
    <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" />
  </svg>
);
TrophyIcon.propTypes = { style: PropTypes.object };
TrophyIcon.defaultProps = { style: {} };

const TargetIcon = ({ style }) => (
  <svg style={style} viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-12c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
  </svg>
);
TargetIcon.propTypes = { style: PropTypes.object };
TargetIcon.defaultProps = { style: {} };

const BulbIcon = ({ style }) => (
  <svg style={style} viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor">
    <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z" />
  </svg>
);
BulbIcon.propTypes = { style: PropTypes.object };
BulbIcon.defaultProps = { style: {} };

const DownloadIcon = ({ style }) => (
  <svg style={style} viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor">
    <path d="M19 9h-4V3H9v6H5l7 7 7-7zm-8 2V5h2v6h1.17L12 13.17 9.83 11H11zm-6 7h14v2H5z" />
  </svg>
);
DownloadIcon.propTypes = { style: PropTypes.object };
DownloadIcon.defaultProps = { style: {} };

const EditIcon = ({ style }) => (
  <svg style={style} viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
  </svg>
);
EditIcon.propTypes = { style: PropTypes.object };
EditIcon.defaultProps = { style: {} };

// ─── Helpers ──────────────────────────────────────────────────────────────────
const isAchievable = (text) =>
  text &&
  /possible|can achieve|achievable|yes/i.test(text) &&
  !/not possible|cannot|can't|not achieve|not achievable/i.test(text);

const tableSx = {
  "& *": { boxShadow: "none !important" },
  "& .MuiTableRow-root": { backgroundColor: "#fff !important" },
  "& .MuiTableRow-root:hover": { backgroundColor: "#f0f4ff !important" },
  "& .MuiTableCell-root": { backgroundColor: "#fff !important" },
  "& .MuiTableHead-root .MuiTableRow-root": { backgroundColor: "primary.main !important" },
  "& .MuiTableHead-root .MuiTableCell-root": {
    backgroundColor: "primary.main !important",
    color: "#ffffff !important",
    fontWeight: 700,
    fontSize: "13px",
    textTransform: "none",
    letterSpacing: "normal",
    borderBottom: "none",
  },
  "& .MuiTableBody-root .MuiTableCell-root": {
    backgroundColor: "#fff !important",
    borderBottom: "1px solid #f3f4f6",
    color: "#374151",
    fontSize: "13px",
  },
};

// ─── Generate preset GPA options between programGpa and maxAchievableGpa ──────
const generatePresets = (programGpa, maxAchievableGpa, scaleMax) => {
  const min = parseFloat(programGpa) || 0;
  const max = parseFloat(maxAchievableGpa) || parseFloat(scaleMax) || 4.0;
  const range = max - min;

  if (range <= 0) return [];

  // Generate ~5 evenly-spaced steps, rounded to nearest 0.25
  const steps = 5;
  const raw = Array.from({ length: steps }, (_, i) => {
    const val = min + ((i + 1) / (steps + 1)) * range;
    return Math.round(val * 4) / 4; // round to nearest 0.25
  });

  // Deduplicate and filter: must be strictly > min and <= max
  return [...new Set(raw)]
    .filter((v) => v > min && v <= max)
    .map((v) => parseFloat(v.toFixed(2)));
};

// ─── Max GPA Ring ─────────────────────────────────────────────────────────────
const MaxGpaRing = ({ maxGpa, programGpa, scaleMax }) => {
  const scale = parseFloat(scaleMax) || 4.0;
  const current = parseFloat(programGpa) || 0;
  const max = parseFloat(maxGpa) || scale;

  const RADIUS = 26;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const currentOffset = CIRCUMFERENCE * (1 - Math.min(current / scale, 1));
  const maxOffset = CIRCUMFERENCE * (1 - Math.min(max / scale, 1));

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        backgroundColor: "#f0fdf4",
        border: "1.5px solid #86efac",
        borderRadius: "12px",
        padding: "14px 20px",
        flex: 1,
      }}
    >
      <div style={{ position: "relative", width: 64, height: 64, flexShrink: 0 }}>
        <svg width="64" height="64" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r={RADIUS} fill="none" stroke="#dcfce7" strokeWidth="5" />
          <circle
            cx="32" cy="32" r={RADIUS} fill="none" stroke="#a78bfa" strokeWidth="5"
            strokeDasharray={CIRCUMFERENCE} strokeDashoffset={currentOffset}
            strokeLinecap="round" transform="rotate(-90 32 32)"
          />
          <circle
            cx="32" cy="32" r={RADIUS} fill="none" stroke="#16a34a" strokeWidth="5"
            strokeDasharray={CIRCUMFERENCE} strokeDashoffset={maxOffset}
            strokeLinecap="round" transform="rotate(-90 32 32)"
          />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <TrophyIcon style={{ color: "#16a34a", fontSize: "18px" }} />
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <Typography variant="body2" style={{ color: "#15803d", fontWeight: 700, fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.8px", margin: 0 }}>
          Max Achievable GPA
        </Typography>
        <Typography variant="body2" style={{ color: "#14532d", fontWeight: 900, fontSize: "28px", lineHeight: 1, margin: 0 }}>
          {max.toFixed(2)}
        </Typography>
        <Typography variant="body2" style={{ color: "#15803d", fontSize: "11px", margin: 0 }}>
          Based on your current progress
        </Typography>
      </div>
    </div>
  );
};

MaxGpaRing.propTypes = {
  maxGpa: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  programGpa: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  scaleMax: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
MaxGpaRing.defaultProps = { maxGpa: null, programGpa: 0, scaleMax: 4.0 };

// ─── Main Component ───────────────────────────────────────────────────────────
const TargetGpaModal = ({
  open,
  onClose,
  onSubmit,
  loading,
  result,
  maxGpa,
  programGpa,
  targetGpa: targetGpaProp,
  maxAchievableGpa,
}) => {
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [customInput, setCustomInput] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);

  const resultRef = React.useRef(null);

  const scaleMax = parseFloat(maxGpa) || 4.0;
  const parsedProgramGpa = parseFloat(programGpa) || 0;
  const parsedMaxAchievable = parseFloat(maxAchievableGpa) || scaleMax;
  const inputScreenMaxGpa = maxAchievableGpa || maxGpa;

  // The active value is either the custom input or the selected preset
  const activeValue = customInput !== "" ? customInput : selectedPreset !== null ? String(selectedPreset) : "";
  const activeNumeric = parseFloat(activeValue);

  // Generate preset buttons
  const presets = useMemo(
    () => generatePresets(parsedProgramGpa, parsedMaxAchievable, scaleMax),
    [parsedProgramGpa, parsedMaxAchievable, scaleMax]
  );

  const handleClose = () => {
    setSelectedPreset(null);
    setCustomInput("");
    onClose();
  };

  // Validation
  const isOutOfRange = !isNaN(activeNumeric) && (activeNumeric < 0 || activeNumeric > scaleMax);
  const isBelowOrEqualProgram = !isNaN(activeNumeric) && activeNumeric <= parsedProgramGpa;
  const isAboveMaxAchievable = !isNaN(activeNumeric) && !isNaN(parsedMaxAchievable) && activeNumeric > parsedMaxAchievable;

  const hasError = Boolean(activeValue && (isOutOfRange || isBelowOrEqualProgram || isAboveMaxAchievable));

  const getHelperText = () => {
    if (!activeValue) return "";
    if (isOutOfRange) return `Please enter a GPA between 0 and ${scaleMax}`;
    if (isAboveMaxAchievable)
      return `Target GPA cannot exceed your Maximum Achievable GPA of ${parsedMaxAchievable.toFixed(2)}`;
    if (isBelowOrEqualProgram)
      return `Target GPA must be greater than your current Program GPA of ${parsedProgramGpa.toFixed(2)}`;
    return "";
  };

  const canSubmit = activeValue && !hasError && !isNaN(activeNumeric);

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit(activeNumeric);
  };

  const handlePresetClick = (val) => {
    setSelectedPreset(val);
    setCustomInput(""); // clear custom when preset chosen
  };

  const handleCustomChange = (e) => {
    setCustomInput(e.target.value);
    setSelectedPreset(null); // deselect preset when typing custom
  };

  // ── PDF Download ──────────────────────────────────────────────────────────
  const downloadPdf = async () => {
    const element = resultRef.current;
    if (!element) return;
    setPdfLoading(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const A4_WIDTH_MM = 210;
      const A4_HEIGHT_MM = 297;
      const MARGIN_MM = 12;
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const printableWidth = A4_WIDTH_MM - MARGIN_MM * 2;
      const printableHeight = A4_HEIGHT_MM - MARGIN_MM * 2;
      const PX_PER_MM = (96 * 2) / 25.4;
      const imgWidthMm = canvas.width / PX_PER_MM;
      const imgHeightMm = canvas.height / PX_PER_MM;
      const scaleFactor = printableWidth / imgWidthMm;
      const scaledWidthMm = printableWidth;
      const scaledHeightMm = imgHeightMm * scaleFactor;
      const totalPages = Math.ceil(scaledHeightMm / printableHeight);

      for (let page = 0; page < totalPages; page++) {
        if (page > 0) pdf.addPage();
        const yOffsetMm = page * printableHeight;
        const sliceHeightMm = Math.min(printableHeight, scaledHeightMm - yOffsetMm);
        const srcYPx = Math.round((yOffsetMm / scaleFactor / imgHeightMm) * canvas.height);
        const srcHeightPx = Math.round((sliceHeightMm / scaleFactor / imgHeightMm) * canvas.height);
        const sliceCanvas = document.createElement("canvas");
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = srcHeightPx;
        const ctx = sliceCanvas.getContext("2d");
        ctx.drawImage(canvas, 0, srcYPx, canvas.width, srcHeightPx, 0, 0, canvas.width, srcHeightPx);
        const sliceData = sliceCanvas.toDataURL("image/png");
        pdf.addImage(sliceData, "PNG", MARGIN_MM, MARGIN_MM, scaledWidthMm, sliceHeightMm);
      }

      pdf.save(`GPA_Recommendation_${displayTargetGpa}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setPdfLoading(false);
    }
  };

  // ── Parse result ──────────────────────────────────────────────────────────
  let parsed = null;
  if (result?.data) {
    try {
      parsed = JSON.parse(result.data);
    } catch (e) {
      parsed = null;
    }
  }

  const achievable = parsed ? isAchievable(parsed.achievability) : null;
  const displayMaxGpa = result?.maxAchievableGpa;
  const displayTargetGpa = targetGpaProp || activeValue || "—";

  const helperText = getHelperText();

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">

      {/* ── Title ── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid #e5e7eb",
        padding: "14px 24px",
        backgroundColor: "#fff",
      }}>
        <div>
          <Typography variant="h3" style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700, textTransform: "none", letterSpacing: "normal" }}>
            AI Recommendation
          </Typography>
          {!result && !loading && (
            <Typography variant="body2" style={{ margin: 0, fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>
              Get personalized insights and a recommended path to reach your goal.
            </Typography>
          )}
        </div>
        <button
          onClick={handleClose}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", borderRadius: "6px", backgroundColor: "transparent", border: "none", cursor: "pointer", padding: 0 }}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#6B21A8" strokeWidth="2.2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <DialogContent style={{ padding: "20px 24px 12px 24px", backgroundColor: "#fff", overflow: "visible" }}>

        {/* ── INPUT STATE ── */}
        {!result && !loading && (
          <>
            {/* Section heading */}
            <Typography variant="body1" style={{ fontWeight: 700, color: "#111827", fontSize: "15px", marginBottom: "4px" }}>
              Let&apos;s set your target GPA
            </Typography>
            <Typography variant="body2" style={{ color: "#6b7280", fontSize: "12.5px", marginBottom: "16px" }}>
              Tell us your goal and we&apos;ll show you how to achieve it.
            </Typography>

            {/* Program GPA + Max Achievable GPA cards */}
            <div style={{ display: "flex", alignItems: "stretch", gap: "12px", marginBottom: "20px" }}>

              {/* Program GPA card */}
              <div style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                backgroundColor: "#f5f3ff",
                border: "1.5px solid #ddd6fe",
                borderRadius: "12px",
                padding: "14px 20px",
                flex: 1,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  {/* Graduation cap icon */}
                  <div style={{ width: 28, height: 28, borderRadius: "50%", backgroundColor: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="#7c3aed">
                      <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zm-1 13.99L5 13.5v4L12 21l7-3.5v-4l-6 3.49z" />
                    </svg>
                  </div>
                  <Typography variant="body2" style={{ color: "#7c3aed", fontWeight: 700, fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.8px", margin: 0 }}>
                    Current Program GPA
                  </Typography>
                </div>
                <Typography variant="body2" style={{ color: "#5b21b6", fontWeight: 900, fontSize: "32px", lineHeight: 1, margin: 0 }}>
                  {parsedProgramGpa != null && !isNaN(parsedProgramGpa)
                    ? parsedProgramGpa.toFixed(2)
                    : "N/A"}
                </Typography>
                <Typography variant="body2" style={{ color: "#7c3aed", fontSize: "11px", marginTop: "4px" }}>
                  Your current performance
                </Typography>
              </div>

              {/* Max Achievable GPA ring */}
              {inputScreenMaxGpa && (
                <MaxGpaRing maxGpa={inputScreenMaxGpa} programGpa={programGpa} scaleMax={maxGpa} />
              )}
            </div>

            {/* Preset GPA buttons section */}
            <Typography variant="body1" style={{ fontWeight: 700, color: "#111827", fontSize: "14px", marginBottom: "10px" }}>
              Choose your target GPA
            </Typography>

            {/* Constraint hint */}
            <Typography variant="body2" style={{ color: "#6b7280", fontSize: "11.5px", marginBottom: "12px" }}>
              Target GPA must be greater than your current Program GPA of{" "}
              <strong style={{ color: "#5b21b6" }}>{parsedProgramGpa.toFixed(2)}</strong>
              {" "}and less than max achievable GPA of{" "}
              <strong style={{ color: "#16a34a" }}>{parsedMaxAchievable.toFixed(2)}</strong>
            </Typography>

            {/* Preset buttons */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
              {presets.length > 0 ? presets.map((val) => {
                const isSelected = selectedPreset === val && customInput === "";
                return (
                  <button
                    key={val}
                    onClick={() => handlePresetClick(val)}
                    style={{
                      flex: 1,
                      minWidth: "56px",
                      padding: "10px 8px",
                      borderRadius: "8px",
                      border: isSelected ? "2px solid #7c3aed" : "1.5px solid #d1d5db",
                      backgroundColor: isSelected ? "#f5f3ff" : "#fff",
                      color: isSelected ? "#5b21b6" : "#374151",
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: "14px",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      boxShadow: isSelected ? "0 0 0 3px #ede9fe" : "none",
                    }}
                  >
                    {val.toFixed(2)}
                  </button>
                );
              }) : (
                <Typography variant="body2" style={{ color: "#9ca3af", fontSize: "12px" }}>
                  No preset options available for your current GPA range.
                </Typography>
              )}
            </div>

            {/* Custom GPA input */}
            <div style={{ position: "relative" }}>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                  <EditIcon style={{ color: "#9ca3af", fontSize: "16px" }} />
                </span>
                <input
                  type="number"
                  step="0.01"
                  min={parsedProgramGpa}
                  max={parsedMaxAchievable}
                  value={customInput}
                  onChange={handleCustomChange}
                  placeholder="Enter custom GPA"
                  style={{
                    width: "100%",
                    padding: "11px 100px 11px 36px",
                    borderRadius: "8px",
                    border: hasError && customInput !== "" ? "1.5px solid #ef4444" : "1.5px solid #d1d5db",
                    fontSize: "14px",
                    color: "#374151",
                    outline: "none",
                    backgroundColor: "#fff",
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                  }}
                />
                <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "12px", color: "#9ca3af", pointerEvents: "none" }}>
                  {parsedProgramGpa.toFixed(2)} – {parsedMaxAchievable.toFixed(2)}
                </span>
              </div>

              {/* Inline error */}
              {hasError && customInput !== "" && helperText && (
                <Typography variant="body2" style={{ color: "#ef4444", fontSize: "11.5px", marginTop: "5px", marginLeft: "2px" }}>
                  {helperText}
                </Typography>
              )}

              {/* Validation message for preset out of range — edge case */}
              {hasError && customInput === "" && selectedPreset !== null && helperText && (
                <Typography variant="body2" style={{ color: "#ef4444", fontSize: "11.5px", marginTop: "5px", marginLeft: "2px" }}>
                  {helperText}
                </Typography>
              )}
            </div>
          </>
        )}

        {/* ── LOADING ── */}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "24px 0", justifyContent: "center" }}>
            <CircularProgress size={28} />
            <Typography variant="body2">Fetching recommendations...</Typography>
          </div>
        )}

        {/* ── RESULT ── */}
        {parsed && !loading && (
          <div ref={resultRef} style={{ backgroundColor: "#fff", padding: "4px" }}>

            {/* Status banner */}
            <div style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
              backgroundColor: achievable ? "#dcfce7" : "#fef2f2",
              border: `1px solid ${achievable ? "#bbf7d0" : "#fecaca"}`,
              borderRadius: "8px",
              padding: "14px 18px",
              marginBottom: "12px",
            }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0, backgroundColor: achievable ? "#16a34a" : "#dc2626", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {achievable
                  ? <CheckCircleIcon style={{ color: "#fff", fontSize: "20px" }} />
                  : <ErrorCircleIcon style={{ color: "#fff", fontSize: "20px" }} />}
              </div>
              <div>
                <Typography variant="body2" style={{ fontWeight: 700, color: achievable ? "#166534" : "#991b1b", marginBottom: 4 }}>
                  Target GPA Status
                </Typography>
                <Typography variant="body2" style={{ color: achievable ? "#166534" : "#7f1d1d", fontSize: "13px", lineHeight: 1.6 }}>
                  {parsed.achievability}
                </Typography>
              </div>
            </div>

            {/* Stat cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <div style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "14px 16px", border: "2px solid #bbf7d0", display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <TrophyIcon style={{ color: "#16a34a", fontSize: "20px" }} />
                </div>
                <div>
                  <Typography variant="body2" style={{ color: "#16a34a", fontWeight: 600, fontSize: "12px", marginBottom: 2 }}>
                    Maximum Achievable GPA
                  </Typography>
                  <Typography variant="h4" style={{ color: "#14532d", fontWeight: 800, fontSize: "22px", margin: 0 }}>
                    {displayMaxGpa}
                  </Typography>
                </div>
              </div>
              <div style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "14px 16px", border: "2px solid #fed7aa", display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "#ffedd5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <TargetIcon style={{ color: "#ea580c", fontSize: "20px" }} />
                </div>
                <div>
                  <Typography variant="body2" style={{ color: "#ea580c", fontWeight: 600, fontSize: "12px", marginBottom: 2 }}>
                    Target GPA
                  </Typography>
                  <Typography variant="h4" style={{ color: "#9a3412", fontWeight: 800, fontSize: "22px", margin: 0 }}>
                    {displayTargetGpa}
                  </Typography>
                </div>
              </div>
            </div>

            {/* Grade table */}
            {parsed.grades && parsed.grades.length > 0 && (
              <div style={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #e5e7eb", overflow: "hidden", marginBottom: "12px" }}>
                <div style={{ padding: "12px 18px", textAlign: "center" }}>
                  <Typography variant="h5" style={{ margin: 0 }}>
                    Recommended Grades for Remaining Courses
                  </Typography>
                </div>
                <Table size="small" sx={tableSx}>
                  <TableHead>
                    <TableRow>
                      <TableCell><Typography variant="body2" style={{ color: "#ffffff", fontWeight: 700 }}>#</Typography></TableCell>
                      <TableCell><Typography variant="body2" style={{ color: "#ffffff", fontWeight: 700 }}>Course</Typography></TableCell>
                      <TableCell><Typography variant="body2" style={{ color: "#ffffff", fontWeight: 700 }}>Credits</Typography></TableCell>
                      <TableCell><Typography variant="body2" style={{ color: "#ffffff", fontWeight: 700 }}>Recommended Grade</Typography></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {parsed.grades.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell><Typography variant="body2">{idx + 1}</Typography></TableCell>
                        <TableCell><Typography variant="body2" style={{ fontWeight: 500 }}>{row.course}</Typography></TableCell>
                        <TableCell><Typography variant="body2">{row.credits}</Typography></TableCell>
                        <TableCell>
                          <Typography variant="body2" style={{ display: "inline-block", padding: "2px 18px", borderRadius: "12px", backgroundColor: "#dcfce7", color: "#16a34a", fontWeight: 700, fontSize: "14px" }}>
                            {row.grade}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Recommendation */}
            {parsed.recommendation && (
              <div style={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #e5e7eb", padding: "14px 18px", display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <BulbIcon style={{ color: "#2563eb", fontSize: "20px" }} />
                </div>
                <div>
                  <Typography variant="body2" style={{ fontWeight: 700, color: "#2563eb", marginBottom: 6 }}>
                    Recommendation
                  </Typography>
                  <Typography variant="body2" style={{ fontSize: "13px", lineHeight: 1.6 }}>
                    {parsed.recommendation}
                  </Typography>
                </div>
              </div>
            )}

            <Typography variant="body2" style={{ marginTop: "14px", textAlign: "center", fontSize: "11px", color: "#9ca3af" }}>
              AI-generated · Results may not be fully accurate. Verify with your academic advisor.
            </Typography>
          </div>
        )}
      </DialogContent>

      {/* ── Actions ── */}
      <DialogActions style={{ borderTop: "1px solid #e5e7eb", padding: "12px 20px", backgroundColor: "#fff", justifyContent: "flex-end", gap: "8px" }}>

        {/* Cancel / Close */}
        <button
          onClick={handleClose}
          style={{
            textTransform: "none",
            color: "#374151",
            border: "1.5px solid #d1d5db",
            borderRadius: "6px",
            backgroundColor: "#fff",
            padding: "8px 20px",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: 600,
            letterSpacing: "0.2px",
          }}
        >
          Cancel
        </button>

        {/* Download PDF — only when result available */}
        {result && (
          <button
            onClick={downloadPdf}
            disabled={pdfLoading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              textTransform: "none",
              backgroundColor: pdfLoading ? "#86efac" : "#16a34a",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              padding: "8px 20px",
              cursor: pdfLoading ? "not-allowed" : "pointer",
              fontSize: "13px",
              fontWeight: 600,
              letterSpacing: "0.2px",
            }}
          >
            {pdfLoading
              ? <CircularProgress size={14} style={{ color: "#fff" }} />
              : <DownloadIcon style={{ fontSize: "16px", color: "#fff" }} />}
            {pdfLoading ? "Generating..." : "Download PDF"}
          </button>
        )}

        {/* Get AI Recommendation — only before result */}
        {!result && (
          <button
            onClick={handleSubmit}
            disabled={loading || !canSubmit}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              textTransform: "none",
              backgroundColor: loading || !canSubmit ? "#c4b5fd" : "#300e4d",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              padding: "9px 20px",
              cursor: loading || !canSubmit ? "not-allowed" : "pointer",
              fontSize: "13px",
              fontWeight: 600,
              letterSpacing: "0.2px",
            }}
          >
            {/* AI sparkle icon */}
            <svg viewBox="0 0 32 32" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="16" fill="url(#sparkle_grad)" />
              <path d="M17.549 9.4c-.17.06-.28.23-.28.41s.11.32.28.38l1.79.67c.23.09.41.27.49.49l.67 1.79c.06.17.23.28.41.28s.32-.11.38-.28l.67-1.79c.09-.23.27-.41.49-.49l1.79-.67c.17-.06.28-.23.28-.41s-.11-.32-.28-.38l-1.79-.67c-.23-.09-.41-.27-.49-.49l-.67-1.79c-.06-.17-.23-.28-.41-.28s-.32.11-.38.28l-.67 1.79c-.09.23-.27.41-.49.49L17.549 9.4ZM5.469 15.28c-.22.1-.35.32-.35.55s.14.45.35.55l.65.3.31.14h.02l3.07 1.43c.18.08.33.23.41.41l1.42 3.07v.02l.15.31.3.65c.1.22.32.35.55.35s.45-.14.55-.35l.3-.65.14-.31v-.02l1.43-3.07c.08-.18.23-.33.41-.41l3.07-1.42h.02l.31-.14.65-.3c.22-.1.35-.32.35-.55s-.14-.45-.35-.55l-.65-.3-.31-.14h-.02l-3.07-1.43c-.18-.08-.33-.23-.41-.41l-1.43-3.07v-.02l-.14-.31-.3-.65c-.1-.22-.32-.35-.55-.35s-.45.14-.55.35l-.3.65-.14.31v-.02l-1.43 3.07c-.08.18-.23.33-.41.41L6.469 14.98h-.02l-.31.14-.67.16Zm3.15.55 1.66-.77c.58-.27 1.04-.73 1.31-1.31.3-.65 1.23-.65 1.53 0 .27.58.73 1.04 1.31 1.31.65.3.65 1.23 0 1.53-.58.27-1.04.73-1.31 1.31-.3.65-1.23.65-1.53 0-.27-.58-.73-1.04-1.31-1.31L8.619 15.83ZM19.829 20.39c-.09.23-.27.41-.49.49l-1.79.67c-.17.06-.28.23-.28.41s.11.32.28.38l1.79.67c.23.09.41.27.49.49l.67 1.79c.06.17.23.28.41.28s.32-.11.38-.28l.67-1.79c.09-.23.27-.41.49-.49l1.79-.67c.17-.06.28-.23.28-.41s-.11-.32-.28-.38l-1.79-.67c-.23-.09-.41-.27-.49-.49l-.67-1.79c-.06-.17-.23-.28-.41-.28s-.32.11-.38.28l-.67 1.79Z" fill="white"/>
              <defs>
                <linearGradient id="sparkle_grad" x1="16" y1="0" x2="16" y2="29.5" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#360140"/>
                  <stop offset="0.2" stopColor="#480A54"/>
                  <stop offset="0.45" stopColor="#5A1366"/>
                  <stop offset="0.72" stopColor="#651972"/>
                  <stop offset="1" stopColor="#691B76"/>
                </linearGradient>
              </defs>
            </svg>
            {loading ? "Loading..." : "Get AI Recommendation"}
          </button>
        )}
      </DialogActions>
    </Dialog>
  );
};

TargetGpaModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  result: PropTypes.shape({
    maxAchievableGpa: PropTypes.string,
    data: PropTypes.string,
  }),
  maxGpa: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  programGpa: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  targetGpa: PropTypes.string,
  maxAchievableGpa: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

TargetGpaModal.defaultProps = {
  loading: false,
  result: null,
  maxGpa: "4.0",
  programGpa: null,
  targetGpa: null,
  maxAchievableGpa: null,
};

export default TargetGpaModal;