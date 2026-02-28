import React, { useState } from 'react';
import './Sidebar.css';
import { LayoutDashboard, ShoppingCart, History, FileText, Settings, Menu, UserCheck, DollarSign } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import logoItau from '../../assets/icons/logo-itau.png';

const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-logo">
                <div className="logo-header">
                    {!isCollapsed && (
                        <div className="logo-itau">
                            <img src={logoItau} alt="Itaú" />
                            <span>Itaú Corretora</span>
                        </div>
                    )}
                    <Menu className="menu-icon" size={20} onClick={toggleSidebar} style={{ margin: isCollapsed ? '0 auto' : '4px 0 0 0' }} />
                </div>
                {!isCollapsed && <div className="admin-badge">ADMINISTRATIVO</div>}
            </div>

            <nav className="sidebar-nav">
                <ul className="nav-list">
                    <li>
                        <NavLink to="/admin/dashboard-master" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} title="Dashboard Master">
                            <LayoutDashboard size={20} />
                            {!isCollapsed && <span>Dashboard Master</span>}
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/admin/basket" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} title="Cesta Top Five">
                            <ShoppingCart size={20} />
                            {!isCollapsed && <span>Configurar Cesta</span>}
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/admin/clients" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} title="Gestão de Clientes">
                            <UserCheck size={20} />
                            {!isCollapsed && <span>Gestão de Clientes</span>}
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/admin/history" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} title="Histórico de Cestas">
                            <History size={20} />
                            {!isCollapsed && <span>Histórico de Cestas</span>}
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/admin/reports" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} title="Relatórios">
                            <FileText size={20} />
                            {!isCollapsed && <span>Relatórios</span>}
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/admin/settings" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} title="Configurações">
                            <Settings size={20} />
                            {!isCollapsed && <span>Configurações</span>}
                        </NavLink>
                    </li>
                </ul>
            </nav>

            <div className="sidebar-footer">
                {!isCollapsed ? (
                    <div className="motor-info schedule-box">
                        <p>Ciclo Mensal de Aporte</p>
                        <div className="schedule-days">
                            <div className="day-pill">05</div>
                            <div className="day-pill">15</div>
                            <div className="day-pill">25</div>
                        </div>
                        <span className="schedule-hint">Distribuição 1/3 por data base</span>
                    </div>
                ) : (
                    <div className="motor-info collapsed-motor" title="Aportes: Dias 05, 15 e 25">
                        <DollarSign size={18} color="#ec7000" />
                    </div>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
