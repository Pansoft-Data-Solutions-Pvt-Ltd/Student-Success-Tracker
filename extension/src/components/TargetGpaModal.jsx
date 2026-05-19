import React, { useState } from "react";
import PropTypes from "prop-types";

import {
  Typography,
  TextField,
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

const WarningIcon = ({ style }) => (
  <svg style={style} viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor">
    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
  </svg>
);
WarningIcon.propTypes = { style: PropTypes.object };
WarningIcon.defaultProps = { style: {} };

// ─── Helpers ──────────────────────────────────────────────────────────────────
const isAchievable = (text) =>
  text &&
  /possible|can achieve|achievable|yes/i.test(text) &&
  !/not possible|cannot|can't|not achieve|not achievable/i.test(text);

//const ELLUCIAN_BLUE = "primary";
//const ELLUCIAN_BLUE_TEXT = "#ffffff";


const tableSx = {
  "& *": {
    boxShadow: "none !important",
  },

  "& .MuiTableRow-root": {
    backgroundColor: "#fff !important",
  },

  "& .MuiTableRow-root:hover": {
    backgroundColor: "#f0f4ff !important",
  },

  "& .MuiTableCell-root": {
    backgroundColor: "#fff !important",
  },

  /* Header row */
  "& .MuiTableHead-root .MuiTableRow-root": {
    backgroundColor: "primary.main !important",
  },

  /* Header cells */
  "& .MuiTableHead-root .MuiTableCell-root": {
    backgroundColor: "primary.main !important",
    color: "#ffffff !important",
    fontWeight: 700,
    fontSize: "13px",
    textTransform: "none",
    letterSpacing: "normal",
    borderBottom: "none",
  },

  /* Body cells */
  "& .MuiTableBody-root .MuiTableCell-root": {
    backgroundColor: "#fff !important",
    borderBottom: "1px solid #f3f4f6",
    color: "#374151",
    fontSize: "13px",
  },
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
      {/* SVG Ring */}
      <div style={{ position: "relative", width: 64, height: 64, flexShrink: 0 }}>
        <svg width="64" height="64" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r={RADIUS} fill="none" stroke="#dcfce7" strokeWidth="5" />
          <circle
            cx="32" cy="32" r={RADIUS} fill="none"
            stroke="#a78bfa" strokeWidth="5"
            strokeDasharray={CIRCUMFERENCE} strokeDashoffset={currentOffset}
            strokeLinecap="round" transform="rotate(-90 32 32)"
          />
          <circle
            cx="32" cy="32" r={RADIUS} fill="none"
            stroke="#16a34a" strokeWidth="5"
            strokeDasharray={CIRCUMFERENCE} strokeDashoffset={maxOffset}
            strokeLinecap="round" transform="rotate(-90 32 32)"
          />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <TrophyIcon style={{ color: "#16a34a", fontSize: "18px" }} />
        </div>
      </div>

      {/* Text */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <Typography
          variant="body2"
          style={{ color: "#15803d", fontWeight: 700, fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.8px", margin: 0 }}
        >
          Max Achievable GPA
        </Typography>
        <Typography
          variant="body2"
          style={{ color: "#14532d", fontWeight: 900, fontSize: "28px", lineHeight: 1, margin: 0 }}
        >
          {max.toFixed(2)}
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
  const [targetGpaInput, setTargetGpaInput] = useState("");

  const handleClose = () => {
    setTargetGpaInput("");
    onClose();
  };

  const isBelowOrEqualProgramGpa = () => {
    const num = parseFloat(targetGpaInput);
    const pgpa = parseFloat(programGpa);
    return !isNaN(num) && !isNaN(pgpa) && num <= pgpa;
  };

  const isAboveMaxAchievable = () => {
    if (!maxAchievableGpa) return false;
    const num = parseFloat(targetGpaInput);
    const maxAch = parseFloat(maxAchievableGpa);
    return !isNaN(num) && !isNaN(maxAch) && num > maxAch;
  };

  const getHelperText = () => {
    if (!targetGpaInput) return "";
    const num = parseFloat(targetGpaInput);
    if (isNaN(num) || num < 0 || num > (parseFloat(maxGpa) || 4.0))
      return `Please enter a GPA between 0 and ${maxGpa || 4.0}`;
    if (isAboveMaxAchievable())
      return `Target GPA cannot exceed your Maximum Achievable GPA of ${parseFloat(maxAchievableGpa).toFixed(2)}`;
    if (isBelowOrEqualProgramGpa())
      return `Target GPA must be greater than your current Program GPA of ${parseFloat(programGpa).toFixed(2)}`;
    return "";
  };

  const hasError = Boolean(
    targetGpaInput &&
    (
      (() => { const n = parseFloat(targetGpaInput); return isNaN(n) || n < 0 || n > (parseFloat(maxGpa) || 4.0); })() ||
      isAboveMaxAchievable() ||
      isBelowOrEqualProgramGpa()
    )
  );

  const handleSubmit = () => {
    if (hasError || !targetGpaInput) return;
    onSubmit(parseFloat(targetGpaInput));
  };

  let parsed = null;
  if (result?.data) {
    try { parsed = JSON.parse(result.data); } catch (e) { parsed = null; }
  }

  const achievable = parsed ? isAchievable(parsed.achievability) : null;
  const displayMaxGpa = result?.maxAchievableGpa;
  const displayTargetGpa = targetGpaProp || targetGpaInput || "—";
  const showBelowGpaBanner = !result && !loading && targetGpaInput && !hasError && isBelowOrEqualProgramGpa();
  const inputScreenMaxGpa = maxAchievableGpa || maxGpa;

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">

      {/* ── Custom Dialog Title with purple X button ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #e5e7eb",
          padding: "14px 24px",
          backgroundColor: "#fff",
        }}
      >
        <Typography
          variant="h3"
          style={{ margin: 0, fontSize: "1.4rem", fontWeight: 700, textTransform: "none", letterSpacing: "normal" }}
        >
          AI Recommendation
        </Typography>
        <button
          onClick={handleClose}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "32px",
            height: "32px",
            
            borderRadius: "6px",
            backgroundColor: "transparent",
            cursor: "pointer",
            color: "primary",
            padding: 0,
          }}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#6B21A8" strokeWidth="2.2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <DialogContent style={{ padding: "20px 24px 12px 24px", backgroundColor: "#fff", overflow: "visible" }}>

        {/* ── Input state ── */}
        {!result && !loading && (
          <>
            <Typography variant="body2" style={{ color: "#210c50", marginBottom: "14px" }}>
              Enter a target GPA you want to achieve
            </Typography>

            {/* ── GPA cards row ── */}
            <div style={{ display: "flex", alignItems: "stretch", gap: "12px", marginBottom: "18px" }}>

              {/* Program GPA card */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  backgroundColor: "#f5f3ff",
                  border: "1.5px solid #ddd6fe",
                  borderRadius: "12px",
                  padding: "14px 20px",
                  flex: 1,
                }}
              >
                <Typography
                  variant="body2"
                  style={{
                    color: "#7c3aed",
                    fontWeight: 700,
                    fontSize: "10px",
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                    marginBottom: "6px",
                  }}
                >
                  Your Program GPA
                </Typography>
                <Typography
                  variant="body2"
                  style={{ color: "#5b21b6", fontWeight: 900, fontSize: "28px", lineHeight: 1, margin: 0 }}
                >
                  {programGpa != null && !isNaN(parseFloat(programGpa))
                    ? parseFloat(programGpa).toFixed(2)
                    : "N/A"}
                </Typography>
              </div>

              {/* Max Achievable GPA ring */}
              {inputScreenMaxGpa && (
                <MaxGpaRing maxGpa={inputScreenMaxGpa} programGpa={programGpa} scaleMax={maxGpa} />
              )}
            </div>

            <TextField
              label="Target GPA"
              value={targetGpaInput}
              onChange={(e) => setTargetGpaInput(e?.target?.value ?? "")}
              placeholder={`e.g. ${programGpa != null ? (parseFloat(programGpa) + 0.3).toFixed(1) : "3.5"}`}
              error={hasError}
              helperText={getHelperText()}
              fullWidth
            />

            {showBelowGpaBanner && (
              <div
                style={{
                  display: "flex", alignItems: "flex-start", gap: "10px",
                  backgroundColor: "#fffbeb", border: "1px solid #fcd34d",
                  borderRadius: "8px", padding: "12px 16px", marginTop: "14px",
                }}
              >
                <div style={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <WarningIcon style={{ color: "#fff", fontSize: "18px" }} />
                </div>
                <div>
                  <Typography variant="body2" style={{ fontWeight: 700, color: "#92400e", marginBottom: 4, fontSize: "13px" }}>
                    Target GPA Too Low
                  </Typography>
                  <Typography variant="body2" style={{ color: "#78350f", fontSize: "13px", lineHeight: 1.6 }}>
                    Your target GPA (<strong>{parseFloat(targetGpaInput).toFixed(2)}</strong>) must be{" "}
                    <strong>greater than</strong> your current Program GPA of{" "}
                    <strong>{parseFloat(programGpa).toFixed(2)}</strong>. Please enter a higher value.
                  </Typography>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── Loading ── */}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "24px 0", justifyContent: "center" }}>
            <CircularProgress size={28} />
            <Typography variant="body2">Fetching recommendations...</Typography>
          </div>
        )}

        {/* ── Result ── */}
        {parsed && !loading && (
          <div>
            {/* Status banner */}
            <div
              style={{
                display: "flex", alignItems: "flex-start", gap: "12px",
                backgroundColor: achievable ? "#dcfce7" : "#fef2f2",
                border: `1px solid ${achievable ? "#bbf7d0" : "#fecaca"}`,
                borderRadius: "8px", padding: "14px 18px", marginBottom: "12px",
              }}
            >
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
                      <TableCell>
                        <Typography variant="body2" style={{ color: "#ffffff", fontWeight: 700 }}>#</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" style={{ color: "#ffffff", fontWeight: 700 }}>Course</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" style={{ color: "#ffffff", fontWeight: 700 }}>Credits</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" style={{ color: "#ffffff", fontWeight: 700 }}>Recommended Grade</Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {parsed.grades.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <Typography variant="body2">{idx + 1}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" style={{ fontWeight: 500 }}>{row.course}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{row.credits}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            style={{
                              display: "inline-block",
                              padding: "2px 18px",
                              borderRadius: "12px",
                              backgroundColor: "#dcfce7",
                              color: "#16a34a",
                              fontWeight: 700,
                              fontSize: "14px",
                            }}
                          >
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
          </div>
        )}
      </DialogContent>

      {/* ── Actions ── */}
      <DialogActions style={{ borderTop: "1px solid #e5e7eb", padding: "12px 20px", backgroundColor: "#fff", justifyContent: "flex-end", gap: "8px" }}>

        {/* Purple filled "Get AI Recommendation" button */}
        {!result && (
          <button
            onClick={handleSubmit}
            disabled={loading || !targetGpaInput || hasError}
            style={{
              textTransform: "none",
              backgroundColor: loading || !targetGpaInput || hasError ? "#d8b4fe" : "#300e4d",
              color: "#ffffff",
              border: "none",
              borderRadius: "4px",
              padding: "8px 16px",
              cursor: loading || !targetGpaInput || hasError ? "not-allowed" : "pointer",
              letterSpacing: "0.3px",
            }}
          >
            <Typography variant="body2" style={{ color: "#ffffff", fontWeight: 600, margin: 0 }}>
              {loading ? "Loading..." : "Get AI Recommendation"}
            </Typography>
          </button>
        )}

        {/* Purple outlined "Close" button */}
        <button
  onClick={handleClose}
  style={{
    textTransform: "none",
    color: "#ffffff",
    border: "1.5px solid #300e4d",
    borderRadius: "4px",
    backgroundColor: "#300e4d",
    padding: "8px 16px",
    cursor: "pointer",
    letterSpacing: "0.3px",
  }}
>
  <Typography
    variant="body2"
    style={{
      color: "#ffffff",
      fontWeight: 600,
      margin: 0,
    }}
  >
    Close
  </Typography>
</button>
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