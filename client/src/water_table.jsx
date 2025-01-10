// WaterQualityTable.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

function WaterQualityTable() {
    // State variables
    const [allData, setAllData] = useState([]);
    const [selectedMonthRange, setSelectedMonthRange] = useState("January-June");
    const [aggregatedData, setAggregatedData] = useState({});

    // Define month options with value and label
    const monthOptions = [
        { value: 'January-June', label: 'January - June' },
        { value: 'July-December', label: 'July - December' },
    ];

    // Parameters to display
    const parameters = ["pH", "Color", "Fecal_Coliform", "TSS", "Chloride", "Nitrate", "Phosphate"];

    // Source Tanks
    const sourceTanks = ["U-mall Water Tank", "Main Water Tank"];

    // Helper function to format numbers without trailing zeros
    const formatNumber = (num) => {
        if (typeof num !== 'number') return num; // Handle non-number cases like "N/A"
        return parseFloat(num.toFixed(2)).toString();
    };

    // Fetch data based on selected month range
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:3001/filterwaterquality_data', {
                    params: {
                        monthRange: selectedMonthRange
                    }
                });
                console.log("Fetched Data:", response.data); // For debugging
                setAllData(response.data);
            } catch (error) {
                console.error("Error fetching water quality data:", error);
            }
        };

        fetchData();
    }, [selectedMonthRange]);

    // Aggregate data whenever allData changes
    useEffect(() => {
        const aggregate = () => {
            const aggregation = {};

            parameters.forEach(param => {
                aggregation[param] = {};
                sourceTanks.forEach(tank => {
                    // Filter data for the specific tank and parameter
                    const tankData = allData.filter(item => item.source_tank === tank);
                    if (tankData.length > 0) {
                        const total = tankData.reduce((sum, current) => sum + (current[param] || 0), 0);
                        const average = total / tankData.length;
                        aggregation[param][tank] = formatNumber(average);
                    } else {
                        aggregation[param][tank] = "N/A";
                    }
                });
            });

            setAggregatedData(aggregation);
        };

        aggregate();
    }, [allData, parameters, sourceTanks]);

    return (
        <div className="container mt-5">
            <h2 className="mb-4">Water Quality Data</h2>

            {/* Dropdown for selecting month range */}
            <div className="mb-4">
                <label htmlFor="monthRangeSelect" className="form-label"><strong>Select Month Range:</strong></label>
                <select
                    id="monthRangeSelect"
                    className="form-select"
                    value={selectedMonthRange}
                    onChange={(e) => setSelectedMonthRange(e.target.value)}
                    style={{ width: "200px" }}
                >
                    {monthOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Table displaying aggregated data */}
            <table className="table table-bordered">
                <thead className="table-light">
                    <tr>
                        <th>Parameter</th>
                        {sourceTanks.map((tank, index) => (
                            <th key={index}>{tank}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {parameters.map((param, index) => (
                        <tr key={index}>
                            <td>{param}</td>
                            {sourceTanks.map((tank, idx) => (
                                <td key={idx}>{aggregatedData[param] ? aggregatedData[param][tank] : "N/A"}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default WaterQualityTable;
