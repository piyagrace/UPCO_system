// AirQualityChart.jsx
import React, { useEffect, useState, useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import axios from 'axios';
import './Chart.css'; // Ensure this file exists and styles the legend appropriately

// Define AQI categories for each pollutant
const aqiCategories = {
  CO: [
    { category: 'Good', min: 0, max: 1 },
    { category: 'Satisfactory', min: 1, max: 2 },
    { category: 'Moderately Polluted', min: 2, max: 10 },
    { category: 'Poor', min: 10, max: 17 },
    { category: 'Very Poor', min: 17, max: 34 },
    { category: 'Severe', min: 34, max: Infinity }
  ],
  NO2: [
    { category: 'Good', min: 0, max: 40 },
    { category: 'Satisfactory', min: 41, max: 80 },
    { category: 'Moderately Polluted', min: 81, max: 180 },
    { category: 'Poor', min: 181, max: 280 },
    { category: 'Very Poor', min: 281, max: 400 },
    { category: 'Severe', min: 400, max: Infinity }
  ],
  SO2: [
    { category: 'Good', min: 0, max: 40 },
    { category: 'Satisfactory', min: 41, max: 80 },
    { category: 'Moderately Polluted', min: 81, max: 380 },
    { category: 'Poor', min: 381, max: 800 },
    { category: 'Very Poor', min: 801, max: 1600 },
    { category: 'Severe', min: 1600, max: Infinity }
  ]
};

// Define colors for each category
const categoryColors = {
  'Good': 'rgba(81,238,227,255)',           
  'Satisfactory': 'rgba(80,203,168,255)',   
  'Moderately Polluted': 'rgba(241,229,64,255)', 
  'Poor': 'rgba(254,80,78,255)',           
  'Very Poor': 'rgba(151,0,51,255)',      
  'Severe': 'rgba(126,1,35,255)',         
  'Unknown': '#CCCCCC'        
};

const categoryBackgroundColors = {
  'Good': 'rgba(81,238,227,0.6)',          
  'Satisfactory': 'rgba(80,203,168,0.6)',
  'Moderately Polluted': 'rgba(241,229,64,0.6)', 
  'Poor': 'rgba(254,80,78,0.6)',           
  'Very Poor': 'rgba(151,0,51,0.6)',   
  'Severe': 'rgba(126,1,35,0.6)',       
  'Unknown': 'rgba(204, 204, 204, 0.6)'     
};

// Function to get AQI category based on pollutant and value
const getAqiCategory = (pollutant, value) => {
  const categories = aqiCategories[pollutant];
  if (!categories) return 'Unknown';

  for (let i = 0; i < categories.length; i++) {
    const { min, max, category } = categories[i];
    if (value >= min && value < max) {
      return category;
    }
  }
  return 'Unknown';
};

// Define month order for comparison
const monthOrder = {
  'January': 1,
  'February': 2,
  'March': 3,
  'April': 4,
  'May': 5,
  'June': 6,
  'July': 7,
  'August': 8,
  'September': 9,
  'October': 10,
  'November': 11,
  'December': 12
};

function AirQualityChart() {
  // Reference to store the original data for toggling
  const originalChartData = useRef({
    CO: 0,
    NO2: 0,
    SO2: 0
  });

  // State for chart data
  const [chartData, setChartData] = useState({
    labels: ['CO', 'NO₂', 'SO₂'], // Labels for the x-axis
    datasets: [
      { 
        label: 'Air Quality', // Single dataset label
        data: [0, 0, 0], // Initialize with zeros
        borderColor: [], // To be set dynamically
        backgroundColor: [], // To be set dynamically
        borderWidth: 1
      }
    ]
  });

  // State for selected year and month
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [error, setError] = useState(null); // State for error handling
  const [loadingYears, setLoadingYears] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  // State for available years fetched from API
  const [availableYears, setAvailableYears] = useState([]);

  // List of months for dropdowns
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Define the backend base URL using environment variables
  const BACKEND_URL = 'http://localhost:3001'; // Update if different

  useEffect(() => {
    // Fetch available years and set the latest year and month
    const fetchLatestData = async () => {
      setLoadingYears(true);
      setError(null); // Clear previous errors
      try {
        // Step 1: Fetch available years
        const yearsResponse = await axios.get(`${BACKEND_URL}/available_year_air`);
        const sortedYears = yearsResponse.data.sort((a, b) => b - a); // Descending order
        setAvailableYears(sortedYears);

        if (sortedYears.length === 0) {
          setError('No available years found.');
          setLoadingYears(false);
          return;
        }

        // Step 2: Select the latest year
        const latestYear = sortedYears[0];
        setSelectedYear(latestYear);

        // Step 3: Fetch all data for the latest year to determine the latest month
        const dataResponse = await axios.get(`${BACKEND_URL}/airquality_data`, {
          params: { year: latestYear }
        });

        const dataForYear = dataResponse.data;

        if (dataForYear.length === 0) {
          setError('No data available for the latest year.');
          setSelectedMonth('');
          setChartData({
            labels: ['CO', 'NO₂', 'SO₂'],
            datasets: [
              { 
                label: 'Air Quality',
                data: [0, 0, 0],
                borderColor: [],
                backgroundColor: [],
                borderWidth: 1
              }
            ]
          });
          setLoadingYears(false);
          return;
        }

        // Step 4: Determine the latest month with available data
        let latestMonth = dataForYear[0].month;
        dataForYear.forEach(item => {
          if (monthOrder[item.month] > monthOrder[latestMonth]) {
            latestMonth = item.month;
          }
        });
        setSelectedMonth(latestMonth);
      } catch (err) {
        console.error('Error fetching latest data:', err);
        setError('Failed to load available years or data.');
      } finally {
        setLoadingYears(false);
      }
    };

    fetchLatestData();
  }, [BACKEND_URL]);

  useEffect(() => {
    // Fetch data whenever selectedYear or selectedMonth changes
    const fetchData = async () => {
      if (!selectedYear || !selectedMonth) {
        setChartData({
          labels: ['CO', 'NO₂', 'SO₂'],
          datasets: [
            { 
              label: 'Air Quality',
              data: [0, 0, 0],
              borderColor: [],
              backgroundColor: [],
              borderWidth: 1
            }
          ]
        });
        return;
      }

      setLoadingData(true);
      setError(null); // Clear previous errors
      try {
        const response = await axios.get(`${BACKEND_URL}/airquality_data`, {
          params: {
            year: selectedYear,
            month: selectedMonth
          }
        });

        const data = response.data;

        if (data.length > 0) {
          // Aggregate data if multiple entries are returned for the same month
          const aggregated = {
            CO: (data.reduce((sum, item) => sum + (item.CO || 0), 0) / data.length).toFixed(2),
            NO2: (data.reduce((sum, item) => sum + (item.NO2 || 0), 0) / data.length).toFixed(2),
            SO2: (data.reduce((sum, item) => sum + (item.SO2 || 0), 0) / data.length).toFixed(2),
          };

          // Determine categories and colors for each pollutant
          const pollutants = ['CO', 'NO2', 'SO2'];
          const values = [aggregated.CO, aggregated.NO2, aggregated.SO2];
          const backgroundColors = [];
          const borderColors = [];

          values.forEach((value, index) => {
            const pollutant = pollutants[index];
            const category = getAqiCategory(pollutant, parseFloat(value));
            const backgroundColor = categoryBackgroundColors[category] || categoryBackgroundColors['Unknown'];
            const borderColor = categoryColors[category] || categoryColors['Unknown'];
            backgroundColors.push(backgroundColor);
            borderColors.push(borderColor);
          });

          // Update chart data
          setChartData({
            labels: ['CO', 'NO₂', 'SO₂'],
            datasets: [
              { 
                label: 'Air Quality',
                data: values,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 1
              }
            ]
          });

          originalChartData.current = aggregated; // Store original data if needed
        } else {
          // No data available
          setChartData({
            labels: ['CO', 'NO₂', 'SO₂'],
            datasets: [
              { 
                label: 'Air Quality',
                data: [0, 0, 0],
                backgroundColor: [categoryBackgroundColors['Unknown'], categoryBackgroundColors['Unknown'], categoryBackgroundColors['Unknown']],
                borderColor: [categoryColors['Unknown'], categoryColors['Unknown'], categoryColors['Unknown']],
                borderWidth: 1
              }
            ]
          });
        }
      } catch (err) {
        console.error('Error fetching air quality data:', err);
        setError('Failed to load air quality data.');
        setChartData({
          labels: ['CO', 'NO₂', 'SO₂'],
          datasets: [
            { 
              label: 'Air Quality',
              data: [0, 0, 0],
              backgroundColor: [categoryBackgroundColors['Unknown'], categoryBackgroundColors['Unknown'], categoryBackgroundColors['Unknown']],
              borderColor: [categoryColors['Unknown'], categoryColors['Unknown'], categoryColors['Unknown']],
              borderWidth: 1
            }
          ]
        });
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [selectedYear, selectedMonth, BACKEND_URL]);

  // Handle year change
  const handleYearChange = async (e) => {
    const newYear = parseInt(e.target.value, 10);
    setSelectedYear(newYear);
    setSelectedMonth(''); // Reset month selection
    setChartData({
      labels: ['CO', 'NO₂', 'SO₂'],
      datasets: [
        { 
          label: 'Air Quality',
          data: [0, 0, 0],
          borderColor: [],
          backgroundColor: [],
          borderWidth: 1
        }
      ]
    }); // Clear existing data
    setError(null); // Clear existing errors

    // Fetch data for the new year to determine the latest month
    setLoadingYears(true);
    try {
      const dataResponse = await axios.get(`${BACKEND_URL}/airquality_data`, {
        params: { year: newYear }
      });

      const dataForYear = dataResponse.data;

      if (dataForYear.length === 0) {
        setError('No data available for the selected year.');
        setSelectedMonth('');
        setChartData({
          labels: ['CO', 'NO₂', 'SO₂'],
          datasets: [
            { 
              label: 'Air Quality',
              data: [0, 0, 0],
              borderColor: [],
              backgroundColor: [],
              borderWidth: 1
            }
          ]
        });
        setLoadingYears(false);
        return;
      }

      // Determine the latest month with available data
      let latestMonth = dataForYear[0].month;
      dataForYear.forEach(item => {
        if (monthOrder[item.month] > monthOrder[latestMonth]) {
          latestMonth = item.month;
        }
      });
      setSelectedMonth(latestMonth);
    } catch (err) {
      console.error('Error fetching data for the selected year:', err);
      setError('Failed to load data for the selected year.');
    } finally {
      setLoadingYears(false);
    }
  };

  // Handle month change
  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true
      }
    },
    plugins: {
      legend: {
        display: false, // Hide the default Chart.js legend
      },
      title: {
        display: true,
        text: selectedMonth && selectedYear ? `Air Quality in CvSU - Indang Campus for ${selectedMonth} ${selectedYear}` : 'Air Quality Index'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const pollutant = context.label;
            const value = context.parsed.y;
            const pollutantKey = pollutant.replace('₂', '2'); // 'NO₂' -> 'NO2', 'SO₂' -> 'SO2'

            if (value === null || value === undefined || isNaN(value)) {
              return `${pollutant}: No data`;
            }

            const category = getAqiCategory(pollutantKey, parseFloat(value));
            return `${pollutant}: ${value} (${category})`;
          }
        }
      }
    }
  };

  return (
    <div className="chart-container">
      <h2>Air Quality Chart</h2>
      
      {/* Dropdowns for Year and Month Selection */}
      <div className="dropdowns">
        {/* Year Dropdown */}
        <div className="dropdown">
          <label htmlFor="year"><strong>Year:</strong></label>
          <select
            id="year"
            value={selectedYear}
            onChange={handleYearChange}
            disabled={loadingYears || loadingData}
          >
            <option value="">Select Year</option>
            {availableYears.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Month Dropdown */}
        <div className="dropdown">
          <label htmlFor="month"><strong>Month:</strong></label>
          <select
            id="month"
            value={selectedMonth}
            onChange={handleMonthChange}
            disabled={loadingData || !selectedYear}
          >
            {/* Automatically select the latest month without a placeholder */}
            {selectedMonth && (
              <option key={selectedMonth} value={selectedMonth}>
                {selectedMonth}
              </option>
            )}
            {months
              .filter(month => month !== selectedMonth)
              .map(month => (
                <option key={month} value={month}>
                  {month}
                </option>
            ))}
          </select>
        </div>
      </div>

      {/* Display Error Message */}
      {error && <p className="error-message">{error}</p>}

      {/* Loading Indicators */}
      {(loadingYears || loadingData) && <p>Loading data...</p>}

      {/* Bar Chart */}
      {!loadingData && !error && (
        <Bar data={chartData} options={options} />
      )}

      {/* Custom Legend */}
      {!loadingData && !error && (
        <div className="chart-legend">
          {Object.keys(categoryColors).filter(cat => cat !== 'Unknown').map(category => (
            <div key={category} className="legend-item">
              <span className="legend-color" style={{ backgroundColor: categoryColors[category] }}></span>
              {category}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AirQualityChart;
