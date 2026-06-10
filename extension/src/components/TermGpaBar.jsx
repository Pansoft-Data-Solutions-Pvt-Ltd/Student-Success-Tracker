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
  layout: { padding: 0 },
  plugins: {
    legend: {
      position: "top",
      align: "end",
      labels: {
        usePointStyle: true,
        pointStyle: "circle",
        font: { size: 9 },
        boxWidth: 6,
        padding: 6,
        color: "#7C3AED",
      },
    },
    title: { display: false },
    tooltip: {
      bodyFont: { size: 10 },
      titleFont: { size: 10, weight: "bold" },
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
        font: { size: 8 },
        autoSkip: true,
        maxTicksLimit: 5,
        color: "#6B7280",
        callback: function (val, index) {
          const label = fullLabels[index] ?? "";
          const match = label.match(/^(Spring|Fall|Summer|Winter)\s+(\d{4})$/i);
          if (match) {
            const season = match[1].substring(0, 2).toUpperCase();
            const year = match[2].substring(2);
            return `${season}${year}`;
          }
          return label;
        },
      },
      grid: { display: false },
      border: { display: false },
    },
    y: {
      min: 0,
      max: 4,
      ticks: {
        stepSize: 1,
        font: { size: 8 },
        padding: 2,
        color: "#6B7280",
      },
      grid: { color: "rgba(243,232,255,0.8)" },
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
        width: "300px",
        minWidth: "300px",
        maxWidth: "300px",
        padding: "18px 14px 20px 14px",
        borderRadius: "12px",
        display: "flex",
        flexDirection: "column",
        gap: "2px",
        border: "2px solid #D1D5DB",
        boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
        background: "#fff",
        boxSizing: "border-box",
        alignSelf: "flex-start",
      }}
    >
      {/* Icon + Title on same row to save vertical space */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <ChartIcon />
        <Typography
          variant="body1"
          style={{ fontSize: "0.88rem", fontWeight: 700, color: "#6B21A8", margin: 0 }}
        >
          Term GPA Report
        </Typography>
      </div>

      {/* Subtitle */}
      <Typography
        variant="body2"
        style={{ fontSize: "0.78rem", color: "#6B21A8", fontWeight: 500, margin: "2px 0 4px 0" }}
      >
        ● GPA trend across terms
      </Typography>

      {/* Chart — height tuned to keep card same size as neighbours */}
      <div style={{ height: "110px", width: "100%" }}>
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