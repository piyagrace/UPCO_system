import React, { useState } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AddWater() {
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [residual, setResidual] = useState('');
  const [biodegradable, setBiodegradable] = useState('');
  const [recyclable, setRecyclable] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // List of months for the dropdown
  const monthsList = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const validateInput = () => {
    // Check if year is a valid number and is a four-digit year
    if (!/^\d{4}$/.test(year)) {
      return "Please enter a valid four-digit year.";
    }
    // Check for valid month entry
    if (!month || month.trim().length === 0) {
      return "Month is required.";
    }
    // Check if residual, biodegradable, and recyclable are numbers
    if (isNaN(residual) || isNaN(biodegradable) || isNaN(recyclable)) {
      return "Residual, Biodegradable, and Recyclable must be valid numbers.";
    }
    // Check if any of the values are empty
    if (residual.trim() === '' || biodegradable.trim() === '' || recyclable.trim() === '') {
      return "All fields must be filled.";
    }
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errorMessage = validateInput();
    if (errorMessage) {
      setError(errorMessage);
      return;
    }
    setError(''); // Clear any existing errors

    axios.post("http://localhost:3001/add_solidwaste", { 
      year, 
      month, 
      residual, 
      biodegradable, 
      recyclable 
    })
      .then(result => {
        console.log(result);
        navigate('/');
      })
      .catch(err => {
        console.log(err);
        setError('Failed to create data. Please try again.');
      });
  };

  return (
    <div className='d-flex vh-100 bg-success justify-content-center align-items-center'>
      <div className='w-50 bg-white rounded p-3' style={{ marginTop: "30px", marginBottom: "30px" }}>
        <form onSubmit={handleSubmit}>
          <h2>Add Solid Waste Data</h2> 
          <p>(Do not include commas in values)</p>
          {error && <p className="text-danger">{error}</p>}

          {/* Year */}
          <div className='mb-2'>
            <label>Year:</label>
            <input 
              type="text" 
              placeholder='Enter Year' 
              className='form-control'
              value={year}
              onChange={(e) => setYear(e.target.value)} 
            />
          </div>

          {/* Month (Dropdown) */}
          <div className='mb-2'>
            <label>Month:</label>
            <select
              className='form-control'
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            >
              <option value="">Select Month</option>
              {monthsList.map((m, idx) => (
                <option key={idx} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Residual */}
          <div className='mb-2'>
            <label>Residual (kg):</label>
            <input 
              type="text" 
              placeholder='Enter Quantity' 
              className='form-control'
              value={residual}
              onChange={(e) => setResidual(e.target.value)}
            />
          </div>

          {/* Recyclable */}
          <div className='mb-2'>
            <label>Recyclable (kg):</label>
            <input 
              type="text" 
              placeholder='Enter Quantity' 
              className='form-control'
              value={recyclable}
              onChange={(e) => setRecyclable(e.target.value)}
            />
          </div>

          {/* Biodegradable */}
          <div className='mb-2'>
            <label>Biodegradable (kg):</label>
            <input 
              type="text" 
              placeholder='Enter Quantity' 
              className='form-control'
              value={biodegradable}
              onChange={(e) => setBiodegradable(e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <button className='btn btn-success'>Submit</button>
        </form>
      </div>
    </div>
  );
}

export default AddWater;
