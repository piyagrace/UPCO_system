import React from 'react'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import CreateUser from './AddWaste'
import Users from './waste_table'
import Home from './Home'
import AddWater from './AddWater'
import AddAir from './AddAir'
import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

   return ( 
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path='/create' element={<CreateUser />}></Route>
        <Route path='/addwater' element={<AddWater />}></Route>
        <Route path='/addair' element={<AddAir />}></Route>
      </Routes>
    </BrowserRouter>

  )
}

export default App