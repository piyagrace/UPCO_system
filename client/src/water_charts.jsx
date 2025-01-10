// WaterQualityChart.jsx
import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import axios from 'axios';

// Import the annotation plugin
import annotationPlugin from 'chartjs-plugin-annotation';

// Register the annotation plugin with Chart.js
import { Chart } from 'chart.js';
Chart.register(annotationPlugin);

// Import the CSS file
import './Chart.css'; // Adjust the path if necessary

function WaterQualityChart() {
  // State to store all fetched data
  const [allData, setAllData] = useState([]);

  // State to manage selected month range
  const [selectedMonthRange, setSelectedMonthRange] = useState('All');

  // State to store chart data
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  });

  // Define month range options
  const monthOptions = [
    { value: 'January-June', label: 'January - June' },
    { value: 'July-December', label: 'July - December' },
  ];

  // Define tank names
  const tankNames = ["U-mall Water Tank", "Main Water Tank"];

  // Fetch data when the component mounts
  useEffect(() => {
    axios.get('http://localhost:3001/waterquality_data')
      .then(response => {
        setAllData(response.data);
      })
      .catch(err => console.log('Error fetching data:', err));
  }, []);

  // Update chart data whenever allData or selectedMonthRange changes
  useEffect(() => {
    // Filter data based on selected month range
    const filteredData = filterDataByMonthRange(allData, selectedMonthRange);
    const formattedData = formatChartData(filteredData);
    setChartData(formattedData);
  }, [allData, selectedMonthRange]);

  /**
   * Filters the data based on the selected month range.
   * @param {Array} data - The complete dataset.
   * @param {string} monthRange - The selected month range.
   * @returns {Array} - The filtered dataset.
   */
  const filterDataByMonthRange = (data, monthRange) => {
    if (monthRange === 'All') {
      return data;
    }
    return data.filter(item => item.month === monthRange);
  };

  /**
   * Formats the data to be compatible with Chart.js.
   * Calculates the average values for each parameter per tank.
   * @param {Array} data - The filtered dataset.
   * @returns {Object} - The formatted chart data.
   */
  const formatChartData = (data) => {
    const parameters = ["pH", "Color", "Fecal_Coliform", "TSS", "Chloride", "Nitrate", "Phosphate"];

    // Initialize datasets
    const datasets = tankNames.map((tank, index) => ({
      label: tank,
      data: [],
      borderColor: index === 0 ? 'rgba(112,159,91,255)' : 'rgba(255,227,167,255)',
      backgroundColor: index === 0 ? 'rgba(112,159,91,255)' : 'rgba(255,227,167,255)',
    }));

    // Group data by source_tank
    const groupedData = tankNames.map(tank => data.filter(item => item.source_tank === tank));

    // Calculate average for each parameter
    parameters.forEach((param) => {
      tankNames.forEach((tank, tankIndex) => {
        const tankData = groupedData[tankIndex];
        const average = tankData.length > 0
          ? tankData.reduce((acc, cur) => acc + parseFloat(cur[param]), 0) / tankData.length
          : 0;
        datasets[tankIndex].data.push(parseFloat(average.toFixed(2)));
      });
    });

    return { labels: parameters, datasets };
  };

  // Chart options with dynamic title based on selected month range
  const options = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: false, // Disable default legend
      },
      title: {
        display: true,
        text: `Water Quality Comparison (${selectedMonthRange === 'All' ? 'All Months' : selectedMonthRange})`,
        font: {
          size: 18
        }
      },
      annotation: {
        annotations: {
          referenceLine: {
            type: 'line',
            yMin: 5,
            yMax: 5,
            borderColor: 'red',
            borderWidth: 2,
            label: {
              enabled: true,
              content: 'Threshold (5 mg/L)',
              position: 'end',
              backgroundColor: 'rgba(255, 99, 132, 0.8)',
              color: '#fff',
              padding: 6,
              font: {
                weight: 'bold'
              },
              yAdjust: -10,
            }
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Parameters',
          font: {
            size: 14
          }
        },
        ticks: {
          autoSkip: false,
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        title: {
          display: true,
          text: 'Values',
          font: {
            size: 14
          }
        },
        beginAtZero: true,
        suggestedMax: 15,
      }
    }
  };

  return (
    <div className="container mt-4">
      <h2>Water Quality Comparison</h2>

      {/* Dropdown for selecting month range */}
      <div className="mb-3">
        <label htmlFor="monthRangeSelect" className="form-label"><strong>Filter by Month Range:</strong></label>
        <select
          id="monthRangeSelect"
          className="form-select"
          value={selectedMonthRange}
          onChange={(e) => setSelectedMonthRange(e.target.value)}
        >
          {monthOptions.map((option, index) => (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Conditional rendering based on filtered data */}
      {chartData.labels.length > 0 ? (
        <>
        <Bar data={chartData} options={options} />
      <div className="chart-legend">
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: 'rgba(112,159,91,255)' }}></span> U-mall Water Tank
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: 'rgba(255,227,167,255)' }}></span> Main Water Tank
        </div>
        <div className="legend-item">
          <span className="legend-dash" style={{ backgroundColor: 'rgba(255,227,167,255)' }}></span> Class A-C Limit (5 mg/L)
        </div>          
      </div>
        </>
      ) : (
        <p className="text-muted">No data available for the selected month range.</p>
      )}
    </div>
  );
}

export default WaterQualityChart;
