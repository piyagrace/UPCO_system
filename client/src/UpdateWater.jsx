import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function UpdateWater() {
    const { id } = useParams();
    const [year, setYear] = useState('');
    const [month, setMonth] = useState('');
    const [source_tank, setSource_tank] = useState('');
    const [pH, setPH] = useState('');
    const [Color, setColor] = useState('');
    const [Fecal_Coliform, setFecal_Coliform] = useState('');
    const [TSS, setTSS] = useState('');
    const [Chloride, setChloride] = useState('');
    const [Nitrate, setNitrate] = useState('');
    const [Phosphate, setPhosphate] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const [options_source_tank] = useState([
        "U-mall Water Tank",
        "Main Water Tank",
    ]);

    // Define month options
    const [options_month] = useState([
        { value: "", label: "Select Month Range" },
        { value: "January-June", label: "January - June" },
        { value: "July-December", label: "July - December" },
    ]);

    useEffect(() => {
        axios.get(`http://localhost:3001/get_water/${id}`)
            .then(result => {
                console.log(result);
                setYear(String(result.data.year));
                setMonth(result.data.month);
                setSource_tank(String(result.data.source_tank));
                setPH(String(result.data.pH));
                setColor(String(result.data.Color));
                setFecal_Coliform(String(result.data.Fecal_Coliform));
                setTSS(String(result.data.TSS));
                setChloride(String(result.data.Chloride));
                setNitrate(String(result.data.Nitrate));
                setPhosphate(String(result.data.Phosphate));
            })
            .catch(err => {
                console.log(err);
                setError("Failed to fetch data.");
            });
    }, [id]);

    const validateInput = () => {
        // Check if year is a valid number and is a four-digit year
        if (!/^\d{4}$/.test(year)) {
            return "Please enter a valid four-digit year.";
        }
        // Check for valid month entry
        if (!month) { // Since it's a dropdown, no need to check trim
            return "Month range is required.";
        }
        // Check if source_tank is selected
        if (!source_tank) {
            return "Source Tank is required.";
        }
        // Check if residual, biodegradable, and recyclable are numbers
        if (
            isNaN(pH) ||
            isNaN(Color) ||
            isNaN(Fecal_Coliform) ||
            isNaN(Nitrate) ||
            isNaN(Phosphate) ||
            isNaN(TSS) ||
            isNaN(Chloride)
        ) {
            return "All values must be valid numbers.";
        }
        // Check if any of the values are empty
        if (
            pH === '' ||
            Color === '' ||
            Fecal_Coliform === '' ||
            TSS === '' ||
            Chloride === '' ||
            Nitrate === '' ||
            Phosphate === ''
        ) {
            return "All fields must be filled.";
        }
        return null;
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        const errorMessage = validateInput();
        if (errorMessage) {
            setError(errorMessage);
            return;
        }
        setError(''); // Clear any existing errors

        // Convert numerical fields back to numbers
        const payload = {
            year: Number(year),
            month,
            source_tank,
            pH: Number(pH),
            Color: Number(Color),
            Fecal_Coliform: Number(Fecal_Coliform),
            TSS: Number(TSS),
            Chloride: Number(Chloride),
            Nitrate: Number(Nitrate),
            Phosphate: Number(Phosphate)
        };

        axios.put(`http://localhost:3001/update_water/${id}`, payload)
            .then(result => {
                console.log(result);
                navigate('/');
            })
            .catch(err => {
                console.log(err);
                setError("An error occurred while updating the data.");
            });
    };

    return (
        <div className='d-flex vh-90 bg-success justify-content-center align-items-center'> {/* Fixed typo here */}
            <div className='w-50 bg-white rounded p-3' style={{ marginTop: "30px", marginBottom: "30px" }}>
                <form onSubmit={handleUpdate}>
                <h2>Update Water Quality Data </h2> <p>(Do not include commas in values)</p>
                    {error && <p className="text-danger">{error}</p>}
                    
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
                    
                    <div className='mb-2'>
                        <label>Month Range:</label>
                        <select
                            className='form-control'
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                        >
                            {options_month.map((option, index) => (
                                <option key={index} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-3">
                        <label htmlFor="sourceTankSelect" className="form-label">
                            Source Tank:
                        </label>
                        <select
                            id="sourceTankSelect"
                            className="form-select"
                            value={source_tank}
                            onChange={(e) => setSource_tank(e.target.value)}
                        >
                            <option value="">Select Source Tank</option>
                            {options_source_tank.map((source, index) => (
                                <option key={index} value={source}>
                                    {source}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div className='mb-2'>
                        <label>pH:</label>
                        <input
                            type="text"
                            placeholder='Enter pH'
                            className='form-control'
                            value={pH}
                            onChange={(e) => setPH(e.target.value)}
                        />
                    </div>
                    
                    <div className='mb-2'>
                        <label>Color:</label>
                        <input
                            type="text"
                            placeholder='Enter Color Value'
                            className='form-control'
                            value={Color}
                            onChange={(e) => setColor(e.target.value)}
                        />
                    </div>
                    
                    <div className='mb-2'>
                        <label>Fecal Coliform:</label>
                        <input
                            type="text"
                            placeholder='Enter Fecal Coliform Value'
                            className='form-control'
                            value={Fecal_Coliform}
                            onChange={(e) => setFecal_Coliform(e.target.value)}
                        />
                    </div>
                    
                    <div className='mb-2'>
                        <label>TSS:</label>
                        <input
                            type="text"
                            placeholder='Enter TSS Value'
                            className='form-control'
                            value={TSS}
                            onChange={(e) => setTSS(e.target.value)}
                        />
                    </div>
                    
                    <div className='mb-2'>
                        <label>Chloride:</label>
                        <input
                            type="text"
                            placeholder='Enter Chloride Value'
                            className='form-control'
                            value={Chloride}
                            onChange={(e) => setChloride(e.target.value)}
                        />
                    </div>
                    
                    <div className='mb-2'>
                        <label>Nitrate:</label>
                        <input
                            type="text"
                            placeholder='Enter Nitrate Value'
                            className='form-control'
                            value={Nitrate}
                            onChange={(e) => setNitrate(e.target.value)}
                        />
                    </div>
                    
                    <div className='mb-2'>
                        <label>Phosphate:</label>
                        <input
                            type="text"
                            placeholder='Enter Phosphate Value'
                            className='form-control'
                            value={Phosphate}
                            onChange={(e) => setPhosphate(e.target.value)}
                        />
                    </div>
                    <button className='btn btn-success'>Submit</button>
                </form>
            </div>
        </div>
    );
}

export default UpdateWater;
