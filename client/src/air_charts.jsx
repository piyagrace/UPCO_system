import React, { useEffect, useState, useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import axios from 'axios';
import './Chart.css'; 

// 1. Define AQI categories for each pollutant
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

// 2. Define colors for each category
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
  'Good': 'rgba(81,238,227,255)',          
  'Satisfactory': 'rgba(255, 255, 0, 0.5)',
  'Moderately Polluted': 'rgba(241,229,64,255)', 
  'Poor': 'rgba(254,80,78,255)',           
  'Very Poor': 'rgba(151,0,51,255)',   
  'Severe': 'rgba(126,1,35,255)',       
  'Unknown': 'rgba(204, 204, 204, 0.5)'     
};

// 3. Function to get AQI category based on pollutant and value
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

function AirQualityChart() {
  // Reference to store the original data for toggling
  const originalChartData = useRef({
    CO: 0,
    NO2: 0,
    SO2: 0
  });

  // 4. State for chart data
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
  const [selectedYear, setSelectedYear] = useState(2024); // Default year
  const [selectedMonth, setSelectedMonth] = useState('August'); // Default month
  const [error, setError] = useState(null); // State for error handling

  // List of years and months for dropdowns
  const years = [2021, 2022, 2023, 2024, 2025];
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    // Fetch data whenever selectedYear or selectedMonth changes
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3001/airquality_data', {
          params: {
            year: selectedYear,
            month: selectedMonth
          }
        });

        const data = response.data;

        // Store original data for toggling
        originalChartData.current = {
          CO: data.CO,
          NO2: data.NO2,
          SO2: data.SO2
        };

        // Determine categories and colors for each pollutant
        const pollutants = ['CO', 'NO2', 'SO2'];
        const values = [data.CO, data.NO2, data.SO2];
        const backgroundColors = [];
        const borderColors = [];

        values.forEach((value, index) => {
          const pollutant = pollutants[index];
          const category = getAqiCategory(pollutant, value);
          const backgroundColor = categoryBackgroundColors[category] || categoryBackgroundColors['Unknown'];
          const borderColor = categoryColors[category] || categoryColors['Unknown'];
          backgroundColors.push(backgroundColor);
          borderColors.push(borderColor);
        });

        // Update chart data with all pollutant values and corresponding colors
        setChartData(prevState => ({
          ...prevState,
          datasets: [
            {
              ...prevState.datasets[0],
              data: values,
              backgroundColor: backgroundColors,
              borderColor: borderColors
            }
          ]
        }));
        setError(null); // Reset error
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.message || 'Error fetching data');
        // Reset chart data if there's an error
        setChartData(prevState => ({
          ...prevState,
          datasets: [
            {
              ...prevState.datasets[0],
              data: [null, null, null], // Hide all bars
              backgroundColor: [null, null, null],
              borderColor: [null, null, null]
            }
          ]
        }));
      }
    };

    fetchData();
  }, [selectedYear, selectedMonth]);

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
        text: `Air Quality in CvSU - Indang Campus for ${selectedMonth} ${selectedYear}`
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const pollutant = context.label;
            const value = context.parsed.y;
            const pollutantKey = pollutant.replace('₂', '2'); // 'NO₂' -> 'NO2', 'SO₂' -> 'SO2'

            if (value === null || value === undefined) {
              return `${pollutant}: No data`;
            }

            const category = getAqiCategory(pollutantKey, value);
            return `${pollutant}: ${value} (${category})`;
          }
        }
      }
    }
  };

  // 5. Define categories for the legend
  const legendCategories = [
    { label: 'Good', color: categoryColors['Good'] },
    { label: 'Satisfactory', color: categoryColors['Satisfactory'] },
    { label: 'Moderately Polluted', color: categoryColors['Moderately Polluted'] },
    { label: 'Poor', color: categoryColors['Poor'] },
    { label: 'Very Poor', color: categoryColors['Very Poor'] },
    { label: 'Severe', color: categoryColors['Severe'] },
  ];

  return (
    <div>
      <h2>Air Quality Index</h2>
      
      {/* Dropdowns for Year and Month Selection */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ marginRight: '10px' }}>
          Year:
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            style={{ marginLeft: '5px' }}
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </label>

        <label>
          Month:
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{ marginLeft: '5px' }}
          >
            {months.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
        </label>
      </div>

      {/* Display error message if any */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* 6. Bar Chart */}
      <Bar data={chartData} options={options} />

      {/* 7. Custom Legend */}
      <div className="chart-legend">
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: 'rgba(81,238,227,255)' }}></span> Good
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: 'rgba(80,203,168,255)' }}></span> Satisfactory
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: 'rgba(241,229,64,255)' }}></span> Moderately Polluted
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: 'rgba(254,80,78,255)' }}></span> Poor
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: 'rgba(151,0,51,255)' }}></span> Very Poor
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: 'rgba(126,1,35,255)' }}></span> Severe
        </div>
      </div>
    </div>
  );
}

export default AirQualityChart;
