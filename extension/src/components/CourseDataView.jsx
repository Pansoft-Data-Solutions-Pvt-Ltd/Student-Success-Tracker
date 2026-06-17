import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { AdvancedTable, Typography, Paper } from "@ellucian/react-design-system/core";
import { useCardInfo } from "@ellucian/experience-extension-utils";

/* ─────────────────────────────────────────────
   Circular progress SVG
───────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────
   Moodle grade breakdown — rendered in detail panel
───────────────────────────────────────────── */
const GradeBreakdown = ({ components }) => {
  if (!components || components.length === 0) return null;

  return (
    <div style={{ padding: "10px 24px 10px 40px" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "0.82rem",
        }}
      >
        <thead>
          <tr style={{ borderBottom: "1px solid #D1C4E9" }}>
            <th
              style={{
                textAlign: "left",
                padding: "4px 8px",
                color: "#3B1F6E",
                fontWeight: 700,
              }}
            >
              Component
            </th>
            <th
              style={{
                textAlign: "center",
                padding: "4px 8px",
                color: "#3B1F6E",
                fontWeight: 700,
              }}
            >
              Grade
            </th>
            <th
              style={{
                textAlign: "center",
                padding: "4px 8px",
                color: "#3B1F6E",
                fontWeight: 700,
              }}
            >
              Max
            </th>
            <th
              style={{
                textAlign: "center",
                padding: "4px 8px",
                color: "#3B1F6E",
                fontWeight: 700,
              }}
            >
              Percentage
            </th>
          </tr>
        </thead>
        <tbody>
          {components.map((comp, i) => (
            <tr
              key={i}
              style={{
                borderBottom:
                  i < components.length - 1 ? "1px solid #EDE9F6" : "none",
              }}
            >
              <td style={{ padding: "4px 8px", color: "#374151" }}>
                {comp.name ?? "—"}
              </td>
              <td
                style={{
                  padding: "4px 8px",
                  color: "#374151",
                  textAlign: "center",
                }}
              >
                {comp.grade}
              </td>
              <td
                style={{
                  padding: "4px 8px",
                  color: "#374151",
                  textAlign: "center",
                }}
              >
                {comp.max}
              </td>
              <td
                style={{
                  padding: "4px 8px",
                  color: "#374151",
                  textAlign: "center",
                }}
              >
                {comp.percentage}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
GradeBreakdown.propTypes = {
  components: PropTypes.array.isRequired,
};

/* ─────────────────────────────────────────────
   Main component
───────────────────────────────────────────── */
const CourseDataView = ({
  loadingCourseData,
  courseData,
  getStatusColor,
  tableConfig,
  colors,
  isCurrentTerm,
}) => {
  const creditsHeader = "Credits";

  const { cardConfiguration } = useCardInfo();
  const { attendance_source, grade_source } = cardConfiguration;
  const isMoodleGrade = grade_source === "moodle";

  const columns = useMemo(
    () => [
      {
        accessorKey: "courseTitle",
        header: "Course",
        Cell: ({ row }) => (
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
              {row.original.subjectCode}-{row.original.courseNumber}
            </Typography>
            <Typography
              variant="body2"
              style={{ color: "#1F2937", textTransform: "capitalize" }}
            >
              {row.original.courseTitle}
            </Typography>
          </div>
        ),
      },
      {
        accessorKey: "grade",
        header: `Grade (${grade_source})`,
        Cell: ({ row }) => {
          const isLowGrade = tableConfig.lowGrades.includes(row.original.grade);
          return (
            <Typography
              variant="body2"
              style={{
                textAlign: "center",
                color: isLowGrade ? colors.CRITICAL : undefined,
              }}
            >
              {row.original.grade ?? "–"}
            </Typography>
          );
        },
      },
      {
        accessorKey: "credit",
        header: creditsHeader,
        Cell: ({ row }) => (
          <Typography variant="body2" style={{ textAlign: "center" }}>
            {row.original.credit}
          </Typography>
        ),
      },
      {
        accessorKey: "attendancePercentage",
        header: `Attendance (${attendance_source})`,
        Cell: ({ row }) => {
          const attendanceColor = getStatusColor(
            row.original.attendancePercentage,
          );
          return row.original.attendancePercentage !== null ? (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <CircularProgress
                percentage={Number(row.original.attendancePercentage)}
                color={attendanceColor}
              />
            </div>
          ) : (
            <Typography
              variant="body2"
              style={{
                color: "#9CA3AF",
                fontStyle: "italic",
                textAlign: "center",
              }}
            >
              N/A
            </Typography>
          );
        },
      },
    ],
    [
      grade_source,
      attendance_source,
      creditsHeader,
      getStatusColor,
      tableConfig,
      colors,
    ],
  );

  return (
    <div className="table-container">
      <Paper sx={{ p: ".5rem" }}>
        <AdvancedTable
          columns={columns}
          data={courseData}
          state={{ isLoading: loadingCourseData }}
          {...(isMoodleGrade && {
            enableExpand: true,
            enableExpandAll: true,
            renderDetailPanel: ({ row }) => {
              const { gradeComponents } = row.original;
              return gradeComponents?.length > 0 ? (
                <GradeBreakdown components={gradeComponents} />
              ) : null;
            },
          })}
        />
      </Paper>
    </div>
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
