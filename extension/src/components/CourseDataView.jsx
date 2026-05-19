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

import { useThemeInfo } from "@ellucian/experience-extension-utils";

const styles = `
   .custom-header-cell {
    backgroundcolor: primary;
    color: #ffffff !important;
  }
 `;

const CourseDataView = ({
  loadingCourseData,
  courseData,
  getStatusColor,
  tableConfig,
  colors,
  isCurrentTerm,
}) => {
  const creditsHeader = isCurrentTerm ? "Credits" : "Credits Earned";

  const headerTextStyle = {
    backgroundColorcolor: "primary",
    fontWeight: 700,
    fontSize: "1rem",
    letterSpacing: "0.02em",
  };
  const themeInfo = useThemeInfo();
  const primaryColor = themeInfo.primaryColor;
  const textColor = '#ffffff';
  console.log(JSON.stringify(themeInfo));

  return (
    <>
      <style>{styles}</style>

      {/* DESKTOP TABLE VIEW */}
      <div className="table-container">
        <Table className="table">
          <TableHead>
            <TableRow>
              <TableCell 
              style={{backgroundColor: primaryColor, color: textColor, textAlign: 'center'}}
              // className="header-cell custom-header-cell"
              >
                <Typography variant="body1" style={headerTextStyle}>Course</Typography>
              </TableCell>
              <TableCell 
              style={{backgroundColor: primaryColor, color: textColor, textAlign: 'center'}}
              // className="header-cell custom-header-cell"
              >
                <Typography variant="body1" style={headerTextStyle}>Grade</Typography>
              </TableCell>
              <TableCell 
              style={{backgroundColor: primaryColor, color: textColor, textAlign: 'center'}}
              // className="header-cell custom-header-cell"
              >
                <Typography variant="body1" style={headerTextStyle}>{creditsHeader}</Typography>
              </TableCell>
              <TableCell 
              style={{backgroundColor: primaryColor, color: textColor, textAlign: 'center'}}
              // className="header-cell last-cell custom-header-cell"
              >
                <Typography variant="body1" style={headerTextStyle}>Attendance</Typography>
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
                    ? `${row.attendancePercentage}%`
                    : "N/A";

                return (
                  <TableRow key={row.crn || index} className="table-row">
                    <TableCell className="body-cell">
                      <div style={{ display: "flex", gap: "10px" }}>
                        <Typography variant="body2">
                          {row.subjectCode}-{row.courseNumber}
                        </Typography>
                        <Typography variant="caption" style={{ color: "#6B7280" }}>
                          {row.courseTitle}
                        </Typography>
                      </div>
                    </TableCell>
                    <TableCell className={`body-cell ${isLowGrade ? "low-grade" : ""}`}>
                      <Typography variant="body2">{row?.grade}</Typography>
                    </TableCell>
                    <TableCell className="body-cell">
                      <Typography variant="body2">{row?.credit}</Typography>
                    </TableCell>
                    <TableCell className="body-cell last-cell">
                      <div className="progress-wrapper">
                        {row.attendancePercentage !== null ? (
                          <>
                            <div className="progress-bar">
                              <div
                                className="progress-fill"
                                style={{
                                  width: `${row.attendancePercentage}%`,
                                  backgroundColor: attendanceColor,
                                }}
                              />
                            </div>
                            <Typography
                              variant="body2"
                              style={{
                                color: attendanceColor,
                                fontWeight: 400,
                                fontSize: "0.95rem",
                                minWidth: "60px",
                              }}
                            >
                              {attendanceDisplay}
                            </Typography>
                          </>
                        ) : (
                          <Typography
                            variant="body2"
                            style={{ color: "#999", fontStyle: "italic" }}
                          >
                            {attendanceDisplay}
                          </Typography>
                        )}
                      </div>
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
            style={{
              textAlign: "center",
              color: "#6B7280",
              fontStyle: "italic",
              padding: "30px",
            }}
          >
            {loadingCourseData
              ? "Loading course data..."
              : "No course data available for this term"}
          </Typography>
        ) : (
          courseData.map((row, index) => {
            const attendanceColor = getStatusColor(row.attendancePercentage);
            const isLowGrade = tableConfig.lowGrades.includes(row?.grade);
            const attendanceDisplay =
              row.attendancePercentage !== null
                ? `${row.attendancePercentage}%`
                : "N/A";

            return (
              <div key={row.crn || index} className="mobile-card">
                <div className="mobile-card-header">
                  <div className="mobile-card-title">
                    <Typography
                      variant="body1"
                      style={{ fontWeight: 700, marginBottom: "4px" }}
                    >
                      {row.crn}
                    </Typography>
                    <Typography variant="body2" style={{ color: "#6B7280" }}>
                      {row.courseTitle}
                    </Typography>
                  </div>
                  <Typography
                    variant="body1"
                    className="mobile-card-grade"
                    style={{
                      color: isLowGrade ? colors.CRITICAL : "#1F2937",
                      fontWeight: 700,
                    }}
                  >
                    {row.grade}
                  </Typography>
                </div>
                <div className="mobile-card-row">
                  <Typography variant="body2" className="mobile-card-label">
                    {creditsHeader}
                  </Typography>
                  <Typography variant="body2" className="mobile-card-value">
                    {row.credit}
                  </Typography>
                </div>
                <div className="mobile-card-row">
                  <Typography variant="body2" className="mobile-card-label">
                    Attendance
                  </Typography>
                  <div className="mobile-progress-wrapper">
                    {row.attendancePercentage !== null ? (
                      <>
                        <div className="mobile-progress-bar">
                          <div
                            className="progress-fill"
                            style={{
                              width: `${row.attendancePercentage}%`,
                              backgroundColor: attendanceColor,
                            }}
                          />
                        </div>
                        <Typography
                          variant="body2"
                          style={{
                            color: attendanceColor,
                            fontWeight: 600,
                            fontSize: "0.875rem",
                            minWidth: "55px",
                            textAlign: "right",
                          }}
                        >
                          {attendanceDisplay}
                        </Typography>
                      </>
                    ) : (
                      <Typography
                        variant="body2"
                        style={{
                          color: "#999",
                          fontStyle: "italic",
                          fontSize: "0.875rem",
                        }}
                      >
                        {attendanceDisplay}
                      </Typography>
                    )}
                  </div>
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