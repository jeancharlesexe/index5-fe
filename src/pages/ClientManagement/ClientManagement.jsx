import React, { useState, useEffect } from 'react';
import axios from 'axios';
import usePageTitle from '../../hooks/usePageTitle';
import '../Home/Home.css';
import './ClientManagement.css';
import {
    UserCheck, Clock, CheckCircle, Search, UserX,
    Fingerprint, Mail, Wallet, UserMinus, DollarSign
} from 'lucide-react';
import Modal from '../../components/Modal/Modal';

const ClientManagement = () => {
    usePageTitle('Gestão de Clientes');
    const [pendingClients, setPendingClients] = useState([]);
    const [approvedClients, setApprovedClients] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters & Pagination for Pending
    const [searchTerm, setSearchTerm] = useState('');
    const [minValue, setMinValue] = useState('');
    const [maxValue, setMaxValue] = useState('');
    const [pendingPage, setPendingPage] = useState(1);
    const [pendingTotalPages, setPendingTotalPages] = useState(1);

    // Filters & Pagination for Active
    const [activeSearchTerm, setActiveSearchTerm] = useState('');
    const [activeMinValue, setActiveMinValue] = useState('');
    const [activeMaxValue, setActiveMaxValue] = useState('');
    const [activePage, setActivePage] = useState(1);
    const [activeTotalPages, setActiveTotalPages] = useState(1);

    const pageSize = 10;
    const activePageSize = 5;

    // Modal states
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null,
        type: 'info',
        confirmText: ''
    });

    const fetchClients = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('@ItauAdmin:token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            // 1. Fetch PENDING
            try {
                const params = new URLSearchParams({
                    page: pendingPage,
                    pageSize: pageSize,
                    name: searchTerm,
                    minValue: minValue || '',
                    maxValue: maxValue || ''
                });
                console.log(`Buscando Pendentes: http://localhost:5246/api/v1/admin/clients/pending?${params}`);
                const res = await axios.get(`http://localhost:5246/api/v1/admin/clients/pending?${params}`, config);

                if (res.data && res.data.status === 200) {
                    console.log("Pendentes recebidos:", res.data.data.items);
                    setPendingClients(Array.isArray(res.data.data.items) ? res.data.data.items : []);
                    setPendingTotalPages(res.data.data.totalPages || 1);
                }
            } catch (pErr) {
                console.error("ERRO na API de Pendentes:", pErr.message);
                // Opcional: Limpar lista ou manter anterior caso queira forçar a busca real
                // setPendingClients([]); 
            }

            // 2. Fetch ACTIVE
            try {
                const paramsActive = new URLSearchParams({
                    page: activePage,
                    pageSize: activePageSize,
                    name: activeSearchTerm,
                    minValue: activeMinValue || '',
                    maxValue: activeMaxValue || ''
                });
                console.log(`Buscando Ativos: http://localhost:5246/api/v1/admin/clients/active?${paramsActive}`);
                const resActive = await axios.get(`http://localhost:5246/api/v1/admin/clients/active?${paramsActive}`, config);

                if (resActive.data && resActive.data.status === 200) {
                    console.log("Ativos recebidos:", resActive.data.data.items);
                    setApprovedClients(Array.isArray(resActive.data.data.items) ? resActive.data.data.items : []);
                    setActiveTotalPages(resActive.data.data.totalPages || 1);
                }
            } catch (aErr) {
                console.error("ERRO na API de Ativos:", aErr.message);
            }
            setError(null);
        } catch (err) {
            console.error("Erro crítico:", err);
            setError("Erro ao carregar dados.");
        } finally {
            setIsLoading(false);
        }
    };

    // Debounced effect for filtering
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchClients();
        }, 500);
        return () => clearTimeout(timer);
    }, [pendingPage, activePage, searchTerm, activeSearchTerm, minValue, maxValue, activeMinValue, activeMaxValue]);

    const handleApproveClick = (client) => {
        setConfirmModal({
            isOpen: true,
            title: 'Confirmar Aprovação',
            message: `Deseja aprovar a entrada do investidor ${client.name} no sistema?`,
            type: 'info',
            confirmText: 'Aprovar',
            onConfirm: () => performApprove(client.clientId || client.id)
        });
    };

    const performApprove = async (id) => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
            const token = localStorage.getItem('@ItauAdmin:token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post(`http://localhost:5246/api/v1/admin/clients/${id}/approve`, {}, config);
            fetchClients();
        } catch (err) {
            alert('Erro ao aprovar cliente.');
        }
    };

    const handleRejectClick = (client) => {
        setConfirmModal({
            isOpen: true,
            title: 'Recusar Investidor',
            message: `Deseja recusar a solicitação de ${client.name}? Esta ação não pode ser desfeita.`,
            type: 'danger',
            confirmText: 'Recusar',
            onConfirm: () => performReject(client.clientId || client.id)
        });
    };

    const performReject = async (id) => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
            const token = localStorage.getItem('@ItauAdmin:token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post(`http://localhost:5246/api/v1/admin/clients/${id}/reject`, {}, config);
            fetchClients();
        } catch (err) {
            alert('Erro ao recusar cliente.');
        }
    };

    const handleDeactivateClick = (client) => {
        setConfirmModal({
            isOpen: true,
            title: 'Desativar Cliente',
            message: `Deseja desativar permanentemente o investidor ${client.name}? Ele deixará de operar e o histórico de saída será gerado.`,
            type: 'danger',
            confirmText: 'Desativar',
            onConfirm: () => performDeactivate(client.clientId || client.id)
        });
    };

    const performDeactivate = async (id) => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
            const token = localStorage.getItem('@ItauAdmin:token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post(`http://localhost:5246/api/v1/admin/clients/${id}/deactivate`, {}, config);
            fetchClients();
        } catch (err) {
            alert('Erro ao desativar cliente.');
        }
    };

    return (
        <div className="basket-page client-mgmt-page">
            <header className="page-header-simple">
                <div className="header-info-wrap">
                    <h1>GESTÃO DE CLIENTES</h1>
                    <p>Controle de admissão de investidores e monitoramento da base ativa.</p>
                </div>
            </header>

            <div className="client-dashboard-grid">
                {/* LEFT COLUMN - PENDING */}
                <div className="client-col-left">
                    <div className="stat-card mb-24">
                        <div className="active-tag">{pendingClients.length} PENDENTES</div>
                        <div className="stat-icon">
                            <Clock size={24} />
                        </div>
                        <div className="stat-content">
                            <span>Aguardando</span>
                            <h3>Fila de Aprovação</h3>
                            <p>Ações pendentes de revisão</p>
                        </div>
                    </div>

                    <div className="edit-card">
                        <div className="card-header">
                            <Clock size={20} color="#ec7000" />
                            <h2>SOLICITAÇÕES DE ADESÃO</h2>
                        </div>

                        <p className="edit-hint">Revise os dados abaixo antes de aprovar a criação da conta.</p>

                        <div className="search-box-wrap">
                            <div className="search-inner-icon">
                                <Search size={16} />
                            </div>
                            <input
                                type="text"
                                placeholder="Nome, E-mail ou CPF..."
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setPendingPage(1); }}
                            />
                        </div>

                        <div className="range-inputs-premium">
                            <label>FAIXA DE VALOR:</label>
                            <div className="range-group">
                                <input
                                    type="number"
                                    placeholder="Mín R$"
                                    value={minValue}
                                    onChange={(e) => { setMinValue(e.target.value); setPendingPage(1); }}
                                />
                                <span>até</span>
                                <input
                                    type="number"
                                    placeholder="Máx R$"
                                    value={maxValue}
                                    onChange={(e) => { setMaxValue(e.target.value); setPendingPage(1); }}
                                />
                            </div>
                        </div>

                        <div className="draft-items-list" style={{ marginTop: '10px' }}>
                            {pendingClients.length === 0 ? (
                                <div className="slots-remaining">
                                    <CheckCircle size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
                                    <p>Nenhuma solicitação pendente no momento.</p>
                                </div>
                            ) : (
                                pendingClients.map(client => (
                                    <div key={client?.clientId || client?.id} className="draft-item client-premium-card">
                                        <div className="item-main">
                                            <div className="index-circle">
                                                <Fingerprint size={14} />
                                            </div>
                                            <div className="client-data-wrap">
                                                <span className="ticker-label">{client.name}</span>
                                                <span className="percent-tag">{client.email}</span>
                                                <span className="client-cpf-sub">{client.cpf}</span>
                                            </div>
                                        </div>
                                        <div className="item-meta" style={{ flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                                            <span className="value-badge">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(client.monthlyValue || 0)}
                                            </span>
                                            <div className="card-actions-premium">
                                                <button className="remove-btn" onClick={() => handleRejectClick(client)} title="Recusar">
                                                    <UserX size={20} />
                                                </button>
                                                <button className="approve-btn-premium" onClick={() => handleApproveClick(client)} title="Aprovar">
                                                    <UserCheck size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {pendingTotalPages > 1 && (
                            <div className="pagination-controls">
                                <button disabled={pendingPage === 1} onClick={() => setPendingPage(p => p - 1)}>Anterior</button>
                                <span>{pendingPage} / {pendingTotalPages}</span>
                                <button disabled={pendingPage === pendingTotalPages} onClick={() => setPendingPage(p => p + 1)}>Próxima</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN - ACTIVE */}
                <div className="client-col-right">
                    <div className="stat-cards-row mb-24">
                        <div className="stat-card">
                            <div className="stat-icon blue">
                                <UserCheck size={24} />
                            </div>
                            <div className="stat-content">
                                <span>Base Total</span>
                                <h3>Clientes Ativos</h3>
                                <p>{approvedClients.length} usuários investindo</p>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon green">
                                <DollarSign size={24} />
                            </div>
                            <div className="stat-content">
                                <span>Fluxo</span>
                                <h3>Volume Médio</h3>
                                <p>Adesões por período</p>
                            </div>
                        </div>
                    </div>

                    <div className="edit-card">
                        <div className="card-header">
                            <UserCheck size={20} color="#198754" />
                            <h2>BASE DE INVESTIDORES ATIVOS</h2>
                        </div>

                        <p className="edit-hint">Lista de clientes processados pelo motor de compra.</p>

                        <div className="search-box-wrap">
                            <div className="search-inner-icon">
                                <Search size={16} />
                            </div>
                            <input
                                type="text"
                                placeholder="Buscar na base ativa..."
                                value={activeSearchTerm}
                                onChange={(e) => { setActiveSearchTerm(e.target.value); setActivePage(1); }}
                            />
                        </div>

                        <div className="range-inputs-premium">
                            <label>FAIXA DE VALOR:</label>
                            <div className="range-group">
                                <input
                                    type="number"
                                    placeholder="Mín R$"
                                    value={activeMinValue}
                                    onChange={(e) => { setActiveMinValue(e.target.value); setActivePage(1); }}
                                />
                                <span>até</span>
                                <input
                                    type="number"
                                    placeholder="Máx R$"
                                    value={activeMaxValue}
                                    onChange={(e) => { setActiveMaxValue(e.target.value); setActivePage(1); }}
                                />
                            </div>
                        </div>

                        <div className="client-table-wrapper premium-table-wrap">
                            <table className="client-table">
                                <thead>
                                    <tr>
                                        <th>INVESTIDOR</th>
                                        <th>CPF</th>
                                        <th>VALOR</th>
                                        <th>CONTA</th>
                                        <th style={{ textAlign: 'center' }}>AÇÃO</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {approvedClients.map(client => (
                                        <tr key={client.clientId || client.id}>
                                            <td>
                                                <div className="table-client-info">
                                                    <strong>{client.name}</strong>
                                                    <span>{client.email}</span>
                                                </div>
                                            </td>
                                            <td><span className="cpf-table">{client.cpf}</span></td>
                                            <td><span className="val-table">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(client.monthlyValue || 0)}</span></td>
                                            <td><code className="account-code-premium">{client.accountNumber}</code></td>
                                            <td style={{ textAlign: 'center' }}>
                                                <button className="btn-deactivate-premium" onClick={() => handleDeactivateClick(client)}>
                                                    <UserMinus size={16} />
                                                    SAIR
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {activeTotalPages > 1 && (
                            <div className="pagination-controls" style={{ marginTop: 'auto' }}>
                                <button disabled={activePage === 1} onClick={() => setActivePage(p => p - 1)}>Anterior</button>
                                <span>{activePage} / {activeTotalPages}</span>
                                <button disabled={activePage === activeTotalPages} onClick={() => setActivePage(p => p + 1)}>Próxima</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Modal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
                confirmText={confirmModal.confirmText}
            />
        </div>
    );
};

export default ClientManagement;
