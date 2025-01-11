// WasteTable.jsx
import React, { useEffect, useState } from "react"; 
import { Link } from "react-router-dom";
import axios from "axios";

function WasteTable() {
  // State variables
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [error, setError] = useState("");

  // New state for fetching available years
  const [availableYears, setAvailableYears] = useState([]);
  const [yearError, setYearError] = useState("");
  const [loadingYears, setLoadingYears] = useState(false);

  // Define months as a constant array in ascending order
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // 1. Fetch available years for the year dropdown in ascending order
  useEffect(() => {
    const fetchAvailableYears = async () => {
      setLoadingYears(true);
      setYearError("");
      try {
        const response = await axios.get("http://localhost:3001/available_year_waste");
        // Sort the array in ascending order (oldest -> newest).
        const sortedYears = response.data.sort((a, b) => a - b);
        setAvailableYears(sortedYears);
      } catch (err) {
        console.error("Error fetching available years:", err);
        setYearError("Failed to fetch available years.");
      } finally {
        setLoadingYears(false);
      }
    };

    fetchAvailableYears();
  }, []);

  // 2. Fetch filtered users based on selectedMonth & selectedYear
  //    If both are empty, fetch ALL data from the server.
  useEffect(() => {
    const fetchFilteredUsers = async () => {
      try {
        const queryParams = new URLSearchParams();
        if (selectedMonth) queryParams.append("month", selectedMonth);
        if (selectedYear) queryParams.append("year", Number(selectedYear));

        const response = await axios.get(`http://localhost:3001/filterUsers?${queryParams.toString()}`);
        let data = response.data;

        /**
         * Sort the data by:
         * 1) Year ascending (oldest to newest)
         * 2) Month ascending (January -> December within each year)
         */
        data.sort((a, b) => {
          // First compare by year ascending
          if (a.year !== b.year) {
            return a.year - b.year;
          }
          // If same year, compare by month index ascending
          return months.indexOf(a.month) - months.indexOf(b.month);
        });

        setFilteredUsers(data);
        setError(""); // clear previous errors
      } catch (err) {
        console.error("Error fetching filtered users:", err);
        setFilteredUsers([]);
        setError("Failed to fetch waste data. Please try again later.");
      }
    };

    fetchFilteredUsers();
  }, [selectedMonth, selectedYear]);

  // Handle Delete Action per Entry
  const handleDelete = async (id) => {
    if (window.confirm(`Are you sure you want to delete this waste entry?`)) {
      try {
        await axios.delete(`http://localhost:3001/delete_solidwaste/${id}`);
        // Remove the deleted record from state
        setFilteredUsers((prevData) => prevData.filter((item) => item._id !== id));
        alert("Waste entry deleted successfully.");
      } catch (error) {
        console.error("Error deleting waste data:", error);
        alert("Failed to delete the entry. Please try again.");
      }
    }
  };

  // Function to calculate total waste
  const calculateTotal = (item) => {
    const residual = parseFloat(item.residual) || 0;
    const biodegradable = parseFloat(item.biodegradable) || 0;
    const recyclable = parseFloat(item.recyclable) || 0;
    return (residual + biodegradable + recyclable).toFixed(2);
  };

  return (
    <div className="container mt-5">
      <h2>Waste Table</h2>

      {/* --- Display an error if years fail to load --- */}
      {yearError && <div className="alert alert-danger">{yearError}</div>}

      {/* 3. Show loading status for years */}
      {loadingYears && <p>Loading available years...</p>}

      {/* Dropdowns for Month and Year */}
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
              disabled={loadingYears}
            >
              <option value="">All Years</option>
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Display Error Message for waste data fetch */}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Table: Individual Solid Waste Entries */}
      <div className="max-auto">
        <h5 className="text-center">Solid Waste Entries</h5>
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
            {filteredUsers.length > 0 ? (
              filteredUsers.map((item) => (
                <tr key={item._id}>
                  <td>{item.year}</td>
                  <td>{item.month}</td>
                  <td>{item.residual ?? "N/A"}</td>
                  <td>{item.biodegradable ?? "N/A"}</td>
                  <td>{item.recyclable ?? "N/A"}</td>
                  <td>{calculateTotal(item)}</td>
                  <td>
                    <Link to={`/update/solidwaste/${item._id}`} className="btn btn-success btn-sm">
                      Update
                    </Link>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(item._id)}
                      style={{ marginLeft: "10px" }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center">
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
