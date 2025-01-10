import React from 'react'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import AddWaste from './AddWaste'
import Home from './Home'
import AddWater from './AddWater'
import AddAir from './AddAir'
import UpdateWaste from './UpdateWaste'
import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

   return ( 
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path='/addwaste' element={<AddWaste />}></Route>
        <Route path='/addwater' element={<AddWater />}></Route>
        <Route path='/addair' element={<AddAir />}></Route>
        <Route path='/solidwaste/:id' element={<UpdateWaste />}></Route>
      </Routes>
    </BrowserRouter>

  )
}

export default App