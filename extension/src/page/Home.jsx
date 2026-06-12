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
  const [avgAttendance, setAvgAttendance] = useState(null);
  const [diffAttendance, setDiffAttendance] = useState(null);
  const [isFirstTermFlag, setIsFirstTermFlag] = useState(false);
  const [termCodesResult, setTermCodesResult] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [academicStanding, setAcademicStanding] = useState(null);
  const [previousAcademicStanding, setPreviousAcademicStanding] = useState(null);
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
    student_term_courses_pipeline,
    student_gpa_recommendation_pipeline,
    max_gpa,
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

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const parsed_minimum_threshold_for_excellent_performance = parseFloat(minimum_threshold_for_excellent_performance);
  const parsed_minimum_threshold_for_satisfactory_performance = parseFloat(minimum_threshold_for_satisfactory_performance);
  const parsed_minimum_threshold_for_excellent_attendance = parseFloat(minimum_threshold_for_excellent_attendance);
  const parsed_minimum_threshold_for_satisfactory_attendance = parseFloat(minimum_threshold_for_satisfactory_attendance);

  if (parsed_minimum_threshold_for_excellent_performance <= parsed_minimum_threshold_for_satisfactory_performance) {
    throw new Error("Invalid performance configuration: excellent threshold must be greater than satisfactory threshold");
  }

  if (parsed_minimum_threshold_for_excellent_attendance <= parsed_minimum_threshold_for_satisfactory_attendance) {
    throw new Error("Invalid attendance configuration: excellent threshold must be greater than satisfactory threshold");
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

  const {
    loading: dataLoading,
    data: pipelineData,
    error: dataError,
  } = useFetch(authenticatedEthosFetch, cardId, undefined, student_term_courses_pipeline, {});

  useEffect(() => {
    if (pipelineData) {
      const rawProgramGpa = pipelineData.programGpa;
      const parsed = parseFloat(rawProgramGpa);
      setProgramGpa(isNaN(parsed) ? null : parsed);
    }
  }, [pipelineData]);

  useEffect(() => {
    if (!pipelineData?.termData) return;

    const allTermCodes = Object.keys(pipelineData.termData);
    const filteredTerms = allTermCodes.sort((a, b) => a.localeCompare(b));

    const newTermCodesResult = filteredTerms.map((tc) => ({
      termCode: tc,
      term: pipelineData.termData[tc]?.termName || tc,
      bannerId: pipelineData.bannerId,
    }));

    setTermCodesResult(newTermCodesResult);
    setTermData(newTermCodesResult.map((t) => t.term));

    const latestTc = filteredTerms[filteredTerms.length - 1];
    setLatestTermCode(latestTc);

    if (!cardTermApplied) {
      setCardTermApplied(true);
      if (termCodeFromCard && pipelineData.termData[termCodeFromCard]) {
        const termName = pipelineData.termData[termCodeFromCard]?.termName || termCodeFromCard;
        setCurrentTermCode(termCodeFromCard);
        setCurrentTerm(termName);
      } else {
        const latestTermName = pipelineData.termData[latestTc]?.termName || latestTc;
        setCurrentTermCode(latestTc);
        setCurrentTerm(latestTermName);
      }
    }
  }, [pipelineData]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!pipelineData || !currentTermCode) return;
    const termInfo = pipelineData.termData[currentTermCode];
    if (!termInfo) return;

    setCurrentGpa(termInfo.cumulative_gpa || 0);
    setTermGpa(termInfo.gpa_available ? termInfo.term_gpa || 0 : "N/A");
    setAvgAttendance(termInfo.attendancePercentage);
    setAcademicStanding(parseStanding(termInfo.academicStanding));

    if (termCodesResult) {
      const currentIndex = termCodesResult.findIndex((t) => t.termCode === currentTermCode);
      if (currentIndex > 0) {
        const prevTermCode = termCodesResult[currentIndex - 1].termCode;
        const prevTermInfo = pipelineData.termData[prevTermCode];
        setPreviousAcademicStanding(parseStanding(prevTermInfo?.academicStanding));
      } else {
        setPreviousAcademicStanding(null);
      }
    }

    const courses = termInfo.courses || [];

    if (courses.length === 0) {
      setCourseData([]);
      setAvgAttendance(null);
      setDiffAttendance(null);
      setGpaDelta(0);
      setIsFirstTermFlag(false);
      return;
    }

    const mappedCourses = courses.map((course) => ({
      courseNumber: course.courseNumber,
      subjectCode: course.subjectCode,
      crn: course.crn,
      courseTitle: course.courseTitle || "-",
      attendancePercentage: course.attendancePercentage ? parseFloat(course.attendancePercentage) : null,
      grade: course.finalGrade || "-",
      credit: course.creditHours || "-",
      gradeMode: course.gradeMode || "-",
    }));
    setCourseData(mappedCourses);

    let gpaDiff = 0;
    let attDiff = 0;
    let isFirst = false;

    if (termCodesResult) {
      const currentIndex = termCodesResult.findIndex((t) => t.termCode === currentTermCode);
      if (currentIndex === 0) {
        isFirst = true;
      } else if (currentIndex > 0) {
        const prevTermCode = termCodesResult[currentIndex - 1].termCode;
        const prevTermInfo = pipelineData.termData[prevTermCode];
        if (prevTermInfo) {
          let prevCumGpa = prevTermInfo.cumulative_gpa;
          if (prevCumGpa === "N/A" || prevCumGpa === null || prevCumGpa === undefined) {
            prevCumGpa = 0;
          } else {
            prevCumGpa = Number(prevCumGpa);
          }
          gpaDiff = (termInfo.cumulative_gpa || 0) - prevCumGpa;

          const prevAvgAtt = prevTermInfo.attendancePercentage;
          if (avgAttendance !== null && prevAvgAtt !== null) {
            attDiff = avgAttendance - prevAvgAtt;
          } else {
            attDiff = 0;
          }
        }
      }
    }

    setGpaDelta(gpaDiff);
    setDiffAttendance(attDiff);
    setIsFirstTermFlag(isFirst);
  }, [pipelineData, currentTermCode, termCodesResult, avgAttendance]);

  useEffect(() => {
    if (!pipelineData || !termCodesResult) {
      setTermGpaData([]);
      return;
    }

    const allTermGpas = termCodesResult.map((termObj) => {
      const tInfo = pipelineData.termData[termObj.termCode];
      return {
        term: termObj.term,
        termCode: termObj.termCode,
        termGpa: tInfo?.term_gpa || 0,
        cumulativeGpa: tInfo?.cumulative_gpa || 0,
      };
    });
    setTermGpaData(allTermGpas);
  }, [pipelineData, termCodesResult]);

  const getStatusColor = (value) => {
    const parsed_value = parseFloat(value);
    if (isNaN(parsed_value)) return poor_performance_color_code;
    if (parsed_value >= parsed_minimum_threshold_for_excellent_attendance) return excellent_performance_color_code;
    if (parsed_value >= parsed_minimum_threshold_for_satisfactory_attendance) return satisfactory_performance_color_code;
    return poor_performance_color_code;
  };

  const getGpaCircleColor = (gpa) => {
    const parsed_gpa = parseFloat(gpa);
    if (isNaN(parsed_gpa)) return poor_performance_color_code;
    if (parsed_gpa >= parsed_minimum_threshold_for_excellent_performance) return excellent_performance_color_code;
    if (parsed_gpa >= parsed_minimum_threshold_for_satisfactory_performance) return satisfactory_performance_color_code;
    return poor_performance_color_code;
  };

  const getAcademicStandingColor = (standing) => {
    if (!standing) return COLOR_CONFIG.ON_TRACK;
    const lower = standing.toLowerCase();
    if (lower.includes("good") || lower.includes("honor") || lower.includes("excellent") || lower.includes("satisfactory"))
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
    const sorted = termCodesResult.sort((a, b) => a.termCode.localeCompare(b.termCode));
    return sorted[0]?.termCode === currentTermCode;
  }, [termCodesResult, currentTermCode]);

  const isZeroDelta = parseFloat(gpaDelta) === 0;
  const isPositive = gpaDelta >= 0;
  const gpaCircleColor = getGpaCircleColor(currentGpa);
  const termGpaCircleColor = getGpaCircleColor(termGpa);
  const attendanceCircleColor = getStatusColor(avgAttendance);
  const deltaColor = isPositive ? COLOR_CONFIG.ON_TRACK : COLOR_CONFIG.CRITICAL;
  const programGpaCircleColor = getGpaCircleColor(programGpa);
  const resolvedStanding = academicStanding || previousAcademicStanding;
  const academicStandingColor = getAcademicStandingColor(resolvedStanding);
  const isLatestTerm = currentTermCode === latestTermCode;
  const attendanceDiff = parseFloat(diffAttendance);
  const isZeroAttendanceDiff = attendanceDiff === 0;
  const isPositiveAttendanceDiff = attendanceDiff > 0;
  const attendanceDiffColor = isPositiveAttendanceDiff ? COLOR_CONFIG.ON_TRACK : COLOR_CONFIG.CRITICAL;

  const isLoading = dataLoading;
  const hasNoTerms =
    !dataLoading &&
    !dataError &&
    pipelineData &&
    (!pipelineData.termData || Object.keys(pipelineData.termData).length === 0);

  return (
    <div className="root">
      <Card className="card">
        <HomeHeader
          currentTerm={currentTerm}
          termCodesResult={termCodesResult}
          loadingTermCodes={dataLoading}
          handleTermChange={handleTermChange}
        />

        {isLoading && (
          <Typography style={{ padding: "20px", textAlign: "center", color: "#02050c" }}>
            Loading student details...
          </Typography>
        )}

        {!isLoading && dataError && (
          <Typography style={{ padding: "20px", textAlign: "center", color: "#B91C1C", fontStyle: "italic" }}>
            Failed to load student data. Please try again later.
          </Typography>
        )}

        {!isLoading && hasNoTerms && (
          <Typography style={{ padding: "20px", textAlign: "center", color: "#6B7280", fontStyle: "italic" }}>
            No term registrations found for this student.
          </Typography>
        )}

        {!isLoading && !dataError && !hasNoTerms && termCodesResult && (
          <>
            <div className="gpa-cards-wrapper" style={{ marginTop: "14px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>

                {/* ROW 1: 4 metric cards + TermGpaBar */}
                <div style={{ display: "flex", flexDirection: "row", gap: "20px", alignItems: "stretch", width: "100%" }}>
                  <GpaMetrics
                    loadingTermInformation={dataLoading}
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
                    diffAttendance={diffAttendance}
                    isZeroAttendanceDiff={isZeroAttendanceDiff}
                    isPositiveAttendanceDiff={isPositiveAttendanceDiff}
                    attendanceDiffColor={attendanceDiffColor}
                    attendanceCircleColor={attendanceCircleColor}
                    avgAttendance={avgAttendance}
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
                  <TermGpaBar
                    termData={termData}
                    termGpaData={termGpaData}
                  />
                </div>

                {/* ROW 2: legends + button — full width so button reaches right edge */}
                <div style={{ display: "flex", alignItems: "center", width: "100%", gap: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "nowrap", whiteSpace: "nowrap", overflow: "hidden", flexShrink: 1 }}>
                    <div className="legend-item">
                      <div className="legend-dot" style={{ backgroundColor: COLOR_CONFIG.ON_TRACK }} />
                      <span style={{ fontSize: "0.92rem", fontWeight: 500 }}>On Track</span>
                    </div>
                    <span style={{ color: "#D1D5DB" }}>|</span>
                    <div className="legend-item">
                      <div className="legend-dot" style={{ backgroundColor: COLOR_CONFIG.NEEDS_ATTENTION }} />
                      <span style={{ fontSize: "0.92rem", fontWeight: 500 }}>Needs Attention</span>
                    </div>
                    <span style={{ color: "#D1D5DB" }}>|</span>
                    <div className="legend-item">
                      <div className="legend-dot" style={{ backgroundColor: COLOR_CONFIG.CRITICAL }} />
                      <span style={{ fontSize: "0.92rem", fontWeight: 500 }}>Critical</span>
                    </div>
                    <span style={{ color: "#D1D5DB" }}>|</span>
                    <span style={{ fontSize: "0.92rem", fontWeight: 500 }}>A, B, C, D = Letter Grades</span>
                    <span style={{ color: "#D1D5DB" }}>|</span>
                    <span style={{ fontSize: "0.92rem", fontWeight: 500 }}>F = Fail</span>
                    <span style={{ color: "#D1D5DB" }}>|</span>
                    <span style={{ fontSize: "0.92rem", fontWeight: 500 }}>N/A = Not Applicable</span>
                  </div>

                  {isLatestTerm && (
                    <Button
                      onClick={handleOpenModal}
                      style={{ textTransform: "capitalize", fontSize: "12px", minHeight: "32px", padding: "4px 16px", marginLeft: "auto", flexShrink: 0 }}
                      color="primary"
                    >
                      <img
                        src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzE3NTFfNzg4NSkiPgo8cGF0aCBkPSJNMTYgMzJDMjQuODM2NiAzMiAzMiAyNC44MzY2IDMyIDE2QzMyIDcuMTYzNDQgMjQuODM2NiAwIDE2IDBDNy4xNjM0NCAwIDAgNy4xNjM0NCAwIDE2QzAgMjQuODM2NiA3LjE2MzQ0IDMyIDE2IDMyWiIgZmlsbD0idXJsKCNwYWludDBfbGluZWFyXzE3NTFfNzg4NSkiLz4KPHBhdGggZD0iTTE3LjU0OTEgOS4zOTk5MkMxNy4zNzkxIDkuNDU5OTIgMTcuMjY5MSA5LjYyOTkyIDE3LjI2OTEgOS44MDk5MkMxNy4yNjkxIDkuOTg5OTIgMTcuMzc5MSAxMC4xNTk5IDE3LjU0OTEgMTAuMjE5OUwxOS4zMzkxIDEwLjg4OTlDMTkuNTY5MSAxMC45Nzk5IDE5Ljc0OTEgMTEuMTU5OSAxOS44MjkxIDExLjM3OTlMMjAuNDk5MSAxMy4xNjk5QzIwLjU1OTEgMTMuMzM5OSAyMC43MjkxIDEzLjQ0OTkgMjAuOTA5MSAxMy40NDk5QzIxLjA4OTEgMTMuNDQ5OSAyMS4yNTkxIDEzLjMzOTkgMjEuMzE5MSAxMy4xNjk5TDIxLjk4OTEgMTEuMzc5OUMyMi4wNzkxIDExLjE0OTkgMjIuMjU5MSAxMC45Njk5IDIyLjQ3OTEgMTAuODg5OUwyNC4yNjkxIDEwLjIxOTlDMjQuNDM5MSAxMC4xNTk5IDI0LjU0OTEgOS45ODk5MiAyNC41NDkxIDkuODA5OTJDMjQuNTQ5MSA5LjYyOTkyIDI0LjQzOTEgOS40NTk5MiAyNC4yNjkxIDkuMzk5OTJMMjIuNDc5MSA4LjcyOTkyQzIyLjI0OTEgOC42Mzk5MiAyMi4wNjkxIDguNDU5OTIgMjEuOTg5MSA4LjIzOTkyTDIxLjMxOTEgNi40NDk5MkMyMS4yNTkxIDYuMjc5OTIgMjEuMDg5MSA2LjE2OTkyIDIwLjkwOTEgNi4xNjk5MkMyMC43MjkxIDYuMTY5OTIgMjAuNTU5MSA2LjI3OTkyIDIwLjQ5OTEgNi40NDk5MkwxOS44MjkxIDguMjM5OTJDMTkuNzM5MSA4LjQ2OTkyIDE5LjU1OTEgOC42NDk5MiAxOS4zMzkxIDguNzI5OTJMMTcuNTQ5MSA5LjM5OTkyWk01LjQ2OTE0IDE1LjI3OTlDNS4yNDkxNCAxNS4zNzk5IDUuMTE5MTQgMTUuNTk5OSA1LjExOTE0IDE1LjgyOTlDNS4xMTkxNCAxNi4wNTk5IDUuMjU5MTQgMTYuMjc5OSA1LjQ2OTE0IDE2LjM3OTlMNi4xMTkxNCAxNi42Nzk5TDYuNDI5MTQgMTYuODE5OUg2LjQ0OTE0TDkuNTE5MTQgMTguMjQ5OUM5LjY5OTE0IDE4LjMyOTkgOS44NDkxNCAxOC40Nzk5IDkuOTI5MTQgMTguNjU5OUwxMS4zNDkxIDIxLjcyOTlWMjEuNzQ5OUwxMS40OTkxIDIyLjA1OTlMMTEuNzk5MSAyMi43MDk5QzExLjg5OTEgMjIuOTI5OSAxMi4xMTkxIDIzLjA1OTkgMTIuMzQ5MSAyMy4wNTk5QzEyLjU3OTEgMjMuMDU5OSAxMi43OTkxIDIyLjkxOTkgMTIuODk5MSAyMi43MDk5TDEzLjE5OTEgMjIuMDU5OUwxMy4zMzkxIDIxLjc0OTlWMjEuNzI5OUwxNC43NjkxIDE4LjY1OTlDMTQuODQ5MSAxOC40Nzk5IDE0Ljk5OTEgMTguMzI5OSAxNS4xNzkxIDE4LjI0OTlMMTguMjQ5MSAxNi44Mjk5SDE4LjI2OTFMMTguNTc5MSAxNi42Nzk5TDE5LjIyOTEgMTYuMzc5OUMxOS40NDkxIDE2LjI3OTkgMTkuNTc5MSAxNi4wNTk5IDE5LjU3OTEgMTUuODI5OUMxOS41NzkxIDE1LjU5OTkgMTkuNDM5MSAxNS4zNzk5IDE5LjIyOTEgMTUuMjc5OUwxOC41NzkxIDE0Ljk3OTlMMTguMjY5MSAxNC44Mzk5SDE4LjI0OTFMMTUuMTc5MSAxMy40MDk5QzE0Ljk5OTEgMTMuMzI5OSAxNC44NDkxIDEzLjE3OTkgMTQuNzY5MSAxMi45OTk5TDEzLjM0OTEgOS45Mjk5MlY5LjkwOTkyTDEzLjE5OTEgOS41OTk5MkwxMi44OTkxIDguOTQ5OTJDMTIuNzk5MSA4LjcyOTkyIDEyLjU3OTEgOC41OTk5MiAxMi4zNDkxIDguNTk5OTJDMTIuMTE5MSA4LjU5OTkyIDExLjg5OTEgOC43Mzk5MiAxMS43OTkxIDguOTQ5OTJMMTEuNDk5MSA5LjU5OTkyTDExLjM1OTEgOS45MDk5MlY5LjkyOTkyTDkuOTI5MTQgMTIuOTk5OUM5Ljg0OTE0IDEzLjE3OTkgOS42OTkxNCAxMy4zMjk5IDkuNTE5MTQgMTMuNDA5OUw2LjQ0OTE0IDE0LjgyOTlINi40MjkxNEw2LjExOTE0IDE0Ljk3OTlMNS40NjkxNCAxNS4yNzk5Wk04LjYxOTE0IDE1LjgyOTlMMTAuMjc5MSAxNS4wNTk5QzEwLjg1OTEgMTQuNzg5OSAxMS4zMTkxIDE0LjMyOTkgMTEuNTg5MSAxMy43NDk5QzExLjg4OTEgMTMuMDk5OSAxMi44MTkxIDEzLjA5OTkgMTMuMTE5MSAxMy43NDk5QzEzLjM4OTEgMTQuMzI5OSAxMy44NDkxIDE0Ljc4OTkgMTQuNDI5MSAxNS4wNTk5QzE1LjA3OTEgMTUuMzU5OSAxNS4wNzkxIDE2LjI4OTkgMTQuNDI5MSAxNi41ODk5QzEzLjg0OTEgMTYuODU5OSAxMy4zODkxIDE3LjMxOTkgMTMuMTE5MSAxNy44OTk5QzEyLjgxOTEgMTguNTQ5OSAxMS44ODkxIDE4LjU0OTkgMTEuNTg5MSAxNy44OTk5QzExLjMxOTEgMTcuMzE5OSAxMC44NTkxIDE2Ljg1OTkgMTAuMjc5MSAxNi41ODk5TDguNjE5MTQgMTUuODI5OVpNMTkuODI5MSAyMC4zODk5QzE5LjczOTEgMjAuNjE5OSAxOS41NTkxIDIwLjc5OTkgMTkuMzM5MSAyMC44Nzk5TDE3LjU0OTEgMjEuNTQ5OUMxNy4zNzkxIDIxLjYwOTkgMTcuMjY5MSAyMS43Nzk5IDE3LjI2OTEgMjEuOTU5OUMxNy4yNjkxIDIyLjEzOTkgMTcuMzc5MSAyMi4zMDk5IDE3LjU0OTEgMjIuMzY5OUwxOS4zMzkxIDIzLjAzOTlDMTkuNTY5MSAyMy4xMjk5IDE5Ljc0OTEgMjMuMzA5OSAxOS44MjkxIDIzLjUyOTlMMjAuNDk5MSAyNS4zMTk5QzIwLjU1OTEgMjUuNDg5OSAyMC43MjkxIDI1LjU5OTkgMjAuOTA5MSAyNS41OTk5QzIxLjA4OTEgMjUuNTk5OSAyMS4yNTkxIDI1LjQ4OTkgMjEuMzE5MSAyNS4zMTk5TDIxLjk4OTEgMjMuNTI5OUMyMi4wNzkxIDIzLjI5OTkgMjIuMjU5MSAyMy4xMTk5IDIyLjQ3OTEgMjMuMDM5OUwyNC4yNjkxIDIyLjM2OTlDMjQuNDM5MSAyMi4zMDk5IDI0LjU0OTEgMjIuMTM5OSAyNC41NDkxIDIxLjk1OTlDMjQuNTQ5MSAyMS43Nzk5IDI0LjQzOTEgMjEuNjA5OSAyNC4yNjkxIDIxLjU0OTlMMjIuNDc5MSAyMC44Nzk5QzIyLjI0OTEgMjAuNzg5OSAyMi4wNjkxIDIwLjYwOTkgMjEuOTg5MSAyMC4zODk5TDIxLjMxOTEgMTguNTk5OUMyMS4yNTkxIDE4LjQyOTkgMjEuMDg5MSAxOC4zMTk5IDIwLjkwOTEgMTguMzE5OUMyMC43MjkxIDE4LjMxOTkgMjAuNTU5MSAxOC40Mjk5IDIwLjQ5OTEgMTguNTk5OUwxOS44MjkxIDIwLjM4OTlaIiBmaWxsPSJ3aGl0ZSIvPgo8L2c+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MF9saW5lYXJfMTc1MV83ODg1IiB4MT0iMTYiIHkxPSIwIiB4Mj0iMTYiIHkyPSIyOS41IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiMzNjAxNDAiLz4KPHN0b3Agb2Zmc2V0PSIwLjIiIHN0b3AtY29sb3I9IiM0ODBBNTQiLz4KPHN0b3Agb2Zmc2V0PSIwLjQ1IiBzdG9wLWNvbG9yPSIjNUExMzY2Ii8+CjxzdG9wIG9mZnNldD0iMC43MiIgc3RvcC1jb2xvcj0iIzY1MTk3MiIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiM2OTFCNzYiLz4KPC9saW5lYXJHcmFkaWVudD4KPGNsaXBQYXRoIGlkPSJjbGlwMF8xNzUxXzc4ODUiPgo8cmVjdCB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIGZpbGw9IndoaXRlIi8+CjwvY2xpcFBhdGg+CjwvZGVmcz4KPC9zdmc+Cg=="
                        alt="GPA recommendation icon"
                        style={{ width: "20px", height: "20px", marginRight: "2px" }}
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
              maxAchievableGpa={pipelineData?.maxAchievableGpa}
            />

            <CourseDataView
              loadingCourseData={dataLoading}
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