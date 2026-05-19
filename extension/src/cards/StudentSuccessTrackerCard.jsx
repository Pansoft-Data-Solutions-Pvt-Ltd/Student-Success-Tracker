import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

import { useCardInfo, useData } from "@ellucian/experience-extension-utils";

import useFetch from '../hooks/useFetch.js';

import { withStyles } from "@ellucian/react-design-system/core/styles";
import { Typography } from "@ellucian/react-design-system/core";

import SvgHollowCircle from "../components/SvgHollowCircle.jsx";

const styles = (theme) => ({
  card: {
    padding: "0 0.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    overflow: "hidden",
    width: "100%",
    height: "100%",
    boxSizing: "border-box",
  },
  cardBody: {
    flex: 1,
    display: "flex",
    flexDirection: "row",
    overflow: "hidden",
    [theme.breakpoints.down("md")]: {
      flexDirection: "column",
    },
  },
  gpaSection: {
    flex: "0 0 38%",
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
    overflow: "hidden",
  },
  attendanceSection: {
    flex: "1 1 62%",
    minWidth: 0,
    paddingLeft: "0.5rem",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  metricBlock: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1.2rem",
    width: "100%",
  },
  circleContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  circleInner: {
    width: "4.5rem",
    height: "4.5rem",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  circleValue: {
    fontSize: "1.1rem",
    fontWeight: 600,
    lineHeight: 1,
  },
  circleDivider: {
    width: "70%",
    margin: "0",
  },
  attendanceHeader: {
    marginBottom: "0.1rem",
  },
  attendanceList: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    padding: "0 0.25rem",
  },
  attendanceRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.2rem 0.25rem",
    borderBottom: "1px solid #e0e0e0",
    gap: "0.25rem",
    minHeight: "0",
    flex: 1,
    "&:last-child": {
      borderBottom: "none",
    },
  },
  courseName: {
    flex: 1,
    fontSize: "0.68rem",
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    lineHeight: "1.2",
  },
  attendancePercentage: {
    display: "flex",
    alignItems: "center",
    gap: "0.3rem",
    fontSize: "0.68rem",
    fontWeight: 400,
    flexShrink: 0,
  },
});

/* ================= COMPONENT ================= */
const StudentSuccessTracker = ({ classes }) => {
  const { authenticatedEthosFetch } = useData();
  const { cardId, configuration } = useCardInfo();

  const {
    excellent_performance_color_code,
    satisfactory_performance_color_code,
    poor_performance_color_code,
    minimum_threshold_for_excellent_performance,
    minimum_threshold_for_satisfactory_performance,
    minimum_threshold_for_excellent_attendance,
    minimum_threshold_for_satisfactory_attendance,
    latest_term_information_pipeline,
  } = configuration;

  const parsed_minimum_threshold_for_excellent_performance    = parseFloat(minimum_threshold_for_excellent_performance);
  const parsed_minimum_threshold_for_satisfactory_performance = parseFloat(minimum_threshold_for_satisfactory_performance);
  const parsed_minimum_threshold_for_excellent_attendance     = parseFloat(minimum_threshold_for_excellent_attendance);
  const parsed_minimum_threshold_for_satisfactory_attendance  = parseFloat(minimum_threshold_for_satisfactory_attendance);

  if (parsed_minimum_threshold_for_excellent_performance <= parsed_minimum_threshold_for_satisfactory_performance) {
    throw new Error("Invalid performance configuration: excellent threshold must be greater than satisfactory threshold");
  }

  if (parsed_minimum_threshold_for_excellent_attendance <= parsed_minimum_threshold_for_satisfactory_attendance) {
    throw new Error("Invalid attendance configuration: excellent threshold must be greater than satisfactory threshold");
  }

  /* ── Helper functions ─────────────────────────────────────────────────── */

  const get_gpa_color = (gpa_value) => {
    const parsed = parseFloat(gpa_value);
    if (isNaN(parsed)) return poor_performance_color_code;
    if (parsed >= parsed_minimum_threshold_for_excellent_performance)    return excellent_performance_color_code;
    if (parsed >= parsed_minimum_threshold_for_satisfactory_performance) return satisfactory_performance_color_code;
    return poor_performance_color_code;
  };

  const get_attendance_color = (attendance_value) => {
    const parsed = parseFloat(attendance_value);
    if (isNaN(parsed)) return poor_performance_color_code;
    if (parsed >= parsed_minimum_threshold_for_excellent_attendance)    return excellent_performance_color_code;
    if (parsed >= parsed_minimum_threshold_for_satisfactory_attendance) return satisfactory_performance_color_code;
    return poor_performance_color_code;
  };

  /* ── State ────────────────────────────────────────────────────────────── */

  const [current_gpa, set_current_gpa]         = useState(0);
  const [term_name, set_term_name]             = useState("");
  const [attendance_data, set_attendance_data] = useState([]);
  const [program_gpa, set_program_gpa]         = useState(null);

  /* ── Fetch ────────────────────────────────────────────────────────────── */

  const { data, loading } = useFetch(
    authenticatedEthosFetch,
    cardId,
    null,
    latest_term_information_pipeline,
    {},
  );

  /* ── React to data ────────────────────────────────────────────────────── */

  useEffect(() => {
    if (!data) return;

    // ── Cumulative GPA (flat field from this pipeline) ──
    const parsedCumulativeGpa = parseFloat(data.cumulativeGpa);
    set_current_gpa(!isNaN(parsedCumulativeGpa) ? parsedCumulativeGpa : 0);

    // ── Term name ──
    set_term_name(data.termName || "");

    // ── Course attendance list ──
    set_attendance_data(Array.isArray(data.termInformation) ? data.termInformation : []);

    // ── Program GPA: not in this pipeline, derive from termInformation if possible ──
    // Calculate a weighted average GPA from available course grades as fallback
    // Or set null if not calculable
    if (data.programGpa !== undefined && data.programGpa !== null) {
      const parsedProgramGpa = parseFloat(data.programGpa);
      set_program_gpa(!isNaN(parsedProgramGpa) ? parsedProgramGpa : null);
    } else {
      set_program_gpa(null);
    }

  }, [data]);

  const gpa_circle_color         = get_gpa_color(current_gpa);
  const program_gpa_circle_color = get_gpa_color(program_gpa);

  /* ── Render ───────────────────────────────────────────────────────────── */

  return (
    <div className={classes.card}>
      <div className={classes.cardBody}>

        {/* ── Left: Cumulative GPA + Program GPA circles ── */}
        <section className={classes.gpaSection}>

          <div className={classes.metricBlock}>
            <Typography variant="h5">Cumulative GPA</Typography>
            <div className={classes.circleContainer}>
              <div
                className={classes.circleInner}
                style={{ border: `4px solid ${gpa_circle_color}` }}
              >
                <strong className={classes.circleValue} style={{ color: gpa_circle_color }}>
                  {loading ? "..." : current_gpa.toFixed(2)}
                </strong>
              </div>
            </div>
          </div>

          <div className={classes.circleDivider} />

          {/* ── Program GPA ── */}
          <div className={classes.metricBlock}>
            <Typography variant="h5">Program GPA</Typography>
            <div className={classes.circleContainer}>
              <div
                className={classes.circleInner}
                style={{ border: `4px solid ${program_gpa !== null ? program_gpa_circle_color : poor_performance_color_code}` }}
              >
                <strong
                  className={classes.circleValue}
                  style={{ color: program_gpa !== null ? program_gpa_circle_color : poor_performance_color_code }}
                >
                  {loading
                    ? "..."
                    : program_gpa !== null
                      ? program_gpa.toFixed(2)
                      : "N/A"}
                </strong>
              </div>
            </div>
            {!loading && program_gpa === null && (
              <Typography variant="body3" style={{ textAlign: "center", fontSize: "0.6rem", color: "#999" }}>
                Not available for current term
              </Typography>
            )}
          </div>

        </section>

        {/* ── Right: per-course attendance list ── */}
        <section className={classes.attendanceSection}>
          <header className={classes.attendanceHeader}>
            <Typography variant="h5" style={{ textAlign: "center" }}>
              Attendance Overview
            </Typography>
            <Typography variant="body2" style={{ textAlign: "center" }}>
              {term_name || "Current Term"}
            </Typography>
          </header>

          {loading ? (
            <Typography style={{ textAlign: "center", padding: "1rem" }}>
              Loading attendance data...
            </Typography>
          ) : attendance_data.length === 0 ? (
            <Typography style={{ textAlign: "center", padding: "1rem" }}>
              No attendance data available
            </Typography>
          ) : (
            <div className={classes.attendanceList}>
              {attendance_data.map((attendance_entry, index) => {
                const parsed_attendance = parseFloat(attendance_entry.attendancePercentage);
                const display_attendance = !isNaN(parsed_attendance)
                  ? `${parsed_attendance}%`
                  : "N/A";

                return (
                  <div key={index} className={classes.attendanceRow}>
                    <div className={classes.courseName} title={attendance_entry.courseTitle}>
                      {attendance_entry.courseTitle}
                    </div>
                    <div className={classes.attendancePercentage}>
                      <span>{display_attendance}</span>
                      <SvgHollowCircle color={get_attendance_color(parsed_attendance)} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </div>
    </div>
  );
};

StudentSuccessTracker.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(StudentSuccessTracker);