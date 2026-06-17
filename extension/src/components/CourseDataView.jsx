/* eslint-disable react/prop-types */
import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  AdvancedTable,
  Typography,
  Paper,
} from "@ellucian/react-design-system/core";
import { useCardInfo } from "@ellucian/experience-extension-utils";

// ── Circular Progress (unchanged) ──
const CircularProgress = ({ percentage, color }) => {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div
      style={{
        position: "relative",
        width: 44,
        height: 44,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg
        width="44"
        height="44"
        style={{ transform: "rotate(-90deg)", position: "absolute" }}
      >
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="3.5"
        />
        <circle
          cx="22"
          cy="22"
          r={radius}
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
          color,
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

CircularProgress.propTypes = {
  percentage: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
};

// ── Grade Circle ──
const GradeCircle = ({ value }) => (
  <div
    style={{
      width: 140,
      height: 140,
      borderRadius: "50%",
      border: "6px solid #7C3AED",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#ffffff",
      boxShadow: "0 4px 16px rgba(124,58,237,0.15)",
    }}
  >
    <Typography
      variant="body1"
      style={{
        fontWeight: 700,
        color: "#3B1F6E",
        fontSize: "1.25rem",
        lineHeight: 1.2,
        textAlign: "center",
        wordBreak: "break-word",
        maxWidth: 110,
      }}
    >
      {value ?? "–"}
    </Typography>
    <Typography
      variant="caption"
      style={{ color: "#6B7280", fontSize: "0.7rem", marginTop: 4 }}
    >
      Current Grade
    </Typography>
  </div>
);

GradeCircle.propTypes = {
  value: PropTypes.string,
};

// ── Grade breakdown panel ──
const GradeBreakdownPanel = ({
  gradeComponents,
  gradeSource,
  overallGrade,
}) => {
  const isMoodle = gradeSource?.toLowerCase() === "moodle";
  const items = gradeComponents ?? [];

  // Shared cell style
  const cellStyle = {
    padding: "10px 60px",
    fontSize: "0.875rem",
    color: "#374151",
    borderBottom: "1px solid #f3f4f6",
    whiteSpace: "nowrap",
  };

  const headerCellStyle = {
    ...cellStyle,
    fontWeight: 700,
    color: "#3B1F6E",
    borderBottom: "2px solid #EDE9F6",
    backgroundColor: "transparent",
  };

  return (
    <div
      style={{
        display: "flex",
        gap: 20,
        padding: "20px 24px",
        alignItems: "flex-start",
      }}
    >
      {/* ── Left: breakdown table ── */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Heading */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 14,
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#7C3AED"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
          <Typography
            variant="body1"
            style={{ fontWeight: 700, color: "#3B1F6E", fontSize: "1rem" }}
          >
            Grade Breakdown
          </Typography>
        </div>

        {items.length === 0 ? (
          <Typography
            variant="body2"
            style={{ color: "#6B7280", fontStyle: "italic" }}
          >
            No grade breakdown available.
          </Typography>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ ...headerCellStyle, textAlign: "left" }}>
                  Component
                </th>
                <th style={{ ...headerCellStyle, textAlign: "left" }}>
                  {isMoodle ? "Grade" : "Score"}
                </th>
                {isMoodle && (
                  <th style={{ ...headerCellStyle, textAlign: "left" }}>Max</th>
                )}
                <th style={{ ...headerCellStyle, textAlign: "left" }}>
                  Percentage
                </th>
                <th style={{ ...headerCellStyle, width: "30%" }} />
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => {
                const pct = parseFloat(item.percentage) || 0;
                const isLast = idx === items.length - 1;

                return (
                  <tr key={idx}>
                    <td
                      style={{
                        ...cellStyle,
                        borderBottom: isLast ? "none" : cellStyle.borderBottom,
                      }}
                    >
                      {item.name}
                    </td>
                    <td
                      style={{
                        ...cellStyle,
                        borderBottom: isLast ? "none" : cellStyle.borderBottom,
                      }}
                    >
                      {isMoodle ? item.grade : item.score}
                    </td>
                    {isMoodle && (
                      <td
                        style={{
                          ...cellStyle,
                          borderBottom: isLast
                            ? "none"
                            : cellStyle.borderBottom,
                        }}
                      >
                        {item.max}
                      </td>
                    )}
                    <td
                      style={{
                        ...cellStyle,
                        borderBottom: isLast ? "none" : cellStyle.borderBottom,
                      }}
                    >
                      {item.percentage}
                    </td>
                    {/* Progress bar */}
                    <td
                      style={{
                        ...cellStyle,
                        borderBottom: isLast ? "none" : cellStyle.borderBottom,
                        width: "30%",
                      }}
                    >
                      <div
                        style={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: "#EDE9F6",
                          overflow: "hidden",
                          minWidth: 80,
                        }}
                      >
                        <div
                          style={{
                            width: `${Math.min(pct, 100)}%`,
                            height: "100%",
                            backgroundColor: "#7C3AED",
                            borderRadius: 4,
                            transition: "width 0.4s ease",
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Right: Overall Grade card ── */}
      {items.length !== 0 && (
        <div
          style={{
            flexShrink: 0,
            width: 220,
            backgroundColor: "#faf8ff",
            border: "1px solid #EDE9F6",
            borderRadius: 12,
            padding: "20px 16px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              // gap: 6,
              // alignSelf: "flex-start",
            }}
          >
            <Typography
              variant="body2"
              style={{ fontWeight: 700, color: "#3B1F6E", fontSize: "0.9rem" }}
            >
              Overall Grade
            </Typography>
          </div>

          <GradeCircle value={overallGrade} />
        </div>
      )}
    </div>
  );
};

GradeBreakdownPanel.propTypes = {
  gradeComponents: PropTypes.array,
  gradeSource: PropTypes.string,
  overallGrade: PropTypes.string,
};

// ── Main component ──
const CourseDataView = ({
  loadingCourseData,
  courseData,
  getStatusColor,
  tableConfig,
  colors,
  isCurrentTerm,
}) => {
  const [expandedMobileRows, setExpandedMobileRows] = useState({});

  const { cardConfiguration } = useCardInfo();
  const { attendance_source, grade_source } = cardConfiguration;

  const toggleMobileRow = (key) =>
    setExpandedMobileRows((prev) => ({ ...prev, [key]: !prev[key] }));

  // ── AdvancedTable column definitions ──
  const columns = [
    {
      accessorKey: "courseTitle",
      header: "Course",
      size: 320,
      Cell: ({ row }) => {
        const { subjectCode, courseNumber, courseTitle } = row.original;
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#7C3AED"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ flexShrink: 0 }}
            >
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
            <Typography
              variant="body2"
              style={{
                fontWeight: 600,
                color: "#7C3AED",
                whiteSpace: "nowrap",
              }}
            >
              {subjectCode}-{courseNumber}
            </Typography>
            <Typography
              variant="body2"
              style={{ color: "#1F2937", textTransform: "capitalize" }}
            >
              {courseTitle}
            </Typography>
          </div>
        );
      },
    },
    {
      accessorKey: "grade",
      header: `Grade (${grade_source ?? ""})`,
      size: 160,
      Cell: ({ row }) => {
        const isLowGrade = tableConfig.lowGrades.includes(row.original.grade);
        return (
          <Typography
            variant="body2"
            style={
              isLowGrade
                ? { color: "#ed1012", fontWeight: 700, fontSize: "1.1rem" }
                : {}
            }
          >
            {row.original.grade ?? "–"}
          </Typography>
        );
      },
    },
    {
      accessorKey: "credit",
      header: "Available Credits",
      size: 160,
      Cell: ({ row }) => (
        <Typography variant="body2">{row.original.credit}</Typography>
      ),
    },
    {
      accessorKey: "attendancePercentage",
      header: `Attendance (${attendance_source ?? ""})`,
      size: 180,
      Cell: ({ row }) => {
        const { attendancePercentage } = row.original;
        if (
          attendancePercentage !== null &&
          attendancePercentage !== undefined
        ) {
          return (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <CircularProgress
                percentage={Number(attendancePercentage)}
                color={getStatusColor(attendancePercentage)}
              />
            </div>
          );
        }
        return (
          <Typography
            variant="body2"
            style={{ color: "#9CA3AF", fontStyle: "italic" }}
          >
            N/A
          </Typography>
        );
      },
    },
  ];

  return (
    <>
      {/* ── DESKTOP: AdvancedTable ── */}
      <div className="table-container">
        <Paper>
          <AdvancedTable
            columns={columns}
            data={courseData}
            enableExpanding
            enableExpandAll={false}
            state={{ isLoading: loadingCourseData }}
            muiTableContainerProps={{
              sx: { borderRadius: "8px", border: "1px solid #d1d5db" },
            }}
            muiTablePaperProps={{ sx: { boxShadow: "none" } }}
            sx={{
              "& .MuiTableHead-root .MuiTableCell-root": {
                backgroundColor: "#EDE9F6",
                color: "#3B1F6E",
                fontWeight: 700,
                fontSize: "1rem",
                borderBottom: "1px solid #D1C4E9",
              },
              "& .MuiTableBody-root .MuiTableRow-root:hover td": {
                backgroundColor: "#f9fafb",
              },
            }}
            renderDetailPanel={({ row }) => (
              <GradeBreakdownPanel
                gradeComponents={row.original.gradeComponents}
                gradeSource={grade_source}
                overallGrade={row.original.grade}
              />
            )}
          />
        </Paper>
      </div>

      {/* ── MOBILE: Card list ── */}
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
            const rowKey = row.crn || index;
            const isExpanded = !!expandedMobileRows[rowKey];
            const creditsHeader = isCurrentTerm ? "Credits" : "Credits Earned";

            return (
              <div key={rowKey} className="mobile-card">
                <div className="mobile-card-header">
                  <div className="mobile-card-title">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#7C3AED"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                      </svg>
                      <Typography
                        variant="body1"
                        style={{ fontWeight: 700, color: "#7C3AED" }}
                      >
                        {row.subjectCode}-{row.courseNumber}
                      </Typography>
                    </div>
                    <Typography
                      variant="body2"
                      style={{ color: "#6B7280", marginTop: "2px" }}
                    >
                      {row.courseTitle}
                    </Typography>
                  </div>
                  <Typography
                    variant="body1"
                    style={{
                      color: isLowGrade ? colors.CRITICAL : "#1F2937",
                      fontWeight: 700,
                    }}
                  >
                    {row.grade ?? "–"}
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
                  {row.attendancePercentage !== null &&
                  row.attendancePercentage !== undefined ? (
                    <CircularProgress
                      percentage={Number(row.attendancePercentage)}
                      color={attendanceColor}
                    />
                  ) : (
                    <Typography
                      variant="body2"
                      style={{ color: "#999", fontStyle: "italic" }}
                    >
                      N/A
                    </Typography>
                  )}
                </div>

                {/* Expand toggle — only render if there are components to show */}
                {(row.gradeComponents?.length ?? 0) > 0 && (
                  <>
                    <button
                      onClick={() => toggleMobileRow(rowKey)}
                      style={{
                        marginTop: 10,
                        width: "100%",
                        background: "none",
                        border: "none",
                        padding: "6px 0 0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 4,
                        cursor: "pointer",
                        color: "#7C3AED",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        borderTop: "1px dashed #e5e7eb",
                      }}
                    >
                      {isExpanded ? "Hide" : "Show"} grade breakdown
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#7C3AED"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                          transform: isExpanded ? "rotate(180deg)" : "none",
                          transition: "transform 0.2s",
                        }}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>

                    {isExpanded && (
                      <div style={{ marginTop: 8 }}>
                        <GradeBreakdownPanel
                          gradeComponents={row.gradeComponents}
                          gradeSource={grade_source}
                        />
                      </div>
                    )}
                  </>
                )}
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
