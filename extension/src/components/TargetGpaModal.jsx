import React, { useState } from "react";
import PropTypes from "prop-types";

import {
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@ellucian/react-design-system/core";

// SG-045: Inline SVG icons — avoids runtime undefined errors from named icon imports
const InfoIcon = ({ style }) => (
  <svg style={style} viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
  </svg>
);
InfoIcon.propTypes = { style: PropTypes.object };
InfoIcon.defaultProps = { style: {} };

const CheckIcon = ({ style }) => (
  <svg style={style} viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14l-4-4 1.41-1.41L10 13.17l6.59-6.59L18 8l-8 8z" />
  </svg>
);
CheckIcon.propTypes = { style: PropTypes.object };
CheckIcon.defaultProps = { style: {} };

const ErrorIcon = ({ style }) => (
  <svg style={style} viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
  </svg>
);
ErrorIcon.propTypes = { style: PropTypes.object };
ErrorIcon.defaultProps = { style: {} };

const SchoolIcon = ({ style }) => (
  <svg style={style} viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor">
    <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z" />
  </svg>
);
SchoolIcon.propTypes = { style: PropTypes.object };
SchoolIcon.defaultProps = { style: {} };

const StarIcon = ({ style }) => (
  <svg style={style} viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);
StarIcon.propTypes = { style: PropTypes.object };
StarIcon.defaultProps = { style: {} };

const TrendingUpIcon = ({ style }) => (
  <svg style={style} viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor">
    <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
  </svg>
);
TrendingUpIcon.propTypes = { style: PropTypes.object };
TrendingUpIcon.defaultProps = { style: {} };

// ─── SG-045: Helper to parse markdown result into structured sections ─────────
// Extracts: achievability line, recommendation text, grade table rows, footer note
const parseResult = (markdown) => {
  if (!markdown) return null;

  const lines = markdown.split("\n").map((l) => l.trim()).filter(Boolean);

  let achievability = null;
  let recommendation = [];
  let grades = []; // { course, grade }
  let footerLines = [];
  let inGradesSection = false;
  let gradesFound = false;

  lines.forEach((line) => {
    // Achievability line
    if (/^achievability[:-]/i.test(line)) {
      achievability = line.replace(/^achievability[:-\s]*/i, "").trim();
      return;
    }

    // Recommendation line
    if (/^recommendation[:-]/i.test(line)) {
      recommendation.push(line.replace(/^recommendation[:-\s]*/i, "").trim());
      return;
    }

    // Detect "Grades Recommended" section header
    if (/grades recommended/i.test(line)) {
      inGradesSection = true;
      gradesFound = true;
      return;
    }

    // Parse bullet grade items  e.g. "- Thermodynamics II: A" or "* Heat Transfer: A"
    if (inGradesSection) {
      const bulletMatch = line.match(/^[-*•]\s*(.+):\s*([A-F][+-]?)$/i);
      if (bulletMatch) {
        grades.push({ course: bulletMatch[1].trim(), grade: bulletMatch[2].trim() });
        return;
      }
      // If no more bullet, stop grades section
      inGradesSection = false;
    }

    // Footer / closing note (after grades)
    if (gradesFound && !inGradesSection) {
      footerLines.push(line);
    } else if (!gradesFound) {
      // Additional recommendation lines before grades section
      recommendation.push(line);
    }
  });

  return { achievability, recommendation, grades, footerLines };
};

// ─── SG-045: Achievability badge ─────────────────────────────────────────────
const AchievabilityBadge = ({ text }) => {
  if (!text) return null;

  const isAchievable = /possible|can achieve|achievable/i.test(text) &&
    !/not possible|cannot|can't|not achieve/i.test(text);

  const badgeStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 14px",
    borderRadius: "20px",
    fontWeight: 600,
    fontSize: "13px",
    marginBottom: "16px",
    backgroundColor: isAchievable ? "#d1fae5" : "#fee2e2",
    color: isAchievable ? "#065f46" : "#991b1b",
    border: `1px solid ${isAchievable ? "#6ee7b7" : "#fca5a5"}`,
  };

  return (
    <div style={badgeStyle}>
      {isAchievable
        ? <CheckIcon style={{ fontSize: "16px" }} />
        : <ErrorIcon style={{ fontSize: "16px" }} />}
      <span>{text}</span>
    </div>
  );
};

AchievabilityBadge.propTypes = {
  text: PropTypes.string,
};

AchievabilityBadge.defaultProps = {
  text: null,
};

// ─── SG-045: Section header with icon ────────────────────────────────────────
const SectionHeader = ({ icon: Icon, label, color }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px", marginTop: "16px" }}>
    <Icon style={{ fontSize: "18px", color }} />
    <Typography
      variant="h5"
      style={{ fontWeight: 700, color, margin: 0, fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}
    >
      {label}
    </Typography>
  </div>
);

SectionHeader.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
};

// ─── SG-046: Grade table (native HTML table — avoids undefined Ellucian Table components) ───
const GradeTable = ({ grades }) => {
  if (!grades || grades.length === 0) return null;

  const gradeColor = (g) => {
    if (g === "A" || g === "A+") return { color: "#065f46", background: "#d1fae5" };
    if (g === "A-" || g === "B+" || g === "B") return { color: "#1e40af", background: "#dbeafe" };
    if (g === "B-" || g === "C+" || g === "C") return { color: "#92400e", background: "#fef3c7" };
    return { color: "#991b1b", background: "#fee2e2" };
  };

  return (
    <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "12px", border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden", fontSize: "13px" }}>
      <thead>
        <tr style={{ backgroundColor: "#f0f4ff" }}>
          <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 700, fontSize: "11px", color: "#374151", textTransform: "uppercase", letterSpacing: "0.4px", borderBottom: "1px solid #e5e7eb" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <SchoolIcon style={{ fontSize: "14px" }} />
              Course
            </div>
          </th>
          <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 700, fontSize: "11px", color: "#374151", textTransform: "uppercase", letterSpacing: "0.4px", borderBottom: "1px solid #e5e7eb" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <StarIcon style={{ fontSize: "14px" }} />
              Recommended Grade
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        {grades.map((row, idx) => {
          const colors = gradeColor(row.grade);
          return (
            <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f9fafb" }}>
              <td style={{ padding: "8px 12px", borderBottom: "1px solid #f3f4f6", color: "#111827", fontWeight: 500 }}>
                {row.course}
              </td>
              <td style={{ padding: "8px 12px", borderBottom: "1px solid #f3f4f6" }}>
                <span style={{
                  display: "inline-block",
                  padding: "2px 12px",
                  borderRadius: "12px",
                  fontWeight: 700,
                  fontSize: "13px",
                  color: colors.color,
                  backgroundColor: colors.background,
                }}>
                  {row.grade}
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

GradeTable.propTypes = {
  grades: PropTypes.arrayOf(
    PropTypes.shape({
      course: PropTypes.string.isRequired,
      grade: PropTypes.string.isRequired,
    })
  ).isRequired,
};

// ─── Main Modal ───────────────────────────────────────────────────────────────
const TargetGpaModal = ({
  open,
  onClose,
  onSubmit,
  loading,
  result,
  error,
  maxGpa,
}) => {
  const [targetGpa, setTargetGpa] = useState("");

  const handleClose = () => {
    setTargetGpa("");
    onClose();
  };

  const isValidGpa = (value) => {
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0 && num <= maxGpa;
  };

  const handleSubmit = () => {
    if (!isValidGpa(targetGpa)) return;
    onSubmit(parseFloat(targetGpa));
  };

  // SG-045 + SG-046: parse the markdown result into structured sections
  const parsed = parseResult(result);

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>
        {/* SG-045: Icon + styled heading */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <TrendingUpIcon style={{ fontSize: "22px", color: "#1d4ed8" }} />
          <Typography variant="h3" style={{ color: "#1d4ed8", fontWeight: 700 }}>
            GPA Recommendation
          </Typography>
        </div>
      </DialogTitle>

      <DialogContent>
        {/* GPA Input — unchanged */}
        {!result && (
          <div style={{ marginBottom: "16px" }}>
            <Typography variant="body1" style={{ marginBottom: "8px" }}>
              Enter a target GPA you want to achieve to get AI recommendation
            </Typography>
            <TextField
              label="Target GPA"
              value={targetGpa}
              onChange={(e) => setTargetGpa(e?.target?.value ?? "")}
              placeholder="e.g. 3.5"
              error={targetGpa && !isValidGpa(targetGpa)}
              helperText={
                targetGpa && !isValidGpa(targetGpa)
                  ? `Please enter a GPA between 0 and ${maxGpa}`
                  : ""
              }
              fullWidth
            />
          </div>
        )}

        {/* Loading state — unchanged */}
        {loading && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "16px 0",
            }}
          >
            <CircularProgress size={24} />
            <Typography variant="body2" style={{ color: "#4b5563" }}>
              Fetching recommendations...
            </Typography>
          </div>
        )}

        {/* Error state — unchanged */}
        {error && !loading && (
          <Typography
            variant="body2"
            style={{
              color: "#dc2626",
              fontWeight: 600,
              marginTop: "12px",
            }}
          >
            Error: {error}
          </Typography>
        )}

        {/* SG-045 + SG-046: Structured, styled result */}
        {result && !loading && parsed && (
          <div
            style={{
              marginTop: "8px",
              borderTop: "1px solid #e5e7eb",
              paddingTop: "16px",
              maxHeight: "400px",
              overflowY: "auto",
            }}
          >
            {/* Achievability badge */}
            <AchievabilityBadge text={parsed.achievability} />

            {/* Recommendation section */}
            {parsed.recommendation.length > 0 && (
              <>
                <SectionHeader icon={InfoIcon} label="Recommendation" color="#1d4ed8" />
                <div style={{ backgroundColor: "#eff6ff", borderLeft: "4px solid #3b82f6", borderRadius: "4px", padding: "10px 14px", marginBottom: "4px" }}>
                  {parsed.recommendation.map((line, i) => (
                    <Typography key={i} variant="body2" style={{ color: "#1e3a5f", lineHeight: 1.7, marginBottom: i < parsed.recommendation.length - 1 ? "6px" : 0 }}>
                      {line}
                    </Typography>
                  ))}
                </div>
              </>
            )}

            {/* SG-046: Grade table */}
            {parsed.grades.length > 0 && (
              <>
                <SectionHeader icon={SchoolIcon} label="Grades Recommended Per Course" color="#065f46" />
                <GradeTable grades={parsed.grades} />
              </>
            )}

            {/* Footer note */}
            {parsed.footerLines.length > 0 && (
              <div style={{ backgroundColor: "#fefce8", borderLeft: "4px solid #facc15", borderRadius: "4px", padding: "10px 14px", marginTop: "12px" }}>
                {parsed.footerLines.map((line, i) => (
                  <Typography key={i} variant="body2" style={V}>
                    {line}
                  </Typography>
                ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>

      {/* DialogActions — unchanged */}
      <DialogActions>
        <Button variant="text" onClick={handleClose}>
          Close
        </Button>
        {!result && (
          <Button
            onClick={handleSubmit}
            disabled={loading || !isValidGpa(targetGpa)}
          >
            {loading ? "Loading..." : "Get Recommendations"}
          </Button>
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
  result: PropTypes.string,
  error: PropTypes.string,
  maxGpa: PropTypes.string,
};

TargetGpaModal.defaultProps = {
  loading: false,
  result: null,
  error: null,
};

export default TargetGpaModal;