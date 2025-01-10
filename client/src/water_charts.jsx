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

// Define tank names outside the component to maintain a stable reference
const tankNames = ["U-mall Water Tank", "Main Water Tank"];

function WaterQualityChart() {
  // State to store all fetched data
  const [allData, setAllData] = useState([]);

  // State to manage selected month range and year
  const [selectedMonthRange, setSelectedMonthRange] = useState('January-June');
  const [selectedYear, setSelectedYear] = useState(null);

  // State to store available years
  const [availableYears, setAvailableYears] = useState([]);

  // State to store chart data
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  });

  // State to manage loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Define month range options
  const monthOptions = [
    { value: 'January-June', label: 'January - June' },
    { value: 'July-December', label: 'July - December' },
  ];

  // Define the backend base URL using environment variables
  const BACKEND_URL = 'http://localhost:3001'; // Update if different

  // Fetch available years when the component mounts
  useEffect(() => {
    const fetchAvailableYears = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/available_years`);
        const sortedYears = response.data.sort((a, b) => b - a); // Descending order
        setAvailableYears(sortedYears);
        if (sortedYears.length > 0) {
          setSelectedYear(sortedYears[0]); // Default to the latest year
        }
      } catch (err) {
        console.error('Error fetching available years:', err);
        setError('Failed to load available years.');
      }
    };

    fetchAvailableYears();
  }, [BACKEND_URL]);

  // Fetch data whenever selectedMonthRange or selectedYear changes
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedYear) return; // Do not fetch if year is not selected

      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.get(`${BACKEND_URL}/waterquality_data`, {
          params: {
            monthRange: selectedMonthRange,
            year: selectedYear,
          }
        });
        setAllData(response.data);
      } catch (err) {
        console.error('Error fetching water quality data:', err);
        setError('Failed to load water quality data.');
        setAllData([]); // Clear data on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedMonthRange, selectedYear, BACKEND_URL]);

  // Update chart data whenever allData changes
  useEffect(() => {
    const formatChartData = (data) => {
      const parameters = ["pH", "Color", "Fecal_Coliform", "TSS", "Chloride", "Nitrate", "Phosphate"];

      // Initialize datasets
      const datasets = tankNames.map((tank, index) => ({
        label: tank,
        data: [],
        borderColor: index === 0 ? 'rgba(112,159,91,255)' : 'rgba(255,227,167,255)',
        backgroundColor: index === 0 ? 'rgba(112,159,91,255)' : 'rgba(255,227,167,255)', // Corrected RGBA format
      }));

      // Group data by source_tank
      const groupedData = tankNames.map(tank => data.filter(item => item.source_tank === tank));

      // Calculate average for each parameter
      parameters.forEach((param) => {
        tankNames.forEach((tank, tankIndex) => {
          const tankData = groupedData[tankIndex].filter(item => item[param] != null);
          const average = tankData.length > 0
            ? tankData.reduce((acc, cur) => acc + parseFloat(cur[param]), 0) / tankData.length
            : 0;
          datasets[tankIndex].data.push(parseFloat(average.toFixed(2)));
        });
      });

      return { labels: parameters, datasets };
    };

    const formattedData = formatChartData(allData);
    setChartData(formattedData);
  }, [allData]); // Removed 'tankNames' from dependencies since it's now stable

  // Chart options with dynamic title based on selected month range and year
  const options = {
    responsive: true,
    animation: false, // Disable animations
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
        text: selectedMonthRange && selectedYear ? `Water Quality Comparison (${selectedMonthRange} - ${selectedYear})` : 'Water Quality Comparison',
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
      <h2>Water Quality Chart</h2>

      {/* Filters: Month Range and Year */}
      <div className="mb-3 d-flex gap-3">
        {/* Dropdown for selecting month range */}
        <div className="flex-grow-1">
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

        {/* Dropdown for selecting year */}
        <div className="flex-grow-1">
          <label htmlFor="yearSelect" className="form-label"><strong>Filter by Year:</strong></label>
          <select
            id="yearSelect"
            className="form-select"
            value={selectedYear || ''}
            onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
          >
            <option value="" disabled>Select Year</option>
            {availableYears.map((year, index) => (
              <option key={index} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading and Error States */}
      {isLoading ? (
        <p>Loading data...</p>
      ) : error ? (
        <p className="text-danger">{error}</p>
      ) : allData.length === 0 ? (
        <p className="text-muted">No data available for the selected month range and year.</p>
      ) : (
        <>
          {/* Bar Chart */}
          <Bar data={chartData} options={options} />

          {/* Custom Legend */}
          <div className="chart-legend mt-3">
            <div className="legend-item d-flex align-items-center mb-2">
              <span className="legend-color" style={{ backgroundColor: 'rgba(112,159,91,255)' }}></span>
              <span className="ms-2">U-mall Water Tank</span>
            </div>
            <div className="legend-item d-flex align-items-center mb-2">
              <span className="legend-color" style={{ backgroundColor: 'rgba(255,227,167,255)' }}></span>
              <span className="ms-2">Main Water Tank</span>
            </div>
            <div className="legend-item d-flex align-items-center">
              <span className="legend-line"></span>
              <span>Threshold (5 mg/L)</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default WaterQualityChart;
