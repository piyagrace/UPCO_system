import React, { useEffect, useState } from "react"; 
import { Link } from "react-router-dom";
import axios from "axios";

function WasteTable() {
  // State for filtered data
  const [filteredUsers, setFilteredUsers] = useState([]);
  // State for all data
  const [allUsers, setAllUsers] = useState([]);
  // States for dropdown selections
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  // Months and Years options
  const [months] = useState([
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]);
  const [years] = useState([2019, 2020, 2021, 2022, 2023, 2024]); // Adjust the years as needed

  // Fetch filtered users whenever selectedMonth or selectedYear changes
  useEffect(() => {
    // Build query parameters based on selected month and year
    const queryParams = new URLSearchParams();
    if (selectedMonth) {
      queryParams.append("month", selectedMonth);
    }
    if (selectedYear) {
      queryParams.append("year", Number(selectedYear)); // Ensure year is a number
    }

    // Fetch filtered data from the backend
    axios
      .get(`http://localhost:3001/filterUsers?${queryParams.toString()}`)
      .then((result) => setFilteredUsers(result.data))
      .catch((err) => console.error("Error fetching filtered users:", err));
  }, [selectedMonth, selectedYear]);

  // Fetch all users once on component mount
  useEffect(() => {
    axios
      .get(`http://localhost:3001/filterUsers`) // No query params to get all users
      .then((result) => setAllUsers(result.data))
      .catch((err) => console.error("Error fetching all users:", err));
  }, []);

  // Handle deletion of a user
  const handleDelete = (id) => {
    axios
      .delete(`http://localhost:3001/delete_solidwaste/${id}`)
      .then((res) => {
        console.log("Delete response:", res);
        // Update both filteredUsers and allUsers by removing the deleted user
        setFilteredUsers((prevFiltered) => prevFiltered.filter((user) => user._id !== id));
        setAllUsers((prevAll) => prevAll.filter((user) => user._id !== id));
      })
      .catch((err) => console.error("Error deleting user:", err));
  };

  // Transform data to aggregate waste types by year and month
  const transformData = (data) => {
    const grouped = data.reduce((acc, item) => {
      const key = `${item.year}-${item.month}`;
      if (!acc[key]) {
        acc[key] = {
          year: item.year,
          month: item.month,
          residual: 0,
          biodegradable: 0,
          recyclable: 0,
        };
      }
      acc[key].residual += item.residual || 0;
      acc[key].biodegradable += item.biodegradable || 0;
      acc[key].recyclable += item.recyclable || 0;
      return acc;
    }, {});

    return Object.values(grouped);
  };

  const transformedData = transformData(filteredUsers);

  return (
      <div>
        <h2>Waste Table</h2>
        {/* Dropdowns for selecting Month and Year */}
        <div className="row mb-4">
          {/* Select Month */}
          <div className="col-md-6">
            <div className="mb-3">
              <label htmlFor="monthSelect" className="form-label">
                Select Month
              </label>
              <select
                id="monthSelect"
                className="form-select"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                <option value="">All Months</option>
                {months.map((month, index) => (
                  <option key={index} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Select Year */}
          <div className="col-md-6">
            <div className="mb-3">
              <label htmlFor="yearSelect" className="form-label">
                Select Year
              </label>
              <select
                id="yearSelect"
                className="form-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                <option value="">All Years</option>
                {years.map((year, index) => (
                  <option key={index} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table: Total Solid Waste Generated (Filtered Data) */}
        <div className="max-auto">
          <h5 className="text-center">Total Solid Waste Generated</h5>
          <table
            className="table table-bordered"
            style={{ marginTop: "20px", marginLeft: "10px", marginRight: "10px" }}
          >
            <thead className="table-light">
              <tr>
                <th>Year</th>
                <th>Month</th>
                <th>Residuals</th>
                <th>Biodegradables</th>
                <th>Recyclables</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transformedData.length > 0 ? (
                transformedData.map((item, index) => {
                  const total =
                    (item.residual || 0) +
                    (item.biodegradable || 0) +
                    (item.recyclable || 0);

                  return (
                    <tr key={index}>
                      <td>{item.year}</td>
                      <td>{item.month}</td>
                      <td>{item.residual}</td>
                      <td>{item.biodegradable}</td>
                      <td>{item.recyclable}</td>
                      <td>{total}</td>
                      <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(item._id)}
                      >
                        Delete
                      </button>
                    </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">
                    No data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
  );
}

export default WasteTable;
