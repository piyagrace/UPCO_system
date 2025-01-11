import React from 'react'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import AddWaste from './AddWaste'
import Home from './Home'
import AddWater from './AddWater'
import AddAir from './AddAir'
import UpdateWaste from './UpdateWaste'
import { useState } from 'react'
import UpdateWater from './UpdateWater'
import UpdateAir from './UpdateAir'

function App() {
  const [count, setCount] = useState(0)

   return ( 
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path='/addwaste' element={<AddWaste />}></Route>
        <Route path='/addwater' element={<AddWater />}></Route>
        <Route path='/addair' element={<AddAir />}></Route>
        <Route path='/update/solidwaste/:id' element={<UpdateWaste />}></Route>
        <Route path='/update/water/:id' element={<UpdateWater />}></Route>
        <Route path='/update/air/:id' element={<UpdateAir />}></Route>
      </Routes>
    </BrowserRouter>

  )
}

export default App