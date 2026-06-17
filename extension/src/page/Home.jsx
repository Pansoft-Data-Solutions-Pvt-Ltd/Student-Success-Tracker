import React, { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import useFetch from "../hooks/useFetch";
import HomeHeader from "../components/HomeHeader";
import GpaMetrics from "../components/GpaMetrics";
import CourseDataView from "../components/CourseDataView";
import "./Home.css";
import TargetGpaModal from "../components/TargetGpaModal";
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
    "pansoft-x-get-student-term-courses-v2",
    {},
  );

  /* ── Derive shared attendance/grade query params ── */
  const pidm = datav2?.termData?.[currentTermCode]?.pidm;
  const crns =
    datav2?.termData?.[currentTermCode]?.courses?.map((c) => c.crn).join(",") ??
    "";

  /* ── Attendance: Banner ── */
  const { data: bannerAttendanceData, loading: bannerAttendanceLoading } =
    useFetch(
      authenticatedEthosFetch,
      cardId,
      undefined,
      "pansoft-x-get-student-course-attendance-banner",
      { pidm, termCode: currentTermCode, crns },
      attendance_source === "banner",
    );

  /* ── Attendance: Moodle ── */
  const { data: moodleAttendanceData, loading: moodleAttendanceLoading } =
    useFetch(
      authenticatedEthosFetch,
      cardId,
      undefined,
      "pansoft-x-get-student-course-attendance-moodle",
      {
        moodleUrl: "https://vidyastu.com/webservice/rest/server.php",
        moodleWsToken: "4d7dc29800b05b61dfd7f8c138e5885f",
        pidm,
        termCode: currentTermCode,
        crns,
      },
      attendance_source === "moodle",
    );

  /* ── Grades: Banner ── */
  const { data: bannerGradeData, loading: bannerGradeLoading } = useFetch(
    authenticatedEthosFetch,
    cardId,
    undefined,
    "pansoft-x-get-student-course-grades-banner",
    { pidm, termCode: currentTermCode, crns },
    grade_source === "banner",
  );

  /* ── Grades: Moodle ── */
  const { data: moodleGradeData, loading: moodleGradeLoading } = useFetch(
    authenticatedEthosFetch,
    cardId,
    undefined,
    "pansoft-x-get-student-course-grades-moodle",
    {
      moodleUrl: "https://vidyastu.com/webservice/rest/server.php",
      moodleWsToken: "4d7dc29800b05b61dfd7f8c138e5885f",
      pidm,
      termCode: currentTermCode,
      crns,
    },
    grade_source === "moodle",
  );

  /* ── Moodle attendance: crn → percentage (number) ── */
  const moodleAttendanceLookup = useMemo(() => {
    if (!moodleAttendanceData?.gradebooks) return {};
    return moodleAttendanceData.gradebooks.reduce((acc, entry) => {
      const pct = parseFloat(entry.attendance?.[0]?.percentage);
      acc[entry.crn] = isNaN(pct) ? null : pct;
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
        entry.grades?.filter((g) => g.type === "mod" || g.type === "quiz") ??
        [];
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

    const newTermCodesResult = filteredTerms.map((tc) => ({
      termCode: tc,
      term: datav2.termData[tc]?.termName || tc,
      bannerId: datav2.bannerId,
    }));

    setTermCodesResult(newTermCodesResult);
    setTermData(newTermCodesResult.map((t) => t.term));

    const latestTc = filteredTerms[filteredTerms.length - 1];
    setLatestTermCode(latestTc);

    if (!cardTermApplied) {
      setCardTermApplied(true);
      if (termCodeFromCard && datav2.termData[termCodeFromCard]) {
        setCurrentTermCode(termCodeFromCard);
        setCurrentTerm(
          datav2.termData[termCodeFromCard]?.termName || termCodeFromCard,
        );
      } else {
        setCurrentTermCode(latestTc);
        setCurrentTerm(datav2.termData[latestTc]?.termName || latestTc);
      }
    }
  }, [datav2]); // eslint-disable-line react-hooks/exhaustive-deps

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

  /* ── Course data — merged from datav2 + attendance + grades ── */
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
        ? (bannerAttendanceData ?? {})
        : moodleAttendanceLookup;

    const grdLookup =
      grade_source === "banner" ? bannerGradeLookup : moodleGradeLookup;

    const mappedCourses = courses.map((course) => {
      const rawAtt = attLookup[course.crn];
      const parsedAtt =
        rawAtt !== undefined && rawAtt !== null ? parseFloat(rawAtt) : null;
      const gradeInfo = grdLookup[course.crn];
      return {
        courseNumber: course.courseNumber,
        subjectCode: course.subjectCode,
        crn: course.crn,
        courseTitle: course.courseTitle || "-",
        attendancePercentage:
          parsedAtt !== null && !isNaN(parsedAtt) ? parsedAtt : null,
        grade: gradeInfo?.grade || "-",
        // credit: gradeInfo?.creditHours || "-",
        credit: course?.credits || "-",
        gradeMode: gradeInfo?.gradeMode || "-",
        gradeComponents: gradeInfo?.gradeComponents || [],
      };
    });

    setCourseData(mappedCourses);
  }, [
    datav2,
    currentTermCode,
    attendance_source,
    bannerAttendanceData,
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
          loadingTermCodes={loadingv2}
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
                    <span style={{ color: "#D1D5DB" }}>|</span>
                    <span style={{ fontSize: "0.92rem", fontWeight: 500 }}>
                      A, B, C, D = Letter Grades
                    </span>
                    <span style={{ color: "#D1D5DB" }}>|</span>
                    <span style={{ fontSize: "0.92rem", fontWeight: 500 }}>
                      F = Fail
                    </span>
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
                      <img
                src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzE3NTFfNzg4NSkiPgo8cGF0aCBkPSJNMTYgMzJDMjQuODM2NiAzMiAzMiAyNC44MzY2IDMyIDE2QzMyIDcuMTYzNDQgMjQuODM2NiAwIDE2IDBDNy4xNjM0NCAwIDAgNy4xNjM0NCAwIDE2QzAgMjQuODM2NiA3LjE2MzQ0IDMyIDE2IDMyWiIgZmlsbD0idXJsKCNwYWludDBfbGluZWFyXzE3NTFfNzg4NSkiLz4KPHBhdGggZD0iTTE3LjU0OTEgOS4zOTk5MkMxNy4zNzkxIDkuNDU5OTIgMTcuMjY5MSA5LjYyOTkyIDE3LjI2OTEgOS44MDk5MkMxNy4yNjkxIDkuOTg5OTIgMTcuMzc5MSAxMC4xNTk5IDE3LjU0OTEgMTAuMjE5OUwxOS4zMzkxIDEwLjg4OTlDMTkuNTY5MSAxMC45Nzk5IDE5Ljc0OTEgMTEuMTU5OSAxOS44MjkxIDExLjM3OTlMMjAuNDk5MSAxMy4xNjk5QzIwLjU1OTEgMTMuMzM5OSAyMC43MjkxIDEzLjQ0OTkgMjAuOTA5MSAxMy40NDk5QzIxLjA4OTEgMTMuNDQ5OSAyMS4yNTkxIDEzLjMzOTkgMjEuMzE5MSAxMy4xNjk5TDIxLjk4OTEgMTEuMzc5OUMyMi4wNzkxIDExLjE0OTkgMjIuMjU5MSAxMC45Njk5IDIyLjQ3OTEgMTAuODg5OUwyNC4yNjkxIDEwLjIxOTlDMjQuNDM5MSAxMC4xNTk5IDI0LjU0OTEgOS45ODk5MiAyNC41NDkxIDkuODA5OTJDMjQuNTQ5MSA5LjYyOTkyIDI0LjQzOTEgOS40NTk5MiAyNC4yNjkxIDkuMzk5OTJMMjIuNDc5MSA4LjcyOTkyQzIyLjI0OTEgOC42Mzk5MiAyMi4wNjkxIDguNDU5OTIgMjEuOTg5MSA4LjIzOTkyTDIxLjMxOTEgNi40NDk5MkMyMS4yNTkxIDYuMjc5OTIgMjEuMDg5MSA2LjE2OTkyIDIwLjkwOTEgNi4xNjk5MkMyMC43MjkxIDYuMTY5OTIgMjAuNTU5MSA2LjI3OTkyIDIwLjQ5OTEgNi40NDk5MkwxOS44MjkxIDguMjM5OTJDMTkuNzM5MSA4LjQ2OTkyIDE5LjU1OTEgOC42NDk5MiAxOS4zMzkxIDguNzI5OTJMMTcuNTQ5MSA5LjM5OTkyWk01LjQ2OTE0IDE1LjI3OTlDNS4yNDkxNCAxNS4zNzk5IDUuMTE5MTQgMTUuNTk5OSA1LjExOTE0IDE1LjgyOTlDNS4xMTkxNCAxNi4wNTk5IDUuMjU5MTQgMTYuMjc5OSA1LjQ2OTE0IDE2LjM3OTlMNi4xMTkxNCAxNi42Nzk5TDYuNDI5MTQgMTYuODE5OUg2LjQ0OTE0TDkuNTE5MTQgMTguMjQ5OUM5LjY5OTE0IDE4LjMyOTkgOS44NDkxNCAxOC40Nzk5IDkuOTI5MTQgMTguNjU5OUwxMS4zNDkxIDIxLjcyOTlWMjEuNzQ5OUwxMS40OTkxIDIyLjA1OTlMMTEuNzk5MSAyMi43MDk5QzExLjg5OTEgMjIuOTI5OSAxMi4xMTkxIDIzLjA1OTkgMTIuMzQ5MSAyMy4wNTk5QzEyLjU3OTEgMjMuMDU5OSAxMi43OTkxIDIyLjkxOTkgMTIuODk5MSAyMi43MDk5TDEzLjE5OTEgMjIuMDU5OUwxMy4zMzkxIDIxLjc0OTlWMjEuNzI5OUwxNC43NjkxIDE4LjY1OTlDMTQuODQ5MSAxOC40Nzk5IDE0Ljk5OTEgMTguMzI5OSAxNS4xNzkxIDE4LjI0OTlMMTguMjQ5MSAxNi44Mjk5SDE4LjI2OTFMMTguNTc5MSAxNi42Nzk5TDE5LjIyOTEgMTYuMzc5OUMxOS40NDkxIDE2LjI3OTkgMTkuNTc5MSAxNi4wNTk5IDE5LjU3OTEgMTUuODI5OUMxOS41NzkxIDE1LjU5OTkgMTkuNDM5MSAxNS4zNzk5IDE5LjIyOTEgMTUuMjc5OUwxOC41NzkxIDE0Ljk3OTlMMTguMjY5MSAxNC44Mzk5SDE4LjI0OTFMMTUuMTc5MSAxMy40MDk5QzE0Ljk5OTEgMTMuMzI5OSAxNC44NDkxIDEzLjE3OTkgMTQuNzY5MSAxMi45OTk5TDEzLjM0OTEgOS45Mjk5MlY5LjkwOTkyTDEzLjE5OTEgOS41OTk5MkwxMi44OTkxIDguOTQ5OTJDMTIuNzk5MSA4LjcyOTkyIDEyLjU3OTEgOC41OTk5MiAxMi4zNDkxIDguNTk5OTJDMTIuMTE5MSA4LjU5OTkyIDExLjg5OTEgOC43Mzk5MiAxMS43OTkxIDguOTQ5OTJMMTEuNDk5MSA5LjU5OTkyTDExLjM1OTEgOS45MDk5MlY5LjkyOTkyTDkuOTI5MTQgMTIuOTk5OUM5Ljg0OTE0IDEzLjE3OTkgOS42OTkxNCAxMy4zMjk5IDkuNTE5MTQgMTMuNDA5OUw2LjQ0OTE0IDE0LjgyOTlINi40MjkxNEw2LjExOTE0IDE0Ljk3OTlMNS40NjkxNCAxNS4yNzk5Wk04LjYxOTE0IDE1LjgyOTlMMTAuMjc5MSAxNS4wNTk5QzEwLjg1OTEgMTQuNzg5OSAxMS4zMTkxIDE0LjMyOTkgMTEuNTg5MSAxMy43NDk5QzExLjg4OTEgMTMuMDk5OSAxMi44MTkxIDEzLjA5OTkgMTMuMTE5MSAxMy43NDk5QzEzLjM4OTEgMTQuMzI5OSAxMy44NDkxIDE0Ljc4OTkgMTQuNDI5MSAxNS4wNTk5QzE1LjA3OTEgMTUuMzU5OSAxNS4wNzkxIDE2LjI4OTkgMTQuNDI5MSAxNi41ODk5QzEzLjg0OTEgMTYuODU5OSAxMy4zODkxIDE3LjMxOTkgMTMuMTE5MSAxNy44OTk5QzEyLjgxOTEgMTguNTQ5OSAxMS44ODkxIDE4LjU0OTkgMTEuNTg5MSAxNy44OTk5QzExLjMxOTEgMTcuMzE5OSAxMC44NTkxIDE2Ljg1OTkgMTAuMjc5MSAxNi41ODk5TDguNjE5MTQgMTUuODI5OVpNMTkuODI5MSAyMC4zODk5QzE5LjczOTEgMjAuNjE5OSAxOS41NTkxIDIwLjc5OTkgMTkuMzM5MSAyMC44Nzk5TDE3LjU0OTEgMjEuNTQ5OUMxNy4zNzkxIDIxLjYwOTkgMTcuMjY5MSAyMS43Nzk5IDE3LjI2OTEgMjEuOTU5OUMxNy4yNjkxIDIyLjEzOTkgMTcuMzc5MSAyMi4zMDk5IDE3LjU0OTEgMjIuMzY5OUwxOS4zMzkxIDIzLjAzOTlDMTkuNTY5MSAyMy4xMjk5IDE5Ljc0OTEgMjMuMzA5OSAxOS44MjkxIDIzLjUyOTlMMjAuNDk5MSAyNS4zMTk5QzIwLjU1OTEgMjUuNDg5OSAyMC43MjkxIDI1LjU5OTkgMjAuOTA5MSAyNS41OTk5QzIxLjA4OTEgMjUuNTk5OSAyMS4yNTkxIDI1LjQ4OTkgMjEuMzE5MSAyNS4zMTk5TDIxLjk4OTEgMjMuNTI5OUMyMi4wNzkxIDIzLjI5OTkgMjIuMjU5MSAyMy4xMTk5IDIyLjQ3OTEgMjMuMDM5OUwyNC4yNjkxIDIyLjM2OTlDMjQuNDM5MSAyMi4zMDk5IDI0LjU0OTEgMjIuMTM5OSAyNC41NDkxIDIxLjk1OTlDMjQuNTQ5MSAyMS43Nzk5IDI0LjQzOTEgMjEuNjA5OSAyNC4yNjkxIDIxLjU0OTlMMjIuNDc5MSAyMC44Nzk5QzIyLjI0OTEgMjAuNzg5OSAyMi4wNjkxIDIwLjYwOTkgMjEuOTg5MSAyMC4zODk5TDIxLjMxOTEgMTguNTk5OUMyMS4yNTkxIDE4LjQyOTkgMjEuMDg5MSAxOC4zMTk5IDIwLjkwOTEgMTguMzE5OUMyMC43MjkxIDE4LjMxOTkgMjAuNTU5MSAxOC40Mjk5IDIwLjQ5OTEgMTguNTk5OUwxOS44MjkxIDIwLjM4OTlaIiBmaWxsPSJ3aGl0ZSIvPgo8L2c+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MF9saW5lYXJfMTc1MV83ODg1IiB4MT0iMTYiIHkxPSIwIiB4Mj0iMTYiIHkyPSIyOS41IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiMzNjAxNDAiLz4KPHN0b3Agb2Zmc2V0PSIwLjIiIHN0b3AtY29sb3I9IiM0ODBBNTQiLz4KPHN0b3Agb2Zmc2V0PSIwLjQ1IiBzdG9wLWNvbG9yPSIjNUExMzY2Ii8+CjxzdG9wIG9mZnNldD0iMC43MiIgc3RvcC1jb2xvcj0iIzY1MTk3MiIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiM2OTFCNzYiLz4KPC9saW5lYXJHcmFkaWVudD4KPGNsaXBQYXRoIGlkPSJjbGlwMF8xNzUxXzc4ODUiPgo8cmVjdCB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIGZpbGw9IndoaXRlIi8+CjwvY2xpcFBhdGg+CjwvZGVmcz4KPC9zdmc+Cg=="
                        alt="GPA recommendation icon"
                        style={{
                          width: "20px",
                          height: "20px",
                          marginRight: "2px",
                        }}
                      />
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
