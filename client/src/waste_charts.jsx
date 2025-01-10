import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import axios from 'axios';

function WasteQualityChart() {
  // State to store all fetched data
  const [allData, setAllData] = useState([]);

  // State to store available years for the dropdown
  const [availableYears, setAvailableYears] = useState([]);

  // State to store the currently selected year
  const [selectedYear, setSelectedYear] = useState('');

  // State to store the chart data
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  });

  // Fetch data once when the component mounts
  useEffect(() => {
    axios.get('http://localhost:3001/solidwaste_data')
      .then(result => {
        const data = result.data;

        // Store all data
        setAllData(data);

        // Extract unique years and sort them (ascending)
        const years = Array.from(new Set(data.map(item => item.year))).sort((a, b) => a - b);
        setAvailableYears(years);

        // Set default selected year to the latest year
        const latestYear = years.length > 0 ? years[years.length - 1] : '';
        setSelectedYear(latestYear);

        // Format and set chart data for the latest year
        const formattedData = formatChartData(data, latestYear);
        setChartData(formattedData);
      })
      .catch(err => console.log('Error fetching data:', err));
  }, []);

  // Update chart data whenever the selected year changes
  useEffect(() => {
    if (selectedYear) {
      const filteredData = allData.filter(item => item.year === Number(selectedYear));
      const formattedData = formatChartData(filteredData, selectedYear);
      setChartData(formattedData);
    }
  }, [selectedYear, allData]);

  // Function to format chart data based on the selected year
  const formatChartData = (data, year) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    
    // Initialize datasets with labels and empty data arrays
    const datasets = [
      { 
        label: 'Residuals', 
        data: [], 
        borderColor: '#ffbb2a', 
        backgroundColor: 'rgba(255, 239, 205, 0.5)', 
        fill: true, 
        pointRadius: 3, 
        pointBackgroundColor: '#FF9F1A' 
      },
      { 
        label: 'Biodegradables', 
        data: [], 
        borderColor: '#2489e1', 
        backgroundColor: 'rgba(23, 131, 230, 0.5)', 
        fill: true, 
        pointRadius: 3, 
        pointBackgroundColor: '#2489e1' 
      },
      { 
        label: 'Recyclables', 
        data: [], 
        borderColor: '#4d8833', 
        backgroundColor: 'rgba(87, 141, 60, 0.3)',  
        fill: true, 
        pointRadius: 3, 
        pointBackgroundColor: '#4d8833' 
      }
    ];

    // Populate the datasets with aggregated data per month
    months.forEach(month => {
      const monthData = data.filter(item => item.month === month);
      
      // Sum up the waste types for the month
      const residualTotal = monthData.reduce((acc, cur) => acc + (cur.residual || 0), 0);
      const biodegradableTotal = monthData.reduce((acc, cur) => acc + (cur.biodegradable || 0), 0);
      const recyclableTotal = monthData.reduce((acc, cur) => acc + (cur.recyclable || 0), 0);
      
      datasets[0].data.push(residualTotal);
      datasets[1].data.push(biodegradableTotal);
      datasets[2].data.push(recyclableTotal);
    });

    return { labels: months, datasets };
  };

  const options = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      tooltip: {
        position: 'average',
        mode: 'index',
        intersect: false
      },
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Solid Waste Generated Chart'
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Months'
        },
        ticks: {
          autoSkip: false,  // Prevent labels from being skipped
          maxRotation: 45,  // Max rotation angle in degrees
          minRotation: 45   // Min rotation angle in degrees
        }
      },
      y: {
        title: {
          display: true,
          text: 'Weight (kg)'
        }
      }
    }
  };  

  // Handler for year selection change
  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  return (
    <div>
      <h2>Monthly Waste Statistics</h2>
      
      {/* Dropdown for selecting year */}
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="year-select" style={{ marginRight: '10px' }}>Select Year:</label>
        <select 
          id="year-select" 
          value={selectedYear} 
          onChange={handleYearChange}
          style={{ padding: '5px', fontSize: '16px' }}
        >
          {availableYears.length === 0 && <option>No Years Available</option>}
          {availableYears.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>
      
      {/* Render the chart */}
      <Line data={chartData} options={options} />
    </div>
  );
}

export default WasteQualityChart;