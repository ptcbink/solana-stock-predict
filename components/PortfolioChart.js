import { Line } from "react-chartjs-2";
import Chart from "chart.js/auto";

const options = {
  plugins: {
    legend: {
      display: false,
    },
  },
};

import React from "react";

const PortfolioChart = ({ data }) => {
  const setGraphColor = () => {
    if (data.change < 0) {
      return "#ef4b09";
    } else {
      return "#00ff1a";
    }
  };
  const lineGraph = {
    labels: [
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sept",
      "Oct",
      "Noz",
      "Dec",
      "Jan",
    ],
    datasets: [
      {
        fill: false,
        lineTension: 0.01,
        backgroundColor: setGraphColor(),
        borderColor: setGraphColor(),
        borderCapStyle: "butt",
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: "miter",
        pointBorderColor: setGraphColor(),
        pointBackgroundColor: setGraphColor(),
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: setGraphColor(),
        pointHoverBorderColor: setGraphColor(),
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: data.data,
      },
    ],
  };
  return <Line data={lineGraph} options={options} width={400} height={150} />;
};

export default PortfolioChart;
