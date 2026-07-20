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
  IconButton,
  Chip,
  Alert,
  Divider,
} from "@ellucian/react-design-system/core";
import {
  colorFillAlertSuccess,
  colorFillAlertWarning,
  colorFillAlertError,
} from "@ellucian/react-design-system/core/styles/tokens";
import { withStyles } from "@ellucian/react-design-system/core/styles";
import { Icon } from "@ellucian/ds-icons/lib";

const isAchievable = (text) =>
  text &&
  /possible|can achieve|achievable|yes/i.test(text) &&
  !/not possible|cannot|can't|not achieve|not achievable/i.test(text);

const unclipAncestors = (el, maxLevels = 8) => {
  const changed = [];
  let node = el.parentElement;
  let level = 0;
  while (node && level < maxLevels) {
    const computed = window.getComputedStyle(node);
    const needsUnclip =
      computed.overflowY === "auto" ||
      computed.overflowY === "scroll" ||
      computed.overflowX === "auto" ||
      computed.overflowX === "scroll" ||
      computed.overflow === "hidden" ||
      computed.overflow === "auto" ||
      computed.overflow === "scroll" ||
      (computed.maxHeight !== "none" && computed.maxHeight !== "") ||
      (computed.height !== "auto" && node.scrollHeight > node.clientHeight);

    if (needsUnclip) {
      changed.push({
        node,
        overflow: node.style.overflow,
        overflowX: node.style.overflowX,
        overflowY: node.style.overflowY,
        maxHeight: node.style.maxHeight,
        height: node.style.height,
      });
      node.style.overflow = "visible";
      node.style.overflowX = "visible";
      node.style.overflowY = "visible";
      node.style.maxHeight = "none";
      node.style.height = "auto";
    }
    node = node.parentElement;
    level += 1;
  }
  return changed;
};

const restoreAncestors = (changed) => {
  changed.forEach(({ node, overflow, overflowX, overflowY, maxHeight, height }) => {
    node.style.overflow = overflow;
    node.style.overflowX = overflowX;
    node.style.overflowY = overflowY;
    node.style.maxHeight = maxHeight;
    node.style.height = height;
  });
};

const GradeBadge = ({ grade }) => {
  const isA = grade?.startsWith("A");
  return (
    <Chip
      label={grade}
      size="small"
      style={{
        backgroundColor: isA ? colorFillAlertSuccess : `${colorFillAlertSuccess}33`,
        color: isA ? "#ffffff" : colorFillAlertSuccess,
        fontWeight: 700,
        minWidth: "44px",
      }}
    />
  );
};
GradeBadge.propTypes = { grade: PropTypes.string };
GradeBadge.defaultProps = { grade: "" };

const DonutChart = ({ aCount, bCount, total, textPrimary, textSecondary, divider }) => {
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
        <circle cx="55" cy="55" r={R} fill="none" stroke={divider} strokeWidth="12" />
        {aLen > 0 && (
          <circle cx="55" cy="55" r={R} fill="none" stroke={colorFillAlertSuccess} strokeWidth="12"
            strokeDasharray={`${aLen} ${CIRC}`} strokeDashoffset={0}
            strokeLinecap="butt" transform="rotate(-90 55 55)" />
        )}
        {bLen > 0 && (
          <circle cx="55" cy="55" r={R} fill="none" stroke={`${colorFillAlertSuccess}33`} strokeWidth="12"
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
        <span style={{ fontWeight: 800, fontSize: "20px", color: textPrimary, lineHeight: 1 }}>{total}</span>
        <span style={{ fontSize: "9px", color: textSecondary, lineHeight: 1.3, textAlign: "center", marginTop: "3px" }}>Total<br />Courses</span>
      </div>
    </div>
  );
};

DonutChart.propTypes = {
  aCount: PropTypes.number,
  bCount: PropTypes.number,
  total: PropTypes.number,
  textPrimary: PropTypes.string.isRequired,
  textSecondary: PropTypes.string.isRequired,
  divider: PropTypes.string.isRequired,
};
DonutChart.defaultProps = { aCount: 0, bCount: 0, total: 0 };

const generatePresets = (cumGpa, maxAchievableGpa, scaleMax) => {
  const min = parseFloat(cumGpa) || 0;
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

const MaxGpaRing = ({ maxGpa, cumGpa, scaleMax, brandPrimary }) => {
  const scale = parseFloat(scaleMax) || 4.0;
  const current = parseFloat(cumGpa) || 0;
  const max = parseFloat(maxGpa) || scale;
  const RADIUS = 26;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const currentOffset = CIRCUMFERENCE * (1 - Math.min(current / scale, 1));
  const maxOffset = CIRCUMFERENCE * (1 - Math.min(max / scale, 1));
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "16px", backgroundColor: `${colorFillAlertSuccess}0D`, border: `1.5px solid ${colorFillAlertSuccess}66`, borderRadius: "12px", padding: "14px 20px", flex: 1 }}>
      <div style={{ position: "relative", width: 64, height: 64, flexShrink: 0 }}>
        <svg width="64" height="64" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r={RADIUS} fill="none" stroke={`${colorFillAlertSuccess}1A`} strokeWidth="5" />
          <circle cx="32" cy="32" r={RADIUS} fill="none" stroke={`${brandPrimary}66`} strokeWidth="5" strokeDasharray={CIRCUMFERENCE} strokeDashoffset={currentOffset} strokeLinecap="round" transform="rotate(-90 32 32)" />
          <circle cx="32" cy="32" r={RADIUS} fill="none" stroke={colorFillAlertSuccess} strokeWidth="5" strokeDasharray={CIRCUMFERENCE} strokeDashoffset={maxOffset} strokeLinecap="round" transform="rotate(-90 32 32)" />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="trophy" style={{ color: colorFillAlertSuccess, fontSize: "18px" }} />
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <Typography variant="body2" style={{ color: colorFillAlertSuccess, fontWeight: 700, fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.8px", margin: 0 }}>Max Achievable GPA</Typography>
        <Typography variant="body2" style={{ color: colorFillAlertSuccess, fontWeight: 900, fontSize: "28px", lineHeight: 1, margin: 0 }}>{max.toFixed(2)}</Typography>
        <Typography variant="body2" style={{ color: colorFillAlertSuccess, fontSize: "11px", margin: 0 }}>Based on your current progress</Typography>
      </div>
    </div>
  );
};
MaxGpaRing.propTypes = { maxGpa: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), cumGpa: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), scaleMax: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), brandPrimary: PropTypes.string.isRequired };
MaxGpaRing.defaultProps = { maxGpa: null, cumGpa: 0, scaleMax: 4.0 };

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

const TargetGpaModal = ({
  open,
  onClose,
  onSubmit,
  loading,
  result,
  maxGpa,
  cumGpa,
  targetGpa: targetGpaProp,
  maxAchievableGpa,
  theme,
}) => {
  const colorTextPrimary = theme.palette.text.primary;
  const colorTextSecondary = theme.palette.text.secondary;
  const colorBackgroundDivider = theme.palette.divider;
  const colorBrandPrimary = theme.palette.primary.main;
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [customInput, setCustomInput] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [activeGradeFilter, setActiveGradeFilter] = useState(null);

  const resultRef = React.useRef(null);

  const scaleMax = parseFloat(maxGpa) || 4.0;
  const parsedCumGpa = parseFloat(cumGpa) || 0;
  const parsedMaxAchievable = parseFloat(maxAchievableGpa) || scaleMax;
  const inputScreenMaxGpa = maxAchievableGpa || maxGpa;

  const activeValue = customInput !== "" ? customInput : selectedPreset !== null ? String(selectedPreset) : "";
  const activeNumeric = parseFloat(activeValue);

  const presets = useMemo(
    () => generatePresets(parsedCumGpa, parsedMaxAchievable, scaleMax),
    [parsedCumGpa, parsedMaxAchievable, scaleMax]
  );

  const handleClose = () => {
    setSelectedPreset(null);
    setCustomInput("");
    setActiveGradeFilter(null);
    onClose();
  };

  const isOutOfRange = !isNaN(activeNumeric) && (activeNumeric < 0 || activeNumeric > scaleMax);
  const isBelowOrEqualCum = !isNaN(activeNumeric) && activeNumeric <= parsedCumGpa;
  const isAboveMaxAchievable = !isNaN(activeNumeric) && !isNaN(parsedMaxAchievable) && activeNumeric > parsedMaxAchievable;
  const hasError = Boolean(activeValue && (isOutOfRange || isBelowOrEqualCum || isAboveMaxAchievable));

  const getHelperText = () => {
    if (!activeValue) return "";
    if (isOutOfRange) return `Please enter a GPA between 0 and ${scaleMax}`;
    if (isAboveMaxAchievable) return `Target GPA cannot exceed your Maximum Achievable GPA of ${parsedMaxAchievable.toFixed(2)}`;
    if (isBelowOrEqualCum) return `Target GPA must be greater than your current CGPA of ${parsedCumGpa.toFixed(2)}`;
    return "";
  };

  const canSubmit = activeValue && !hasError && !isNaN(activeNumeric);
  const handleSubmit = () => { if (!canSubmit) return; onSubmit(activeNumeric); };
  const handlePresetClick = (val) => { setSelectedPreset(val); setCustomInput(""); };
  const handleCustomChange = (e) => { setCustomInput(e.target.value); setSelectedPreset(null); };

  const downloadPdf = async () => {
    const element = resultRef.current;
    if (!element) return;
    setPdfLoading(true);

    const changedAncestors = unclipAncestors(element);
    if (element.parentElement) element.parentElement.scrollTop = 0;

    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve))
    );

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });
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
      restoreAncestors(changedAncestors);
      setPdfLoading(false);
    }
  };

  let parsed = null;
  if (result?.data) {
    try { parsed = JSON.parse(result.data); } catch (e) { parsed = null; }
  }

  const achievable = parsed ? isAchievable(parsed.achievability) : null;
  const displayMaxGpa = result?.maxAchievableGpa;
  const displayTargetGpa = targetGpaProp || activeValue || "—";
  const helperText = getHelperText();

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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", backgroundColor: "#fff", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <SparkleIcon size={22} />
          <div>
            <Typography variant="h3" style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, textTransform: "none", letterSpacing: "normal", color: colorTextPrimary }}>
              AI Recommendation
            </Typography>
            {!result && !loading && (
              <Typography variant="body2" style={{ margin: 0, fontSize: "12px", color: colorTextSecondary, marginTop: "2px" }}>
                Personalized insights to help you achieve your target GPA
              </Typography>
            )}
          </div>
        </div>
        <IconButton onClick={handleClose} aria-label="Close">
          <Icon name="close" style={{ color: theme.palette.primary.contrastText, fontSize: "18px" }} />
        </IconButton>
      </div>
      <Divider />

      <DialogContent style={{ padding: "20px 24px 12px 24px", backgroundColor: "#fff", overflowY: "auto", flex: 1 }}>

        {!result && !loading && (
          <>
            <Typography variant="body1" style={{ fontWeight: 700, color: colorTextPrimary, fontSize: "15px", marginBottom: "4px" }}>Let&apos;s set your target GPA</Typography>
            <Typography variant="body2" style={{ color: colorTextSecondary, fontSize: "12.5px", marginBottom: "16px" }}>Tell us your goal and we&apos;ll show you how to achieve it.</Typography>
            <div style={{ display: "flex", alignItems: "stretch", gap: "12px", marginBottom: "20px" }}>
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", backgroundColor: `${colorBrandPrimary}0D`, border: `1.5px solid ${colorBrandPrimary}4D`, borderRadius: "12px", padding: "14px 20px", flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", backgroundColor: `${colorBrandPrimary}33`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon name="graduation" style={{ color: colorBrandPrimary, fontSize: "15px" }} />
                  </div>
                  <Typography variant="body2" style={{ color: colorBrandPrimary, fontWeight: 700, fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.8px", margin: 0 }}>Current CGPA</Typography>
                </div>
                <Typography variant="body2" style={{ color: colorBrandPrimary, fontWeight: 900, fontSize: "32px", lineHeight: 1, margin: 0 }}>
                  {parsedCumGpa != null && !isNaN(parsedCumGpa) ? parsedCumGpa.toFixed(2) : "N/A"}
                </Typography>
                <Typography variant="body2" style={{ color: colorBrandPrimary, fontSize: "11px", marginTop: "4px" }}>Your current performance</Typography>
              </div>
              {inputScreenMaxGpa && <MaxGpaRing maxGpa={inputScreenMaxGpa} cumGpa={cumGpa} scaleMax={maxGpa} brandPrimary={colorBrandPrimary} />}
            </div>
            <Typography variant="body1" style={{ fontWeight: 700, color: colorTextPrimary, fontSize: "14px", marginBottom: "10px" }}>Choose your target GPA</Typography>
            <Typography variant="body2" style={{ color: colorTextSecondary, fontSize: "11.5px", marginBottom: "12px" }}>
              Target GPA must be greater than your current CGPA of{" "}
              <strong style={{ color: colorBrandPrimary }}>{parsedCumGpa.toFixed(2)}</strong>
              {" "}and less than max achievable GPA of{" "}
              <strong style={{ color: colorFillAlertSuccess }}>{parsedMaxAchievable.toFixed(2)}</strong>
            </Typography>
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
                      border: isSelected ? `2px solid ${colorBrandPrimary}` : `1.5px solid ${colorBackgroundDivider}`,
                      backgroundColor: isSelected ? `${colorBrandPrimary}0D` : "#fff",
                      color: isSelected ? colorBrandPrimary : colorTextPrimary,
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: "14px",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      boxShadow: isSelected ? `0 0 0 3px ${colorBrandPrimary}33` : "none",
                    }}
                  >
                    {val.toFixed(2)}
                  </button>
                );
              }) : (
                <Typography variant="body2" style={{ color: colorTextSecondary, fontSize: "12px" }}>No preset options available for your current GPA range.</Typography>
              )}
            </div>
            <div style={{ position: "relative" }}>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                  <Icon name="edit" style={{ color: colorTextSecondary, fontSize: "16px" }} />
                </span>
                <input type="number" step="0.01" min={parsedCumGpa} max={parsedMaxAchievable} value={customInput} onChange={handleCustomChange} placeholder="Enter custom GPA"
                  style={{ width: "100%", padding: "11px 100px 11px 36px", borderRadius: "8px", border: hasError && customInput !== "" ? `1.5px solid ${colorFillAlertError}` : `1.5px solid ${colorBackgroundDivider}`, fontSize: "14px", color: colorTextPrimary, outline: "none", backgroundColor: "#fff", boxSizing: "border-box", fontFamily: "inherit" }} />
                <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "12px", color: colorTextSecondary, pointerEvents: "none" }}>
                  {parsedCumGpa.toFixed(2)} – {parsedMaxAchievable.toFixed(2)}
                </span>
              </div>
              {hasError && customInput !== "" && helperText && (
                <Typography variant="body2" style={{ color: colorFillAlertError, fontSize: "11.5px", marginTop: "5px", marginLeft: "2px" }}>{helperText}</Typography>
              )}
              {hasError && customInput === "" && selectedPreset !== null && helperText && (
                <Typography variant="body2" style={{ color: colorFillAlertError, fontSize: "11.5px", marginTop: "5px", marginLeft: "2px" }}>{helperText}</Typography>
              )}
            </div>

            <Typography variant="body2" style={{ marginTop: "16px", textAlign: "center", fontSize: "11px", color: colorTextSecondary, lineHeight: 1.5 }}>
               GPA recommendations are calculated using core subjects only and do not include elective courses. The recommended grades and maximum achievable GPA are estimated values provided for guidance purposes only and may differ from official GPA calculations.
            </Typography>
          </>
        )}

        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "24px 0", justifyContent: "center" }}>
            <CircularProgress size={28} />
            <Typography variant="body2">Fetching recommendations...</Typography>
          </div>
        )}

        {parsed && !loading && (
          <div ref={resultRef} style={{ backgroundColor: "#fff" }}>

            <Alert
              status={achievable ? "success" : "error"}
              style={{ marginBottom: "16px" }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <Typography variant="body1" style={{ fontWeight: 700, fontSize: "15px", marginBottom: "4px" }}>
                    {achievable ? "Target GPA is Achievable" : "Target GPA Not Achievable"}
                  </Typography>
                  <Typography variant="body2" style={{ fontSize: "12.5px", lineHeight: 1.55, maxWidth: "340px" }}>
                    {parsed.achievability}
                  </Typography>
                </div>
                {achievable && (
                  <div style={{ textAlign: "center", flexShrink: 0, paddingLeft: "16px", borderLeft: `1px solid ${colorFillAlertSuccess}33` }}>
                    <Typography variant="body2" style={{ color: colorTextSecondary, fontSize: "11px", marginBottom: "4px" }}>Success Probability</Typography>
                    <Typography variant="body1" style={{ color: colorFillAlertSuccess, fontWeight: 800, fontSize: "24px", lineHeight: 1 }}>92%</Typography>
                  </div>
                )}
              </div>
            </Alert>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1px", backgroundColor: colorBackgroundDivider, borderRadius: "10px", overflow: "hidden", marginBottom: "16px", border: `1px solid ${colorBackgroundDivider}` }}>
              <div style={{ backgroundColor: "#fff", padding: "18px 20px", textAlign: "center" }}>
                <Typography variant="body2" style={{ color: colorTextSecondary, fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>Current CGPA</Typography>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                  <Typography variant="body1" style={{ color: colorTextPrimary, fontWeight: 800, fontSize: "26px", lineHeight: 1 }}>
                    {parsedCumGpa.toFixed(2)}
                  </Typography>
                  <Icon name="graduation" style={{ color: colorBrandPrimary, fontSize: "18px", marginTop: "2px" }} />
                </div>
                <Typography variant="body2" style={{ color: colorTextSecondary, fontSize: "11px", marginTop: "5px" }}>Based on your current performance</Typography>
              </div>

              <div style={{ backgroundColor: "#fff", padding: "18px 20px", textAlign: "center" }}>
                <Typography variant="body2" style={{ color: colorTextSecondary, fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>Target CGPA</Typography>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                  <Typography variant="body1" style={{ color: colorTextPrimary, fontWeight: 800, fontSize: "26px", lineHeight: 1 }}>
                    {displayTargetGpa}
                  </Typography>
                  <Icon name="target" style={{ color: colorFillAlertWarning, fontSize: "18px", marginTop: "2px" }} />
                </div>
                <Typography variant="body2" style={{ color: colorTextSecondary, fontSize: "11px", marginTop: "5px" }}>Your goal to achieve</Typography>
              </div>

              <div style={{ backgroundColor: "#fff", padding: "18px 20px", textAlign: "center" }}>
                <Typography variant="body2" style={{ color: colorTextSecondary, fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>Maximum Achievable</Typography>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                  <Typography variant="body1" style={{ color: colorTextPrimary, fontWeight: 800, fontSize: "26px", lineHeight: 1 }}>
                    {displayMaxGpa}
                  </Typography>
                  <Icon name="trophy" style={{ color: colorFillAlertSuccess, fontSize: "18px", marginTop: "2px" }} />
                </div>
                <Typography variant="body2" style={{ color: colorTextSecondary, fontSize: "11px", marginTop: "5px" }}>With optimal grade distribution</Typography>
              </div>
            </div>

            {grades.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>

                <div style={{
                  backgroundColor: "#fff",
                  border: `1px solid ${colorBackgroundDivider}`,
                  borderRadius: "10px",
                  padding: "16px 20px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}>
                  <Typography variant="body1" style={{ fontWeight: 700, color: colorTextPrimary, fontSize: "13px", marginBottom: "16px", alignSelf: "flex-start" }}>
                    Recommended Grade Distribution
                  </Typography>

                  <DonutChart
                    aCount={aGrades.length}
                    bCount={bGrades.length}
                    total={totalCourses}
                    textPrimary={colorTextPrimary}
                    textSecondary={colorTextSecondary}
                    divider={colorBackgroundDivider}
                  />

                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    marginTop: "20px",
                    width: "100%",
                    alignItems: "center",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: 14, height: 14, borderRadius: "3px", backgroundColor: colorFillAlertSuccess, flexShrink: 0 }} />
                      <div>
                        <Typography variant="body2" style={{ fontWeight: 700, color: colorTextPrimary, fontSize: "13px", margin: 0 }}>A Grade</Typography>
                        <Typography variant="body2" style={{ color: colorTextSecondary, fontSize: "12px", margin: 0 }}>
                          {aGrades.length} courses ({aPercent}%)
                        </Typography>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: 14, height: 14, borderRadius: "3px", backgroundColor: `${colorFillAlertSuccess}33`, flexShrink: 0 }} />
                      <div>
                        <Typography variant="body2" style={{ fontWeight: 700, color: colorTextPrimary, fontSize: "13px", margin: 0 }}>B Grade</Typography>
                        <Typography variant="body2" style={{ color: colorTextSecondary, fontSize: "12px", margin: 0 }}>
                          {bGrades.length} courses ({bPercent}%)
                        </Typography>
                      </div>
                    </div>
                  </div>
                </div>

                {parsed.recommendation && (
                  <div style={{
                    backgroundColor: "#ffffff",
                    border: `1px solid ${colorBackgroundDivider}`,
                    borderRadius: "10px",
                    padding: "16px 20px",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                      <SparkleIcon size={18} />
                      <Typography variant="body2" style={{ fontWeight: 700, color: colorBrandPrimary, fontSize: "13px" }}>AI Insight</Typography>
                    </div>
                    <Typography variant="body2" style={{ color: colorTextPrimary, fontSize: "12.5px", lineHeight: 1.6 }}>
                      {parsed.recommendation}
                    </Typography>
                  </div>
                )}
              </div>
            )}

            {grades.length > 0 && (
              <div style={{ backgroundColor: "#fff", borderRadius: "10px", border: `1px solid ${colorBackgroundDivider}`, overflow: "hidden", marginBottom: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px" }}>
                  <Typography variant="body1" style={{ fontWeight: 700, color: colorTextPrimary, fontSize: "13px", margin: 0 }}>
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
                              ? (key === "A" ? colorFillAlertSuccess : `${colorFillAlertSuccess}33`)
                              : `${colorBackgroundDivider}4D`,
                            color: active
                              ? (key === "A" ? "#fff" : colorFillAlertSuccess)
                              : colorTextPrimary,
                            transition: "all 0.15s",
                          }}>
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <Divider />

                <Table size="small" sx={{ "& .MuiTableRow-root": { backgroundColor: "#fff !important" }, "& .MuiTableRow-root:hover": { backgroundColor: `${colorBackgroundDivider}33 !important` }, "& .MuiTableCell-root": { backgroundColor: "transparent !important", boxShadow: "none !important" }, "& .MuiTableHead-root .MuiTableRow-root": { backgroundColor: `${colorBackgroundDivider}33 !important` }, "& .MuiTableHead-root .MuiTableCell-root": { color: `${colorTextSecondary} !important`, fontWeight: 600, fontSize: "12px", borderBottom: `1px solid ${colorBackgroundDivider}`, padding: "9px 18px", textTransform: "none", letterSpacing: "normal" }, "& .MuiTableBody-root .MuiTableCell-root": { borderBottom: `1px solid ${colorBackgroundDivider}4D`, color: colorTextPrimary, fontSize: "13px", padding: "10px 18px" } }}>
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
                        <TableCell><Typography variant="body2" style={{ color: colorTextSecondary, fontSize: "13px" }}>{idx + 1}</Typography></TableCell>
                        <TableCell><Typography variant="body2" style={{ color: colorTextPrimary, fontWeight: 500, fontSize: "13px" }}>{row.course}</Typography></TableCell>
                        <TableCell align="center"><Typography variant="body2" style={{ fontSize: "13px" }}>{row.credits}</Typography></TableCell>
                        <TableCell align="center">
                          <GradeBadge grade={row.grade} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            <Typography variant="body2" style={{ marginTop: "10px", textAlign: "center", fontSize: "11px", color: colorTextSecondary }}>
              AI-generated · Results may not be fully accurate. Verify with your academic advisor.
            </Typography>
          </div>
        )}
      </DialogContent>
      <Divider />

      <DialogActions style={{
        padding: "12px 20px",
        backgroundColor: "#fff",
        justifyContent: "flex-end",
        gap: "8px",
        flexShrink: 0,
      }}>
        {result && (
          <>
            <button
              onClick={downloadPdf}
              disabled={pdfLoading}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                backgroundColor: pdfLoading ? `${colorBrandPrimary}99` : colorBrandPrimary,
                color: "#ffffff", border: "none", borderRadius: "6px",
                padding: "8px 20px", cursor: pdfLoading ? "not-allowed" : "pointer",
                fontSize: "13px", fontWeight: 600,
              }}
            >
              {pdfLoading ? <CircularProgress size={14} style={{ color: "#fff" }} /> : <Icon name="download" style={{ fontSize: "16px", color: "#fff" }} />}
              {pdfLoading ? "Generating..." : "Download PDF"}
            </button>
            <button
              onClick={handleClose}
              style={{
                color: colorTextPrimary, border: `1.5px solid ${colorBackgroundDivider}`,
                borderRadius: "6px", backgroundColor: "#fff",
                padding: "8px 20px", cursor: "pointer",
                fontSize: "13px", fontWeight: 600,
              }}
            >
              Close
            </button>
          </>
        )}

        {!result && (
          <>
            <button
              onClick={handleClose}
              style={{
                color: colorTextPrimary, border: `1.5px solid ${colorBackgroundDivider}`,
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
                backgroundColor: loading || !canSubmit ? `${colorBrandPrimary}4D` : colorBrandPrimary,
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
  cumGpa: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  targetGpa: PropTypes.string,
  maxAchievableGpa: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  theme: PropTypes.object.isRequired,
};

TargetGpaModal.defaultProps = {
  loading: false,
  result: null,
  maxGpa: "4.0",
  cumGpa: null,
  targetGpa: null,
  maxAchievableGpa: null,
};

export default withStyles({}, { withTheme: true })(TargetGpaModal);
