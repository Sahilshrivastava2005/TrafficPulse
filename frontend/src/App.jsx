import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import Header from './components/Header';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import MapView from './pages/Map';
import Insights from './pages/Insights';
import Dispatcher from './pages/Dispatcher';
import './index.css';

const DashboardLayout = () => {
  return (
    <div className="app-container">
      <div className="main-wrapper">
        <Header />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/dispatcher" element={<Dispatcher />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
