import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { Typography } from "@ellucian/react-design-system/core";
import PropTypes from "prop-types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ChartIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const buildOptions = (fullLabels) => ({
  responsive: true,
  maintainAspectRatio: false,
  layout: { padding: { top: 2, bottom: 4, left: 0, right: 4 } },
  plugins: {
    legend: { display: false },
    title: { display: false },
    tooltip: {
      bodyFont: { size: 11 },
      titleFont: { size: 11, weight: "bold" },
      callbacks: {
        title: (items) => fullLabels[items[0].dataIndex] ?? items[0].label,
        label: (item) => `GPA: ${Number(item.raw).toFixed(2)}`,
      },
      displayColors: false,
    },
  },
  scales: {
    x: {
      ticks: {
        font: { size: 9, weight: "600" },   // ← bolder + bigger
        autoSkip: true,
        maxTicksLimit: 5,
        color: "#4B0082",                    // ← darker purple so more visible
        padding: 2,
        callback: function (val, index) {
          const label = fullLabels[index] ?? "";
          // Full names: "Spring 2024", "Fall 2024" etc — no shortening
          return label;
        },
      },
      grid: { display: false },
      border: { display: false },
      offset: false,
    },
    y: {
  min: undefined,
  max: undefined,
  ticks: {
    font: { size: 8, weight: "600" },  // ← added weight: "600"
    padding: 2,
    color: "#4B0082",                   // ← darker purple like x-axis
    maxTicksLimit: 4,
    callback: (val) => Number(val).toFixed(1),
  },
  grid: { color: "rgba(139,92,246,0.15)", lineWidth: 1 },
  border: { display: false },
},
  },
});

export default function TermGpaBar({ termData, termGpaData }) {
  const fullLabels = termData ?? [];

  const data = {
    labels: fullLabels,
    datasets: [
      {
        label: "Term GPA",
        data: termGpaData?.map((item) => item.termGpa),
        borderColor: "#7C3AED",
        backgroundColor: "rgba(167, 139, 250, 0.15)",
        pointBackgroundColor: "#7C3AED",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 1,
        pointRadius: 3,
        pointHoverRadius: 5,
        borderWidth: 2,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        flexGrow: 1,
        height: "130px",
        padding: "4px 14px 8px 14px",
        borderRadius: "12px",
        display: "flex",
        flexDirection: "column",
        gap: "2px",
        border: "2px solid #D1D5DB",
        boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
        background: "#fff",
        boxSizing: "border-box",
      }}
    >
      {/* Title row */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <ChartIcon />
        <Typography
          variant="body1"
          style={{ fontSize: "0.88rem", fontWeight: 700, color: "#6B21A8", margin: 0 }}
        >
          Term GPA Report
        </Typography>
      </div>

      {/* Chart */}
      <div style={{ flex: 1, width: "100%", minHeight: 0 }}>
        <Line options={buildOptions(fullLabels)} data={data} />
      </div>
    </div>
  );
}

TermGpaBar.propTypes = {
  termData: PropTypes.array,
  termGpaData: PropTypes.array,
};

TermGpaBar.defaultProps = {
  termData: [],
  termGpaData: [],
};