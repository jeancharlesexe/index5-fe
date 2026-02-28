import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Briefcase, Users, DollarSign, TrendingUp } from 'lucide-react';
import usePageTitle from '../../hooks/usePageTitle';
import './Dashboard.css';

const Dashboard = () => {
    usePageTitle('Centro de Comando | Dashboard');

    const [custodyData, setCustodyData] = useState([]);
    const [totalResidue, setTotalResidue] = useState(0);
    const [totalAUM, setTotalAUM] = useState(0);
    const [activeClientsCount, setActiveClientsCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const COLORS = ['#032e5e', '#ec7000', '#0ca678', '#228be6', '#7950f2', '#e64980'];

    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            try {
                const token = localStorage.getItem('@ItauAdmin:token');
                const config = { headers: { Authorization: `Bearer ${token}` } };

                // 1. Fetch Custody
                const resCustody = await axios.get('http://localhost:5246/api/v1/admin/master-account/custody', config);
                let custodyItems = [];
                let residue = 0;
                let calculatedAUM = 0;

                if (resCustody.data && resCustody.data.status === 200) {
                    const data = resCustody.data.data;
                    custodyItems = data.custody || [];
                    residue = data.totalResidueValue || 0;

                    const custodySum = custodyItems.reduce((acc, item) => acc + (item.currentValue * item.quantity), 0);
                    calculatedAUM = residue + custodySum;

                    setCustodyData(custodyItems);
                    setTotalResidue(residue);
                    setTotalAUM(calculatedAUM);
                }

                // 2. Fetch Active Clients
                const resClients = await axios.get('http://localhost:5246/api/v1/admin/clients/active?page=1&pageSize=1', config);
                if (resClients.data && resClients.data.status === 200) {
                    setActiveClientsCount(resClients.data.data.totalCount || 0);
                }

            } catch (error) {
                console.error("Erro ao carregar Dashboard:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
    };

    // Format data for chart
    const chartData = custodyData.map(item => ({
        name: item.ticker,
        value: item.currentValue * item.quantity
    }));

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip premium-tooltip">
                    <p className="label">{`${payload[0].name}`}</p>
                    <p className="intro">Alocação: <strong>{formatCurrency(payload[0].value)}</strong></p>
                </div>
            );
        }
        return null;
    };

    if (isLoading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner"></div>
                <p>Carregando informações da conta master...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-page client-mgmt-page">
            <header className="page-header-simple premium-header-titles">
                <span className="greeting-text">Painel Consolidado de Gestão</span>
                <h1>Centro de Comando <span className="title-separator">•</span> Wealth Management</h1>
            </header>

            {/* KPI Cards */}
            <div className="kpi-grid mb-24">
                <div className="stat-card kpi-card-premium">
                    <div className="stat-icon blue">
                        <Briefcase size={24} />
                    </div>
                    <div className="stat-content">
                        <span>AUM Total</span>
                        <h3>{formatCurrency(totalAUM)}</h3>
                        <p>Patrimônio sob gestão</p>
                    </div>
                </div>

                <div className="stat-card kpi-card-premium">
                    <div className="stat-icon green">
                        <Users size={24} />
                    </div>
                    <div className="stat-content">
                        <span>Base Ativa</span>
                        <h3>{activeClientsCount} Investidores</h3>
                        <p>Total de CPFs investindo</p>
                    </div>
                </div>

                <div className="stat-card kpi-card-premium border-highlight">
                    <div className="stat-icon orange">
                        <DollarSign size={24} />
                    </div>
                    <div className="stat-content">
                        <span>Caixa</span>
                        <h3>{formatCurrency(totalResidue)}</h3>
                        <p>Resíduo financeiro (Conta Master)</p>
                    </div>
                </div>

                <div className="stat-card kpi-card-premium">
                    <div className="stat-icon purple">
                        <TrendingUp size={24} />
                    </div>
                    <div className="stat-content">
                        <span>Performance Média</span>
                        <h3 className="positive-text">+2.4% no mês</h3>
                        <p>Taxa de crescimento geral</p>
                    </div>
                </div>
            </div>

            {/* Content Split: Chart & Table */}
            <div className="dashboard-content-grid">
                {/* Chart Section */}
                <div className="edit-card chart-card">
                    <div className="card-header dashboard-header-wrap">
                        <h2>Alocação da Conta Master</h2>
                        <span>Distribuição de patrimônio investido.</span>
                    </div>
                    <div className="chart-container">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={110}
                                        paddingAngle={5}
                                        dataKey="value"
                                        animationDuration={800}
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="empty-chart">Nenhum ativo alocado no momento.</div>
                        )}
                    </div>
                </div>

                {/* Table Section */}
                <div className="edit-card table-card">
                    <div className="card-header dashboard-header-wrap">
                        <h2>Ativos Consolidados</h2>
                        <span>Posição detalhada por papel da Conta Master.</span>
                    </div>
                    <div className="premium-table-wrap">
                        <table className="client-table dashboard-table">
                            <thead>
                                <tr>
                                    <th>ATIVO</th>
                                    <th style={{ textAlign: 'right' }}>QTDE</th>
                                    <th style={{ textAlign: 'right' }}>PM COMPRA</th>
                                    <th style={{ textAlign: 'right' }}>COTAÇÃO ATUAL</th>
                                    <th style={{ textAlign: 'right' }}>VALOR TOTAL</th>
                                </tr>
                            </thead>
                            <tbody>
                                {custodyData.length > 0 ? (
                                    custodyData.map((item, index) => {
                                        const isPositive = item.currentValue >= item.averagePrice;
                                        return (
                                            <tr key={index}>
                                                <td>
                                                    <div className="ticker-badge" style={{ borderLeftColor: COLORS[index % COLORS.length] }}>
                                                        {item.ticker}
                                                    </div>
                                                </td>
                                                <td style={{ textAlign: 'right', fontWeight: '600' }}>
                                                    {item.quantity.toLocaleString('pt-BR')} cota{item.quantity > 1 ? 's' : ''}
                                                </td>
                                                <td style={{ textAlign: 'right' }}>{formatCurrency(item.averagePrice)}</td>
                                                <td style={{ textAlign: 'right' }} className={isPositive ? "val-positive" : "val-negative"}>
                                                    {formatCurrency(item.currentValue)}
                                                </td>
                                                <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#032e5e' }}>
                                                    {formatCurrency(item.currentValue * item.quantity)}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>
                                            Nenhum ativo processado pela conta Master.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
