/* eslint-disable react/prop-types */
import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  AdvancedTable,
  Typography,
  Paper,
} from "@ellucian/react-design-system/core";
import { useCardInfo } from "@ellucian/experience-extension-utils";

const hexToRgba = (hex, alpha) => {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

const getAttendanceWarning = (absencePct, thresholds) => {
  if (absencePct === null || absencePct === undefined) return null;
  const val = Number(absencePct);
  const { warning1, warning2, redFlag, w1Color, w2Color, rfColor } = thresholds;

  if (val >= redFlag) {
    return {
      level: "red_flag",
      label: "Eligible for Red Flag",
      circleColor: rfColor,
      color: rfColor,
      badgeBg: hexToRgba(rfColor, 0.12),
      rowTint: hexToRgba(rfColor, 0.06),
    };
  }
  if (val >= warning2) {
    return {
      level: "warning2",
      label: "Eligible for Warning 2",
      circleColor: w2Color,
      color: w2Color,
      badgeBg: hexToRgba(w2Color, 0.12),
      rowTint: hexToRgba(w2Color, 0.06),
    };
  }
  if (val >= warning1) {
    return {
      level: "warning1",
      label: "Eligible for Warning 1",
      circleColor: w1Color,
      color: w1Color,
      badgeBg: hexToRgba(w1Color, 0.12),
      rowTint: hexToRgba(w1Color, 0.06),
    };
  }
  return {
    level: "ok",
    label: null,
    circleColor: "#22C55E",
    color: "#16A34A",
    badgeBg: null,
    rowTint: "transparent",
  };
};

// Fixed dimensions so every row's number, bar, and badge line up
// and are the same size regardless of label/value length.
const ATT_PCT_WIDTH = 52;
const ATT_BAR_WIDTH = 90;
const ATT_BADGE_WIDTH = 168;

const HorizontalProgress = ({ percentage, color }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <Typography
      variant="caption"
      style={{
        fontSize: "0.8rem",
        fontWeight: 700,
        color,
        width: ATT_PCT_WIDTH,
        flexShrink: 0,
        textAlign: "right",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {percentage}%
    </Typography>
    <div
      style={{
        width: ATT_BAR_WIDTH,
        flexShrink: 0,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#E5E7EB",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${Math.min(Number(percentage), 100)}%`,
          height: "100%",
          backgroundColor: color,
          borderRadius: 4,
          transition: "width 0.4s ease",
        }}
      />
    </div>
  </div>
);

HorizontalProgress.propTypes = {
  percentage: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
};

const WarningBadge = ({ warning }) => {
  if (!warning || !warning.label) return null;
  return (
    <Typography
      variant="caption"
      style={{
        fontSize: "0.6rem",
        fontWeight: 700,
        color: warning.color,
        backgroundColor: warning.badgeBg,
        borderRadius: 6,
        padding: "2px 6px",
        width: ATT_BADGE_WIDTH,
        flexShrink: 0,
        boxSizing: "border-box",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        lineHeight: 1.4,
        border: `1px solid ${warning.color}33`,
      }}
    >
      {warning.label}
    </Typography>
  );
};

const AttendanceCell = ({ absencePct, thresholds }) => {
  if (absencePct === null || absencePct === undefined) {
    return (
      <Typography variant="body2" style={{ color: "#9CA3AF", fontStyle: "italic" }}>
        N/A
      </Typography>
    );
  }
  const warning = getAttendanceWarning(absencePct, thresholds);
  return (
    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 10 }}>
      <HorizontalProgress
        percentage={Number(absencePct)}
        color={warning ? warning.circleColor : "#22C55E"}
      />
      <WarningBadge warning={warning} />
    </div>
  );
};

const GradeCircle = ({ value }) => (
  <div style={{
    width: 140, height: 140, borderRadius: "50%",
    border: "6px solid #7C3AED",
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    backgroundColor: "#ffffff", boxShadow: "0 4px 16px rgba(124,58,237,0.15)",
  }}>
    <Typography variant="body1" style={{ fontWeight: 700, color: "#3B1F6E", fontSize: "1.25rem", lineHeight: 1.2, textAlign: "center", wordBreak: "break-word", maxWidth: 110 }}>
      {value ?? "–"}
    </Typography>
    <Typography variant="caption" style={{ color: "#6B7280", fontSize: "0.7rem", marginTop: 4 }}>
      Current Grade
    </Typography>
  </div>
);

GradeCircle.propTypes = { value: PropTypes.string };

const GradeBreakdownPanel = ({ gradeComponents, gradeSource, overallGrade }) => {
  const isMoodle = gradeSource?.toLowerCase() === "moodle";
  const items = gradeComponents ?? [];

  const cellStyle = {
    padding: "10px 60px", fontSize: "0.875rem", color: "#374151",
    borderBottom: "1px solid #f3f4f6", whiteSpace: "nowrap",
  };
  const headerCellStyle = {
    ...cellStyle, fontWeight: 700, color: "#3B1F6E",
    borderBottom: "2px solid #EDE9F6", backgroundColor: "transparent",
  };

  return (
    <div style={{ display: "flex", gap: 20, padding: "20px 24px", alignItems: "flex-start" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
          <Typography variant="body1" style={{ fontWeight: 700, color: "#3B1F6E", fontSize: "1rem" }}>
            Grade Breakdown
          </Typography>
        </div>

        {items.length === 0 ? (
          <Typography variant="body2" style={{ color: "#6B7280", fontStyle: "italic" }}>
            No grade breakdown available.
          </Typography>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ ...headerCellStyle, textAlign: "left" }}>Component</th>
                <th style={{ ...headerCellStyle, textAlign: "left" }}>{isMoodle ? "Grade" : "Score"}</th>
                {isMoodle && <th style={{ ...headerCellStyle, textAlign: "left" }}>Max</th>}
                <th style={{ ...headerCellStyle, textAlign: "left" }}>Percentage</th>
                <th style={{ ...headerCellStyle, width: "30%" }} />
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => {
                const pct = parseFloat(item.percentage) || 0;
                const isLast = idx === items.length - 1;
                const border = isLast ? "none" : cellStyle.borderBottom;
                return (
                  <tr key={idx}>
                    <td style={{ ...cellStyle, borderBottom: border }}>{item.name}</td>
                    <td style={{ ...cellStyle, borderBottom: border }}>{isMoodle ? item.grade : parseInt(item.score)}</td>
                    {isMoodle && <td style={{ ...cellStyle, borderBottom: border }}>{item.max}</td>}
                    <td style={{ ...cellStyle, borderBottom: border }}>{parseInt(item.percentage)}</td>
                    <td style={{ ...cellStyle, borderBottom: border, width: "30%" }}>
                      <div style={{ height: 8, borderRadius: 4, backgroundColor: "#EDE9F6", overflow: "hidden", minWidth: 80 }}>
                        <div style={{ width: `${Math.min(pct, 100)}%`, height: "100%", backgroundColor: "#7C3AED", borderRadius: 4, transition: "width 0.4s ease" }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {items.length !== 0 && (
        <div style={{ flexShrink: 0, width: 220, backgroundColor: "#faf8ff", border: "1px solid #EDE9F6", borderRadius: 12, padding: "20px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <Typography variant="body2" style={{ fontWeight: 700, color: "#3B1F6E", fontSize: "0.9rem" }}>
            Overall Grade
          </Typography>
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

const CourseDataView = ({ loadingCourseData, courseData, tableConfig, colors, isCurrentTerm }) => {
  const [expandedMobileRows, setExpandedMobileRows] = useState({});

  const { cardConfiguration } = useCardInfo();
  const {
    attendance_source,
    grade_source,
    warning1,
    warning2,
    red_flag,
    warning1_color,
    warning2_color,
    red_flag_color,
  } = cardConfiguration;

  const thresholds = {
    warning1: parseFloat(warning1)    || 5,
    warning2: parseFloat(warning2)    || 10,
    redFlag:  parseFloat(red_flag)    || 15,
    w1Color:  warning1_color          || "#F59E0B",
    w2Color:  warning2_color          || "#F97316",
    rfColor:  red_flag_color          || "#EF4444",
  };

  const toggleMobileRow = (key) =>
    setExpandedMobileRows((prev) => ({ ...prev, [key]: !prev[key] }));

  const columns = [
    {
      accessorKey: "courseTitle",
      header: "Course",
      size: 320,
      Cell: ({ row }) => {
        const { subjectCode, courseNumber, courseTitle } = row.original;
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
            <Typography variant="body2" style={{ fontWeight: 600, color: "#7C3AED", whiteSpace: "nowrap" }}>
              {subjectCode}-{courseNumber}
            </Typography>
            <Typography variant="body2" style={{ color: "#1F2937", textTransform: "capitalize" }}>
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
          <Typography variant="body2" style={isLowGrade ? { color: "#ed1012", fontWeight: 700, fontSize: "1.1rem" } : {}}>
            {row.original.grade ?? "–"}
          </Typography>
        );
      },
    },
    {
      accessorKey: "credit",
      header: "Available Credits",
      size: 160,
      Cell: ({ row }) => <Typography variant="body2">{row.original.credit}</Typography>,
    },
    {
      accessorKey: "attendancePercentage",
      header: `Absence % (${attendance_source ?? ""})`,
      size: 280,
      Cell: ({ row }) => (
        <AttendanceCell
          absencePct={row.original.attendancePercentage}
          thresholds={thresholds}
        />
      ),
    },
  ];

  return (
    <>
      {/* ── DESKTOP ── */}
      <div className="table-container">
        <Paper>
          <AdvancedTable
            columns={columns}
            data={courseData}
            enableExpanding
            enableExpandAll={true}
            state={{ isLoading: loadingCourseData }}
            muiTableContainerProps={{ sx: { borderRadius: "8px", border: "1px solid #d1d5db" } }}
            muiTablePaperProps={{ sx: { boxShadow: "none" } }}
            muiTableBodyRowProps={({ row }) => {
              const w = getAttendanceWarning(row.original.attendancePercentage, thresholds);
              return w && w.level !== "ok"
                ? { sx: { backgroundColor: w.rowTint, "& td": { backgroundColor: w.rowTint }, "&:hover td": { filter: "brightness(0.97)" } } }
                : {};
            }}
            sx={{
              "& .MuiTableHead-root .MuiTableCell-root": {
                backgroundColor: "#EDE9F6",
                color: "#3B1F6E",
                fontWeight: 700,
                fontSize: "1rem",
                borderBottom: "1px solid #D1C4E9",
                borderRight: "1px solid #D1C4E9",
                textTransform: "capitalize",
                "&:last-of-type": { borderRight: "none" },
              },
              "& .MuiTableBody-root .MuiTableCell-root": {
                borderRight: "1px solid #E5E7EB",
                "&:last-of-type": { borderRight: "none" },
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

      {/* ── MOBILE ── */}
      <div className="mobile-card-list">
        {loadingCourseData || courseData.length === 0 ? (
          <Typography variant="body2" style={{ textAlign: "center", color: "#6B7280", fontStyle: "italic", padding: "30px" }}>
            {loadingCourseData ? "Loading course data..." : "No course data available for this term"}
          </Typography>
        ) : (
          courseData.map((row, index) => {
            const isLowGrade = tableConfig.lowGrades.includes(row?.grade);
            const rowKey = row.crn || index;
            const isExpanded = !!expandedMobileRows[rowKey];
            const creditsHeader = isCurrentTerm ? "Credits" : "Credits Earned";
            const warning = getAttendanceWarning(row.attendancePercentage, thresholds);

            return (
              <div
                key={rowKey}
                className="mobile-card"
                style={warning && warning.level !== "ok"
                  ? { backgroundColor: warning.rowTint, borderLeft: `3px solid ${warning.circleColor}` }
                  : undefined}
              >
                <div className="mobile-card-header">
                  <div className="mobile-card-title">
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                      </svg>
                      <Typography variant="body1" style={{ fontWeight: 700, color: "#7C3AED" }}>
                        {row.subjectCode}-{row.courseNumber}
                      </Typography>
                    </div>
                    <Typography variant="body2" style={{ color: "#6B7280", marginTop: "2px" }}>{row.courseTitle}</Typography>
                  </div>
                  <Typography variant="body1" style={{ color: isLowGrade ? colors.CRITICAL : "#1F2937", fontWeight: 700 }}>
                    {row.grade ?? "–"}
                  </Typography>
                </div>

                <div className="mobile-card-row">
                  <Typography variant="body2" className="mobile-card-label">{creditsHeader}</Typography>
                  <Typography variant="body2" className="mobile-card-value">{row.credit}</Typography>
                </div>

                <div className="mobile-card-row">
                  <Typography variant="body2" className="mobile-card-label">Absence</Typography>
                  <AttendanceCell absencePct={row.attendancePercentage} thresholds={thresholds} />
                </div>

                {(row.gradeComponents?.length ?? 0) > 0 && (
                  <>
                    <button
                      onClick={() => toggleMobileRow(rowKey)}
                      style={{ marginTop: 10, width: "100%", background: "none", border: "none", padding: "6px 0 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 4, cursor: "pointer", color: "#7C3AED", fontSize: "0.8rem", fontWeight: 600, borderTop: "1px dashed #e5e7eb" }}
                    >
                      {isExpanded ? "Hide" : "Show"} grade breakdown
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                        style={{ transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                    {isExpanded && (
                      <div style={{ marginTop: 8 }}>
                        <GradeBreakdownPanel gradeComponents={row.gradeComponents} gradeSource={grade_source} />
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
  tableConfig: PropTypes.object.isRequired,
  colors: PropTypes.object.isRequired,
  isCurrentTerm: PropTypes.bool.isRequired,
};

export default CourseDataView;