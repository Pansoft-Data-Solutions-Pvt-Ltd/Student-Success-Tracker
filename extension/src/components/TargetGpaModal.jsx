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

const ELLUCIAN_BLUE = "#175cb6";
const ELLUCIAN_BLUE_TEXT = "#ffffff";

const tableSx = {
  "& *": { boxShadow: "none !important" },
  "& .MuiTableRow-root": { backgroundColor: "#fff !important" },
  "& .MuiTableRow-root:hover": { backgroundColor: "#f0f4ff !important" },
  "& .MuiTableCell-root": { backgroundColor: "#fff !important" },
  "& .MuiTableHead-root .MuiTableRow-root": { backgroundColor: `${ELLUCIAN_BLUE} !important` },
  "& .MuiTableHead-root .MuiTableCell-root": {
    backgroundColor: `${ELLUCIAN_BLUE} !important`,
    color: `${ELLUCIAN_BLUE_TEXT} !important`,
    fontWeight: 700,
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.4px",
    borderBottom: "none",
  },
  "& .MuiTableBody-root .MuiTableCell-root": {
    backgroundColor: "#fff !important",
    borderBottom: "1px solid #f3f4f6",
    color: "#374151",
    fontSize: "13px",
  },
};

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
}) => {
  const [targetGpaInput, setTargetGpaInput] = useState("");

  const handleClose = () => {
    setTargetGpaInput("");
    onClose();
  };

  // ── Validation helpers ──
  const isValidGpa = (value) => {
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0 && num <= (parseFloat(maxGpa) || 4.0);
  };

  const isBelowOrEqualProgramGpa = () => {
    const num = parseFloat(targetGpaInput);
    const pgpa = parseFloat(programGpa);
    return !isNaN(num) && !isNaN(pgpa) && num <= pgpa;
  };

  const getHelperText = () => {
    if (!targetGpaInput) return "";
    if (!isValidGpa(targetGpaInput)) {
      return `Please enter a GPA between 0 and ${maxGpa || 4.0}`;
    }
    if (isBelowOrEqualProgramGpa()) {
      return `Target GPA must be greater than your current Program GPA of ${parseFloat(programGpa).toFixed(2)}`;
    }
    return "";
  };

  const hasError = Boolean(
    targetGpaInput && (!isValidGpa(targetGpaInput) || isBelowOrEqualProgramGpa())
  );

  const handleSubmit = () => {
    if (!isValidGpa(targetGpaInput)) return;
    if (isBelowOrEqualProgramGpa()) return;
    onSubmit(parseFloat(targetGpaInput));
  };

  // ── Parse result ──
  let parsed = null;
  if (result?.data) {
    try { parsed = JSON.parse(result.data); } catch (e) { parsed = null; }
  }

  const achievable = parsed ? isAchievable(parsed.achievability) : null;
  const displayMaxGpa = result?.maxAchievableGpa;
  const displayTargetGpa = targetGpaProp || targetGpaInput || "—";

  const showBelowGpaBanner =
    !result &&
    !loading &&
    targetGpaInput &&
    isValidGpa(targetGpaInput) &&
    isBelowOrEqualProgramGpa();

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">

      <DialogTitle
        style={{ borderBottom: "1px solid #e5e7eb", padding: "14px 24px", backgroundColor: "#fff" }}
      >
        <Typography variant="h3" style={{ margin: 0 }}>
          AI Recommendation
        </Typography>
      </DialogTitle>

      <DialogContent
        style={{ padding: "16px 24px 8px 24px", backgroundColor: "#fff", overflow: "visible" }}
      >

        {/* ── Input state ── */}
        {!result && !loading && (
          <>
            <Typography gutterBottom>
              Enter a target GPA you want to achieve
            </Typography>

            {/* Program GPA chip only */}
            <div style={{ marginBottom: "14px" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  backgroundColor: "#f5f3ff",
                  border: "1px solid #ddd6fe",
                  borderRadius: "6px",
                  padding: "6px 12px",
                }}
              >
                <Typography
                  variant="body2"
                  style={{ color: "#7c3aed", fontWeight: 600, fontSize: "13px" }}
                >
                  Your Program GPA:&nbsp;
                  <span style={{ fontSize: "15px", fontWeight: 800 }}>
                    {programGpa != null && !isNaN(parseFloat(programGpa))
                      ? parseFloat(programGpa).toFixed(2)
                      : "N/A"}
                  </span>
                </Typography>
              </div>
            </div>

            <TextField
              label="Target GPA"
              value={targetGpaInput}
              onChange={(e) => setTargetGpaInput(e?.target?.value ?? "")}
              placeholder={`e.g. ${programGpa != null ? (parseFloat(programGpa) + 0.3).toFixed(1) : "3.5"} (max ${maxGpa || "4.0"})`}
              error={hasError}
              helperText={getHelperText()}
              fullWidth
            />

            {/* ── Warning banner ── */}
            {showBelowGpaBanner && (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  backgroundColor: "#fffbeb",
                  border: "1px solid #fcd34d",
                  borderRadius: "8px",
                  padding: "12px 16px",
                  marginTop: "14px",
                }}
              >
                <div
                  style={{
                    width: 32, height: 32, borderRadius: "50%",
                    backgroundColor: "#f59e0b", display: "flex",
                    alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}
                >
                  <WarningIcon style={{ color: "#fff", fontSize: "18px" }} />
                </div>
                <div>
                  <Typography
                    variant="body2"
                    style={{ fontWeight: 700, color: "#92400e", marginBottom: 4, fontSize: "13px" }}
                  >
                    Target GPA Too Low
                  </Typography>
                  <Typography
                    variant="body2"
                    style={{ color: "#78350f", fontSize: "13px", lineHeight: 1.6 }}
                  >
                    Your target GPA (<strong>{parseFloat(targetGpaInput).toFixed(2)}</strong>) must
                    be <strong>greater than</strong> your current Program GPA of{" "}
                    <strong>{parseFloat(programGpa).toFixed(2)}</strong>. Please enter a higher
                    value to get a meaningful recommendation.
                  </Typography>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── Loading state ── */}
        {loading && (
          <div
            style={{
              display: "flex", alignItems: "center", gap: "12px",
              padding: "16px 0", justifyContent: "center",
            }}
          >
            <CircularProgress size={28} />
            <Typography variant="body2">Fetching recommendations...</Typography>
          </div>
        )}

        {/* ── Result state ── */}
        {parsed && !loading && (
          <div>

            {/* 1. Status Box */}
            <div
              style={{
                display: "flex", alignItems: "flex-start", gap: "12px",
                backgroundColor: achievable ? "#dcfce7" : "#fef2f2",
                border: `1px solid ${achievable ? "#bbf7d0" : "#fecaca"}`,
                borderRadius: "8px", padding: "14px 18px", marginBottom: "12px",
              }}
            >
              <div
                style={{
                  width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                  backgroundColor: achievable ? "#16a34a" : "#dc2626",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                {achievable
                  ? <CheckCircleIcon style={{ color: "#fff", fontSize: "20px" }} />
                  : <ErrorCircleIcon style={{ color: "#fff", fontSize: "20px" }} />}
              </div>
              <div>
                <Typography
                  variant="body2"
                  style={{ fontWeight: 700, color: achievable ? "#166534" : "#991b1b", marginBottom: 4 }}
                >
                  Target GPA Status
                </Typography>
                <Typography
                  variant="body2"
                  style={{ color: achievable ? "#166534" : "#7f1d1d", fontSize: "13px", lineHeight: 1.6 }}
                >
                  {parsed.achievability}
                </Typography>
              </div>
            </div>

            {/* 2. Stat Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <div
                style={{
                  backgroundColor: "#fff", borderRadius: "8px", padding: "14px 16px",
                  border: "2px solid #bbf7d0", display: "flex", alignItems: "center", gap: "12px",
                }}
              >
                <div
                  style={{
                    width: 40, height: 40, borderRadius: "50%", backgroundColor: "#dcfce7",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}
                >
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

              <div
                style={{
                  backgroundColor: "#fff", borderRadius: "8px", padding: "14px 16px",
                  border: "2px solid #fed7aa", display: "flex", alignItems: "center", gap: "12px",
                }}
              >
                <div
                  style={{
                    width: 40, height: 40, borderRadius: "50%", backgroundColor: "#ffedd5",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}
                >
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

            {/* 3. Table */}
            {parsed.grades && parsed.grades.length > 0 && (
              <div
                style={{
                  backgroundColor: "#fff", borderRadius: "8px",
                  border: "1px solid #e5e7eb", overflow: "hidden", marginBottom: "12px",
                }}
              >
                <div style={{ padding: "12px 18px", textAlign: "center" }}>
                  <Typography variant="h5" style={{ margin: 0 }}>
                    Recommended Grades for Remaining Courses
                  </Typography>
                </div>
                <Table size="small" sx={tableSx}>
                  <TableHead>
                    <TableRow>
                      <TableCell>#</TableCell>
                      <TableCell>Course</TableCell>
                      <TableCell>Credits</TableCell>
                      <TableCell>Recommended Grade</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {parsed.grades.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell component="th" scope="row">{idx + 1}</TableCell>
                        <TableCell>
                          <Typography variant="body2" style={{ fontWeight: 500 }}>{row.course}</Typography>
                        </TableCell>
                        <TableCell>{row.credits}</TableCell>
                        <TableCell>
                          <span
                            style={{
                              display: "inline-block", padding: "2px 18px", borderRadius: "12px",
                              backgroundColor: "#dcfce7", color: "#16a34a", fontWeight: 700, fontSize: "14px",
                            }}
                          >
                            {row.grade}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* 4. Recommendation */}
            {parsed.recommendation && (
              <div
                style={{
                  backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #e5e7eb",
                  padding: "14px 18px", display: "flex", alignItems: "flex-start", gap: "12px",
                }}
              >
                <div
                  style={{
                    width: 36, height: 36, borderRadius: "50%", backgroundColor: "#dbeafe",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}
                >
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

      <DialogActions
        style={{
          borderTop: "1px solid #e5e7eb", padding: "12px 20px",
          backgroundColor: "#fff", justifyContent: "flex-end", gap: "8px",
        }}
      >
        {!result && (
          <Button
            color="primary"
            onClick={handleSubmit}
            disabled={loading || !targetGpaInput || !isValidGpa(targetGpaInput) || isBelowOrEqualProgramGpa()}
            sx={{ textTransform: "none !important" }}
          >
            {loading ? "Loading..." : "Get AI Recommendation"}
          </Button>
        )}
        <Button
          color="secondary"
          onClick={handleClose}
          sx={{ textTransform: "none !important" }}
        >
          Close
        </Button>
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
};

TargetGpaModal.defaultProps = {
  loading: false,
  result: null,
  maxGpa: "4.0",
  programGpa: null,
  targetGpa: null,
};

export default TargetGpaModal;