import React from "react";
import PropTypes from "prop-types";
import { Typography } from "@ellucian/react-design-system/core";
import DoubleChevronIcon from "./DoubleChevron";

const CumulativeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TermGpaIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="4" width="18" height="18" rx="2" stroke="#0369A1" strokeWidth="2"/>
    <path d="M16 2v4M8 2v4M3 10h18" stroke="#0369A1" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const AcademicStandingIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ProgramGpaIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="8" r="4" stroke="#7C3AED" strokeWidth="2"/>
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

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
  colors,
}) => {
  const displayedAcademicStanding =
    academicStanding || (isLatestTerm ? previousAcademicStanding : null) || "N/A";

  const cardStyle = {
    flex: 1,
    padding: "18px 20px 20px 20px",
    borderRadius: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    minWidth: 0,
    border: "2px solid #D1D5DB",
    boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
    background: "#fff",
  };

  return (
    <div className="gpa-cards-column">

      {/* ── 4 METRIC CARDS ROW ── */}
      <div style={{ display: "flex", gap: "16px" }}>

        {/* CUMULATIVE GPA CARD */}
        <div style={cardStyle}>
          <CumulativeIcon />
          <Typography
            variant="body1"
            style={{ fontSize: "0.95rem", fontWeight: 700, color: "#374151", marginTop: "8px" }}
          >
            Cumulative GPA
          </Typography>
          <Typography
            variant="h3"
            style={{ fontSize: "2.1rem", fontWeight: 800, color: gpaCircleColor, lineHeight: 1.1, marginTop: "4px" }}
          >
            {loadingTermInformation ? "..." : currentGpa}
          </Typography>
          {!isFirstTerm && (
            <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
              {isZeroDelta ? (
                <Typography variant="body2" style={{ fontSize: "0.88rem", color: "#6B7280", fontWeight: 500 }}>
                  ● Same as Last Term
                </Typography>
              ) : (
                <>
                  <DoubleChevronIcon
                    orientation={isPositive ? "up" : "down"}
                    size={14}
                    backgroundColor={deltaColor}
                  />
                  <Typography variant="body2" style={{ fontSize: "0.88rem", color: deltaColor, fontWeight: 700 }}>
                    {gpaDelta != null ? Number(gpaDelta).toFixed(2) : gpaDelta}
                  </Typography>
                  <Typography variant="body2" style={{ fontSize: "0.88rem", color: "#6B7280", fontWeight: 500 }}>
                    From Last Term
                  </Typography>
                </>
              )}
            </div>
          )}
        </div>

        {/* TERM GPA CARD */}
        <div style={cardStyle}>
          <TermGpaIcon />
          <Typography
            variant="body1"
            style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1D4ED8", marginTop: "8px" }}
          >
            Term GPA
          </Typography>
          <Typography
            variant="h3"
            style={{ fontSize: "2.1rem", fontWeight: 800, color: termGpaCircleColor, lineHeight: 1.1, marginTop: "4px" }}
          >
            {loadingTermInformation
              ? "..."
              : termGpa != null && !isNaN(termGpa)
                ? Number(termGpa).toFixed(2)
                : "N/A"}
          </Typography>
          <Typography variant="body2" style={{ fontSize: "0.88rem", color: "#1D4ED8", marginTop: "4px", fontWeight: 500 }}>
            ● Current term performance
          </Typography>
        </div>

        {/* ACADEMIC STANDING CARD */}
        <div style={cardStyle}>
          <AcademicStandingIcon />
          <Typography
            variant="body1"
            style={{ fontSize: "0.95rem", fontWeight: 700, color: "#065F46", marginTop: "8px" }}
          >
            Academic Standing
          </Typography>
          <Typography
            variant="h3"
            style={{
              fontSize:
                displayedAcademicStanding.length > 10
                  ? "1.2rem"
                  : displayedAcademicStanding.length > 5
                  ? "1.55rem"
                  : "2.1rem",
              fontWeight: 800,
              color: academicStandingColor,
              lineHeight: 1.15,
              marginTop: "4px",
              wordBreak: "break-word",
            }}
          >
            {loadingTermInformation ? "..." : displayedAcademicStanding}
          </Typography>
          <Typography variant="body2" style={{ fontSize: "0.88rem", color: "#065F46", marginTop: "4px", fontWeight: 500 }}>
            ●{" "}
            {!academicStanding && isLatestTerm && previousAcademicStanding
              ? "Based on previous term"
              : "Current standing status"}
          </Typography>
        </div>

        {/* PROGRAM GPA CARD */}
        <div style={cardStyle}>
          <ProgramGpaIcon />
          <Typography
            variant="body1"
            style={{ fontSize: "0.95rem", fontWeight: 700, color: "#6B21A8", marginTop: "8px" }}
          >
            Program GPA
          </Typography>
          <Typography
            variant="h3"
            style={{ fontSize: "2.1rem", fontWeight: 800, color: programGpaCircleColor, lineHeight: 1.1, marginTop: "4px" }}
          >
            {loadingTermInformation
              ? "..."
              : programGpa != null && !isNaN(programGpa)
                ? Number(programGpa).toFixed(2)
                : "N/A"}
          </Typography>
          <Typography variant="body2" style={{ fontSize: "0.88rem", color: "#6B21A8", marginTop: "4px", fontWeight: 500 }}>
            ● Overall program performance
          </Typography>
        </div>

      </div>

      {/* ── LEGEND ROW ── button has been moved to Home.js (position:absolute bottom-right) ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          marginTop: "14px",
          gap: "12px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexWrap: "nowrap",
            whiteSpace: "nowrap",
            overflow: "hidden",
            flexShrink: 1,
          }}
        >
          <div className="legend-item">
            <div className="legend-dot" style={{ backgroundColor: colors.ON_TRACK }} />
            <Typography variant="body2" style={{ fontSize: "0.82rem", fontWeight: 500 }}>On Track</Typography>
          </div>
          <Typography variant="body2" style={{ color: "#D1D5DB" }}>|</Typography>
          <div className="legend-item">
            <div className="legend-dot" style={{ backgroundColor: colors.NEEDS_ATTENTION }} />
            <Typography variant="body2" style={{ fontSize: "0.82rem", fontWeight: 500 }}>Needs Attention</Typography>
          </div>
          <Typography variant="body2" style={{ color: "#D1D5DB" }}>|</Typography>
          <div className="legend-item">
            <div className="legend-dot" style={{ backgroundColor: colors.CRITICAL }} />
            <Typography variant="body2" style={{ fontSize: "0.82rem", fontWeight: 500 }}>Critical</Typography>
          </div>
          <Typography variant="body2" style={{ color: "#D1D5DB" }}>|</Typography>
          <Typography variant="body2" style={{ fontSize: "0.82rem", fontWeight: 500 }}>A, B, C, D = Letter Grades</Typography>
          <Typography variant="body2" style={{ color: "#D1D5DB" }}>|</Typography>
          <Typography variant="body2" style={{ fontSize: "0.82rem", fontWeight: 500 }}>F = Fail</Typography>
          <Typography variant="body2" style={{ color: "#D1D5DB" }}>|</Typography>
          <Typography variant="body2" style={{ fontSize: "0.82rem", fontWeight: 500 }}>N/A = Not Applicable</Typography>
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