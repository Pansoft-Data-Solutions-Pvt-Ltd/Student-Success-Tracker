import React from "react";
import PropTypes from "prop-types";
import { Typography } from "@ellucian/react-design-system/core";
import DoubleChevronIcon from "./DoubleChevron";

/* ─── Corner Wave ─── */
const CornerWave = ({ color }) => (
  <svg
    width="60" height="50" viewBox="0 0 60 50" fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ position: "absolute", bottom: 0, right: 0, pointerEvents: "none" }}
    aria-hidden="true"
  >
    <path d="M60 50 L0 50 Q35 45 60 0 Z" fill={color} opacity="0.15" />
  </svg>
);
CornerWave.propTypes = { color: PropTypes.string.isRequired };

/* ─── Icons — tiny outline, color prop ─── */
const CumulativeIcon = ({ color }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
CumulativeIcon.propTypes = { color: PropTypes.string.isRequired };

const TermGpaIcon = ({ color }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="4" width="18" height="18" rx="2" stroke={color} strokeWidth="2"/>
    <path d="M16 2v4M8 2v4M3 10h18" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);
TermGpaIcon.propTypes = { color: PropTypes.string.isRequired };

const AcademicStandingIcon = ({ color }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
AcademicStandingIcon.propTypes = { color: PropTypes.string.isRequired };

const ProgramGpaIcon = ({ color }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="8" r="4" stroke={color} strokeWidth="2"/>
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);
ProgramGpaIcon.propTypes = { color: PropTypes.string.isRequired };

/* ─── hex → rgba ─── */
const hexToRgba = (hex = "#000000", alpha = 0.1) => {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

/* ══════════════════════════════════════════════════
   GpaMetrics
══════════════════════════════════════════════════ */
const GpaMetrics = ({
  loadingTermInformation,
  isFirstTerm,
  isZeroDelta,
  isPositive,
  deltaColor,
  gpaDelta,
  gpaCircleColor,
  currentGpa,
  termGpaCircleColor,
  termGpa,
  isLatestTerm,
  academicStanding,
  previousAcademicStanding,
  academicStandingColor,
  programGpa,
  programGpaCircleColor,
}) => {
  const displayedAcademicStanding =
    academicStanding || (isLatestTerm ? previousAcademicStanding : null) || "N/A";

  /* ── Shared card style — pure white bg, colored border only ── */
  const cardStyle = (accentColor) => ({
    flex: 1,
    position: "relative",
    overflow: "hidden",
    /* fixed height so all 4 cards are identical */
    height: "130px",
    padding: "12px 14px",
    borderRadius: "12px",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    border: `1.5px solid ${hexToRgba(accentColor, 0.4)}`,
    boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
    background: "#ffffff",           /* ← pure white */
    boxSizing: "border-box",
  });

  /* ── small icon pill ── */
  const iconPill = (accentColor) => ({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 26,
    height: 26,
    borderRadius: "50%",
    background: hexToRgba(accentColor, 0.12),
    flexShrink: 0,
  });

  /* ── Rows inside each card ──
     Row 1 (top):    icon
     Row 2 (middle): big value  ← flex:1 + center so it always lands in the same spot
     Row 3 (bottom): footer text
  */
  const topRow = { display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 };

  const midRow = {
    flex: 1,                     /* takes all remaining vertical space */
    display: "flex",
    alignItems: "center",        /* vertical center */
    justifyContent: "center",    /* horizontal center */
    width: "100%",
  };

  const botRow = { flexShrink: 0 };

  return (
    <div className="gpa-cards-column">
      <div style={{ display: "flex", gap: "12px", alignItems: "stretch" }}>

        {/* ══ CUMULATIVE GPA ══ */}
        <div style={cardStyle(gpaCircleColor)}>
          <CornerWave color={gpaCircleColor} />

          {/* top: icon + title */}
          <div style={topRow}>
            <div style={iconPill(gpaCircleColor)}>
              <CumulativeIcon color={gpaCircleColor} />
            </div>
            <Typography variant="body2" style={{ fontSize: "0.88rem", fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>
              Cumulative GPA
            </Typography>
          </div>

          {/* middle: big value — always centered */}
          <div style={midRow}>
            <Typography variant="h3" style={{
              fontSize: "2rem", fontWeight: 800,
              color: gpaCircleColor,
              lineHeight: 1, margin: 0, textAlign: "center",
            }}>
              {loadingTermInformation ? "..." : currentGpa}
            </Typography>
          </div>

          {/* bottom: footer */}
          <div style={botRow}>
            {!isFirstTerm ? (
              isZeroDelta ? (
                <Typography variant="body2" style={{ fontSize: "0.78rem", color: "#6B7280", fontWeight: 500 }}>
                  ● Same as Last Term
                </Typography>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                  <DoubleChevronIcon orientation={isPositive ? "up" : "down"} size={11} backgroundColor={deltaColor} />
                  <Typography variant="body2" style={{ fontSize: "0.78rem", color: deltaColor, fontWeight: 700 }}>
                    {gpaDelta != null ? Number(gpaDelta).toFixed(2) : gpaDelta}
                  </Typography>
                  <Typography variant="body2" style={{ fontSize: "0.78rem", color: "#6B7280", fontWeight: 500 }}>
                    From Last Term
                  </Typography>
                </div>
              )
            ) : (
              <Typography variant="body2" style={{ fontSize: "0.78rem", color: "#6B7280", fontWeight: 500 }}>
                ● First term
              </Typography>
            )}
          </div>
        </div>

        {/* ══ TERM GPA ══ */}
        <div style={cardStyle(termGpaCircleColor)}>
          <CornerWave color={termGpaCircleColor} />

          <div style={topRow}>
            <div style={iconPill(termGpaCircleColor)}>
              <TermGpaIcon color={termGpaCircleColor} />
            </div>
            <Typography variant="body2" style={{ fontSize: "0.88rem", fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>
              Term GPA
            </Typography>
          </div>

          <div style={midRow}>
            <Typography variant="h3" style={{
              fontSize: "2rem", fontWeight: 800,
              color: termGpaCircleColor,
              lineHeight: 1, margin: 0, textAlign: "center",
            }}>
              {loadingTermInformation
                ? "..."
                : termGpa != null && !isNaN(termGpa)
                  ? Number(termGpa).toFixed(2)
                  : "N/A"}
            </Typography>
          </div>

          <div style={botRow}>
            <Typography variant="body2" style={{ fontSize: "0.78rem", color: "#6B7280", fontWeight: 500 }}>
              ● Current term performance
            </Typography>
          </div>
        </div>

        {/* ══ ACADEMIC STANDING ══ */}
        <div style={cardStyle(academicStandingColor)}>
          <CornerWave color={academicStandingColor} />

          <div style={topRow}>
            <div style={iconPill(academicStandingColor)}>
              <AcademicStandingIcon color={academicStandingColor} />
            </div>
            {/* title BLACK like other cards */}
            <Typography variant="body2" style={{ fontSize: "0.88rem", fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>
              Academic Standing
            </Typography>
          </div>

          {/* middle — same flex:1 centering, font scales with text length */}
          <div style={midRow}>
            <Typography variant="h3" style={{
              fontSize: displayedAcademicStanding.length > 16
                ? "1.05rem"
                : displayedAcademicStanding.length > 9
                  ? "1.7rem"
                  : "2rem",
              fontWeight: 800,
              color: academicStandingColor,   /* value keeps its dynamic color */
              lineHeight: 1.15, margin: 0,
              textAlign: "center",
              wordBreak: "break-word",
              width: "100%",
            }}>
              {loadingTermInformation ? "..." : displayedAcademicStanding}
            </Typography>
          </div>

          <div style={botRow}>
            {/* footer BLACK like other cards */}
            <Typography variant="body2" style={{ fontSize: "0.78rem", color: "#6B7280", fontWeight: 500 }}>
              ●{" "}
              {!academicStanding && isLatestTerm && previousAcademicStanding
                ? "Based on previous term"
                : "Current standing status"}
            </Typography>
          </div>
        </div>

        {/* ══ PROGRAM GPA ══ */}
        <div style={cardStyle(programGpaCircleColor)}>
          <CornerWave color={programGpaCircleColor} />

          <div style={topRow}>
            <div style={iconPill(programGpaCircleColor)}>
              <ProgramGpaIcon color={programGpaCircleColor} />
            </div>
            <Typography variant="body2" style={{ fontSize: "0.88rem", fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>
              Program GPA
            </Typography>
          </div>

          <div style={midRow}>
            <Typography variant="h3" style={{
              fontSize: "2rem", fontWeight: 800,
              color: programGpaCircleColor,
              lineHeight: 1, margin: 0, textAlign: "center",
            }}>
              {loadingTermInformation
                ? "..."
                : programGpa != null && !isNaN(programGpa)
                  ? Number(programGpa).toFixed(2)
                  : "N/A"}
            </Typography>
          </div>

          <div style={botRow}>
            <Typography variant="body2" style={{ fontSize: "0.78rem", color: "#6B7280", fontWeight: 500 }}>
              ● Overall program performance
            </Typography>
          </div>
        </div>

      </div>
    </div>
  );
};

GpaMetrics.propTypes = {
  fetchGpaRecommendation: PropTypes.func.isRequired,
  loadingRecommendation: PropTypes.bool,
  recommendationResult: PropTypes.string,
  recommendationError: PropTypes.string,
  loadingTermInformation: PropTypes.bool.isRequired,
  isFirstTerm: PropTypes.bool.isRequired,
  isFirstTermFlag: PropTypes.bool.isRequired,
  isZeroDelta: PropTypes.bool.isRequired,
  isPositive: PropTypes.bool.isRequired,
  deltaColor: PropTypes.string.isRequired,
  gpaDelta: PropTypes.number,
  gpaCircleColor: PropTypes.string.isRequired,
  currentGpa: PropTypes.number.isRequired,
  termGpaCircleColor: PropTypes.string.isRequired,
  termGpa: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  isLatestTerm: PropTypes.bool.isRequired,
  academicStanding: PropTypes.string,
  previousAcademicStanding: PropTypes.string,
  academicStandingColor: PropTypes.string.isRequired,
  programGpa: PropTypes.number,
  programGpaCircleColor: PropTypes.string.isRequired,
  colors: PropTypes.object.isRequired,
  handleOpenModal: PropTypes.func,
};

GpaMetrics.defaultProps = {
  previousAcademicStanding: null,
};

export default GpaMetrics;