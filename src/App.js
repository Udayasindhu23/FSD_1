import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import LinearProgramming from './pages/LinearProgramming';
import CombinatorialOptimization from './pages/CombinatorialOptimization';
import NonLinearProgramming from './pages/NonLinearProgramming';
import InfiniteDimensional from './pages/InfiniteDimensional';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/linear-programming" element={<LinearProgramming />} />
            <Route path="/combinatorial-optimization" element={<CombinatorialOptimization />} />
            <Route path="/non-linear-programming" element={<NonLinearProgramming />} />
            <Route path="/infinite-dimensional" element={<InfiniteDimensional />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
