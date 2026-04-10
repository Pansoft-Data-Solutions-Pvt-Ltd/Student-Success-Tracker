import React, { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import useFetch from "../hooks/useFetch";
import TermGpaBar from "../components/TermGpaBar";
import HomeHeader from "../components/HomeHeader";
import GpaMetrics from "../components/GpaMetrics";
import CourseDataView from "../components/CourseDataView";
import "./Home.css";

// Ellucian provided hooks
import { useData, useCardInfo } from "@ellucian/experience-extension-utils";

import { Typography, Card } from "@ellucian/react-design-system/core";

/* ================= CONFIG ================= */
/* ================= COMPONENT ================= */
const MySuccessTrackerTable = () => {
  const [currentTerm, setCurrentTerm] = useState(null);
  const [termData, setTermData] = useState([]);
  const [currentBannerId, setCurrentBannerId] = useState(null);
  const [currentTermCode, setCurrentTermCode] = useState(null);
  const [latestTermCode, setLatestTermCode] = useState(null); // always the most recent term, never changes on term switch
  const [currentGpa, setCurrentGpa] = useState(0);
  const [termGpa, setTermGpa] = useState(0);
  const [gpaDelta, setGpaDelta] = useState(0);
  const [courseData, setCourseData] = useState([]);
  const [loadingCourseData, setLoadingCourseData] = useState(false);
  const [termGpaData, setTermGpaData] = useState([]);
  const [loadingAllTermGpas, setLoadingAllTermGpas] = useState(false);
  const [initialCourseData, setInitialCourseData] = useState([]);
  const [avgAttendance, setAvgAttendance] = useState(null);
  const [diffAttendance, setDiffAttendance] = useState(null);
  const [isFirstTermFlag, setIsFirstTermFlag] = useState(false);

  const { authenticatedEthosFetch } = useData();
  const { cardId, cardConfiguration } = useCardInfo();
  console.log(
    "Printing card configuration:",
    JSON.stringify(cardConfiguration),
  );

  const {
    excellent_performance_color_code,
    satisfactory_performance_color_code,
    poor_performance_color_code,
    minimum_threshold_for_excellent_performance,
    minimum_threshold_for_satisfactory_performance,
    minimum_threshold_for_excellent_attendance,
    minimum_threshold_for_satisfactory_attendance,
    academic_performance_pipeline,
    term_information_pipeline,
    term_codes_pipeline,
  } = cardConfiguration;

  // Parse config thresholds once — they arrive as strings from cardConfiguration
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


  // Defined as a constant outside render cycle to avoid stale closure issues
  const blockedTermCodes = useMemo(() => ["199610", "199510", "199520"], []);

  const { data: rawTermCodes, loading: loadingTermCodes } = useFetch(
    authenticatedEthosFetch,
    cardId,
    null,
    term_codes_pipeline,
    {}
  );

  const termCodesResult = useMemo(() => {
    return rawTermCodes?.termCodeDetails?.filter(
      (item) => !blockedTermCodes.includes(item.termCode)
    ) || [];
  }, [rawTermCodes, blockedTermCodes]);

  const termInfoParams = useMemo(() => {
    return currentTermCode ? { termCode: currentTermCode } : null;
  }, [currentTermCode]);

  const { data: termInformationData, loading: loadingTermInformation } = useFetch(
    authenticatedEthosFetch,
    cardId,
    null,
    currentTermCode ? term_information_pipeline : null,
    termInfoParams
  );

  // Fetch and filter term codes
  useEffect(() => {
    if (termCodesResult && termCodesResult.length > 0 && !currentTermCode) {
      const sortedTerms = [...termCodesResult].sort((a, b) => a.termCode.localeCompare(b.termCode));
      setTermData(sortedTerms.map((term) => term.term));
      const latestTerm = sortedTerms[sortedTerms.length - 1];
      setCurrentTerm(latestTerm?.term);
      setCurrentTermCode(latestTerm?.termCode);
      setLatestTermCode(latestTerm?.termCode);
      setCurrentBannerId(latestTerm?.bannerId);
    }
  }, [termCodesResult, currentTermCode]);

  // Fetch current term details
  useEffect(() => {
    if (!currentTermCode) return;

    if (termInformationData) {
      const data = termInformationData;
      const cumGpa = parseFloat(data?.cumulativeGpa) || 0;
      const trmGpa = data?.termGpa;
      setCurrentGpa(cumGpa);
      setTermGpa(trmGpa);
      setCurrentBannerId(data?.bannerId);
      setGpaDelta(data?.cgpaDifference);
      setAvgAttendance(data?.averageAttendancePercentage ?? null);
      setDiffAttendance(data?.differenceInAttendance ?? null);
      setIsFirstTermFlag(data?.firstTermFlag ?? false);

      if (Array.isArray(data?.termInformation)) {
        setInitialCourseData(data.termInformation);
      } else {
        setInitialCourseData([]);
      }
    } else if (!loadingTermInformation) {
      setCurrentGpa(0);
      setTermGpa(0);
      setAvgAttendance(null);
      setDiffAttendance(null);
      setIsFirstTermFlag(false);
      setInitialCourseData([]);
    }
  }, [termInformationData, loadingTermInformation, currentTermCode, currentTerm, termCodesResult]);

  // Fetch all term GPAs at once
  useEffect(() => {
    if (!termCodesResult || termCodesResult.length === 0) return;

    const fetchAllTermGpas = async () => {
      setLoadingAllTermGpas(true);
      try {
        const filteredTerms = termCodesResult
          .filter((item) => !blockedTermCodes.includes(item.termCode))
          .sort((a, b) => a.termCode.localeCompare(b.termCode));

        const allTermGpaPromises = filteredTerms.map(async (term) => {
          try {
            const qs = new URLSearchParams({ cardId, termCode: term.termCode }).toString();
            const response = await authenticatedEthosFetch(`${term_information_pipeline}?${qs}`, {
              method: 'GET',
              headers: { Accept: 'application/json' }
            });
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
            const data = await response.json();

            return {
              term: term.term,
              termCode: term.termCode,
              termGpa: data?.termGpa,
              cumulativeGpa: parseFloat(data?.cumulativeGpa) || 0,
            };
          } catch (error) {
            console.error(
              `Error fetching GPA for term ${term.termCode}:`,
              error,
            );
            return {
              term: term.term,
              termCode: term.termCode,
              termGpa: 0,
              cumulativeGpa: 0,
            };
          }
        });

        const allTermGpas = await Promise.all(allTermGpaPromises);
        setTermGpaData(allTermGpas);
      } catch (error) {
        console.error("Error fetching all term GPAs:", error);
      } finally {
        setLoadingAllTermGpas(false);
      }
    };

    fetchAllTermGpas();
  }, [termCodesResult, authenticatedEthosFetch, cardId, term_information_pipeline]);

  // Fetch academic performance data for each course
  useEffect(() => {
    if (
      !initialCourseData ||
      initialCourseData.length === 0 ||
      !currentTermCode ||
      !currentBannerId
    ) {
      setCourseData([]);
      return;
    }

    const fetchAcademicPerformanceData = async () => {
      setLoadingCourseData(true);
      try {
        const performancePromises = initialCourseData.map(async (course) => {
          try {
            const qs = new URLSearchParams({ 
              cardId, 
              termCode: currentTermCode, 
              crn: course.crn, 
              bannerId: currentBannerId 
            }).toString();
            const response = await authenticatedEthosFetch(`${academic_performance_pipeline}?${qs}`, {
              method: 'GET',
              headers: { Accept: 'application/json' }
            });
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
            const performanceData = await response.json();

            return {
              courseNumber: course.courseNumber,
              subjectCode: course.subjectCode,
              crn: course.crn,
              courseTitle: course.courseTitle || "-",
              attendancePercentage: course?.attendancePercentage
                ? parseFloat(course.attendancePercentage)
                : null,
              grade: performanceData?.grade || "-",
              credit: performanceData?.earnedCreditHours || "-",
              gradeMode: performanceData?.gradeMode || "-",
            };
          } catch (error) {
            console.error(
              `Error fetching performance for CRN ${course.crn}:`,
              error,
            );
            return {
              crn: course.crn,
              courseNumber: "-",
              subjectCode: "-",
              courseTitle: course.courseTitle || "-",
              attendancePercentage: null,
              grade: "-",
              credit: course.credit || "-",
              gradeMode: "-",
            };
          }
        });

        const performanceResults = await Promise.all(performancePromises);
        setCourseData(performanceResults);
      } catch (error) {
        console.error("Error fetching academic performance data:", error);
      } finally {
        setLoadingCourseData(false);
      }
    };

    fetchAcademicPerformanceData();
  }, [
    initialCourseData,
    currentTermCode,
    currentBannerId,
    authenticatedEthosFetch,
    cardId,
    academic_performance_pipeline
  ]);

  const getStatusColor = (value) => {
    const parsed_value = parseFloat(value);
    if (isNaN(parsed_value)) return poor_performance_color_code;
    if (parsed_value >= parsed_minimum_threshold_for_excellent_attendance)
      return excellent_performance_color_code;
    if (parsed_value >= parsed_minimum_threshold_for_satisfactory_attendance)
      return satisfactory_performance_color_code;
    return poor_performance_color_code;
  };

  const getGpaCircleColor = (gpa) => {
    const parsed_gpa = parseFloat(gpa);
    if (isNaN(parsed_gpa)) return poor_performance_color_code;
    if (parsed_gpa >= parsed_minimum_threshold_for_excellent_performance)
      return excellent_performance_color_code;
    if (parsed_gpa >= parsed_minimum_threshold_for_satisfactory_performance)
      return satisfactory_performance_color_code;
    return poor_performance_color_code;
  };

  const handleTermChange = (term) => {
    setCourseData([]);
    setCurrentTerm(term.term);
    setCurrentTermCode(term.termCode);
    setCurrentBannerId(term.bannerId);
  };

  const isFirstTerm = useMemo(() => {
    if (!termCodesResult || termCodesResult.length === 0) return false;
    const sorted = termCodesResult
      .filter((item) => !blockedTermCodes.includes(item.termCode))
      .sort((a, b) => a.termCode.localeCompare(b.termCode));
    return sorted[0]?.termCode === currentTermCode;
  }, [termCodesResult, currentTermCode]);

  const isZeroDelta = parseFloat(gpaDelta) === 0;
  const isPositive = gpaDelta >= 0;
  const gpaCircleColor = getGpaCircleColor(currentGpa);
  const termGpaCircleColor = getGpaCircleColor(termGpa);
  const attendanceCircleColor = getStatusColor(avgAttendance);
  const deltaColor = isPositive ? COLOR_CONFIG.ON_TRACK : COLOR_CONFIG.CRITICAL;

  const isLatestTerm = currentTermCode === latestTermCode;
  const attendanceDiff = parseFloat(diffAttendance);
  const isZeroAttendanceDiff = attendanceDiff === 0;
  const isPositiveAttendanceDiff = attendanceDiff > 0;
  const attendanceDiffColor = isPositiveAttendanceDiff
    ? COLOR_CONFIG.ON_TRACK
    : COLOR_CONFIG.CRITICAL;

  const isLoading = loadingTermInformation;

  return (
    <div className="root">
      <Card className="card">
        <HomeHeader
          currentTerm={currentTerm}
          termCodesResult={termCodesResult}
          blockedTermCodes={blockedTermCodes}
          loadingTermCodes={loadingTermCodes}
          handleTermChange={handleTermChange}
        />

        {isLoading && (
          <Typography
            style={{ padding: "20px", textAlign: "center", color: "#02050c" }}
          >
            Loading student details...
          </Typography>
        )}

        {!isLoading && (
          <>
            <div className="gpa-cards-wrapper">
              <div
                style={{
                  display: "flex",
                  gap: "20px",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <GpaMetrics
                  loadingTermInformation={loadingTermInformation}
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
                />

                {/* TERM GPA BAR CHART */}
                <Card className="term-gpa-bar-card">
                  <TermGpaBar
                    termData={termData}
                    termGpaData={termGpaData}
                    loading={loadingAllTermGpas}
                  />
                </Card>
              </div>
            </div>

            <CourseDataView
              loadingCourseData={loadingCourseData}
              courseData={courseData}
              getStatusColor={getStatusColor}
              tableConfig={TABLE_CONFIG}
              colors={COLOR_CONFIG}
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
