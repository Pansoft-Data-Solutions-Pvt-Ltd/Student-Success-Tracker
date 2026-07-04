import React from "react";
import PropTypes from "prop-types";
import { Typography } from "@ellucian/react-design-system/core";

// ─── Palette ───────────────────────────────────────────────────────────────
const palette = {
  neutral600: "#151618",
  neutral500: "#5B5E65",
  neutral300: "#D9D9D9",
  neutral250: "#E9E9E9",
  neutral100: "#FFFFFF",
  iris600: "#7100EB",
};

const hexToRgba = (hex = "#000000", alpha = 0.1) => {
  const h = (hex || "#000000").replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

// ─── Corner wave decoration (matches StudentSuccessTrackerCard.jsx) ─────────
const CornerWave = ({ color }) => (
  <svg
    width="60"
    height="50"
    viewBox="0 0 60 50"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ position: "absolute", bottom: 0, right: 0, pointerEvents: "none" }}
    aria-hidden="true"
  >
    <path d="M60 50 L0 50 Q35 45 60 0 Z" fill={color} opacity="0.15" />
  </svg>
);
CornerWave.propTypes = { color: PropTypes.string.isRequired };

// ─── Small inline icons (no external icon lib dependency here) ─────────────
const LayersIcon = ({ color }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2 2 7l10 5 10-5-10-5Z" fill={color} />
    <path d="M2 12l10 5 10-5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2 17l10 5 10-5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
LayersIcon.propTypes = { color: PropTypes.string };
LayersIcon.defaultProps = { color: "#000" };

const CalendarIcon = ({ color }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="5" width="18" height="16" rx="2" stroke={color} strokeWidth="2" />
    <path d="M3 10h18" stroke={color} strokeWidth="2" />
    <path d="M8 3v4M16 3v4" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);
CalendarIcon.propTypes = { color: PropTypes.string };
CalendarIcon.defaultProps = { color: "#000" };

const ShieldIcon = ({ color }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 2 4 5v6c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V5l-8-3Z"
      stroke={color}
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);
ShieldIcon.propTypes = { color: PropTypes.string };
ShieldIcon.defaultProps = { color: "#000" };

// ─── One metric card (Cumulative GPA / Term GPA / Academic Standing / etc.) ─
const MetricCard = ({ icon, title, value, valueColor, caption, accentColor }) => (
  <div
    style={{
      position: "relative",
      flex: 1,
      minWidth: 0,
      height: "100%",
      boxSizing: "border-box",
      borderRadius: "12px",
      border: `1.5px solid ${hexToRgba(accentColor, 0.35)}`,
      background: hexToRgba(accentColor, 0.03),
      padding: "14px 18px 16px",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      gap: "6px",
    }}
  >
    <CornerWave color={accentColor} />
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", zIndex: 1 }}>
        {icon}
        <Typography
          style={{
            margin: 0,
            fontSize: "0.85rem",
            fontWeight: 700,
            color: palette.neutral600,
          }}
        >
          {title}
        </Typography>
      </div>

      <Typography
        style={{
          margin: 0,
          fontSize: "1.7rem",
          fontWeight: 800,
          color: valueColor,
          lineHeight: 1.15,
          zIndex: 1,
        }}
      >
        {value}
      </Typography>
    </div>

    {caption && (
      <Typography
        style={{
          margin: 0,
          fontSize: "0.72rem",
          color: palette.neutral500,
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          gap: "5px",
        }}
      >
        <span style={{ fontSize: "0.9em" }}>•</span> {caption}
      </Typography>
    )}
  </div>
);
MetricCard.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  value: PropTypes.node.isRequired,
  valueColor: PropTypes.string.isRequired,
  caption: PropTypes.string,
  accentColor: PropTypes.string.isRequired,
};
MetricCard.defaultProps = { caption: null };

// ─── Main component ──────────────────────────────────────────────────────────
const GpaMetrics = ({
  loadingTermInformation,
  isFirstTerm,
  isFirstTermFlag,
  isZeroDelta,
  isPositive,
  gpaDelta,
  gpaCircleColor,
  currentGpa,
  termGpaCircleColor,
  termGpa,
  colors,
  academicStanding,
  previousAcademicStanding,
  academicStandingColor,
}) => {
  const showFirstTermNote = isFirstTerm || isFirstTermFlag;

  // ── Cumulative GPA caption ──
  let cumulativeCaption = "Same as last term";
  if (!showFirstTermNote && !isZeroDelta) {
    const delta = Math.abs(Number(gpaDelta) || 0).toFixed(2);
    cumulativeCaption = isPositive
      ? `Up ${delta} from last term`
      : `Down ${delta} from last term`;
  } else if (showFirstTermNote) {
    cumulativeCaption = "First recorded term";
  }

  // ── Academic standing caption + value ──
  const usingCurrentStanding = !!academicStanding;
  const resolvedStanding = academicStanding || previousAcademicStanding;
  const standingCaption = usingCurrentStanding
    ? "Based on current term"
    : "Based on previous term";

  const termGpaDisplay =
    !loadingTermInformation && termGpa !== null && termGpa !== undefined && termGpa !== "N/A" && !isNaN(termGpa)
      ? Number(termGpa).toFixed(2)
      : "N/A";

  return (
    <div
      style={{
        flex: 3,
        display: "flex",
        flexDirection: "row",
        alignItems: "stretch",
        gap: "14px",
        minWidth: 0,
      }}
    >
      <MetricCard
        icon={<LayersIcon color={gpaCircleColor || colors?.ON_TRACK} />}
        title="Cumulative GPA"
        value={loadingTermInformation ? "—" : Number(currentGpa || 0).toFixed(2)}
        valueColor={gpaCircleColor || colors?.ON_TRACK}
        caption={loadingTermInformation ? null : cumulativeCaption}
        accentColor={gpaCircleColor || colors?.ON_TRACK}
      />

      <MetricCard
        icon={<CalendarIcon color={termGpaCircleColor || colors?.ON_TRACK} />}
        title="Term GPA"
        value={termGpaDisplay}
        valueColor={termGpaCircleColor || colors?.ON_TRACK}
        caption={loadingTermInformation ? null : "Current term performance"}
        accentColor={termGpaCircleColor || colors?.ON_TRACK}
      />

      <MetricCard
        icon={<ShieldIcon color={academicStandingColor || colors?.ON_TRACK} />}
        title="Academic Standing"
        value={loadingTermInformation ? "—" : resolvedStanding || "N/A"}
        valueColor={academicStandingColor || colors?.ON_TRACK}
        caption={loadingTermInformation || !resolvedStanding ? null : standingCaption}
        accentColor={academicStandingColor || colors?.ON_TRACK}
      />
    </div>
  );
};

GpaMetrics.propTypes = {
  loadingTermInformation: PropTypes.bool,
  isFirstTerm: PropTypes.bool,
  isFirstTermFlag: PropTypes.bool,
  isZeroDelta: PropTypes.bool,
  isPositive: PropTypes.bool,
  deltaColor: PropTypes.string,
  gpaDelta: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  gpaCircleColor: PropTypes.string,
  currentGpa: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  termGpaCircleColor: PropTypes.string,
  termGpa: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  isLatestTerm: PropTypes.bool,
  diffAttendance: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  isZeroAttendanceDiff: PropTypes.bool,
  isPositiveAttendanceDiff: PropTypes.bool,
  attendanceDiffColor: PropTypes.string,
  attendanceCircleColor: PropTypes.string,
  avgAttendance: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  colors: PropTypes.shape({
    ON_TRACK: PropTypes.string,
    NEEDS_ATTENTION: PropTypes.string,
    CRITICAL: PropTypes.string,
  }),
  handleOpenModal: PropTypes.func,
  academicStanding: PropTypes.string,
  previousAcademicStanding: PropTypes.string,
  academicStandingColor: PropTypes.string,
  programGpa: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  programGpaCircleColor: PropTypes.string,
  fetchGpaRecommendation: PropTypes.func,
  loadingRecommendation: PropTypes.bool,
  recommendationResult: PropTypes.object,
  recommendationError: PropTypes.string,
};

GpaMetrics.defaultProps = {
  loadingTermInformation: false,
  isFirstTerm: false,
  isFirstTermFlag: false,
  isZeroDelta: true,
  isPositive: true,
  deltaColor: palette.iris600,
  gpaDelta: 0,
  gpaCircleColor: palette.iris600,
  currentGpa: 0,
  termGpaCircleColor: palette.iris600,
  termGpa: null,
  isLatestTerm: false,
  diffAttendance: null,
  isZeroAttendanceDiff: true,
  isPositiveAttendanceDiff: false,
  attendanceDiffColor: palette.iris600,
  attendanceCircleColor: palette.iris600,
  avgAttendance: null,
  colors: { ON_TRACK: "#079C34", NEEDS_ATTENTION: "#F5A327", CRITICAL: "#F54927" },
  handleOpenModal: () => {},
  academicStanding: null,
  previousAcademicStanding: null,
  academicStandingColor: palette.iris600,
  programGpa: null,
  programGpaCircleColor: palette.iris600,
  fetchGpaRecommendation: () => {},
  loadingRecommendation: false,
  recommendationResult: null,
  recommendationError: null,
};

export default GpaMetrics;