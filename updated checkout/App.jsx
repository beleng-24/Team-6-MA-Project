import React from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Checkout from './pages/Checkout'

export default function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/" element={<Home/>} />
      </Routes>
    </BrowserRouter>
  )
}

function Home(){
  return (
    <div style={{padding:40}}>
      <h1>Demo</h1>
      <p><Link to="/checkout">Go to Checkout</Link></p>
    </div>
  )
}
