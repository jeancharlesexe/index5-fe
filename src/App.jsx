import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Login from './pages/Login/Login';
import AdminLayout from './components/AdminLayout/AdminLayout';
import Cesta from './pages/Cesta/Cesta';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import DashboardMaster from './pages/DashboardMaster/DashboardMaster';
import Historico from './pages/Historico/Historico';
import Relatorios from './pages/Relatorios/Relatorios';
import Configuracoes from './pages/Configuracoes/Configuracoes';
import GestaoClientes from './pages/GestaoClientes/GestaoClientes';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard-master" replace />} />
              <Route path="dashboard-master" element={<DashboardMaster />} />
              <Route path="basket" element={<Cesta />} />
              <Route path="clients" element={<GestaoClientes />} />
              <Route path="history" element={<Historico />} />
              <Route path="reports" element={<Relatorios />} />
              <Route path="settings" element={<Configuracoes />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
