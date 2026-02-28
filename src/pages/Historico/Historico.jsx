import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, CheckCircle, Archive, Shield, Layers, TrendingUp, Info } from 'lucide-react';
import usePageTitle from '../../hooks/usePageTitle';
import './Historico.css';

const Historico = () => {
    usePageTitle('Histórico | Gestão Estratégica');
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchHistory = async () => {
        try {
            const token = localStorage.getItem('@ItauAdmin:token');
            const res = await axios.get('http://localhost:5246/api/v1/admin/basket/history', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data && res.data.status === 200) {
                setHistory(res.data.data.baskets || []);
            }
        } catch (error) {
            console.error("Erro ao carregar histórico:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "-";
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading) return <div className="dashboard-loading"><div className="spinner"></div><p>Carregando histórico estratégico...</p></div>;

    return (
        <div className="home-container basket-page">
            <header className="page-header-simple" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="header-info-wrap">
                    <h1>HISTÓRICO DE ESTRATÉGIAS</h1>
                    <p>Relatório consolidado das cestas de recomendação e suas vigências operacionais.</p>
                </div>
                <div className="header-actions">
                    <button
                        onClick={fetchHistory}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#ec7000', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 12px rgba(236, 112, 0, 0.2)' }}
                    >
                        Recarregar Histórico
                    </button>
                </div>
            </header>

            <div className="history-grid">
                {history.length > 0 ? (
                    history.map((basket) => (
                        <div key={basket.basketId} className={`history-card ${basket.active ? 'active' : 'archived'}`}>
                            {basket.active && (
                                <div className="active-tag" style={{ top: 0, right: 0, borderRadius: '0 0 0 16px', padding: '10px 15px' }}>
                                    <TrendingUp size={14} style={{ marginRight: '6px' }} /> VIGENTE
                                </div>
                            )}

                            <div className="card-top">
                                <div className="card-title-area">
                                    <h3>{basket.name}</h3>
                                    <p><Shield size={14} /> ID: {basket.basketId ? basket.basketId.toString().padStart(4, '0') : 'N/A'}</p>
                                </div>
                                <div className="status-pills">
                                    {!basket.active && (
                                        <span className="pill archived"><Archive size={14} style={{ marginRight: '6px' }} /> ARQUIVADA</span>
                                    )}
                                </div>
                            </div>

                            <div className="card-body">
                                <div className="dates-info">
                                    <div className="date-item">
                                        <div className="date-label"><Calendar size={12} style={{ marginRight: '4px' }} /> Criada em</div>
                                        <div className="date-value">{formatDate(basket.createdAt)}</div>
                                    </div>
                                    <div className="date-item">
                                        <div className="date-label"><Archive size={12} style={{ marginRight: '4px' }} /> Desativada em</div>
                                        <div className="date-value">{formatDate(basket.deactivatedAt)}</div>
                                    </div>
                                </div>

                                <div className="assets-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#495057', fontWeight: 'bold' }}>
                                    <Layers size={16} /> Composição de Ativos
                                </div>

                                <div className="assets-composition">
                                    {(basket.items || []).map((item, idx) => (
                                        <div key={idx} className="asset-pill">
                                            <span className="ticker">{item.ticker}</span>
                                            <span className="percentage">{item.percentage}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-history">
                        <Info size={48} color="#adb5bd" />
                        <h2>Nenhum registro encontrado</h2>
                        <p>O histórico de cestas aparecerá aqui conforme novas estratégias forem cadastradas.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Historico;
