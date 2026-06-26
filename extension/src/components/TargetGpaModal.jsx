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

// ─── Grade Badge (pill shape) ─────────────────────────────────────────────────
const GradeBadge = ({ grade }) => {
  const isA = grade?.startsWith("A");
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "4px 14px",
      borderRadius: "999px",
      backgroundColor: isA ? "#22c55e" : "#bbf7d0",
      color: isA ? "#ffffff" : "#15803d",
      fontWeight: 700,
      fontSize: "12px",
      minWidth: "44px",
    }}>
      {grade}
    </span>
  );
};
GradeBadge.propTypes = { grade: PropTypes.string };
GradeBadge.defaultProps = { grade: "" };

// ─── Donut Chart (with total count in center) ─────────────────────────────────
const DonutChart = ({ aCount, bCount, total }) => {
  const aPercent = total > 0 ? aCount / total : 0;
  const bPercent = total > 0 ? bCount / total : 0;

  const R = 45;
  const CIRC = 2 * Math.PI * R;
  const GAP = 2;

  const aLen = CIRC * aPercent - GAP;
  const bStart = CIRC * aPercent;
  const bLen = CIRC * bPercent - GAP;

  return (
    <div style={{ position: "relative", width: 110, height: 110, flexShrink: 0 }}>
      <svg width="110" height="110" viewBox="0 0 110 110">
        <circle cx="55" cy="55" r={R} fill="none" stroke="#e5e7eb" strokeWidth="12" />
        {aLen > 0 && (
          <circle cx="55" cy="55" r={R} fill="none" stroke="#22c55e" strokeWidth="12"
            strokeDasharray={`${aLen} ${CIRC}`} strokeDashoffset={0}
            strokeLinecap="butt" transform="rotate(-90 55 55)" />
        )}
        {bLen > 0 && (
          <circle cx="55" cy="55" r={R} fill="none" stroke="#bbf7d0" strokeWidth="12"
            strokeDasharray={`${bLen} ${CIRC}`} strokeDashoffset={-bStart}
            strokeLinecap="butt" transform="rotate(-90 55 55)" />
        )}
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        pointerEvents: "none",
      }}>
        <span style={{ fontWeight: 800, fontSize: "20px", color: "#111827", lineHeight: 1 }}>{total}</span>
        <span style={{ fontSize: "9px", color: "#6b7280", lineHeight: 1.3, textAlign: "center", marginTop: "3px" }}>Total<br />Courses</span>
      </div>
    </div>
  );
};

DonutChart.propTypes = {
  aCount: PropTypes.number,
  bCount: PropTypes.number,
  total: PropTypes.number,
};
DonutChart.defaultProps = { aCount: 0, bCount: 0, total: 0 };

// ─── Generate preset GPA options ──────────────────────────────────────────────
const generatePresets = (programGpa, maxAchievableGpa, scaleMax) => {
  const min = parseFloat(programGpa) || 0;
  const max = parseFloat(maxAchievableGpa) || parseFloat(scaleMax) || 4.0;
  const range = max - min;
  if (range <= 0) return [];
  const steps = 5;
  const raw = Array.from({ length: steps }, (_, i) => {
    const val = min + ((i + 1) / (steps + 1)) * range;
    return Math.round(val * 4) / 4;
  });
  return [...new Set(raw)]
    .filter((v) => v > min && v <= max)
    .map((v) => parseFloat(v.toFixed(2)));
};

// ─── Max GPA Ring (input screen) ─────────────────────────────────────────────
const MaxGpaRing = ({ maxGpa, programGpa, scaleMax }) => {
  const scale = parseFloat(scaleMax) || 4.0;
  const current = parseFloat(programGpa) || 0;
  const max = parseFloat(maxGpa) || scale;
  const RADIUS = 26;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const currentOffset = CIRCUMFERENCE * (1 - Math.min(current / scale, 1));
  const maxOffset = CIRCUMFERENCE * (1 - Math.min(max / scale, 1));
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "16px", backgroundColor: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: "12px", padding: "14px 20px", flex: 1 }}>
      <div style={{ position: "relative", width: 64, height: 64, flexShrink: 0 }}>
        <svg width="64" height="64" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r={RADIUS} fill="none" stroke="#dcfce7" strokeWidth="5" />
          <circle cx="32" cy="32" r={RADIUS} fill="none" stroke="#a78bfa" strokeWidth="5" strokeDasharray={CIRCUMFERENCE} strokeDashoffset={currentOffset} strokeLinecap="round" transform="rotate(-90 32 32)" />
          <circle cx="32" cy="32" r={RADIUS} fill="none" stroke="#16a34a" strokeWidth="5" strokeDasharray={CIRCUMFERENCE} strokeDashoffset={maxOffset} strokeLinecap="round" transform="rotate(-90 32 32)" />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <TrophyIcon style={{ color: "#16a34a", fontSize: "18px" }} />
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <Typography variant="body2" style={{ color: "#15803d", fontWeight: 700, fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.8px", margin: 0 }}>Max Achievable GPA</Typography>
        <Typography variant="body2" style={{ color: "#14532d", fontWeight: 900, fontSize: "28px", lineHeight: 1, margin: 0 }}>{max.toFixed(2)}</Typography>
        <Typography variant="body2" style={{ color: "#15803d", fontSize: "11px", margin: 0 }}>Based on your current progress</Typography>
      </div>
    </div>
  );
};
MaxGpaRing.propTypes = { maxGpa: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), programGpa: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), scaleMax: PropTypes.oneOfType([PropTypes.string, PropTypes.number]) };
MaxGpaRing.defaultProps = { maxGpa: null, programGpa: 0, scaleMax: 4.0 };

// ─── Sparkle AI Icon ─────────────────────────────────────────────────────────
// Exported so other components (e.g. Home.jsx) can reuse the exact same icon
// instead of duplicating it as a base64 data URI.
export const SparkleIcon = ({ size }) => (
  <svg viewBox="0 0 32 32" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="16" fill="url(#sparkle_grad2)" />
    <path d="M17.549 9.4c-.17.06-.28.23-.28.41s.11.32.28.38l1.79.67c.23.09.41.27.49.49l.67 1.79c.06.17.23.28.41.28s.32-.11.38-.28l.67-1.79c.09-.23.27-.41.49-.49l1.79-.67c.17-.06.28-.23.28-.41s-.11-.32-.28-.38l-1.79-.67c-.23-.09-.41-.27-.49-.49l-.67-1.79c-.06-.17-.23-.28-.41-.28s-.32.11-.38.28l-.67 1.79c-.09.23-.27.41-.49.49L17.549 9.4ZM5.469 15.28c-.22.1-.35.32-.35.55s.14.45.35.55l.65.3.31.14h.02l3.07 1.43c.18.08.33.23.41.41l1.42 3.07v.02l.15.31.3.65c.1.22.32.35.55.35s.45-.14.55-.35l.3-.65.14-.31v-.02l1.43-3.07c.08-.18.23-.33.41-.41l3.07-1.42h.02l.31-.14.65-.3c.22-.1.35-.32.35-.55s-.14-.45-.35-.55l-.65-.3-.31-.14h-.02l-3.07-1.43c-.18-.08-.33-.23-.41-.41l-1.43-3.07v-.02l-.14-.31-.3-.65c-.1-.22-.32-.35-.55-.35s-.45.14-.55.35l-.3.65-.14.31v-.02l-1.43 3.07c-.08.18-.23.33-.41.41L6.469 14.98h-.02l-.31.14-.67.16Zm3.15.55 1.66-.77c.58-.27 1.04-.73 1.31-1.31.3-.65 1.23-.65 1.53 0 .27.58.73 1.04 1.31 1.31.65.3.65 1.23 0 1.53-.58.27-1.04.73-1.31 1.31-.3.65-1.23.65-1.53 0-.27-.58-.73-1.04-1.31-1.31L8.619 15.83ZM19.829 20.39c-.09.23-.27.41-.49.49l-1.79.67c-.17.06-.28.23-.28.41s.11.32.28.38l1.79.67c.23.09.41.27.49.49l.67 1.79c.06.17.23.28.41.28s.32-.11.38-.28l.67-1.79c.09-.23.27-.41.49-.49l1.79-.67c.17-.06.28-.23.28-.41s-.11-.32-.28-.38l-1.79-.67c-.23-.09-.41-.27-.49-.49l-.67-1.79c-.06-.17-.23-.28-.41-.28s-.32.11-.38.28l-.67 1.79Z" fill="white" />
    <defs>
      <linearGradient id="sparkle_grad2" x1="16" y1="0" x2="16" y2="29.5" gradientUnits="userSpaceOnUse">
        <stop stopColor="#360140" />
        <stop offset="0.2" stopColor="#480A54" />
        <stop offset="0.45" stopColor="#5A1366" />
        <stop offset="0.72" stopColor="#651972" />
        <stop offset="1" stopColor="#691B76" />
      </linearGradient>
    </defs>
  </svg>
);
SparkleIcon.propTypes = { size: PropTypes.number };
SparkleIcon.defaultProps = { size: 20 };

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
  const [activeGradeFilter, setActiveGradeFilter] = useState(null);

  const resultRef = React.useRef(null);

  const scaleMax = parseFloat(maxGpa) || 4.0;
  const parsedProgramGpa = parseFloat(programGpa) || 0;
  const parsedMaxAchievable = parseFloat(maxAchievableGpa) || scaleMax;
  const inputScreenMaxGpa = maxAchievableGpa || maxGpa;

  const activeValue = customInput !== "" ? customInput : selectedPreset !== null ? String(selectedPreset) : "";
  const activeNumeric = parseFloat(activeValue);

  const presets = useMemo(
    () => generatePresets(parsedProgramGpa, parsedMaxAchievable, scaleMax),
    [parsedProgramGpa, parsedMaxAchievable, scaleMax]
  );

  const handleClose = () => {
    setSelectedPreset(null);
    setCustomInput("");
    setActiveGradeFilter(null);
    onClose();
  };

  const isOutOfRange = !isNaN(activeNumeric) && (activeNumeric < 0 || activeNumeric > scaleMax);
  const isBelowOrEqualProgram = !isNaN(activeNumeric) && activeNumeric <= parsedProgramGpa;
  const isAboveMaxAchievable = !isNaN(activeNumeric) && !isNaN(parsedMaxAchievable) && activeNumeric > parsedMaxAchievable;
  const hasError = Boolean(activeValue && (isOutOfRange || isBelowOrEqualProgram || isAboveMaxAchievable));

  const getHelperText = () => {
    if (!activeValue) return "";
    if (isOutOfRange) return `Please enter a GPA between 0 and ${scaleMax}`;
    if (isAboveMaxAchievable) return `Target GPA cannot exceed your Maximum Achievable GPA of ${parsedMaxAchievable.toFixed(2)}`;
    if (isBelowOrEqualProgram) return `Target GPA must be greater than your current Program GPA of ${parsedProgramGpa.toFixed(2)}`;
    return "";
  };

  const canSubmit = activeValue && !hasError && !isNaN(activeNumeric);
  const handleSubmit = () => { if (!canSubmit) return; onSubmit(activeNumeric); };
  const handlePresetClick = (val) => { setSelectedPreset(val); setCustomInput(""); };
  const handleCustomChange = (e) => { setCustomInput(e.target.value); setSelectedPreset(null); };

  // ── PDF Download ──────────────────────────────────────────────────────────
  const downloadPdf = async () => {
    const element = resultRef.current;
    if (!element) return;
    setPdfLoading(true);
    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: "#ffffff", logging: false });
      const A4_WIDTH_MM = 210, A4_HEIGHT_MM = 297, MARGIN_MM = 12;
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
        pdf.addImage(sliceCanvas.toDataURL("image/png"), "PNG", MARGIN_MM, MARGIN_MM, scaledWidthMm, sliceHeightMm);
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
    try { parsed = JSON.parse(result.data); } catch (e) { parsed = null; }
  }

  const achievable = parsed ? isAchievable(parsed.achievability) : null;
  const displayMaxGpa = result?.maxAchievableGpa;
  const displayTargetGpa = targetGpaProp || activeValue || "—";
  const helperText = getHelperText();

  // ── Grade distribution counts ─────────────────────────────────────────────
  const grades = parsed?.grades || [];
  const aGrades = grades.filter(r => r.grade === "A" || r.grade === "A+");
  const bGrades = grades.filter(r => r.grade === "B" || r.grade === "B+");
  const totalCourses = grades.length;

  const aPercent = totalCourses > 0 ? Math.round((aGrades.length / totalCourses) * 100) : 0;
  const bPercent = totalCourses > 0 ? Math.round((bGrades.length / totalCourses) * 100) : 0;

  const filteredGrades = activeGradeFilter === "A"
    ? aGrades
    : activeGradeFilter === "B"
      ? bGrades
      : grades;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        style: {
          display: "flex",
          flexDirection: "column",
          maxHeight: "90vh",
          overflow: "hidden",
        }
      }}
    >

      {/* ── Title ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e5e7eb", padding: "16px 24px", backgroundColor: "#fff", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <SparkleIcon size={22} />
          <div>
            <Typography variant="h3" style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, textTransform: "none", letterSpacing: "normal", color: "#111827" }}>
              AI Recommendation
            </Typography>
            {!result && !loading && (
              <Typography variant="body2" style={{ margin: 0, fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>
                Personalized insights to help you achieve your target GPA
              </Typography>
            )}
          </div>
        </div>
        <button onClick={handleClose} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "30px", height: "30px", borderRadius: "6px", backgroundColor: "transparent", border: "none", cursor: "pointer", padding: 0 }}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#6B21A8" strokeWidth="2.2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* ── Scrollable Content ── */}
      <DialogContent style={{ padding: "20px 24px 12px 24px", backgroundColor: "#fff", overflowY: "auto", flex: 1 }}>

        {/* ── INPUT STATE ── */}
        {!result && !loading && (
          <>
            <Typography variant="body1" style={{ fontWeight: 700, color: "#111827", fontSize: "15px", marginBottom: "4px" }}>Let&apos;s set your target GPA</Typography>
            <Typography variant="body2" style={{ color: "#6b7280", fontSize: "12.5px", marginBottom: "16px" }}>Tell us your goal and we&apos;ll show you how to achieve it.</Typography>
            <div style={{ display: "flex", alignItems: "stretch", gap: "12px", marginBottom: "20px" }}>
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", backgroundColor: "#f5f3ff", border: "1.5px solid #ddd6fe", borderRadius: "12px", padding: "14px 20px", flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", backgroundColor: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="#7c3aed"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zm-1 13.99L5 13.5v4L12 21l7-3.5v-4l-6 3.49z" /></svg>
                  </div>
                  <Typography variant="body2" style={{ color: "#7c3aed", fontWeight: 700, fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.8px", margin: 0 }}>Current Program GPA</Typography>
                </div>
                <Typography variant="body2" style={{ color: "#5b21b6", fontWeight: 900, fontSize: "32px", lineHeight: 1, margin: 0 }}>
                  {parsedProgramGpa != null && !isNaN(parsedProgramGpa) ? parsedProgramGpa.toFixed(2) : "N/A"}
                </Typography>
                <Typography variant="body2" style={{ color: "#7c3aed", fontSize: "11px", marginTop: "4px" }}>Your current performance</Typography>
              </div>
              {inputScreenMaxGpa && <MaxGpaRing maxGpa={inputScreenMaxGpa} programGpa={programGpa} scaleMax={maxGpa} />}
            </div>
            <Typography variant="body1" style={{ fontWeight: 700, color: "#111827", fontSize: "14px", marginBottom: "10px" }}>Choose your target GPA</Typography>
            <Typography variant="body2" style={{ color: "#6b7280", fontSize: "11.5px", marginBottom: "12px" }}>
              Target GPA must be greater than your current Program GPA of{" "}
              <strong style={{ color: "#5b21b6" }}>{parsedProgramGpa.toFixed(2)}</strong>
              {" "}and less than max achievable GPA of{" "}
              <strong style={{ color: "#16a34a" }}>{parsedMaxAchievable.toFixed(2)}</strong>
            </Typography>
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
              {presets.length > 0 ? presets.map((val) => {
                const isSelected = selectedPreset === val && customInput === "";
                return (
                  <button key={val} onClick={() => handlePresetClick(val)} style={{ flex: 1, minWidth: "56px", padding: "10px 8px", borderRadius: "8px", border: isSelected ? "2px solid #7c3aed" : "1.5px solid #d1d5db", backgroundColor: isSelected ? "#f5f3ff" : "#fff", color: isSelected ? "#5b21b6" : "#374151", fontWeight: isSelected ? 700 : 500, fontSize: "14px", cursor: "pointer", transition: "all 0.15s ease", boxShadow: isSelected ? "0 0 0 3px #ede9fe" : "none" }}>
                    {val.toFixed(2)}
                  </button>
                );
              }) : (
                <Typography variant="body2" style={{ color: "#9ca3af", fontSize: "12px" }}>No preset options available for your current GPA range.</Typography>
              )}
            </div>
            <div style={{ position: "relative" }}>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                  <EditIcon style={{ color: "#9ca3af", fontSize: "16px" }} />
                </span>
                <input type="number" step="0.01" min={parsedProgramGpa} max={parsedMaxAchievable} value={customInput} onChange={handleCustomChange} placeholder="Enter custom GPA"
                  style={{ width: "100%", padding: "11px 100px 11px 36px", borderRadius: "8px", border: hasError && customInput !== "" ? "1.5px solid #ef4444" : "1.5px solid #d1d5db", fontSize: "14px", color: "#374151", outline: "none", backgroundColor: "#fff", boxSizing: "border-box", fontFamily: "inherit" }} />
                <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "12px", color: "#9ca3af", pointerEvents: "none" }}>
                  {parsedProgramGpa.toFixed(2)} – {parsedMaxAchievable.toFixed(2)}
                </span>
              </div>
              {hasError && customInput !== "" && helperText && (
                <Typography variant="body2" style={{ color: "#ef4444", fontSize: "11.5px", marginTop: "5px", marginLeft: "2px" }}>{helperText}</Typography>
              )}
              {hasError && customInput === "" && selectedPreset !== null && helperText && (
                <Typography variant="body2" style={{ color: "#ef4444", fontSize: "11.5px", marginTop: "5px", marginLeft: "2px" }}>{helperText}</Typography>
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
          <div ref={resultRef} style={{ backgroundColor: "#fff" }}>

            {/* ── Achievability banner ── */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: achievable ? "#f0fdf4" : "#fef2f2",
              border: `1px solid ${achievable ? "#bbf7d0" : "#fecaca"}`,
              borderRadius: "10px",
              padding: "16px 20px",
              marginBottom: "16px",
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
                  backgroundColor: achievable ? "#16a34a" : "#dc2626",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {achievable
                    ? <CheckCircleIcon style={{ color: "#fff", fontSize: "22px" }} />
                    : <ErrorCircleIcon style={{ color: "#fff", fontSize: "22px" }} />}
                </div>
                <div>
                  <Typography variant="body1" style={{ fontWeight: 700, color: achievable ? "#15803d" : "#991b1b", fontSize: "15px", marginBottom: "4px" }}>
                    {achievable ? "Target GPA is Achievable" : "Target GPA Not Achievable"}
                  </Typography>
                  <Typography variant="body2" style={{ color: achievable ? "#166534" : "#7f1d1d", fontSize: "12.5px", lineHeight: 1.55, maxWidth: "340px" }}>
                    {parsed.achievability}
                  </Typography>
                </div>
              </div>
              {achievable && (
                <div style={{ textAlign: "center", flexShrink: 0, paddingLeft: "16px", borderLeft: "1px solid #bbf7d0" }}>
                  <Typography variant="body2" style={{ color: "#6b7280", fontSize: "11px", marginBottom: "4px" }}>Success Probability</Typography>
                  <Typography variant="body1" style={{ color: "#16a34a", fontWeight: 800, fontSize: "24px", lineHeight: 1 }}>92%</Typography>
                </div>
              )}
            </div>

            {/* ── Three stat columns ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1px", backgroundColor: "#e5e7eb", borderRadius: "10px", overflow: "hidden", marginBottom: "16px", border: "1px solid #e5e7eb" }}>
              <div style={{ backgroundColor: "#fff", padding: "18px 20px", textAlign: "center" }}>
                <Typography variant="body2" style={{ color: "#6b7280", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>Current CGPA</Typography>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                  <Typography variant="body1" style={{ color: "#111827", fontWeight: 800, fontSize: "26px", lineHeight: 1 }}>
                    {parsedProgramGpa.toFixed(2)}
                  </Typography>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="#7c3aed" style={{ marginTop: "2px" }}>
                    <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zm-1 13.99L5 13.5v4L12 21l7-3.5v-4l-6 3.49z" />
                  </svg>
                </div>
                <Typography variant="body2" style={{ color: "#9ca3af", fontSize: "11px", marginTop: "5px" }}>Based on your current performance</Typography>
              </div>

              <div style={{ backgroundColor: "#fff", padding: "18px 20px", textAlign: "center" }}>
                <Typography variant="body2" style={{ color: "#6b7280", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>Target CGPA</Typography>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                  <Typography variant="body1" style={{ color: "#111827", fontWeight: 800, fontSize: "26px", lineHeight: 1 }}>
                    {displayTargetGpa}
                  </Typography>
                  <TargetIcon style={{ color: "#ea580c", fontSize: "18px", marginTop: "2px" }} />
                </div>
                <Typography variant="body2" style={{ color: "#9ca3af", fontSize: "11px", marginTop: "5px" }}>Your goal to achieve</Typography>
              </div>

              <div style={{ backgroundColor: "#fff", padding: "18px 20px", textAlign: "center" }}>
                <Typography variant="body2" style={{ color: "#6b7280", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>Maximum Achievable</Typography>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                  <Typography variant="body1" style={{ color: "#111827", fontWeight: 800, fontSize: "26px", lineHeight: 1 }}>
                    {displayMaxGpa}
                  </Typography>
                  <TrophyIcon style={{ color: "#16a34a", fontSize: "18px", marginTop: "2px" }} />
                </div>
                <Typography variant="body2" style={{ color: "#9ca3af", fontSize: "11px", marginTop: "5px" }}>With optimal grade distribution</Typography>
              </div>
            </div>

            {/* ── Grade Distribution + AI Insight (side by side) ── */}
            {grades.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>

                {/* ── Grade distribution card ── */}
                <div style={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "10px",
                  padding: "16px 20px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}>
                  <Typography variant="body1" style={{ fontWeight: 700, color: "#111827", fontSize: "13px", marginBottom: "16px", alignSelf: "flex-start" }}>
                    Recommended Grade Distribution
                  </Typography>

                  {/* Donut centered */}
                  <DonutChart aCount={aGrades.length} bCount={bGrades.length} total={totalCourses} />

                  {/* Legend — centered below donut */}
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    marginTop: "20px",
                    width: "100%",
                    alignItems: "center",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: 14, height: 14, borderRadius: "3px", backgroundColor: "#22c55e", flexShrink: 0 }} />
                      <div>
                        <Typography variant="body2" style={{ fontWeight: 700, color: "#111827", fontSize: "13px", margin: 0 }}>A Grade</Typography>
                        <Typography variant="body2" style={{ color: "#6b7280", fontSize: "12px", margin: 0 }}>
                          {aGrades.length} courses ({aPercent}%)
                        </Typography>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      {/* ── B Grade legend square — one shade lighter ── */}
                      <div style={{ width: 14, height: 14, borderRadius: "3px", backgroundColor: "#bbf7d0", flexShrink: 0 }} />
                      <div>
                        <Typography variant="body2" style={{ fontWeight: 700, color: "#111827", fontSize: "13px", margin: 0 }}>B Grade</Typography>
                        <Typography variant="body2" style={{ color: "#6b7280", fontSize: "12px", margin: 0 }}>
                          {bGrades.length} courses ({bPercent}%)
                        </Typography>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── AI Insight card — white background ── */}
                {parsed.recommendation && (
                  <div style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "10px",
                    padding: "16px 20px",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                      <SparkleIcon size={18} />
                      <Typography variant="body2" style={{ fontWeight: 700, color: "#6b21a8", fontSize: "13px" }}>AI Insight</Typography>
                    </div>
                    <Typography variant="body2" style={{ color: "#374151", fontSize: "12.5px", lineHeight: 1.6 }}>
                      {parsed.recommendation}
                    </Typography>
                  </div>
                )}
              </div>
            )}

            {/* ── Grade table ── */}
            {grades.length > 0 && (
              <div style={{ backgroundColor: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", overflow: "hidden", marginBottom: "10px" }}>
                {/* Table header row with filter pills */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", borderBottom: "1px solid #f3f4f6" }}>
                  <Typography variant="body1" style={{ fontWeight: 700, color: "#111827", fontSize: "13px", margin: 0 }}>
                    Recommended Grades for Remaining Courses
                  </Typography>
                  <div style={{ display: "flex", gap: "6px" }}>
                    {["A Grade", "B Grade"].map((label) => {
                      const key = label[0];
                      const active = activeGradeFilter === key;
                      return (
                        <button key={key} onClick={() => setActiveGradeFilter(active ? null : key)}
                          style={{
                            padding: "4px 14px",
                            borderRadius: "20px",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: 600,
                            backgroundColor: active
                              ? (key === "A" ? "#22c55e" : "#bbf7d0")
                              : "#f3f4f6",
                            color: active
                              ? (key === "A" ? "#fff" : "#15803d")
                              : "#374151",
                            transition: "all 0.15s",
                          }}>
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Table size="small" sx={{ "& .MuiTableRow-root": { backgroundColor: "#fff !important" }, "& .MuiTableRow-root:hover": { backgroundColor: "#f9fafb !important" }, "& .MuiTableCell-root": { backgroundColor: "transparent !important", boxShadow: "none !important" }, "& .MuiTableHead-root .MuiTableRow-root": { backgroundColor: "#f9fafb !important" }, "& .MuiTableHead-root .MuiTableCell-root": { color: "#6b7280 !important", fontWeight: 600, fontSize: "12px", borderBottom: "1px solid #e5e7eb", padding: "9px 18px", textTransform: "none", letterSpacing: "normal" }, "& .MuiTableBody-root .MuiTableCell-root": { borderBottom: "1px solid #f3f4f6", color: "#374151", fontSize: "13px", padding: "10px 18px" } }}>
                  <TableHead>
                    <TableRow>
                      <TableCell style={{ width: "40px" }}>#</TableCell>
                      <TableCell>Course Name</TableCell>
                      <TableCell align="center">Credit Hours</TableCell>
                      <TableCell align="center">Recommended Grade</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredGrades.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell><Typography variant="body2" style={{ color: "#9ca3af", fontSize: "13px" }}>{idx + 1}</Typography></TableCell>
                        <TableCell><Typography variant="body2" style={{ color: "#111827", fontWeight: 500, fontSize: "13px" }}>{row.course}</Typography></TableCell>
                        <TableCell align="center"><Typography variant="body2" style={{ fontSize: "13px" }}>{row.credits}</Typography></TableCell>
                        <TableCell align="center">
                          {/* ── Pill-shaped grade badge matching donut colors ── */}
                          <GradeBadge grade={row.grade} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            <Typography variant="body2" style={{ marginTop: "10px", textAlign: "center", fontSize: "11px", color: "#9ca3af" }}>
              AI-generated · Results may not be fully accurate. Verify with your academic advisor.
            </Typography>
          </div>
        )}
      </DialogContent>

      {/* ── Sticky Actions Bar ── */}
      <DialogActions style={{
        borderTop: "1px solid #e5e7eb",
        padding: "12px 20px",
        backgroundColor: "#fff",
        justifyContent: "flex-end",
        gap: "8px",
        flexShrink: 0,
      }}>
        {/* Result screen: Download PDF first, then Close */}
        {result && (
          <>
            <button
              onClick={downloadPdf}
              disabled={pdfLoading}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                backgroundColor: pdfLoading ? "#7c3aed99" : "#4c1d95",
                color: "#ffffff", border: "none", borderRadius: "6px",
                padding: "8px 20px", cursor: pdfLoading ? "not-allowed" : "pointer",
                fontSize: "13px", fontWeight: 600,
              }}
            >
              {pdfLoading ? <CircularProgress size={14} style={{ color: "#fff" }} /> : <DownloadIcon style={{ fontSize: "16px", color: "#fff" }} />}
              {pdfLoading ? "Generating..." : "Download PDF"}
            </button>
            <button
              onClick={handleClose}
              style={{
                color: "#374151", border: "1.5px solid #d1d5db",
                borderRadius: "6px", backgroundColor: "#fff",
                padding: "8px 20px", cursor: "pointer",
                fontSize: "13px", fontWeight: 600,
              }}
            >
              Close
            </button>
          </>
        )}

        {/* Input screen: Cancel, then Get AI Recommendation */}
        {!result && (
          <>
            <button
              onClick={handleClose}
              style={{
                color: "#374151", border: "1.5px solid #d1d5db",
                borderRadius: "6px", backgroundColor: "#fff",
                padding: "8px 20px", cursor: "pointer",
                fontSize: "13px", fontWeight: 600,
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !canSubmit}
              style={{
                display: "flex", alignItems: "center", gap: "8px",
                backgroundColor: loading || !canSubmit ? "#c4b5fd" : "#300e4d",
                color: "#ffffff", border: "none", borderRadius: "6px",
                padding: "9px 20px", cursor: loading || !canSubmit ? "not-allowed" : "pointer",
                fontSize: "13px", fontWeight: 600,
              }}
            >
              <SparkleIcon size={18} />
              {loading ? "Loading..." : "Get AI Recommendation"}
            </button>
          </>
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
  result: PropTypes.shape({ maxAchievableGpa: PropTypes.string, data: PropTypes.string }),
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