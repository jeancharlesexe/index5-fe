import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DollarSign, TrendingUp, PlayCircle, RefreshCw } from 'lucide-react';
import usePageTitle from '../../hooks/usePageTitle';
import '../Cesta/Cesta.css';

const DashboardMaster = () => {
    usePageTitle('Centro de Comando | Financeiro Master');

    const [custodyData, setCustodyData] = useState([]);
    const [totalResidue, setTotalResidue] = useState(0);
    const [totalAum, setTotalAum] = useState(0);
    const [engineStatus, setEngineStatus] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const COLORS = ['#032e5e', '#ec7000', '#0ca678', '#228be6', '#7950f2', '#e64980'];

    const fetchDashboardData = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('@ItauAdmin:token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const resCustody = await axios.get('http://localhost:5246/api/v1/admin/master-account/custody', config);
            if (resCustody.data && resCustody.data.status === 200) {
                const data = resCustody.data.data;
                setCustodyData(data.custody || []);
                setTotalResidue(data.totalResidueValue || 0);
            }

            try {
                const resAum = await axios.get('http://localhost:5246/api/v1/admin/master-account/aum', config);
                if (resAum.data && resAum.data.status === 200) {
                    setTotalAum(resAum.data.data.totalAum || 0);
                }
            } catch (aumErr) {
                console.error("Erro ao carregar AUM:", aumErr);
            }

            try {
                const resStatus = await axios.get('http://localhost:5246/api/v1/engine/status', config);
                if (resStatus.data && resStatus.data.status === 200) {
                    setEngineStatus(resStatus.data.data);
                }
            } catch (statusErr) {
                console.error("Erro ao carregar status do motor:", statusErr);
            }
        } catch (error) {
            console.error("Erro ao carregar Dashboard Master:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {

        fetchDashboardData();
    }, []);

    const handleRunEngine = async () => {
        const confirmDialog = window.confirm("Atenção: Deseja forçar a execução do Motor de Compras para a data base atual?");
        if (!confirmDialog) return;

        try {
            const token = localStorage.getItem('@ItauAdmin:token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const today = new Date().toISOString().split('T')[0];
            const payload = { referenceDate: today };

            await axios.post('http://localhost:5246/api/v1/engine/execute-purchase', payload, config);
            alert("Motor de compras executado com sucesso e ativos distribuídos!");

            // Recarrega os dados
            fetchDashboardData();
        } catch (error) {
            console.error("Erro ao rodar motor de compras:", error);
            if (error.response && error.response.data && error.response.data.message) {
                alert(`Erro: ${error.response.data.message}`);
            } else {
                alert("Ocorreu um erro durante a execução do motor. Verifique se existem clientes ativos, cesta configurada e as cotações base disponíveis.");
            }
        }
    };

    const handleRunRebalance = async () => {
        const confirmDialog = window.confirm("Atenção: Deseja forçar o Motor de Rebalanceamento para corrigir desvios de proporção em todos os clientes?");
        if (!confirmDialog) return;

        try {
            const token = localStorage.getItem('@ItauAdmin:token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            await axios.post('http://localhost:5246/api/v1/engine/execute-rebalance', {}, config);
            alert("Motor de Rebalanceamento executado com sucesso e desvios foram ajustados!");

            fetchDashboardData();
        } catch (error) {
            console.error("Erro ao rodar motor de rebalanceamento:", error);
            if (error.response && error.response.data && error.response.data.message) {
                alert(`Erro: ${error.response.data.message}`);
            } else {
                alert("Ocorreu um erro durante a execução do rebalanceamento.");
            }
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
    };

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
                <p>Carregando conta master...</p>
            </div>
        );
    }

    return (
        <div className="home-container basket-page">
            <header className="page-header-simple" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="header-info-wrap">
                    <h1>DASHBOARD MASTER</h1>
                    <p>Painel consolidado da Conta Atacado Itaú e controle do Motor.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={handleRunRebalance}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#032e5e', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px rgba(3, 46, 94, 0.3)' }}
                    >
                        <RefreshCw size={20} />
                        Motor de Rebalanceamento
                    </button>
                    <button
                        onClick={handleRunEngine}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#ec7000', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px rgba(236, 112, 0, 0.3)' }}
                    >
                        <PlayCircle size={20} />
                        Executar Motor de Compras
                    </button>
                </div>
            </header>

            <div className="basket-overview-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                <div className="stat-card kpi-card-premium border-highlight">
                    <div className="stat-icon orange">
                        <DollarSign size={24} />
                    </div>
                    <div className="stat-content">
                        <span>Caixa Retido (Master)</span>
                        <h3>{formatCurrency(totalResidue)}</h3>
                        <p>Resíduo financeiro isolado</p>
                    </div>
                </div>

                <div className="stat-card kpi-card-premium">
                    <div className="stat-icon purple">
                        <TrendingUp size={24} />
                    </div>
                    <div className="stat-content">
                        <span>AUM consolidado</span>
                        <h3 className="positive-text">{formatCurrency(totalAum)}</h3>
                        <p>Capitalização total sob gestão</p>
                    </div>
                </div>

                <div className="stat-card kpi-card-premium">
                    <div className="stat-icon blue">
                        <PlayCircle size={24} />
                    </div>
                    <div className="stat-content" style={{ width: '100%' }}>
                        <span>Status do Motor de Compra</span>
                        <h3 style={{ fontSize: '1.25rem' }}>{engineStatus ? new Date(engineStatus.nextPurchaseDate).toLocaleDateString('pt-BR') : 'Carregando...'}</h3>
                        <div style={{ marginTop: '10px', width: '100%' }}>
                            <div style={{ height: '6px', width: '100%', backgroundColor: '#dee2e6', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{
                                    height: '100%',
                                    width: `${engineStatus?.progressPercentage || 0}%`,
                                    backgroundColor: '#ec7000',
                                    transition: 'width 0.5s ease-in-out'
                                }}></div>
                            </div>
                            <p style={{ fontSize: '11px', color: '#868e96', marginTop: '4px' }}>Próxima execução agendada</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="dashboard-content-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.7fr', gap: '24px', alignItems: 'start' }}>
                <div className="edit-card chart-card">
                    <div className="card-header dashboard-header-wrap">
                        <h2>Alocação</h2>
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

export default DashboardMaster;
