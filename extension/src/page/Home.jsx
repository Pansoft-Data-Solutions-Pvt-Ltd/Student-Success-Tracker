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
        credit: gradeInfo?.creditHours || "-",
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
                        src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzE3NTFfNzg4NSkiPgo8cGF0aCBkPSJNMTYgMzJDMjQuODM2NiAzMiAzMiAyNC44MzY2IDMyIDE2QzMyIDcuMTYzNDQgMjQuODM2NiAwIDE2IDBDNy4xNjM0NCAwIDAgNy4xNjM0NCAwIDE2QzAgMjQuODM2NiA3LjE2MzQ0IDMyIDE2IDMyWiIgZmlsbD0idXJsKCNwYWludDBfbGluZWFyXzE3NTFfNzg4NSkiLz4KPHBhdGggZD0iTTE3LjU0OTEgOS4zOTk5MkMxNy4zNzkxIDkuNDU5OTIgMTcuMjY5MSA5LjYyOTkyIDE3LjI2OTEgOS44MDk5MkMxNy4yNjkxIDkuOTg5OTIgMTcuMzc5MSAxMC4xNTk5IDE3LjU0OTEgMTAuMjE5OUwxOS4zMzkxIDEwLjg4OTlDMTkuNTY5MSAxMC45Nzk5IDE5Ljc0OTEgMTEuMTU5OSAxOS44MjkxIDExLjM3OTlMMjAuNDk5MSAxMy4xNjk5QzIwLjU1OTEgMTMuMzM5OSAyMC43MjkxIDEzLjQ0OTkgMjAuOTA5MSAxMy40NDk5QzIxLjA4OTEgMTMuNDQ5OSAyMS4yNTkxIDEzLjMzOTkgMjEuMzE5MSAxMy4xNjk5TDIxLjk4OTEgMTEuMzc5OUMyMi4wNzkxIDExLjE0OTkgMjIuMjU5MSAxMC45Njk5IDIyLjQ3OTEgMTAuODg5OUwyNC4yNjkxIDEwLjIxOTlDMjQuNDM5MSAxMC4xNTk5IDI0LjU0OTEgOS45ODk5MiAyNC41NDkxIDkuODA5OTJDMjQuNTQ5MSA5LjYyOTkyIDI0LjQzOTEgOS40NTk5MiAyNC4yNjkxIDkuMzk5OTJMMjIuNDc5MSA4LjcyOTkyQzIyLjI0OTEgOC42Mzk5MiAyMi4wNjkxIDguNDU5OTIgMjEuOTg5MSA4LjIzOTkyTDIxLjMxOTEgNi40NDk5MkMyMS4yNTkxIDYuMjc5OTIgMjEuMDg5MSA2LjE2OTkyIDIwLjkwOTEgNi4xNjk5MkMyMC43MjkxIDYuMTY5OTIgMjAuNTU5MSA2LjI3OTkyIDIwLjQ5OTEgNi40NDk5MkwxOS44MjkxIDguMjM5OTJDMTkuNzM5MSA4LjQ2OTkyIDE5LjU1OTEgOC42NDk5MiAxOS4zMzkxIDguNzI5OTJMMTcuNTQ5MSA5LjM5OTkyWk01LjQ2OTE0IDE1LjI3OTlDNS4yNDkxNCAxNS4zNzk5IDUuMTkxNCA1LjU5OTkgNS4xMTkxNCAxNS44Mjk5QzUuMTE5MTQgMTYuMDU5OSA1LjI1OTE0IDE2LjI3OTkgNS40NjkxNCAxNi4zNzk5TDYuMTE5MTQgMTYuNjc5OUw2LjQyOTE0IDE2LjgxOTlINi40NDkxNEw5LjUxOTE0IDE4LjI0OTlDOS42OTkxNCAxOC4zMjk5IDkuODQ5MTQgMTguNDc5OSA5LjkyOTE0IDE4LjY1OTlMMTEuMzQ5MSAyMS43Mjk5VjIxLjc0OTlMMTEuNDk5MSAyMi4wNTk5TDExLjc5OTEgMjIuNzA5OUMxMS44OTkxIDIyLjkyOTkgMTIuMTE5MSAyMy4wNTk5IDEyLjM0OTEgMjMuMDU5OUMxMi41NzkxIDIzLjA1OTkgMTIuNzk5MSAyMi45MTk5IDEyLjg5OTEgMjIuNzA5OUwxMy4xOTkxIDIyLjA1OTlMMTMuMzM5MSAyMS43NDk5VjIxLjcyOTlMMTQuNzY5MSAxOC42NTk5QzE0Ljg0OTEgMTguNDc5OSAxNC45OTkxIDE4LjMyOTkgMTUuMTc5MSAxOC4yNDk5TDE4LjI0OTEgMTYuODI5OUgxOC4yNjkxTDE4LjU3OTEgMTYuNjc5OUwxOS4yMjkxIDE2LjM3OTlDMTkuNDQ5MSAxNi4yNzk5IDE5LjU3OTEgMTYuMDU5OSAxOS41NzkxIDE1LjgyOTlDMTkuNTc5MSAxNS41OTk5IDE5LjQzOTEgMTUuMzc5OSAxOS4yMjkxIDE1LjI3OTlMMTguNTc5MSAxNC45Nzk5TDE4LjI2OTEgMTQuODM5OUgxOC4yNDkxTDE1LjE3OTEgMTMuNDA5OUMxNC45OTkxIDEzLjMyOTkgMTQuODQ5MSAxMy4xNzk5IDE0Ljc2OTEgMTIuOTk5OUwxMy4zNDkxIDkuOTI5OTJWOS45MDk5MkwxMy4xOTkxIDkuNTk5OTJMMTIuODk5MSA4Ljk0OTkyQzEyLjc5OTEgOC43Mjk5MiAxMi41NzkxIDguNTk5OTIgMTIuMzQ5MSA4LjU5OTkyQzEyLjExOTEgOC41OTk5MiAxMS44OTkxIDguNzM5OTIgMTEuNzk5MSA4Ljk0OTkyTDExLjQ5OTEgOS41OTk5MkwxMS4zNTkxIDkuOTA5OTJWOS45Mjk5Mkw5LjkyOTE0IDEyLjk5OTlDOS44NDkxNCAxMy4xNzk5IDkuNjk5MTQgMTMuMzI5OSA5LjUxOTE0IDEzLjQwOTlMNi40NDkxNCAxNC44Mjk5SDYuNDI5MTRMNI4MTkxNCAxNC45Nzk5TDUuNDY5MTQgMTUuMjc5OVpNOC42MTkxNCAxNS44Mjk5TDEwLjI3OTEgMTUuMDU5OUMxMC44NTkxIDE0Ljc4OTkgMTEuMzE5MSAxNC4zMjk5IDExLjU4OTEgMTMuNzQ5OUMxMS44ODkxIDEzLjA5OTkgMTIuODE5MSAxMy4wOTk5IDEzLjExOTEgMTMuNzQ5OUMxMy4zODkxIDE0LjMyOTkgMTMuODQ5MSAxNC43ODk5IDE0LjQyOTEgMTUuMDU5OUMxNS4wNzkxIDE1LjM1OTkgMTUuMDc5MSAxNi4yODk5IDE0LjQyOTEgMTYuNTg5OUMxMy44NDkxIDE2Ljg1OTkgMTMuMzg5MSAxNy4zMTk5IDEzLjExOTEgMTcuODk5OUMxMi44MTkxIDE4LjU0OTkgMTEuODg5MSAxOC41NDk5IDExLjU4OTEgMTcuODk5OUMxMS4zMTkxIDE3LjMxOTkgMTAuODU5MSAxNi44NTk5IDEwLjI3OTEgMTYuNTg5OUw4LjYxOTE0IDE1LjgyOTlaTTE5LjgyOTEgMjAuMzg5OUMxOS43MzkxIDIwLjYxOTkgMTkuNTU5MSAyMC43OTk5IDE5LjMzOTEgMjAuODc5OUwxNy41NDkxIDIxLjU0OTlDMTcuMzc5MSAyMS42MDk5IDE3LjI2OTEgMjEuNzc5OSAxNy4yNjkxIDIxLjk1OTlDMTcuMjY5MSAyMi4xMzk5IDE3LjM3OTEgMjIuMzA5OSAxNy41NDkxIDIyLjM2OTlMMTkuMzM5MSAyMy4wMzk5QzE5LjU2OTEgMjMuMTI5OSAxOS43NDkxIDIzLjMwOTkgMTkuODI5MSAyMy41Mjk5TDIwLjQ5OTEgMjUuMzE5OUMyMC41NTkxIDI1LjQ4OTkgMjAuNzI5MSAyNS41OTk5IDIwLjkwOTEgMjUuNTk5OUMyMS4wODkxIDI1LjU5OTkgMjEuMjU5MSAyNS40ODk5IDIxLjMxOTEgMjUuMzE5OUwyMS45ODkxIDIzLjUyOTlDMjIuMDc5MSAyMy4yOTk5IDIyLjI1OTEgMjMuMTE5OSAyMi40NzkxIDIzLjAzOTlMMjQuMjY5MSAyMi4zNjk5QzI0LjQzOTEgMjIuMzA5OSAyNC41NDkxIDIyLjEzOTkgMjQuNTQ5MSAyMS45NTk5QzI0LjU0OTEgMjEuNzc5OSAyNC40MzkxIDIxLjYwOTkgMjQuMjY5MSAyMS41NDk5TDIyLjQ3OTEgMjAuODc5OUMyMi4yNDkxIDIwLjc4OTkgMjIuMDY5MSAyMC42MDk5IDIxLjk4OTEgMjAuMzg5OUwyMS4zMTkxIDE4LjU5OTlDMjEuMjU5MSAxOC40Mjk5IDIxLjA4OTEgMTguMzE5OSAyMC45MDkxIDE4LjMxOTlDMjAuNzI5MSAxOC4zMTk5IDIwLjU1OTEgMTguNDI5OSAyMC40OTkxIDE4LjU5OTlMMTkuODI5MSAyMC4zODk5WiIgZmlsbD0id2hpdGUiLz4KPC9nPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJwYWludDBfbGluZWFyXzE3NTFfNzg4NSIgeDE9IjE2IiB5MT0iMCIgeDI9IjE2IiB5Mj0iMjkuNSIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBzdG9wLWNvbG9yPSIjMzYwMTQwIi8+CjxzdG9wIG9mZnNldD0iMC4yIiBzdG9wLWNvbG9yPSIjNDgwQTU0Ii8+CjxzdG9wIG9mZnNldD0iMC40NSIgc3RvcC1jb2xvcj0iIzVBMTM2NiIvPgo8c3RvcCBvZmZzZXQ9IjAuNzIiIHN0b3AtY29sb3I9IiM2NTE5NzIiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjNjkxQjc2Ii8+CjwvbGluZWFyR3JhZGllbnQ+CjxjbGlwUGF0aCBpZD0iY2xpcDBfMTc1MV83ODg1Ij4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSJ3aGl0ZSIvPgo8L2NsaXBQYXRoPgo8L2RlZnM+Cjwvc3ZnPgo="
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
