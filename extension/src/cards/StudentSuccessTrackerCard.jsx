import React, { useState, useEffect, useMemo, useRef } from "react";
import PropTypes from "prop-types";

import {
  useCardInfo,
  useData,
  useCardControl,
} from "@ellucian/experience-extension-utils";
import useFetch from "../hooks/useFetch.js";

import { withStyles } from "@ellucian/react-design-system/core/styles";
import { Typography } from "@ellucian/react-design-system/core";
import { Icon } from "@ellucian/ds-icons/lib";

/* ─────────────────────────────────────────────
   Design tokens — pulled from the Ellucian Path
   color guidelines. Keeping these in one place
   means if the palette changes, this is the only
   spot that needs updating.
───────────────────────────────────────────── */
const palette = {
  // Neutrals
  neutral600: "#151618",
  neutral500: "#5B5E65",
  neutral450: "#74767C",
  neutral400: "#B2B3B7",
  neutral300: "#D9D9D9",
  neutral250: "#E9E9E9",
  neutral200: "#F8F8F8",
  neutral100: "#FFFFFF",

  // Brand / CTA (Iris)
  iris600: "#7100EB",
  ctaIrisBase: "#320070", // cta-iris-800 (base)
  ctaIrisHover: "#5300B2", // cta-iris-700 (hover)
  ctaIrisActive: "#7100EB", // cta-iris-600 (active)
  ctaIrisTint: "#F6F6FD",

  // Alert semantics
  alertSuccessFill: "#00AF69",
  alertSuccessText: "#00804D",
  alertWarningFill: "#EFC728", // == saffron-600
  alertWarningText: "#8A6A00",
  alertErrorFill: "#D42828",
  alertErrorText: "#D42828",
  alertNeutralFill: "#51ABFF",
  alertNeutralText: "#2874BB",

  // Tertiary chart color used for the mid-tier attendance warning
  tangerine600: "#FF8C3A",
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
   Attendance pill badge — `color` is always passed
   in from get_attendance_color(), which is built
   entirely from card config (warning1_color /
   warning2_color / red_flag_color /
   poor_performance_color_code), falling back to the
   design-system alert palette above. Nothing here
   is hardcoded outside of `palette`.
───────────────────────────────────────────── */
const AttendancePill = ({ value, color }) => {
  const label = isNaN(value) ? "N/A" : `${value}% absent`;

  return (
    <span
      style={{
        flexShrink: 0,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: "88px",
        padding: "0.3rem 0.5rem",
        borderRadius: "999px",
        background: hexToRgba(color, 0.1),
        color,
        fontSize: "0.7rem",
        fontWeight: 700,
        whiteSpace: "nowrap",
        lineHeight: 1,
        textAlign: "center",
      }}
      aria-label={`Absence: ${label}`}
    >
      {label}
    </span>
  );
};
AttendancePill.propTypes = {
  value: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
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
   Absence warning helper — same 3-tier logic as CourseDataView.jsx,
   reading the same warning1 / warning2 / red_flag config keys so both
   components stay in sync if thresholds are changed in card config.
   attendancePercentage IS already the absence % (e.g. 21.28 = 21.28% absent).
   Colors (w1Color / w2Color / rfColor) come from absenceThresholds, which
   itself is built from card config, falling back to the design-system
   alert palette (saffron/tangerine/error-red) when config values are
   missing — the "ok" floor color is the design-system success fill.
───────────────────────────────────────────── */
const getAttendanceWarning = (absencePct, thresholds) => {
  if (absencePct === null || absencePct === undefined || isNaN(absencePct)) {
    return null;
  }
  const val = Number(absencePct);
  const { warning1, warning2, redFlag, w1Color, w2Color, rfColor } = thresholds;

  if (val >= redFlag) {
    return { level: "red_flag", label: "Red Flag", circleColor: rfColor, color: rfColor };
  }
  if (val >= warning2) {
    return { level: "warning2", label: "Warning 2", circleColor: w2Color, color: w2Color };
  }
  if (val >= warning1) {
    return { level: "warning1", label: "Warning 1", circleColor: w1Color, color: w1Color };
  }
  // Below all thresholds — good, design-system success color
  return {
    level: "ok",
    label: null,
    circleColor: palette.alertSuccessFill,
    color: palette.alertSuccessText,
  };
};

/* ─────────────────────────────────────────────
   Styles
   Breakpoints used:
     - down("md"): stack GPA column above attendance column
     - down("sm"): tighten spacing/typography for phones,
       lay the two GPA boxes out side-by-side to use the
       freed-up horizontal space efficiently
     - down("xs")/custom max-width: further compress for
       very narrow card placements
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
    [theme.breakpoints.down("sm")]: {
      padding: "0.1rem 0.5rem 0.4rem",
    },
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
      overflowY: "auto",
    },
  },
  gpaCol: {
    flex: "0 0 38%",
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
    minWidth: 0,
    height: "100%",
    [theme.breakpoints.down("md")]: {
      flex: "0 0 auto",
      width: "100%",
      height: "auto",
      // Side-by-side on narrower/stacked layouts so the two GPA
      // boxes share the freed-up horizontal space instead of
      // stacking twice as tall.
      flexDirection: "row",
    },
    [theme.breakpoints.down("xs")]: {
      gap: "0.3rem",
    },
  },
  gpaBox: {
    position: "relative",
    borderRadius: "12px",
    padding: "0.55rem 0.65rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "space-between",
    background: palette.neutral100,
    boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
    flex: 1,
    overflow: "hidden",
    minHeight: 0,
    minWidth: 0,
    [theme.breakpoints.down("sm")]: {
      padding: "0.45rem 0.55rem",
      borderRadius: "10px",
    },
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
    [theme.breakpoints.down("sm")]: {
      width: "28px",
      height: "28px",
    },
  },
  gpaTitle: {
    fontSize: "0.62rem",
    color: palette.neutral500,
    fontWeight: 500,
    lineHeight: 1.2,
    zIndex: 1,
    [theme.breakpoints.down("sm")]: {
      fontSize: "0.58rem",
    },
  },
  gpaNumber: {
    fontSize: "1.45rem",
    fontWeight: 700,
    lineHeight: 1.1,
    color: palette.neutral600,
    zIndex: 1,
    [theme.breakpoints.down("sm")]: {
      fontSize: "1.15rem",
    },
  },
  gpaRule: {
    height: "2.5px",
    width: "42%",
    borderRadius: "2px",
    flexShrink: 0,
    zIndex: 1,
    background: palette.iris600,
  },
  attCol: {
    flex: "1 1 62%",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    overflow: "hidden",
    [theme.breakpoints.down("md")]: {
      flex: "1 1 auto",
    },
  },
  attHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "0.5rem",
    marginBottom: "0.3rem",
    flexShrink: 0,
    flexWrap: "wrap",
  },
  attHeaderTitle: {
    fontSize: "0.72rem",
    fontWeight: 700,
    color: palette.neutral600,
    textTransform: "capitalize",
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    [theme.breakpoints.down("sm")]: {
      fontSize: "0.66rem",
    },
  },
  /* ── Custom term dropdown (replaces native <select> so the open
     list's highlight/selected colors are fully styleable — native
     <select> popups are OS-rendered and ignore CSS for that part) ── */
  termDropdownWrap: {
    position: "relative",
    flexShrink: 0,
  },
  termDropdownButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "0.4rem",
    background: palette.neutral100,
    border: `1px solid ${palette.neutral300}`,
    borderRadius: "6px",
    padding: "0.18rem 0.5rem 0.18rem 0.55rem",
    fontSize: "0.75rem",
    fontWeight: 600,
    color: palette.ctaIrisBase,
    fontFamily: "inherit",
    cursor: "pointer",
    outline: "none",
    maxWidth: "150px",
    minWidth: 0,
    "&:focus": {
      borderColor: palette.ctaIrisBase,
      boxShadow: `0 0 0 2px ${hexToRgba(palette.ctaIrisBase, 0.15)}`,
    },
    [theme.breakpoints.down("sm")]: {
      fontSize: "0.68rem",
      maxWidth: "120px",
      padding: "0.16rem 0.45rem 0.16rem 0.45rem",
    },
  },
  termDropdownButtonLabel: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    minWidth: 0,
  },
  termDropdownChevron: {
    flexShrink: 0,
    display: "flex",
    color: palette.ctaIrisBase,
    transition: "transform 0.15s ease",
  },
  termDropdownChevronOpen: {
    transform: "rotate(180deg)",
  },
  termDropdownMenu: {
    position: "absolute",
    top: "calc(100% + 4px)",
    right: 0,
    minWidth: "100%",
    maxHeight: "220px",
    overflowY: "auto",
    background: palette.neutral100,
    border: `1px solid ${palette.neutral300}`,
    borderRadius: "8px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
    zIndex: 10,
    padding: "0.25rem",
    listStyle: "none",
    margin: 0,
  },
  termDropdownItem: {
    padding: "0.4rem 0.6rem",
    fontSize: "0.75rem",
    fontWeight: 500,
    color: palette.neutral600,
    borderRadius: "6px",
    cursor: "pointer",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    "&:hover": {
      background: palette.ctaIrisTint,
      color: palette.ctaIrisBase,
    },
    "&:focus-visible": {
      outline: `2px solid ${palette.ctaIrisBase}`,
      outlineOffset: "-2px",
    },
  },
  termDropdownItemSelected: {
    background: palette.ctaIrisBase,
    color: palette.neutral100,
    fontWeight: 700,
    "&:hover": {
      background: palette.ctaIrisHover,
      color: palette.neutral100,
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
    borderBottom: `1px solid ${palette.neutral250}`,
    padding: "0.08rem 0",
    "&:last-child": {
      borderBottom: "none",
    },
  },
  courseIconWrap: {
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    color: palette.iris600,
  },
  courseName: {
    flex: 1,
    fontSize: "0.75rem",
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    lineHeight: "1.2",
    color: palette.neutral600,
    fontWeight: 400,
    [theme.breakpoints.down("sm")]: {
      fontSize: "0.68rem",
    },
  },
  attEmptyState: {
    textAlign: "center",
    padding: "1rem",
    color: palette.neutral500,
    fontSize: "0.8rem",
  },
  gpaUnavailable: {
    fontSize: "0.55rem",
    color: palette.neutral400,
    zIndex: 1,
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
    background: palette.ctaIrisBase,
    color: palette.neutral100,
    fontSize: "0.80rem",
    fontWeight: 700,
    letterSpacing: "0.07em",
    textTransform: "uppercase",
    padding: "0.58rem 0",
    cursor: "pointer",
    fontFamily: "inherit",
    "&:hover": { background: palette.ctaIrisHover },
    "&:active": { background: palette.ctaIrisActive },
    [theme.breakpoints.down("sm")]: {
      fontSize: "0.72rem",
      padding: "0.5rem 0",
    },
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
   Custom term dropdown — a button + listbox instead of a native
   <select>, so the open menu's item highlight/selected colors are
   fully styleable (purple) instead of the OS-default blue.
───────────────────────────────────────────── */
const TermDropdown = ({ classes, terms, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const selectedTerm = terms.find((t) => t.termCode === value);

  return (
    <div className={classes.termDropdownWrap} ref={wrapRef}>
      <button
        type="button"
        className={classes.termDropdownButton}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select term"
      >
        <span className={classes.termDropdownButtonLabel}>
          {selectedTerm ? toTitleCase(selectedTerm.termName) : "Select term"}
        </span>
        <span
          className={`${classes.termDropdownChevron} ${
            open ? classes.termDropdownChevronOpen : ""
          }`}
        >
          <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
            <path
              d="M4 6L8 10L12 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      {open && (
        <ul className={classes.termDropdownMenu} role="listbox">
          {terms.map((t) => {
            const isSelected = t.termCode === value;
            return (
              <li
                key={t.termCode}
                role="option"
                aria-selected={isSelected}
                tabIndex={0}
                className={`${classes.termDropdownItem} ${
                  isSelected ? classes.termDropdownItemSelected : ""
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(t.termCode);
                  setOpen(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    onChange(t.termCode);
                    setOpen(false);
                  }
                }}
              >
                {toTitleCase(t.termName)}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
TermDropdown.propTypes = {
  classes: PropTypes.object.isRequired,
  terms: PropTypes.arrayOf(
    PropTypes.shape({
      termCode: PropTypes.string.isRequired,
      termName: PropTypes.string,
    }),
  ).isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
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
    student_term_courses_pipeline_v2,
    get_student_course_attendance_banner,
    get_student_course_attendance_moodle,
    attendance_source,
    display_historical_terms_number,
    warning1,
    warning2,
    red_flag,
    warning1_color,
    warning2_color,
    red_flag_color,
  } = configuration;

  const parsed_exc_perf = parseFloat(
    minimum_threshold_for_excellent_performance,
  );
  const parsed_sat_perf = parseFloat(
    minimum_threshold_for_satisfactory_performance,
  );

  if (parsed_exc_perf <= parsed_sat_perf)
    throw new Error(
      "Invalid performance configuration: excellent threshold must be greater than satisfactory threshold",
    );

  /* ── Absence thresholds — same config keys as CourseDataView.jsx,
     so both components stay in sync if these are changed in card config.
     Colors here all flow from configuration first, falling back to the
     Ellucian design-system alert palette (never hardcoded ad-hoc hex). ── */
  const absenceThresholds = {
    warning1: parseFloat(warning1) || 5,
    warning2: parseFloat(warning2) || 10,
    redFlag: parseFloat(red_flag) || 15,
    w1Color: warning1_color || palette.alertWarningFill, // saffron-600
    w2Color: warning2_color || palette.tangerine600,
    rfColor: red_flag_color || palette.alertErrorFill,
  };

  const get_gpa_color = (val) => {
    const v = parseFloat(val);
    if (isNaN(v)) return poor_performance_color_code;
    if (v >= parsed_exc_perf) return excellent_performance_color_code;
    if (v >= parsed_sat_perf) return satisfactory_performance_color_code;
    return poor_performance_color_code;
  };

  const get_attendance_color = (val) => {
    const v = parseFloat(val);
    const warning = getAttendanceWarning(v, absenceThresholds);
    return warning ? warning.circleColor : poor_performance_color_code;
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

  /* Only fire dependent fetches once pidm/term/crns are actually ready,
     to avoid premature calls like pidm=undefined&termCode=null&crns= */
  const hasValidAttendanceParams = !!pidm && !!selected_term_code && !!crns;

  /* ── Attendance: Banner (only when attendance_source === "banner") ──
     get_student_course_attendance_banner points at
     "pansoft-x-get-student-course-absence-banner", which returns a FLAT object:
     { "20005": "23.81", "20018": "22.22", ... }  (crn → absence % as string)
  */
  const { data: bannerAttendanceData, loading: bannerAttendanceLoading } =
    useFetch(
      authenticatedEthosFetch,
      cardId,
      null,
      get_student_course_attendance_banner,
      { pidm, termCode: selected_term_code, crns },
      attendance_source === "banner" && hasValidAttendanceParams,
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
      attendance_source === "moodle" && hasValidAttendanceParams,
    );

  /* ── Banner: flat { crn: "23.81" } object → crn → percentage (number) ── */
  const bannerAttendanceLookup = useMemo(() => {
    if (!bannerAttendanceData || typeof bannerAttendanceData !== "object")
      return {};
    return Object.entries(bannerAttendanceData).reduce((acc, [crn, val]) => {
      const pct = parseFloat(val);
      acc[String(crn)] = isNaN(pct) ? NaN : pct;
      return acc;
    }, {});
  }, [bannerAttendanceData]);

  /* ── Moodle: flatten gradebooks into crn → percentage lookup ── */
  const moodleAttendanceLookup = useMemo(() => {
    if (!moodleAttendanceData?.gradebooks) return {};
    return moodleAttendanceData.gradebooks.reduce((acc, entry) => {
      // percentage comes as "70.00 %" — parseFloat handles the trailing " %" cleanly
      const pct = parseFloat(entry.attendance?.[0]?.percentage);
      acc[String(entry.crn)] = isNaN(pct) ? NaN : pct;
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
        ? bannerAttendanceLookup
        : moodleAttendanceLookup;
    return courses.map((course) => ({
      ...course,
      attendancePercentage: lookup[String(course.crn)] ?? NaN,
    }));
  }, [
    datav2,
    selected_term_code,
    attendance_source,
    bannerAttendanceLookup,
    moodleAttendanceLookup,
  ]);

  const gpa_color = get_gpa_color(current_gpa);
  const prog_color =
    program_gpa !== null
      ? get_gpa_color(program_gpa)
      : poor_performance_color_code;

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
              <span style={{ color: gpa_color, display: "flex" }}>
                <Icon name="graduation" />
              </span>
            </div>
            <Typography className={classes.gpaTitle}>Cumulative GPA</Typography>
            <Typography className={classes.gpaNumber}>
              {loadingv2 ? "—" : current_gpa.toFixed(2)}
            </Typography>
            <div className={classes.gpaRule} />
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
              <span style={{ color: prog_color, display: "flex" }}>
                <Icon name="bar-chart" />
              </span>
            </div>
            <Typography className={classes.gpaTitle}>Program GPA</Typography>
            <Typography className={classes.gpaNumber}>
              {loadingv2
                ? "—"
                : program_gpa !== null
                  ? program_gpa.toFixed(2)
                  : "N/A"}
            </Typography>
            <div className={classes.gpaRule} />
            {!loadingv2 && program_gpa === null && (
              <Typography className={classes.gpaUnavailable}>
                Not available
              </Typography>
            )}
          </div>
        </div>

        {/* ─── Right: Attendance ─── */}
        <div className={classes.attCol}>
          <div className={classes.attHeader}>
            <Typography variant="h5" className={classes.attHeaderTitle}>
              (Absence {attendance_source})
            </Typography>

            {!loadingv2 && all_terms.length > 0 && (
              <TermDropdown
                classes={classes}
                terms={all_terms}
                value={selected_term_code}
                onChange={(termCode) => set_selected_term_code(termCode)}
              />
            )}
          </div>

          {isLoading ? (
            <Typography className={classes.attEmptyState}>
              Loading attendance data...
            </Typography>
          ) : displayed_attendance.length === 0 ? (
            <Typography className={classes.attEmptyState}>
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
                      <Icon name="course" />
                    </div>
                    <Typography
                      variant="body3"
                      title={entry.courseTitle}
                      className={classes.courseName}
                    >
                      {entry.courseTitle}
                    </Typography>
                    <AttendancePill
                      value={isNaN(parsed_pct) ? NaN : parsed_pct}
                      color={att_color}
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