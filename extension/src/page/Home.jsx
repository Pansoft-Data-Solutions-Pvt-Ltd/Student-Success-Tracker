import React, { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import useFetch from "../hooks/useFetch";
import HomeHeader from "../components/HomeHeader";
import GpaMetrics from "../components/GpaMetrics";
import CourseDataView from "../components/CourseDataView";
import "./Home.css";
import TargetGpaModal, { SparkleIcon } from "../components/TargetGpaModal";
import TermGpaBar from "../components/TermGpaBar";

import { useData, useCardInfo } from "@ellucian/experience-extension-utils";
import { Typography, Card, Button } from "@ellucian/react-design-system/core";

const parseStanding = (value) => {
  if (!value || value.trim().toUpperCase() === "N/A") return null;
  return value;
};

const MySuccessTrackerTable = () => {
  const [currentTerm, setCurrentTerm] = useState(null);
  const [termData, setTermData] = useState([]);
  const [currentTermCode, setCurrentTermCode] = useState(null);
  const [latestTermCode, setLatestTermCode] = useState(null);
  const [currentGpa, setCurrentGpa] = useState(0);
  const [termGpa, setTermGpa] = useState(0);
  const [gpaDelta, setGpaDelta] = useState(0);
  const [courseData, setCourseData] = useState([]);
  const [termGpaData, setTermGpaData] = useState([]);
  const [isFirstTermFlag, setIsFirstTermFlag] = useState(false);
  const [termCodesResult, setTermCodesResult] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [academicStanding, setAcademicStanding] = useState(null);
  const [previousAcademicStanding, setPreviousAcademicStanding] =
    useState(null);
  const [programGpa, setProgramGpa] = useState(null);
  const [cardTermApplied, setCardTermApplied] = useState(false);

  const { authenticatedEthosFetch } = useData();
  const { cardId, cardConfiguration } = useCardInfo();

  const [termCodeFromCard] = useState(() => {
    return localStorage.getItem("sst_card_term_code") || null;
  });

  const {
    excellent_performance_color_code,
    satisfactory_performance_color_code,
    poor_performance_color_code,
    minimum_threshold_for_excellent_performance,
    minimum_threshold_for_satisfactory_performance,
    minimum_threshold_for_excellent_attendance,
    minimum_threshold_for_satisfactory_attendance,
    student_gpa_recommendation_pipeline,
    max_gpa,
    attendance_source,
    grade_source,
    student_term_courses_pipeline_v2,
    get_student_course_attendance_banner,
    get_student_course_attendance_moodle,
    get_student_course_grades_moodle,
    get_student_course_grades_banner,
    show_unrolled_grades,
    display_historical_terms_number,
  } = cardConfiguration;

  const [loadingRecommendation, setLoadingRecommendation] = useState(false);
  const [recommendationResult, setRecommendationResult] = useState(null);
  const [recommendationError, setRecommendationError] = useState(null);

  const fetchGpaRecommendation = async (gpa) => {
    if (!gpa || !student_gpa_recommendation_pipeline) return;
    setLoadingRecommendation(true);
    setRecommendationResult(null);
    setRecommendationError(null);
    try {
      const queryString = new URLSearchParams({
        cardId,
        targetGpa: gpa,
      }).toString();
      const resourcePath = `${student_gpa_recommendation_pipeline}?${queryString}`;
      const options = {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      };
      const response = await authenticatedEthosFetch(resourcePath, options);
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      const jsonData = await response.json();
      setRecommendationResult(jsonData);
    } catch (err) {
      setRecommendationError(err.message || "Something went wrong.");
    } finally {
      setLoadingRecommendation(false);
    }
  };

  const handleOpenModal = () => {
    setRecommendationResult(null);
    setRecommendationError(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => setModalOpen(false);

  const parsed_minimum_threshold_for_excellent_performance = parseFloat(
    minimum_threshold_for_excellent_performance,
  );
  const parsed_minimum_threshold_for_satisfactory_performance = parseFloat(
    minimum_threshold_for_satisfactory_performance,
  );
  const parsed_minimum_threshold_for_excellent_attendance = parseFloat(
    minimum_threshold_for_excellent_attendance,
  );
  const parsed_minimum_threshold_for_satisfactory_attendance = parseFloat(
    minimum_threshold_for_satisfactory_attendance,
  );

  if (
    parsed_minimum_threshold_for_excellent_performance <=
    parsed_minimum_threshold_for_satisfactory_performance
  ) {
    throw new Error(
      "Invalid performance configuration: excellent threshold must be greater than satisfactory threshold",
    );
  }
  if (
    parsed_minimum_threshold_for_excellent_attendance <=
    parsed_minimum_threshold_for_satisfactory_attendance
  ) {
    throw new Error(
      "Invalid attendance configuration: excellent threshold must be greater than satisfactory threshold",
    );
  }

  const COLOR_CONFIG = {
    ON_TRACK: excellent_performance_color_code,
    NEEDS_ATTENTION: satisfactory_performance_color_code,
    CRITICAL: poor_performance_color_code,
  };

  const TABLE_CONFIG = {
    attendanceGood: minimum_threshold_for_excellent_attendance,
    attendanceWarning: minimum_threshold_for_satisfactory_attendance,
    lowGrades: ["F"],
  };

  /* ── Primary data (v2) ── */
  const {
    loading: loadingv2,
    data: datav2,
    error: errorv2,
  } = useFetch(
    authenticatedEthosFetch,
    cardId,
    undefined,
    student_term_courses_pipeline_v2,
    {},
  );

  /* ── Derive shared attendance/grade query params ── */
  const pidm = datav2?.termData?.[currentTermCode]?.pidm;
  const crns =
    datav2?.termData?.[currentTermCode]?.courses?.map((c) => c.crn).join(",") ??
    "";

  /* Only fire dependent fetches once we actually have a pidm + termCode + crns,
     to avoid premature calls like pidm=undefined&termCode=null&crns= */
  const hasValidAttendanceParams = !!pidm && !!currentTermCode && !!crns;

  /* ── Attendance/Absence: Banner ──
     get_student_course_attendance_banner now points at
     "pansoft-x-get-student-course-absence-banner", which returns a FLAT object:
     { "20005": "23.81", "20018": "22.22", ... }  (crn → absence % as string)
  */
  const { data: bannerAttendanceData, loading: bannerAttendanceLoading } =
    useFetch(
      authenticatedEthosFetch,
      cardId,
      undefined,
      get_student_course_attendance_banner,
      { pidm, termCode: currentTermCode, crns },
      attendance_source === "banner" && hasValidAttendanceParams,
    );

  /* ── Attendance: Moodle ── */
  const { data: moodleAttendanceData, loading: moodleAttendanceLoading } =
    useFetch(
      authenticatedEthosFetch,
      cardId,
      undefined,
      get_student_course_attendance_moodle,
      {
        moodleUrl: "https://vidyastu.com/webservice/rest/server.php",
        moodleWsToken: "4d7dc29800b05b61dfd7f8c138e5885f",
        pidm,
        termCode: currentTermCode,
        crns,
      },
      attendance_source === "moodle" && hasValidAttendanceParams,
    );

  /* ── Grades: Banner ── */
  const { data: bannerGradeData, loading: bannerGradeLoading } = useFetch(
    authenticatedEthosFetch,
    cardId,
    undefined,
    get_student_course_grades_banner,
    { pidm, termCode: currentTermCode, crns },
    grade_source === "banner" && hasValidAttendanceParams,
  );

  /* ── Grades: Moodle ── */
  const { data: moodleGradeData, loading: moodleGradeLoading } = useFetch(
    authenticatedEthosFetch,
    cardId,
    undefined,
    get_student_course_grades_moodle,
    {
      moodleUrl: "https://vidyastu.com/webservice/rest/server.php",
      moodleWsToken: "4d7dc29800b05b61dfd7f8c138e5885f",
      pidm,
      termCode: currentTermCode,
      crns,
    },
    grade_source === "moodle" && hasValidAttendanceParams,
  );

  /* ── Banner: crn → absence percentage (number) ──
     bannerAttendanceData is already a FLAT object: { crn: "23.81", ... }
     No nested data[0].payload — just parse each value directly.
  */
  const bannerAttendanceLookup = useMemo(() => {
    if (!bannerAttendanceData || typeof bannerAttendanceData !== "object")
      return {};
    return Object.entries(bannerAttendanceData).reduce((acc, [crn, val]) => {
      const pct = parseFloat(val);
      acc[String(crn)] = isNaN(pct) ? null : pct;
      return acc;
    }, {});
  }, [bannerAttendanceData]);

  /* ── Moodle attendance: crn → percentage (number) ── */
  const moodleAttendanceLookup = useMemo(() => {
    if (!moodleAttendanceData?.gradebooks) return {};
    return moodleAttendanceData.gradebooks.reduce((acc, entry) => {
      const pct = parseFloat(entry.attendance?.[0]?.percentage);
      acc[String(entry.crn)] = isNaN(pct) ? null : pct;
      return acc;
    }, {});
  }, [moodleAttendanceData]);

  /* ── Banner grades: crn → { grade, gradeMode, creditHours } ── */
  const bannerGradeLookup = useMemo(() => {
    if (!bannerGradeData) return {};
    return Object.entries(bannerGradeData).reduce((acc, [crn, data]) => {
      acc[crn] = {
        grade: data?.grade?.grade || "-",
        gradeMode: data?.grade?.gradeMode || "-",
        creditHours: data?.grade?.creditHours || "-",
        gradeComponents: data?.gradeableComponents ?? [],
      };
      return acc;
    }, {});
  }, [bannerGradeData]);

  /* ── Moodle grades: crn → { grade (percentage string), gradeMode, creditHours, gradeComponents } ── */
  const moodleGradeLookup = useMemo(() => {
    if (!moodleGradeData?.gradebooks) return {};
    return moodleGradeData.gradebooks.reduce((acc, entry) => {
      // Overall grade: type === "course" entry
      const courseEntry = entry.grades?.find((g) => g.type === "course");
      const pct = courseEntry ? parseFloat(courseEntry.percentage) : null;
      // Breakdown: mod + quiz entries only
      const gradeComponents =
        entry.grades?.filter(
          (g) =>
            (g.type === "mod" || g.type === "quiz") &&
            g.name?.toLowerCase() !== "attendance",
        ) ?? [];
      acc[entry.crn] = {
        grade: pct !== null && !isNaN(pct) ? `${pct.toFixed(2)}%` : "-",
        gradeMode: "-",
        creditHours: "-",
        gradeComponents,
      };
      return acc;
    }, {});
  }, [moodleGradeData]);

  /* ── Loading states ── */
  const attendanceLoading =
    attendance_source === "banner"
      ? bannerAttendanceLoading
      : moodleAttendanceLoading;
  const gradeLoading =
    grade_source === "banner" ? bannerGradeLoading : moodleGradeLoading;
  const isLoading = loadingv2; // gates overall structure + GPA metrics
  const isCourseLoading = loadingv2 || attendanceLoading || gradeLoading; // gates course table only

  /* ── programGpa ── */
  useEffect(() => {
    if (!datav2) return;
    const parsed = parseFloat(datav2.programGpa);
    setProgramGpa(parsed > 0 ? parsed : null);
  }, [datav2]);

  /* ── Term codes + initial term selection ── */
  useEffect(() => {
    if (!datav2?.termData) return;

    const allTermCodes = Object.keys(datav2.termData);
    const filteredTerms = allTermCodes.sort((a, b) => a.localeCompare(b));

    const latestTc = filteredTerms[filteredTerms.length - 1];
    setLatestTermCode(latestTc);

    let limitedTermCodes = filteredTerms;
    if (
      display_historical_terms_number &&
      display_historical_terms_number !== "all"
    ) {
      const historicalCount = parseInt(display_historical_terms_number, 10);
      if (!isNaN(historicalCount)) {
        limitedTermCodes = filteredTerms.slice(-(historicalCount + 1));
      }
    }

    const newTermCodesResult = limitedTermCodes.map((tc) => ({
      termCode: tc,
      term: datav2.termData[tc]?.termName || tc,
      bannerId: datav2.bannerId,
    }));

    setTermCodesResult(newTermCodesResult);
    setTermData(newTermCodesResult.map((t) => t.term));

    if (!cardTermApplied) {
      setCardTermApplied(true);
      if (
        termCodeFromCard &&
        datav2.termData[termCodeFromCard] &&
        limitedTermCodes.includes(termCodeFromCard)
      ) {
        setCurrentTermCode(termCodeFromCard);
        setCurrentTerm(
          datav2.termData[termCodeFromCard]?.termName || termCodeFromCard,
        );
      } else {
        setCurrentTermCode(latestTc);
        setCurrentTerm(datav2.termData[latestTc]?.termName || latestTc);
      }
    }
  }, [datav2, display_historical_terms_number]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── GPA, academic standing, delta — derived from datav2 only ── */
  useEffect(() => {
    if (!datav2 || !currentTermCode) return;
    const termInfo = datav2.termData?.[currentTermCode];
    if (!termInfo) return;

    setCurrentGpa(termInfo.cumulative_gpa || 0);
    setTermGpa(termInfo.gpa_available ? termInfo.termGpa || 0 : "N/A");
    setAcademicStanding(parseStanding(termInfo.academicStanding));

    if (!termCodesResult) return;

    const currentIndex = termCodesResult.findIndex(
      (t) => t.termCode === currentTermCode,
    );

    if (currentIndex === 0) {
      setIsFirstTermFlag(true);
      setGpaDelta(0);
      setPreviousAcademicStanding(null);
    } else if (currentIndex > 0) {
      setIsFirstTermFlag(false);
      const prevTermCode = termCodesResult[currentIndex - 1].termCode;
      const prevTermInfo = datav2.termData[prevTermCode];
      setPreviousAcademicStanding(
        parseStanding(prevTermInfo?.academicStanding),
      );

      let prevCumGpa = prevTermInfo?.cumulative_gpa;
      if (
        prevCumGpa === "N/A" ||
        prevCumGpa === null ||
        prevCumGpa === undefined
      ) {
        prevCumGpa = 0;
      } else {
        prevCumGpa = Number(prevCumGpa);
      }
      setGpaDelta((termInfo.cumulative_gpa || 0) - prevCumGpa);
    }
  }, [datav2, currentTermCode, termCodesResult]);

  /* ── Course data — merged from datav2 + absence/attendance + grades ── */
  useEffect(() => {
    if (!datav2?.termData || !currentTermCode) {
      setCourseData([]);
      return;
    }

    const courses = datav2.termData[currentTermCode]?.courses ?? [];

    if (courses.length === 0) {
      setCourseData([]);
      return;
    }

    const attLookup =
      attendance_source === "banner"
        ? bannerAttendanceLookup
        : moodleAttendanceLookup;

    const grdLookup =
      grade_source === "banner" ? bannerGradeLookup : moodleGradeLookup;

    const isLatestTermSelected = currentTermCode === latestTermCode;
    const hideGrades = isLatestTermSelected && show_unrolled_grades === "no";

    const mappedCourses = courses.map((course) => {
      const rawAtt = attLookup[String(course.crn)];
      const parsedAtt =
        rawAtt !== undefined && rawAtt !== null ? parseFloat(rawAtt) : null;
      const gradeInfo = grdLookup[course.crn];
      return {
        courseNumber: course.courseNumber,
        subjectCode: course.subjectCode,
        crn: course.crn,
        courseTitle: course.courseTitle || "-",
        // NOTE: field is named attendancePercentage for backward compatibility
        // with CourseDataView, but it always holds the ABSENCE percentage.
        attendancePercentage:
          parsedAtt !== null && !isNaN(parsedAtt) ? parsedAtt : null,
        grade: hideGrades ? "-" : gradeInfo?.grade || "-",
        // credit: gradeInfo?.creditHours || "-",
        credit: course?.credits || "-",
        gradeMode: gradeInfo?.gradeMode || "-",
        gradeComponents: hideGrades ? [] : gradeInfo?.gradeComponents || [],
      };
    });

    setCourseData(mappedCourses);
  }, [
    datav2,
    currentTermCode,
    latestTermCode,
    show_unrolled_grades,
    attendance_source,
    bannerAttendanceLookup,
    moodleAttendanceLookup,
    grade_source,
    bannerGradeLookup,
    moodleGradeLookup,
  ]);

  /* ── Term GPA chart data ── */
  useEffect(() => {
    if (!datav2 || !termCodesResult) {
      setTermGpaData([]);
      return;
    }
    const allTermGpas = termCodesResult.map((termObj) => {
      const tInfo = datav2.termData[termObj.termCode];
      return {
        term: termObj.term,
        termCode: termObj.termCode,
        termGpa: tInfo?.termGpa || 0,
        cumulativeGpa: tInfo?.cumulative_gpa || 0,
      };
    });
    setTermGpaData(allTermGpas);
  }, [datav2, termCodesResult]);

  const getStatusColor = (value) => {
    const v = parseFloat(value);
    if (isNaN(v)) return poor_performance_color_code;
    if (v >= parsed_minimum_threshold_for_excellent_attendance)
      return excellent_performance_color_code;
    if (v >= parsed_minimum_threshold_for_satisfactory_attendance)
      return satisfactory_performance_color_code;
    return poor_performance_color_code;
  };

  const getGpaCircleColor = (gpa) => {
    const v = parseFloat(gpa);
    if (isNaN(v)) return poor_performance_color_code;
    if (v >= parsed_minimum_threshold_for_excellent_performance)
      return excellent_performance_color_code;
    if (v >= parsed_minimum_threshold_for_satisfactory_performance)
      return satisfactory_performance_color_code;
    return poor_performance_color_code;
  };

  const getAcademicStandingColor = (standing) => {
    if (!standing) return COLOR_CONFIG.ON_TRACK;
    const lower = standing.toLowerCase();
    if (
      lower.includes("good") ||
      lower.includes("honor") ||
      lower.includes("excellent") ||
      lower.includes("satisfactory")
    )
      return COLOR_CONFIG.ON_TRACK;
    if (lower.includes("warning") || lower.includes("probation"))
      return COLOR_CONFIG.NEEDS_ATTENTION;
    if (lower.includes("suspend") || lower.includes("dismiss"))
      return COLOR_CONFIG.CRITICAL;
    return COLOR_CONFIG.ON_TRACK;
  };

  const handleTermChange = (term) => {
    setCurrentTerm(term.term);
    setCurrentTermCode(term.termCode);
  };

  const isFirstTerm = useMemo(() => {
    if (!termCodesResult || termCodesResult.length === 0) return false;
    const sorted = termCodesResult
      .slice()
      .sort((a, b) => a.termCode.localeCompare(b.termCode));
    return sorted[0]?.termCode === currentTermCode;
  }, [termCodesResult, currentTermCode]);

  const isZeroDelta = parseFloat(gpaDelta) === 0;
  const isPositive = gpaDelta >= 0;
  const gpaCircleColor = getGpaCircleColor(currentGpa);
  const termGpaCircleColor = getGpaCircleColor(termGpa);
  const deltaColor = isPositive ? COLOR_CONFIG.ON_TRACK : COLOR_CONFIG.CRITICAL;
  const programGpaCircleColor = getGpaCircleColor(programGpa);
  const resolvedStanding = academicStanding || previousAcademicStanding;
  const academicStandingColor = getAcademicStandingColor(resolvedStanding);
  const isLatestTerm = currentTermCode === latestTermCode;

  const hasNoTerms =
    !loadingv2 &&
    !errorv2 &&
    datav2 &&
    (!datav2.termData || Object.keys(datav2.termData).length === 0);

  return (
    <div className="root">
      <Card className="card">
        <HomeHeader
          currentTerm={currentTerm}
          termCodesResult={termCodesResult}
          loadingTermCodes={isCourseLoading}
          handleTermChange={handleTermChange}
        />

        {isLoading && (
          <Typography
            style={{ padding: "20px", textAlign: "center", color: "#02050c" }}
          >
            Loading student details...
          </Typography>
        )}

        {!isLoading && errorv2 && (
          <Typography
            style={{
              padding: "20px",
              textAlign: "center",
              color: "#B91C1C",
              fontStyle: "italic",
            }}
          >
            Failed to load student data. Please try again later.
          </Typography>
        )}

        {!isLoading && hasNoTerms && (
          <Typography
            style={{
              padding: "20px",
              textAlign: "center",
              color: "#6B7280",
              fontStyle: "italic",
            }}
          >
            No term registrations found for this student.
          </Typography>
        )}

        {!isLoading && !errorv2 && !hasNoTerms && termCodesResult && (
          <>
            <div className="gpa-cards-wrapper" style={{ marginTop: "14px" }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  width: "100%",
                }}
              >
                {/* ROW 1: metric cards + TermGpaBar */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: "20px",
                    alignItems: "stretch",
                    width: "100%",
                  }}
                >
                  <GpaMetrics
                    loadingTermInformation={loadingv2}
                    isFirstTerm={isFirstTerm}
                    isFirstTermFlag={isFirstTermFlag}
                    isZeroDelta={isZeroDelta}
                    isPositive={isPositive}
                    deltaColor={deltaColor}
                    gpaDelta={gpaDelta}
                    gpaCircleColor={gpaCircleColor}
                    currentGpa={currentGpa}
                    termGpaCircleColor={termGpaCircleColor}
                    termGpa={termGpa}
                    isLatestTerm={isLatestTerm}
                    diffAttendance={null}
                    isZeroAttendanceDiff={true}
                    isPositiveAttendanceDiff={false}
                    attendanceDiffColor={COLOR_CONFIG.ON_TRACK}
                    attendanceCircleColor={poor_performance_color_code}
                    avgAttendance={null}
                    colors={COLOR_CONFIG}
                    handleOpenModal={handleOpenModal}
                    academicStanding={academicStanding}
                    previousAcademicStanding={previousAcademicStanding}
                    academicStandingColor={academicStandingColor}
                    programGpa={programGpa}
                    programGpaCircleColor={programGpaCircleColor}
                    fetchGpaRecommendation={fetchGpaRecommendation}
                    loadingRecommendation={loadingRecommendation}
                    recommendationResult={recommendationResult}
                    recommendationError={recommendationError}
                  />
                  <TermGpaBar termData={termData} termGpaData={termGpaData} />
                </div>

                {/* ROW 2: legends + button */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
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
                      <div
                        className="legend-dot"
                        style={{ backgroundColor: COLOR_CONFIG.ON_TRACK }}
                      />
                      <span style={{ fontSize: "0.92rem", fontWeight: 500 }}>
                        On Track
                      </span>
                    </div>
                    <span style={{ color: "#D1D5DB" }}>|</span>
                    <div className="legend-item">
                      <div
                        className="legend-dot"
                        style={{
                          backgroundColor: COLOR_CONFIG.NEEDS_ATTENTION,
                        }}
                      />
                      <span style={{ fontSize: "0.92rem", fontWeight: 500 }}>
                        Needs Attention
                      </span>
                    </div>
                    <span style={{ color: "#D1D5DB" }}>|</span>
                    <div className="legend-item">
                      <div
                        className="legend-dot"
                        style={{ backgroundColor: COLOR_CONFIG.CRITICAL }}
                      />
                      <span style={{ fontSize: "0.92rem", fontWeight: 500 }}>
                        Critical
                      </span>
                    </div>
                    {grade_source === "banner" && (
                      <span>
                        <span style={{ color: "#D1D5DB" }}>|</span>
                        <span style={{ fontSize: "0.92rem", fontWeight: 500 }}>
                          A, B, C, D = Letter Grades
                        </span>
                        <span style={{ color: "#D1D5DB" }}>|</span>
                        <span style={{ fontSize: "0.92rem", fontWeight: 500 }}>
                          F = Fail
                        </span>
                      </span>
                    )}
                    <span style={{ color: "#D1D5DB" }}>|</span>
                    <span style={{ fontSize: "0.92rem", fontWeight: 500 }}>
                      N/A = Not Applicable
                    </span>
                  </div>

                  {isLatestTerm && (
                    <Button
                      onClick={handleOpenModal}
                      style={{
                        textTransform: "capitalize",
                        fontSize: "12px",
                        minHeight: "32px",
                        padding: "4px 16px",
                        marginLeft: "auto",
                        flexShrink: 0,
                      }}
                      color="primary"
                    >
                      <SparkleIcon size={20} />
                      Get GPA Recommendations
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <TargetGpaModal
              open={modalOpen}
              onClose={handleCloseModal}
              onSubmit={fetchGpaRecommendation}
              loading={loadingRecommendation}
              result={recommendationResult}
              maxGpa={max_gpa}
              currentGpa={currentGpa}
              programGpa={programGpa}
              maxAchievableGpa={datav2?.maxAchievableGpa}
            />

            <CourseDataView
              loadingCourseData={isCourseLoading}
              courseData={courseData}
              getStatusColor={getStatusColor}
              tableConfig={TABLE_CONFIG}
              colors={COLOR_CONFIG}
              isCurrentTerm={currentTermCode === latestTermCode}
            />
          </>
        )}
      </Card>
    </div>
  );
};

MySuccessTrackerTable.propTypes = {
  classes: PropTypes.object,
};

export default MySuccessTrackerTable;