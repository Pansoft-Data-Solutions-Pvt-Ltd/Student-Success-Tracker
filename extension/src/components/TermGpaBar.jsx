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
} from "chart.js";
import { Line } from "react-chartjs-2";
import PropTypes from "prop-types";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

// Chart options
const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top",
      labels: {
        usePointStyle: true,
        pointStyle: "circle",
      },
    },
    title: {
      display: true,
      text: "Term GPA Report",
    },
  },
  scales: {
    y: {
      min: 0,
      max: 4,
      ticks: {
        stepSize: 1,
        callback: function (value) {
          return value;
        },
      },
    },
  },
};

export default function App({ termData, termGpaData }) {
  const data = {
    labels: termData,
    datasets: [
      {
        label: "Term GPA",
        data: termGpaData?.map((data) => data.termGpa),
        borderColor: "#6B21A8",
        backgroundColor: "rgba(107, 33, 168, 0.2)",
        pointBackgroundColor: "#6B21A8",
        pointBorderColor: "#6B21A8",
      },
    ],
  };

  return (
    <div style={{ width: "100%", margin: "0px 0px", height: "100%" }}>
      <Line options={options} data={data} />
    </div>
  );
}

App.propTypes = {
  termData: PropTypes.arrayOf(
    PropTypes.shape({
      term: PropTypes.string,
    }),
  ),
  termGpaData: PropTypes.array,
};