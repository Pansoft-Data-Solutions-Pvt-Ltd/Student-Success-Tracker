import React, { useState, useEffect, useMemo, useCallback } from "react";
import PropTypes from "prop-types";

import {
  useCardInfo,
  useData,
  useCardControl,
} from "@ellucian/experience-extension-utils";
import useFetch from "../hooks/useFetch.js";

import {
  Button,
  Card,
  CardContent,
  Dropdown,
  DropdownItem,
  Typography,
} from "@ellucian/react-design-system/core";
import {
  colorTextAlertSuccess,
  colorBackgroundAlertSuccess,
  colorTextAlertWarning,
  colorBackgroundAlertWarning,
  colorTextAlertError,
  colorBackgroundAlertError,
  colorTextAlertNeutral,
  colorBackgroundAlertNeutral,
  colorFillAlertSuccess,
  colorFillAlertWarning,
  colorFillAlertError,
  colorFillAlertNeutral,
  borderRadiusCircle,
  borderRadiusLarge,
  borderRadiusXLarge,
} from "@ellucian/react-design-system/core/styles/tokens";
import { withStyles } from "@ellucian/react-design-system/core/styles";
import { Icon } from "@ellucian/ds-icons/lib";

const toTitleCase = (str) => {
  if (!str) return str;
  return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
};


const alertTokens = {
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
  neutral: {
    text: colorTextAlertNeutral,
    background: colorBackgroundAlertNeutral,
    fill: colorFillAlertNeutral,
  },
};

const getGpaStatus = (val, excellentThreshold, satisfactoryThreshold) => {
  const v = parseFloat(val);
  if (isNaN(v)) return { status: "error", text: "N/A" };
  if (v >= excellentThreshold) return { status: "success", text: "EXCELLENT" };
  if (v >= satisfactoryThreshold) return { status: "warning", text: "SATISFACTORY" };
  return { status: "error", text: "NEEDS IMPROVEMENT" };
};


const getAttendanceWarning = (absencePct, thresholds) => {
  if (absencePct === null || absencePct === undefined || isNaN(absencePct)) {
    return { status: "error", text: "N/A" };
  }
  const val = Number(absencePct);
  const { warning1, warning2, redFlag } = thresholds;

  if (val >= redFlag) return { status: "error", text: `${val}% absent` };
  if (val >= warning2 || val >= warning1) return { status: "warning", text: `${val}% absent` };
  return { status: "success", text: `${val}% absent` };
};


const buildStatusStyles = (tokens) => ({
  pill: {
    backgroundColor: tokens.background,
    color: tokens.text,
  },
  iconBox: {
    backgroundColor: tokens.fill,
    color: "#FFFFFF", 
  },
  gpaBox: {
    backgroundColor: tokens.background,
    border: `1px solid ${tokens.text}33`,
  },
  numberText: {
    color: tokens.text,
  },
});

const styles = (theme) => {
  const success = buildStatusStyles(alertTokens.success);
  const warning = buildStatusStyles(alertTokens.warning);
  const error = buildStatusStyles(alertTokens.error);
  const neutral = buildStatusStyles(alertTokens.neutral);

  return {
    card: {
      padding: theme.spacing(0.5, 2, 1.5),
      display: "flex",
      flexDirection: "column",
      gap: theme.spacing(1),
      overflow: "hidden",
      width: "100%",
      height: "100%",
      boxSizing: "border-box",
      [theme.breakpoints.down("sm")]: {
        padding: theme.spacing(0.5, 1.5, 1.5),
      },
    },
    cardBody: {
      flex: 1,
      display: "flex",
      flexDirection: "row",
      gap: theme.spacing(1.5),
      overflow: "hidden",
      minHeight: 0,
      [theme.breakpoints.down("md")]: {
        flexDirection: "column",
        overflowY: "auto",
      },
    },
    gpaCol: {
      flex: "0 0 26%",
      display: "flex",
      flexDirection: "column",
      gap: theme.spacing(0.75),
      minWidth: 0,
      height: "100%",
      [theme.breakpoints.down("md")]: {
        flex: "0 0 auto",
        width: "100%",
        height: "auto",
        flexDirection: "row",
        flexWrap: "wrap",
      },
    },
    gpaBoxBase: {
      borderRadius: borderRadiusLarge,
      padding: theme.spacing(1, 1),
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: theme.spacing(0.5),
      flex: 1,
      overflow: "hidden",
      minHeight: 0,
      minWidth: 0,
    },
    gpaBoxSuccess: success.gpaBox,
    gpaBoxWarning: warning.gpaBox,
    gpaBoxError: error.gpaBox,
    gpaBoxNeutral: neutral.gpaBox,
    iconBoxBase: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: theme.spacing(4),
      height: theme.spacing(4),
      borderRadius: borderRadiusCircle,
      flexShrink: 0,
    },
    iconBoxSuccess: success.iconBox,
    iconBoxWarning: warning.iconBox,
    iconBoxError: error.iconBox,
    iconBoxNeutral: neutral.iconBox,
    gpaTitle: {
      color: theme.palette.text.secondary,
    },
    gpaNumber: {
      lineHeight: 1.1,
    },
    gpaNumberSuccess: success.numberText,
    gpaNumberWarning: warning.numberText,
    gpaNumberError: error.numberText,
    gpaNumberNeutral: neutral.numberText,
    gpaUnavailable: {
      color: alertTokens.error.text,
      fontWeight: 700,
    },
    pillBase: {
      display: "inline-flex",
      alignItems: "center",
      padding: theme.spacing(0.4, 1.25),
      borderRadius: borderRadiusXLarge,
      fontSize: "0.75rem",
      fontWeight: 700,
      letterSpacing: "0.02em",
      whiteSpace: "nowrap",
      lineHeight: 1.4,
    },
    pillSuccess: success.pill,
    pillWarning: warning.pill,
    pillError: error.pill,
    pillNeutral: neutral.pill,
    attCol: {
      flex: "1 1 72%",
      display: "flex",
      flexDirection: "column",
      minWidth: 0,
      overflow: "hidden",
    },
    attColTitle: {
      minWidth: 0,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      marginBottom: theme.spacing(0.5),
      flexShrink: 0,
    },
    
    termAndTitleRow: {
      display: "flex",
      flexDirection: "column",
      alignItems: "stretch",
      gap: theme.spacing(0.75),
      marginBottom: theme.spacing(0.5),
      flexShrink: 0,
    },
    termRow: {
      flexShrink: 0,
      width: "100%",
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
      gap: theme.spacing(1),
      flex: 1,
      minHeight: 0,
      padding: theme.spacing(0.5, 0),
    },
    rowDivider: {
      height: "1px",
      backgroundColor: theme.palette.divider,
    },
    courseIconWrap: {
      flexShrink: 0,
      display: "flex",
      alignItems: "center",
      color: theme.palette.primary.main,
    },
    courseName: {
      flex: 1,
      minWidth: 0,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      color: theme.palette.text.primary,
    },
    attEmptyState: {
      textAlign: "center",
      padding: theme.spacing(2),
      color: theme.palette.text.secondary,
    },
    btnWrap: {
      flexShrink: 0,
      paddingTop: theme.spacing(0.5),
    },
    
    cardRoot: {
      boxShadow: "none",
      border: "none",
      backgroundColor: "transparent",
      height: "100%",
    },
   
    cardContentFullHeight: {
      height: "100%",
      display: "flex",
      flexDirection: "column",
    },
    pillButton: {
      borderRadius: borderRadiusXLarge,
    },
  };
};

const statusClass = (classes, prefix, status) => {
  const suffix = status.charAt(0).toUpperCase() + status.slice(1);
  return classes[`${prefix}${suffix}`];
};


const Pill = ({ classes, status, text }) => (
  <span className={`${classes.pillBase} ${statusClass(classes, "pill", status)}`}>{text}</span>
);

Pill.propTypes = {
  classes: PropTypes.object.isRequired,
  status: PropTypes.oneOf(["success", "warning", "error", "neutral"]).isRequired,
  text: PropTypes.string.isRequired,
};

const StudentSuccessTracker = ({ classes }) => {
  const { authenticatedEthosFetch } = useData();
  const cardInfo = useCardInfo();
  const { cardId } = cardInfo;

  const configuration = cardInfo?.cardConfiguration ?? cardInfo?.configuration ?? {};
  const configurationReady = !!(cardInfo?.cardConfiguration ?? cardInfo?.configuration);

  const { navigateToPage } = useCardControl();

  const {
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
  } = configuration;

  const parsed_exc_perf = parseFloat(minimum_threshold_for_excellent_performance);
  const parsed_sat_perf = parseFloat(minimum_threshold_for_satisfactory_performance);

  if (
    configurationReady &&
    !isNaN(parsed_exc_perf) &&
    !isNaN(parsed_sat_perf) &&
    parsed_exc_perf <= parsed_sat_perf
  ) {
    throw new Error(
      "Invalid performance configuration: excellent threshold must be greater than satisfactory threshold",
    );
  }

  const absenceThresholds = {
    warning1: parseFloat(warning1) || 5,
    warning2: parseFloat(warning2) || 10,
    redFlag: parseFloat(red_flag) || 15,
  };

  const [selected_term_code, set_selected_term_code] = useState(null);
  const [current_gpa, set_current_gpa] = useState(0);
  const [term_gpa, set_term_gpa] = useState(null);

  const { data: datav2, loading: loadingv2 } = useFetch(
    authenticatedEthosFetch,
    cardId,
    null,
    student_term_courses_pipeline_v2,
    {},
  );

  const pidm = datav2?.termData?.[selected_term_code]?.pidm;
  const crns =
    datav2?.termData?.[selected_term_code]?.courses?.map((c) => c.crn).join(",") ?? "";

  const hasValidAttendanceParams = !!pidm && !!selected_term_code && !!crns;

  const { data: bannerAttendanceData, loading: bannerAttendanceLoading } = useFetch(
    authenticatedEthosFetch,
    cardId,
    null,
    get_student_course_attendance_banner,
    { pidm, termCode: selected_term_code, crns },
    attendance_source === "banner" && hasValidAttendanceParams,
  );

  const { data: moodleAttendanceData, loading: moodleAttendanceLoading } = useFetch(
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

  const bannerAttendanceLookup = useMemo(() => {
    if (!bannerAttendanceData || typeof bannerAttendanceData !== "object") return {};
    return Object.entries(bannerAttendanceData).reduce((acc, [crn, val]) => {
      const pct = parseFloat(val);
      acc[String(crn)] = isNaN(pct) ? NaN : pct;
      return acc;
    }, {});
  }, [bannerAttendanceData]);

  const moodleAttendanceLookup = useMemo(() => {
    if (!moodleAttendanceData?.gradebooks) return {};
    return moodleAttendanceData.gradebooks.reduce((acc, entry) => {
      const pct = parseFloat(entry.attendance?.[0]?.percentage);
      acc[String(entry.crn)] = isNaN(pct) ? NaN : pct;
      return acc;
    }, {});
  }, [moodleAttendanceData]);

  const attendanceLoading =
    attendance_source === "banner" ? bannerAttendanceLoading : moodleAttendanceLoading;
  const isLoading = loadingv2 || attendanceLoading;

  const all_terms = useMemo(() => {
    if (!datav2?.termData) return [];
    const sortedCodes = Object.keys(datav2.termData).sort((a, b) => a.localeCompare(b));

    let limitedCodes = sortedCodes;
    if (display_historical_terms_number && display_historical_terms_number !== "all") {
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
    if (all_terms.length > 0 && !selected_term_code) {
      set_selected_term_code(all_terms[all_terms.length - 1].termCode);
    }
  }, [all_terms, selected_term_code]);

  useEffect(() => {
    if (selected_term_code) {
      localStorage.setItem("sst_card_term_code", selected_term_code);
    }
  }, [selected_term_code]);

  useEffect(() => {
    if (!datav2 || !selected_term_code) return;
    const termInfo = datav2.termData?.[selected_term_code];
    if (!termInfo) return;
    const cGpa = parseFloat(termInfo.cumulative_gpa);
    set_current_gpa(!isNaN(cGpa) ? cGpa : 0);
    const tGpa = termInfo.gpa_available ? parseFloat(termInfo.termGpa) : NaN;
    set_term_gpa(!isNaN(tGpa) ? tGpa : null);
  }, [datav2, selected_term_code]);

  const displayed_attendance = useMemo(() => {
    if (!datav2?.termData || !selected_term_code) return [];
    const courses = datav2.termData[selected_term_code]?.courses ?? [];
    const lookup = attendance_source === "banner" ? bannerAttendanceLookup : moodleAttendanceLookup;
    return courses.map((course) => ({
      ...course,
      attendancePercentage: lookup[String(course.crn)] ?? NaN,
    }));
  }, [datav2, selected_term_code, attendance_source, bannerAttendanceLookup, moodleAttendanceLookup]);

  const current_gpa_status = getGpaStatus(current_gpa, parsed_exc_perf, parsed_sat_perf);
  const term_gpa_status =
    term_gpa !== null
      ? getGpaStatus(term_gpa, parsed_exc_perf, parsed_sat_perf)
      : { status: "error", text: "N/A" };

  const handle_view_details = () => {
    navigateToPage({ route: "/", params: { termCode: selected_term_code } });
  };

  const handle_term_change = useCallback((event) => {
    set_selected_term_code(event.target.value);
  }, []);

  if (!configurationReady) {
    return (
      <Card raised={false} spacingOptions={{ spacing: "none" }} classes={{ root: classes.cardRoot }}>
        <CardContent className={classes.cardContentFullHeight}>
          <div className={classes.card}>
            <Typography variant="body1" className={classes.attEmptyState}>
              Loading...
            </Typography>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card raised={false} spacingOptions={{ spacing: "none" }} classes={{ root: classes.cardRoot }}>
    <CardContent className={classes.cardContentFullHeight}>
    <div className={classes.card}>
      <div className={classes.termAndTitleRow}>
        {!loadingv2 && all_terms.length > 0 && (
          <div className={classes.termRow}>
            <Dropdown
              size="small"
              id="sst-term-dropdown"
              label="Term"
              fullWidth
              value={selected_term_code || ""}
              onChange={handle_term_change}
              MenuProps={{
                PaperProps: {
                  style: { maxHeight: 200 },
                },
              }}
            >
              {all_terms.map((t) => (
                <DropdownItem
                  key={t.termCode}
                  label={toTitleCase(t.termName)}
                  value={t.termCode}
                />
              ))}
            </Dropdown>
          </div>
        )}
      </div>

      <div className={classes.cardBody}>
        <div className={classes.gpaCol}>
          <div className={`${classes.gpaBoxBase} ${statusClass(classes, "gpaBox", current_gpa_status.status)}`}>
            <div className={`${classes.iconBoxBase} ${statusClass(classes, "iconBox", current_gpa_status.status)}`}>
              <Icon name="graduation" />
            </div>
            <Typography variant="body3" className={classes.gpaTitle}>
              Cumulative GPA
            </Typography>
            <Typography
              variant="h2"
              className={`${classes.gpaNumber} ${
                loadingv2 ? "" : statusClass(classes, "gpaNumber", current_gpa_status.status)
              }`}
            >
              {loadingv2 ? "—" : current_gpa.toFixed(2)}
            </Typography>
          </div>

          <div className={`${classes.gpaBoxBase} ${statusClass(classes, "gpaBox", term_gpa_status.status)}`}>
            <div className={`${classes.iconBoxBase} ${statusClass(classes, "iconBox", term_gpa_status.status)}`}>
              <Icon name="bar-chart" />
            </div>
            <Typography variant="body3" className={classes.gpaTitle}>
              Term GPA
            </Typography>
            <Typography
              variant="h2"
              className={`${classes.gpaNumber} ${
                loadingv2
                  ? ""
                  : term_gpa === null
                  ? classes.gpaUnavailable
                  : statusClass(classes, "gpaNumber", term_gpa_status.status)
              }`}
            >
              {loadingv2 ? "—" : term_gpa !== null ? term_gpa.toFixed(2) : "N/A"}
            </Typography>
          </div>
        </div>

        <div className={classes.attCol}>
          <Typography variant="h5" className={classes.attColTitle}>
            Absence % ({toTitleCase(attendance_source)})
          </Typography>

          {isLoading ? (
            <Typography variant="body2" className={classes.attEmptyState}>
              Loading attendance data...
            </Typography>
          ) : displayed_attendance.length === 0 ? (
            <Typography variant="body2" className={classes.attEmptyState}>
              No attendance data available
            </Typography>
          ) : (
            <div className={classes.attList}>
              {displayed_attendance.map((entry, index) => {
                const parsed_pct = parseFloat(entry.attendancePercentage);
                const warning = getAttendanceWarning(parsed_pct, absenceThresholds);
                return (
                  <React.Fragment key={entry.crn ?? index}>
                    <div className={classes.attRow}>
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
                      <Pill classes={classes} status={warning.status} text={warning.text} />
                    </div>
                    {index < displayed_attendance.length - 1 && (
                      <div className={classes.rowDivider} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className={classes.btnWrap}>
        <Button fluid color="primary" className={classes.pillButton} onClick={handle_view_details}>
          View Details
        </Button>
      </div>
    </div>
    </CardContent>
    </Card>
  );
};

StudentSuccessTracker.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(StudentSuccessTracker);
