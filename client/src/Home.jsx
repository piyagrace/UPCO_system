import React from "react"; 
import { Link } from "react-router-dom";
import WasteQualityChart from "./waste_charts.jsx";
import WaterQualityChart from "./water_charts.jsx";
import AirQualityChart from "./air_charts.jsx";
import WasteTable from "./waste_table.jsx";

function Home() {

  return (
    <div className="d-flex vh-70 bg-success justify-content-center align-items-center">
      <div
        className="w-75 bg-white rounded p-3"
        style={{ marginTop: "30px", marginBottom: "30px" }}>
        {/* Add New Record Button */}
        <Link to="/create" className="btn btn-success mb-3">
          Add Solid Waste
        </Link>

        <Link to="/addwater" className="btn btn-success mb-3">
          Add Water Data
        </Link>

        <Link to="/addair" className="btn btn-success mb-3">
          Add Air Data
        </Link>

        {/*Tables*/}
        <WasteTable />

        {/*Charts*/}
        <WasteQualityChart />
        <WaterQualityChart />
        <AirQualityChart />
      </div>
    </div>
  );
}

export default Home;
