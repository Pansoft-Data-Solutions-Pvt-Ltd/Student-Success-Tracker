import React from "react";
import PropTypes from "prop-types";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
} from "@ellucian/react-design-system/core";
import { useCardInfo } from "@ellucian/experience-extension-utils";

// Circular progress SVG component
const CircularProgress = ({ percentage, color }) => {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div style={{ position: "relative", width: 44, height: 44, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
      <svg width="44" height="44" style={{ transform: "rotate(-90deg)", position: "absolute" }}>
        {/* Background track */}
        <circle
          cx="22" cy="22" r={radius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="3.5"
        />
        {/* Colored fill */}
        <circle
          cx="22" cy="22" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="3.5"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <Typography
        variant="caption"
        style={{
          fontSize: "0.55rem",
          fontWeight: 700,
          color: color,
          lineHeight: 1,
          textAlign: "center",
          zIndex: 1,
        }}
      >
        {percentage}%
      </Typography>
    </div>
  );
};

// ── Fix 1: PropTypes for CircularProgress ──
CircularProgress.propTypes = {
  percentage: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
};

const CourseDataView = ({
  loadingCourseData,
  courseData,
  getStatusColor,
  tableConfig,
  colors,
  isCurrentTerm,
}) => {
  const creditsHeader = isCurrentTerm ? "Credits" : "Credits Earned";

  const { cardConfiguration } = useCardInfo();
  const {
    attendance_source,
    grade_source,
  } = cardConfiguration;

  // Light lavender header — matches screenshot
  const headerCellStyle = {
    backgroundColor: "#EDE9F6",
    color: "#3B1F6E",
    textAlign: "center",
    padding: "12px 16px",
    borderBottom: "1px solid #D1C4E9",
  };

  const headerTextStyle = {
    fontWeight: 700,
    fontSize: "1rem",
    color: "#3B1F6E",
  };

  return (
    <>
      {/* DESKTOP TABLE VIEW */}
      <div className="table-container">
        <Table className="table">
          <TableHead>
            <TableRow>
              <TableCell style={{ ...headerCellStyle, textAlign: "left" }}>
                <Typography variant="body1" style={headerTextStyle}>Course</Typography>
              </TableCell>
              <TableCell style={headerCellStyle}>
                <Typography variant="body1" style={headerTextStyle}>Grade <span style={{fontSize: '0.8rem', fontWeight: 'normal'}} >({grade_source})</span></Typography>
              </TableCell>
              <TableCell style={headerCellStyle}>
                <Typography variant="body1" style={headerTextStyle}>{creditsHeader}</Typography>
              </TableCell>
              <TableCell style={headerCellStyle}>
                <Typography variant="body1" style={headerTextStyle}>Attendance <span style={{fontSize: '0.8rem', fontWeight: 'normal'}} >({attendance_source})</span></Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loadingCourseData || courseData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="body-cell">
                  <Typography variant="body2" style={{ color: "#6B7280", fontStyle: "italic" }}>
                    {loadingCourseData
                      ? "Loading course data..."
                      : "No course data available for this term"}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              courseData.map((row, index) => {
                const attendanceColor = getStatusColor(row.attendancePercentage);
                const isLowGrade = tableConfig.lowGrades.includes(row.grade);
                const attendanceDisplay =
                  row.attendancePercentage !== null
                    ? `${row.attendancePercentage}`
                    : null;

                return (
                  <TableRow key={row.crn || index} className="table-row">
                    {/* COURSE — icon + purple course code + title */}
                    <TableCell className="body-cell">
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {/* Book/course icon */}
                        <svg
                          width="16" height="16" viewBox="0 0 24 24"
                          fill="none" stroke="#7C3AED" strokeWidth="2"
                          strokeLinecap="round" strokeLinejoin="round"
                          style={{ flexShrink: 0 }}
                        >
                          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                        </svg>
                        <Typography
                          variant="body2"
                          style={{ fontWeight: 600, color: "#7C3AED", whiteSpace: "nowrap" }}
                        >
                          {row.subjectCode}-{row.courseNumber}
                        </Typography>
                        <Typography
                          variant="body2"
                          style={{ color: "#1F2937", textTransform: "capitalize" }}
                        >
                          {row.courseTitle}
                        </Typography>
                      </div>
                    </TableCell>

                    {/* GRADE */}
                    <TableCell
                      className={`body-cell ${isLowGrade ? "low-grade" : ""}`}
                      style={{ textAlign: "center" }}
                    >
                      <Typography variant="body2">{row?.grade ?? "–"}</Typography>
                    </TableCell>

                    {/* CREDITS */}
                    <TableCell className="body-cell" style={{ textAlign: "center" }}>
                      <Typography variant="body2">{row?.credit}</Typography>
                    </TableCell>

                    {/* ATTENDANCE — circular progress */}
                    <TableCell className="body-cell last-cell" style={{ textAlign: "center" }}>
                      {attendanceDisplay !== null ? (
                        <div style={{ display: "flex", justifyContent: "center" }}>
                          <CircularProgress
                            percentage={Number(row.attendancePercentage)}
                            color={attendanceColor}
                          />
                        </div>
                      ) : (
                        <Typography variant="body2" style={{ color: "#9CA3AF", fontStyle: "italic" }}>
                          N/A
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* MOBILE CARD VIEW */}
      <div className="mobile-card-list">
        {loadingCourseData || courseData.length === 0 ? (
          <Typography
            variant="body2"
            style={{ textAlign: "center", color: "#6B7280", fontStyle: "italic", padding: "30px" }}
          >
            {loadingCourseData ? "Loading course data..." : "No course data available for this term"}
          </Typography>
        ) : (
          courseData.map((row, index) => {
            const attendanceColor = getStatusColor(row.attendancePercentage);
            const isLowGrade = tableConfig.lowGrades.includes(row?.grade);

            return (
              <div key={row.crn || index} className="mobile-card">
                <div className="mobile-card-header">
                  <div className="mobile-card-title">
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                      </svg>
                      <Typography variant="body1" style={{ fontWeight: 700, color: "#7C3AED" }}>
                        {row.subjectCode}-{row.courseNumber}
                      </Typography>
                    </div>
                    <Typography variant="body2" style={{ color: "#6B7280", marginTop: "2px" }}>
                      {row.courseTitle}
                    </Typography>
                  </div>
                  <Typography
                    variant="body1"
                    style={{ color: isLowGrade ? colors.CRITICAL : "#1F2937", fontWeight: 700 }}
                  >
                    {row.grade ?? "–"}
                  </Typography>
                </div>

                <div className="mobile-card-row">
                  <Typography variant="body2" className="mobile-card-label">{creditsHeader}</Typography>
                  <Typography variant="body2" className="mobile-card-value">{row.credit}</Typography>
                </div>

                <div className="mobile-card-row">
                  <Typography variant="body2" className="mobile-card-label">Attendance</Typography>
                  {row.attendancePercentage !== null ? (
                    <CircularProgress
                      percentage={Number(row.attendancePercentage)}
                      color={attendanceColor}
                    />
                  ) : (
                    <Typography variant="body2" style={{ color: "#999", fontStyle: "italic" }}>N/A</Typography>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
};

CourseDataView.propTypes = {
  loadingCourseData: PropTypes.bool.isRequired,
  courseData: PropTypes.array.isRequired,
  getStatusColor: PropTypes.func.isRequired,
  tableConfig: PropTypes.object.isRequired,
  colors: PropTypes.object.isRequired,
  isCurrentTerm: PropTypes.bool.isRequired,
};

export default CourseDataView;
