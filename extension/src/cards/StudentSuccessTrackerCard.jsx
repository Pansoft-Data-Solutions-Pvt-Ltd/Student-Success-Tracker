import React, { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";

import {
  useCardInfo,
  useData,
  useCardControl,
} from "@ellucian/experience-extension-utils";
import useFetch from "../hooks/useFetch.js";

import { withStyles } from "@ellucian/react-design-system/core/styles";
import { Typography } from "@ellucian/react-design-system/core";

const GradCapIcon = ({ color, size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M12 3L1 9l11 6 9-4.91V17M5 13.18V17.18L12 21l7-3.82V13.18L12 17l-7-3.82z"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
GradCapIcon.propTypes = {
  color: PropTypes.string.isRequired,
  size: PropTypes.number,
};

const BarChartIcon = ({ color, size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <rect
      x="3"
      y="12"
      width="4"
      height="9"
      rx="1"
      stroke={color}
      strokeWidth="1.8"
    />
    <rect
      x="10"
      y="7"
      width="4"
      height="14"
      rx="1"
      stroke={color}
      strokeWidth="1.8"
    />
    <rect
      x="17"
      y="4"
      width="4"
      height="17"
      rx="1"
      stroke={color}
      strokeWidth="1.8"
    />
  </svg>
);
BarChartIcon.propTypes = {
  color: PropTypes.string.isRequired,
  size: PropTypes.number,
};

const CourseIcon = ({ color, size = 14 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <rect
      x="4"
      y="3"
      width="14"
      height="18"
      rx="1.5"
      stroke={color}
      strokeWidth="1.8"
      fill="none"
    />
    <line
      x1="8"
      y1="3"
      x2="8"
      y2="21"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <line
      x1="11"
      y1="8"
      x2="16"
      y2="8"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <line
      x1="11"
      y1="12"
      x2="16"
      y2="12"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <line
      x1="11"
      y1="16"
      x2="14"
      y2="16"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);
CourseIcon.propTypes = {
  color: PropTypes.string.isRequired,
  size: PropTypes.number,
};

/* ─────────────────────────────────────────────
   Corner wave — color tinted based on performance
───────────────────────────────────────────── */
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
CornerWave.propTypes = {
  color: PropTypes.string.isRequired,
};

/* ─────────────────────────────────────────────
   Attendance ring SVG
───────────────────────────────────────────── */
const AttendanceCircle = ({ value, color, size = 32 }) => {
  const stroke = 1.5;
  const radius = (size - stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = isNaN(value) ? 0 : Math.min(100, Math.max(0, value));
  const dashOffset = circumference - (pct / 100) * circumference;
  const label = isNaN(value) ? "N/A" : `${value}%`;
  const fontSize = value >= 100 ? "0.42rem" : "0.50rem";

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ flexShrink: 0 }}
      aria-label={`Attendance: ${label}`}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 0.5s ease" }}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        fill={color}
        fontSize={fontSize}
        fontWeight="700"
        fontFamily="inherit"
      >
        {label}
      </text>
    </svg>
  );
};
AttendanceCircle.propTypes = {
  value: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
  size: PropTypes.number,
};

/* ─────────────────────────────────────────────
   hex → rgba helper for tints
───────────────────────────────────────────── */
const hexToRgba = (hex = "#000000", alpha = 0.1) => {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

/* ─────────────────────────────────────────────
   Styles
───────────────────────────────────────────── */
const styles = (theme) => ({
  card: {
    padding: "0.1rem 0.7rem 0.4rem",
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
    gap: "0.5rem",
    overflow: "hidden",
    minHeight: 0,
    [theme.breakpoints.down("md")]: {
      flexDirection: "column",
    },
  },
  gpaCol: {
    flex: "0 0 38%",
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
    minWidth: 0,
    height: "100%",
  },
  gpaBox: {
    position: "relative",
    borderRadius: "12px",
    padding: "0.55rem 0.65rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "space-between",
    background: "#ffffff",
    boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
    flex: 1,
    overflow: "hidden",
    minHeight: 0,
  },
  iconBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    flexShrink: 0,
    zIndex: 1,
  },
  gpaTitle: {
    fontSize: "0.62rem",
    color: "#6b7280",
    fontWeight: 500,
    lineHeight: 1.2,
    zIndex: 1,
  },
  gpaNumber: {
    fontSize: "1.45rem",
    fontWeight: 700,
    lineHeight: 1.1,
    color: "#1e1b4b",
    zIndex: 1,
  },
  gpaRule: {
    height: "2.5px",
    width: "42%",
    borderRadius: "2px",
    flexShrink: 0,
    zIndex: 1,
  },
  attCol: {
    flex: "1 1 62%",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    overflow: "hidden",
  },
  attHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.3rem",
    flexShrink: 0,
  },
  termSelect: {
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
    background: "#fff",
    border: "1px solid #c9cdd6",
    borderRadius: "6px",
    padding: "0.18rem 1.6rem 0.18rem 0.55rem",
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "#333",
    fontFamily: "inherit",
    cursor: "pointer",
    outline: "none",
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 16 16'%3E%3Cpath d='M4 6L8 10L12 6' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' fill='none'/%3E%3C/svg%3E\")",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 0.4rem center",
    "&:focus": {
      borderColor: "#3d0d6e",
      boxShadow: "0 0 0 2px rgba(61,13,110,0.15)",
    },
  },
  attList: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  attRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.28rem",
    flex: 1,
    minHeight: 0,
    borderBottom: "1px solid #f0f0f0",
    padding: "0.08rem 0",
    "&:last-child": {
      borderBottom: "none",
    },
  },
  courseIconWrap: {
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
  },
  courseName: {
    flex: 1,
    fontSize: "0.75rem",
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    lineHeight: "1.2",
    color: "#374151",
  },
  btnWrap: {
    flexShrink: 0,
    paddingTop: "0.35rem",
  },
  viewBtn: {
    display: "block",
    width: "100%",
    border: "none",
    borderRadius: "8px",
    background: "#3d0d6e",
    color: "#fff",
    fontSize: "0.80rem",
    fontWeight: 700,
    letterSpacing: "0.07em",
    textTransform: "uppercase",
    padding: "0.58rem 0",
    cursor: "pointer",
    fontFamily: "inherit",
    "&:hover": { background: "#2d0a52" },
    "&:active": { background: "#1e0638" },
  },
});

/* ─────────────────────────────────────────────
   Helper
───────────────────────────────────────────── */
const toTitleCase = (str) => {
  if (!str) return str;
  return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
};

/* ─────────────────────────────────────────────
   Component
───────────────────────────────────────────── */
const StudentSuccessTracker = ({ classes }) => {
  const { authenticatedEthosFetch } = useData();
  const { cardId, configuration } = useCardInfo();
  const { navigateToPage } = useCardControl();

  const {
    excellent_performance_color_code,
    satisfactory_performance_color_code,
    poor_performance_color_code,
    minimum_threshold_for_excellent_performance,
    minimum_threshold_for_satisfactory_performance,
    minimum_threshold_for_excellent_attendance,
    minimum_threshold_for_satisfactory_attendance,
    student_term_courses_pipeline_v2,
    get_student_course_attendance_banner,
    get_student_course_attendance_moodle,
    attendance_source,
    display_historical_terms_number,
  } = configuration;

  const parsed_exc_perf = parseFloat(
    minimum_threshold_for_excellent_performance,
  );
  const parsed_sat_perf = parseFloat(
    minimum_threshold_for_satisfactory_performance,
  );
  const parsed_exc_att = parseFloat(minimum_threshold_for_excellent_attendance);
  const parsed_sat_att = parseFloat(
    minimum_threshold_for_satisfactory_attendance,
  );

  if (parsed_exc_perf <= parsed_sat_perf)
    throw new Error(
      "Invalid performance configuration: excellent threshold must be greater than satisfactory threshold",
    );
  if (parsed_exc_att <= parsed_sat_att)
    throw new Error(
      "Invalid attendance configuration: excellent threshold must be greater than satisfactory threshold",
    );

  const get_gpa_color = (val) => {
    const v = parseFloat(val);
    if (isNaN(v)) return poor_performance_color_code;
    if (v >= parsed_exc_perf) return excellent_performance_color_code;
    if (v >= parsed_sat_perf) return satisfactory_performance_color_code;
    return poor_performance_color_code;
  };

  const get_attendance_color = (val) => {
    const v = parseFloat(val);
    if (isNaN(v)) return poor_performance_color_code;
    if (v >= parsed_exc_att) return excellent_performance_color_code;
    if (v >= parsed_sat_att) return satisfactory_performance_color_code;
    return poor_performance_color_code;
  };

  const [selected_term_code, set_selected_term_code] = useState(null);
  const [current_gpa, set_current_gpa] = useState(0);
  const [program_gpa, set_program_gpa] = useState(null);

  /* ── Primary data ── */
  const { data: datav2, loading: loadingv2 } = useFetch(
    authenticatedEthosFetch,
    cardId,
    null,
    student_term_courses_pipeline_v2,
    {},
  );

  /* ── Derive attendance query params from datav2 + selected term ── */
  const pidm = datav2?.termData?.[selected_term_code]?.pidm;
  const crns =
    datav2?.termData?.[selected_term_code]?.courses
      ?.map((c) => c.crn)
      .join(",") ?? "";

  /* ── Attendance: Banner (only when attendance_source === "banner") ── */
  const { data: bannerAttendanceData, loading: bannerAttendanceLoading } =
    useFetch(
      authenticatedEthosFetch,
      cardId,
      null,
      get_student_course_attendance_banner,
      { pidm, termCode: selected_term_code, crns },
      attendance_source === "banner",
    );

  /* ── Attendance: Moodle (only when attendance_source === "moodle") ── */
  const { data: moodleAttendanceData, loading: moodleAttendanceLoading } =
    useFetch(
      authenticatedEthosFetch,
      cardId,
      null,
      get_student_course_attendance_moodle,
      {
        moodleUrl: "https://vidyastu.com/webservice/rest/server.php",
        moodleWsToken: "4d7dc29800b05b61dfd7f8c138e5885f",
        pidm,
        termCode: selected_term_code,
        crns,
      },
      attendance_source === "moodle",
    );

  /* ── Moodle: flatten gradebooks into crn → percentage lookup ── */
  const moodleAttendanceLookup = useMemo(() => {
    if (!moodleAttendanceData?.gradebooks) return {};
    return moodleAttendanceData.gradebooks.reduce((acc, entry) => {
      // percentage comes as "70.00 %" — parseFloat handles the trailing " %" cleanly
      const pct = parseFloat(entry.attendance?.[0]?.percentage);
      acc[entry.crn] = isNaN(pct) ? NaN : pct;
      return acc;
    }, {});
  }, [moodleAttendanceData]);

  /* ── Combined loading state ── */
  const attendanceLoading =
    attendance_source === "banner"
      ? bannerAttendanceLoading
      : moodleAttendanceLoading;

  const isLoading = loadingv2 || attendanceLoading;

  /* ── Terms list ── */
  const all_terms = useMemo(() => {
    if (!datav2?.termData) return [];
    const sortedCodes = Object.keys(datav2.termData).sort((a, b) =>
      a.localeCompare(b),
    );

    let limitedCodes = sortedCodes;
    if (
      display_historical_terms_number &&
      display_historical_terms_number !== "all"
    ) {
      const historicalCount = parseInt(display_historical_terms_number, 10);
      if (!isNaN(historicalCount)) {
        limitedCodes = sortedCodes.slice(-(historicalCount + 1));
      }
    }

    return limitedCodes.map((tc) => ({
      termCode: tc,
      termName: datav2.termData[tc]?.termName || tc,
    }));
  }, [datav2, display_historical_terms_number]);

  useEffect(() => {
    if (all_terms.length > 0 && !selected_term_code)
      set_selected_term_code(all_terms[all_terms.length - 1].termCode);
  }, [all_terms, selected_term_code]);

  useEffect(() => {
    if (selected_term_code)
      localStorage.setItem("sst_card_term_code", selected_term_code);
  }, [selected_term_code]);

  useEffect(() => {
    if (!datav2 || !selected_term_code) return;
    const termInfo = datav2.termData?.[selected_term_code];
    if (!termInfo) return;
    const cGpa = parseFloat(termInfo.cumulative_gpa);
    set_current_gpa(!isNaN(cGpa) ? cGpa : 0);
    const pGpa = parseFloat(datav2.programGpa);
    // treat 0 and NaN both as unavailable
    set_program_gpa(pGpa > 0 ? pGpa : null);
  }, [datav2, selected_term_code]);

  /* ── Courses with attendance merged in ── */
  const displayed_attendance = useMemo(() => {
    if (!datav2?.termData || !selected_term_code) return [];
    const courses = datav2.termData[selected_term_code]?.courses ?? [];
    const lookup =
      attendance_source === "banner"
        ? (bannerAttendanceData ?? {})
        : moodleAttendanceLookup;
    return courses.map((course) => ({
      ...course,
      attendancePercentage: lookup[course.crn] ?? NaN,
    }));
  }, [
    datav2,
    selected_term_code,
    attendance_source,
    bannerAttendanceData,
    moodleAttendanceLookup,
  ]);

  const gpa_color = get_gpa_color(current_gpa);
  const prog_color =
    program_gpa !== null
      ? get_gpa_color(program_gpa)
      : poor_performance_color_code;

  const handle_term_change = (e) => {
    e.stopPropagation();
    set_selected_term_code(e.target.value);
  };

  const handle_view_details = () => {
    navigateToPage({ route: "/", params: { termCode: selected_term_code } });
  };

  return (
    <div
      className={classes.card}
      role="button"
      tabIndex={0}
      onClick={handle_view_details}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handle_view_details();
        }
      }}
      style={{ cursor: "pointer" }}
    >
      <div className={classes.cardBody}>
        {/* ─── Left: GPA boxes ─── */}
        <div className={classes.gpaCol}>
          {/* Cumulative GPA */}
          <div
            className={classes.gpaBox}
            style={{
              border: `1.5px solid ${hexToRgba(gpa_color, 0.4)}`,
              background: hexToRgba(gpa_color, 0.04),
            }}
          >
            <CornerWave color={gpa_color} />
            <div
              className={classes.iconBox}
              style={{ background: hexToRgba(gpa_color, 0.12) }}
            >
              <GradCapIcon color={gpa_color} size={18} />
            </div>
            <Typography className={classes.gpaTitle}>Cumulative GPA</Typography>
            <Typography className={classes.gpaNumber}>
              {loadingv2 ? "—" : current_gpa.toFixed(2)}
            </Typography>
            <div
              className={classes.gpaRule}
              style={{ background: "#1e1b4b" }}
            />
          </div>

          {/* Program GPA */}
          <div
            className={classes.gpaBox}
            style={{
              border: `1.5px solid ${hexToRgba(prog_color, 0.4)}`,
              background: hexToRgba(prog_color, 0.04),
            }}
          >
            <CornerWave color={prog_color} />
            <div
              className={classes.iconBox}
              style={{ background: hexToRgba(prog_color, 0.12) }}
            >
              <BarChartIcon color={prog_color} size={18} />
            </div>
            <Typography className={classes.gpaTitle}>Program GPA</Typography>
            <Typography className={classes.gpaNumber}>
              {loadingv2
                ? "—"
                : program_gpa !== null
                  ? program_gpa.toFixed(2)
                  : "N/A"}
            </Typography>
            <div
              className={classes.gpaRule}
              style={{ background: "#1e1b4b" }}
            />
            {!loadingv2 && program_gpa === null && (
              <Typography
                style={{ fontSize: "0.55rem", color: "#9ca3af", zIndex: 1 }}
              >
                Not available
              </Typography>
            )}
          </div>
        </div>

        {/* ─── Right: Attendance ─── */}
        <div className={classes.attCol}>
          <div className={classes.attHeader}>
            <Typography
              variant="h5"
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                color: "#111827",
                textTransform: "capitalize",
              }}
            >
              (Attendance {attendance_source})
            </Typography>

            {!loadingv2 && all_terms.length > 0 && (
              <select
                className={classes.termSelect}
                value={selected_term_code || ""}
                onChange={handle_term_change}
                onClick={(e) => e.stopPropagation()}
                aria-label="Select term"
              >
                {all_terms.map((t) => (
                  <option key={t.termCode} value={t.termCode}>
                    {toTitleCase(t.termName)}
                  </option>
                ))}
              </select>
            )}
          </div>

          {isLoading ? (
            <Typography style={{ textAlign: "center", padding: "1rem" }}>
              Loading attendance data...
            </Typography>
          ) : displayed_attendance.length === 0 ? (
            <Typography style={{ textAlign: "center", padding: "1rem" }}>
              No attendance data available
            </Typography>
          ) : (
            <div className={classes.attList}>
              {displayed_attendance.map((entry, index) => {
                const parsed_pct = parseFloat(entry.attendancePercentage);
                const att_color = get_attendance_color(parsed_pct);
                return (
                  <div key={index} className={classes.attRow}>
                    <div className={classes.courseIconWrap}>
                      <CourseIcon color="#6B21A8" size={14} />
                    </div>
                    <Typography
                      variant="body3"
                      title={entry.courseTitle}
                      className={classes.courseName}
                      style={{
                        flex: 1,
                        fontSize: "0.75rem",
                        color: "#374151",
                        fontWeight: 400,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        lineHeight: 1.2,
                        minWidth: 0,
                      }}
                    >
                      {entry.courseTitle}
                    </Typography>
                    <AttendanceCircle
                      value={isNaN(parsed_pct) ? NaN : parsed_pct}
                      color={att_color}
                      size={32}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ══════════ VIEW DETAILS ══════════ */}
      <div className={classes.btnWrap}>
        <button
          type="button"
          className={classes.viewBtn}
          onClick={(e) => {
            e.stopPropagation();
            handle_view_details();
          }}
        >
          View Details
        </button>
      </div>
    </div>
  );
};

StudentSuccessTracker.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(StudentSuccessTracker);
