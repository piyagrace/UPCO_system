import React, { useEffect, useState } from "react"; 
import { Link } from "react-router-dom";
import axios from "axios";

function WasteTable() {
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [months] = useState([
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ]);
  const [years] = useState([2019, 2020, 2021, 2022, 2023, 2024]);

  useEffect(() => {
    const queryParams = new URLSearchParams();
    if (selectedMonth) {
      queryParams.append("month", selectedMonth);
    }
    if (selectedYear) {
      queryParams.append("year", Number(selectedYear));
    }

    axios
      .get(`http://localhost:3001/filterUsers?${queryParams.toString()}`)
      .then((result) => setFilteredUsers(result.data))
      .catch((err) => console.error("Error fetching filtered users:", err));
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    axios
      .get(`http://localhost:3001/filterUsers`)
      .then((result) => setAllUsers(result.data))
      .catch((err) => console.error("Error fetching all users:", err));
  }, []);

  const handleDelete = (id) => {
    axios.delete(`http://localhost:3001/delete_solidwaste/${id}`)
      .then(res => {
        console.log(res);
        window.location.reload();
      })
      .catch(err => console.log(err));
  }

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
              filteredUsers.map((item) => {
                const total =
                  (item.residual || 0) +
                  (item.biodegradable || 0) +
                  (item.recyclable || 0);

                return (
                  <tr key={item._id}>
                    <td>{item.year}</td>
                    <td>{item.month}</td>
                    <td>{item.residual}</td>
                    <td>{item.biodegradable}</td>
                    <td>{item.recyclable}</td>
                    <td>{total}</td>
                    <td>
                      <Link to={`/solidwaste/${item._id}`} className='btn btn-success btn-sm'>Update</Link>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(item._id)}
                        style={{ marginLeft: '10px' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
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
