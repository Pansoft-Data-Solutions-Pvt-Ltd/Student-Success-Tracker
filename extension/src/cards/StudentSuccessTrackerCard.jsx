import React, { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";

import { useCardInfo, useData } from "@ellucian/experience-extension-utils";

import useFetch from '../hooks/useFetch.js';

import { withStyles } from "@ellucian/react-design-system/core/styles";
import { Typography } from "@ellucian/react-design-system/core";

import SvgHollowCircle from "../components/SvgHollowCircle.jsx";

/* Inline SVG chevrons — no external icon package, no redirect */
const ChevronLeftIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const styles = (theme) => ({
  card: {
    padding: "0 0.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
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
  /* Full-width row: term nav aligned to the right */
  termNavRow: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    width: "100%",
    marginBottom: "0.15rem",
  },
  /* Row: Cumulative GPA label | Attendance Overview label side by side */
  sectionTitlesRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: "0.25rem",
  },
  gpaTitleCell: {
    flex: "0 0 38%",
    textAlign: "center",
  },
  attendanceTitleCell: {
    flex: "1 1 62%",
    paddingLeft: "0.5rem",
  },
  /* Keep attendanceHeader minimal — titles moved to sectionTitlesRow */
  attendanceHeader: {
    display: "flex",
    flexDirection: "column",
  },
  termNav: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  termNavLabel: {
    minWidth: "72px",
    textAlign: "center",
    fontSize: "0.72rem",
    lineHeight: 1.2,
  },
  /* Plain <button> — no Ellucian IconButton to avoid redirect */
  navBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "22px",
    height: "22px",
    padding: 0,
    border: "1px solid #ccc",
    borderRadius: "50%",
    background: "transparent",
    cursor: "pointer",
    color: "inherit",
    lineHeight: 1,
    "&:disabled": {
      opacity: 0.35,
      cursor: "default",
    },
    "&:hover:not(:disabled)": {
      background: "rgba(0,0,0,0.06)",
    },
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

/* ── Title-case helper ── */
const toTitleCase = (str) => {
  if (!str) return str;
  return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
};

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
    student_term_courses_pipeline,
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

  /* ── Helpers ── */
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

  /* ── State ── */
  const [selected_term_code, set_selected_term_code] = useState(null);
  const [current_gpa, set_current_gpa]               = useState(0);
  const [program_gpa, set_program_gpa]               = useState(null);

  /* ── Fetch ── */
  const { data, loading } = useFetch(
    authenticatedEthosFetch,
    cardId,
    null,
    student_term_courses_pipeline,
    {},
  );

  /* ── Derive term list ── */
  const all_terms = useMemo(() => {
    if (!data?.termData) return [];
    return Object.keys(data.termData)
      .sort((a, b) => a.localeCompare(b))
      .map((tc) => ({
        termCode: tc,
        termName: data.termData[tc]?.termName || tc,
      }));
  }, [data]);

  /* ── Auto-select latest term (only on first load) ── */
  useEffect(() => {
    if (all_terms.length > 0 && !selected_term_code) {
      set_selected_term_code(all_terms[all_terms.length - 1].termCode);
    }
  }, [all_terms, selected_term_code]);

  /* ── Persist selected term to localStorage whenever it changes.
       Home.jsx reads this on mount so the page opens on the same term
       the user was viewing in the card.                                 ── */
  useEffect(() => {
    if (selected_term_code) {
      localStorage.setItem("sst_card_term_code", selected_term_code);
    }
  }, [selected_term_code]);

  /* ── Sync GPA when term changes ── */
  useEffect(() => {
    if (!data || !selected_term_code) return;
    const termInfo = data.termData?.[selected_term_code];
    if (!termInfo) return;

    const parsedCumulativeGpa = parseFloat(termInfo.cumulative_gpa);
    set_current_gpa(!isNaN(parsedCumulativeGpa) ? parsedCumulativeGpa : 0);

    const parsedProgramGpa = parseFloat(data.programGpa);
    set_program_gpa(!isNaN(parsedProgramGpa) ? parsedProgramGpa : null);
  }, [data, selected_term_code]);

  /* ── Derived ── */
  const current_term_index  = all_terms.findIndex(t => t.termCode === selected_term_code);
  const selected_term_obj   = all_terms[current_term_index] || null;
  const displayed_term_name = selected_term_obj?.termName ?? "";

  const displayed_attendance = useMemo(() => {
    if (!data?.termData || !selected_term_code) return [];
    return data.termData[selected_term_code]?.courses ?? [];
  }, [data, selected_term_code]);

  const gpa_circle_color         = get_gpa_color(current_gpa);
  const program_gpa_circle_color = get_gpa_color(program_gpa);

  /* ── Term nav handlers — e.stopPropagation() prevents card-level redirect ── */
  const handle_prev_term = (e) => {
    e.stopPropagation();
    if (current_term_index > 0) {
      set_selected_term_code(all_terms[current_term_index - 1].termCode);
    }
  };

  const handle_next_term = (e) => {
    e.stopPropagation();
    if (current_term_index < all_terms.length - 1) {
      set_selected_term_code(all_terms[current_term_index + 1].termCode);
    }
  };

  /* ── Card click — localStorage is already up-to-date via the persist effect above.
       Nothing extra needed here; the SDK’s built-in pageRoute click fires naturally. ── */
  const handle_card_click = () => {};

  /* ── Render ── */
  return (
    <div
      className={classes.card}
      role="button"
      tabIndex={0}
      onClick={handle_card_click}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handle_card_click();
        }
      }}
      style={{ cursor: "pointer" }}
    >
      {/* ── Row 1: term nav aligned right ── */}
      {!loading && all_terms.length > 0 && (
        <div className={classes.termNavRow}>
          <button
            type="button"
            className={classes.navBtn}
            aria-label="Previous term"
            disabled={current_term_index <= 0}
            onClick={handle_prev_term}
          >
            <ChevronLeftIcon />
          </button>
          <Typography variant="body2" className={classes.termNavLabel}>
            {toTitleCase(displayed_term_name) || "Select Term"}
          </Typography>
          <button
            type="button"
            className={classes.navBtn}
            aria-label="Next term"
            disabled={current_term_index >= all_terms.length - 1}
            onClick={handle_next_term}
          >
            <ChevronRightIcon />
          </button>
        </div>
      )}

      {/* ── Row 2: section titles side by side ── */}
      <div className={classes.sectionTitlesRow}>
        <div className={classes.gpaTitleCell}>
          <Typography variant="h5">Cumulative GPA</Typography>
        </div>
        <div className={classes.attendanceTitleCell}>
          <Typography variant="h5">Attendance Overview</Typography>
        </div>
      </div>

      <div className={classes.cardBody}>

        {/* ── Left: GPA circles ── */}
        <section className={classes.gpaSection}>

          <div className={classes.metricBlock}>
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

          <div className={classes.metricBlock}>
            <Typography variant="h5">Program GPA</Typography>
            <div className={classes.circleContainer}>
              <div
                className={classes.circleInner}
                style={{
                  border: `4px solid ${program_gpa !== null ? program_gpa_circle_color : poor_performance_color_code}`,
                }}
              >
                <strong
                  className={classes.circleValue}
                  style={{ color: program_gpa !== null ? program_gpa_circle_color : poor_performance_color_code }}
                >
                  {loading ? "..." : program_gpa !== null ? program_gpa.toFixed(2) : "N/A"}
                </strong>
              </div>
            </div>
            {!loading && program_gpa === null && (
              <Typography variant="body3" style={{ textAlign: "center", fontSize: "0.6rem", color: "#999" }}>
                Not available
              </Typography>
            )}
          </div>

        </section>

        {/* ── Right: attendance ── */}
        <section className={classes.attendanceSection}>

          {/* Attendance list */}
          {loading ? (
            <Typography style={{ textAlign: "center", padding: "1rem" }}>
              Loading attendance data...
            </Typography>
          ) : displayed_attendance.length === 0 ? (
            <Typography style={{ textAlign: "center", padding: "1rem" }}>
              No attendance data available
            </Typography>
          ) : (
            <div className={classes.attendanceList}>
              {displayed_attendance.map((entry, index) => {
                const parsed_attendance  = parseFloat(entry.attendancePercentage);
                const display_attendance = !isNaN(parsed_attendance) ? `${parsed_attendance}%` : "N/A";

                return (
                  <div key={index} className={classes.attendanceRow}>
                    <div className={classes.courseName} title={entry.courseTitle}>
                      {entry.courseTitle}
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