import React from "react";
import PropTypes from "prop-types";
import { Typography } from "@ellucian/react-design-system/core";
import {
  colorBrandPrimary,
  colorTextAlertSuccess,
  colorBackgroundAlertSuccess,
  colorTextAlertWarning,
  colorBackgroundAlertWarning,
  colorTextAlertError,
  colorBackgroundAlertError,
  colorFillAlertSuccess,
  colorFillAlertWarning,
  colorFillAlertError,
  borderRadiusLarge,
  borderRadiusCircle,
} from "@ellucian/react-design-system/core/styles/tokens";
import { withStyles } from "@ellucian/react-design-system/core/styles";
import { Icon } from "@ellucian/ds-icons/lib";

const metricAlertTokens = {
  success: {
    text: colorTextAlertSuccess,
    background: colorBackgroundAlertSuccess,
    fill: colorFillAlertSuccess,
  },
  warning: {
    text: colorTextAlertWarning,
    background: colorBackgroundAlertWarning,
    fill: colorFillAlertWarning,
  },
  error: {
    text: colorTextAlertError,
    background: colorBackgroundAlertError,
    fill: colorFillAlertError,
  },
};

const getMetricTone = (accentColor, colors) => {
  if (accentColor === colors?.CRITICAL) return "error";
  if (accentColor === colors?.NEEDS_ATTENTION) return "warning";
  return "success";
};

const styles = (theme) => ({
  row: {
    flex: 3,
    display: "flex",
    flexDirection: "row",
    alignItems: "stretch",
    gap: theme.spacing(2.5), 
    minWidth: 0,
    marginBottom: theme.spacing(2), 
  },
  card: {
    position: "relative",
    flex: 1,
    minWidth: 0,
    minHeight: theme.spacing(15), 
    boxSizing: "border-box",
    borderRadius: borderRadiusLarge,
    padding: theme.spacing(2, 2.5, 2.25),
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start", 
    justifyContent: "space-between",
    gap: theme.spacing(1), 
    textAlign: "left",
  },
  headerRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  iconCircle: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: theme.spacing(4), 
    height: theme.spacing(4),
    borderRadius: borderRadiusCircle,
    flexShrink: 0,
    color: "#FFFFFF", 
    "& svg": {
      width: theme.spacing(2.25), 
      height: theme.spacing(2.25),
    },
  },
  title: {
    color: theme.palette.text.primary,
    fontWeight: 700,
  },
  value: {
    fontWeight: 800,
    fontSize: "2rem", 
    lineHeight: 1.15,
  },
  caption: {
    color: theme.palette.text.secondary,
    display: "flex",
    alignItems: "center",
  },
  bullet: {
    marginRight: theme.spacing(0.5),
    lineHeight: 1,
  },
  divider: {
    height: "1px",
    backgroundColor: theme.palette.divider,
  },
});

const MetricCard = ({ classes, iconName, title, value, caption, tone }) => {
  const alertColors = metricAlertTokens[tone];

  return (
  <div
    className={classes.card}
    style={{
        border: `1px solid ${alertColors.text}33`,
      backgroundColor: alertColors.background,
    }}
  >
    <div className={classes.headerRow}>
      <div className={classes.iconCircle} style={{ backgroundColor: alertColors.fill }}>
        <Icon name={iconName} />
      </div>
      <Typography variant="body2" className={classes.title}>
        {title}
      </Typography>
    </div>

    <Typography variant="h3" className={classes.value} style={{ color: alertColors.text }}>
      {value}
    </Typography>

    {caption && (
      <Typography variant="body3" className={classes.caption}>
        <span className={classes.bullet}>•</span>
        {caption}
      </Typography>
    )}
  </div>
  );
};
MetricCard.propTypes = {
  classes: PropTypes.object.isRequired,
  iconName: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  value: PropTypes.node.isRequired,
  caption: PropTypes.string,
  tone: PropTypes.oneOf(["success", "warning", "error"]).isRequired,
};
MetricCard.defaultProps = { caption: null };

const GpaMetrics = ({
  classes,
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

  let cumulativeCaption = "Same as last term";
  if (!showFirstTermNote && !isZeroDelta) {
    const delta = Math.abs(Number(gpaDelta) || 0).toFixed(2);
    cumulativeCaption = isPositive
      ? `Up ${delta} from last term`
      : `Down ${delta} from last term`;
  } else if (showFirstTermNote) {
    cumulativeCaption = "First recorded term";
  }

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
    <div className={classes.row}>
      <MetricCard
        classes={classes}
        iconName="graduation"
        title="Cumulative GPA"
        value={loadingTermInformation ? "—" : Number(currentGpa || 0).toFixed(2)}
        caption={loadingTermInformation ? null : cumulativeCaption}
        tone={getMetricTone(gpaCircleColor || colors?.ON_TRACK, colors)}
      />

      <MetricCard
        classes={classes}
        iconName="bar-chart"
        title="Term GPA"
        value={termGpaDisplay}
        caption={loadingTermInformation ? null : "Current term performance"}
        tone={getMetricTone(termGpaCircleColor || colors?.ON_TRACK, colors)}
      />

      <MetricCard
        classes={classes}
        iconName="course"
        title="Academic Standing"
        value={loadingTermInformation ? "—" : resolvedStanding || "N/A"}
        caption={loadingTermInformation || !resolvedStanding ? null : standingCaption}
        tone={getMetricTone(academicStandingColor || colors?.ON_TRACK, colors)}
      />
    </div>
  );
};

GpaMetrics.propTypes = {
  classes: PropTypes.object.isRequired,
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
  deltaColor: colorBrandPrimary,
  gpaDelta: 0,
  gpaCircleColor: colorBrandPrimary,
  currentGpa: 0,
  termGpaCircleColor: colorBrandPrimary,
  termGpa: null,
  isLatestTerm: false,
  diffAttendance: null,
  isZeroAttendanceDiff: true,
  isPositiveAttendanceDiff: false,
  attendanceDiffColor: colorBrandPrimary,
  attendanceCircleColor: colorBrandPrimary,
  avgAttendance: null,
  
  colors: {
    ON_TRACK: colorFillAlertSuccess,
    NEEDS_ATTENTION: colorFillAlertWarning,
    CRITICAL: colorFillAlertError,
  },
  handleOpenModal: () => {},
  academicStanding: null,
  previousAcademicStanding: null,
  academicStandingColor: colorBrandPrimary,
  programGpa: null,
  programGpaCircleColor: colorBrandPrimary,
  fetchGpaRecommendation: () => {},
  loadingRecommendation: false,
  recommendationResult: null,
  recommendationError: null,
};

export default withStyles(styles)(GpaMetrics);
