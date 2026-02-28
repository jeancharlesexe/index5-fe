import React, { useState, useEffect } from 'react';
import axios from 'axios';
import usePageTitle from '../../hooks/usePageTitle';
import './Cesta.css';
import {
    LayoutDashboard, PlusCircle, ArrowRightCircle, Save, XCircle,
    TrendingUp, History, Info, AlertTriangle, CheckCircle2, Search, Trash2
} from 'lucide-react';
import Modal from '../../components/Modal/Modal';
import Button from '../../components/Button/Button';

const Cesta = () => {
    usePageTitle('Cesta Top Five');

    // States
    const [basketData, setBasketData] = useState(null);
    const [availableAssets, setAvailableAssets] = useState([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [basketName, setBasketName] = useState('');

    // State for local editing (clone of current items)
    const [newBasketItems, setNewBasketItems] = useState([]);

    // Modal states
    const [modalInfo, setModalInfo] = useState({
        isOpen: false, title: '', message: '', onConfirm: null, type: 'info'
    });

    // Fetch current basket data on mount
    const fetchCurrentBasket = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('@ItauAdmin:token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const response = await axios.get('http://localhost:5246/api/v1/admin/basket/current', config);

            if (response.data && response.data.status === 200) {
                setBasketData(response.data.data);
                // When data is loaded, sync edit state
                if (response.data.data.items) {
                    setNewBasketItems(response.data.data.items.map(i => ({
                        ticker: i.ticker,
                        percentage: i.percentage
                    })));
                }
            }
        } catch (error) {
            console.error("Erro ao buscar cesta atual:", error);
            if (error.response && error.response.status === 404) {
                setBasketData(null);
                setNewBasketItems([]);
            } else {
                setBasketData(null);
                setNewBasketItems([]);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch all available assets
    const fetchAssets = async () => {
        try {
            const token = localStorage.getItem('@ItauAdmin:token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const response = await axios.get('http://localhost:5246/api/v1/admin/assets', config);
            if (response.data && response.data.status === 200) {
                setAvailableAssets(response.data.data);
            }
        } catch (error) {
            console.error("Erro ao buscar ativos disponíveis:", error);
            setAvailableAssets(["ITUB4", "VALE3", "PETR4", "BBDC4", "ABEV3", "STBP3", "RADL3", "HYPE3", "ELET3"]);
        }
    };

    useEffect(() => {
        fetchCurrentBasket();
        fetchAssets();
    }, []);

    // Helper functions
    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const toggleEdit = () => {
        if (!isEditMode) {
            // Enter edit mode: ensure local list matches current
            setNewBasketItems(basketData?.items.map(i => ({
                ticker: i.ticker,
                percentage: i.percentage
            })) || []);
            setBasketName(basketData?.name || '');
        }
        setIsEditMode(!isEditMode);
    };

    const addAssetToDraft = (ticker) => {
        if (newBasketItems.length >= 5) {
            alert('A cesta deve conter exatamente 5 ativos.');
            return;
        }
        if (newBasketItems.some(i => i.ticker === ticker)) {
            alert('Ativo já está na cesta selecionada.');
            return;
        }

        // Default to remaining percentage if possible, else 0
        const currentTotal = newBasketItems.reduce((sum, item) => sum + item.percentage, 0);
        const defaultPercent = Math.max(0, 100 - currentTotal);

        setNewBasketItems([...newBasketItems, { ticker, percentage: 0 }]);
        setSearchTerm('');
    };

    const removeFromDraft = (ticker) => {
        setNewBasketItems(newBasketItems.filter(i => i.ticker !== ticker));
    };

    const handlePercentageChange = (ticker, value) => {
        const val = parseFloat(value) || 0;
        setNewBasketItems(newBasketItems.map(item =>
            item.ticker === ticker ? { ...item, percentage: val } : item
        ));
    };

    const totalPercentage = newBasketItems.reduce((sum, item) => sum + item.percentage, 0);

    const handleSaveNewBasket = async () => {
        if (!basketName.trim()) {
            alert('Por favor, dê um nome para a estratégia.');
            return;
        }

        if (newBasketItems.length !== 5) {
            setModalInfo({
                isOpen: true,
                title: 'Erro na Cesta',
                message: `Você selecionou ${newBasketItems.length} ativos. Para rebalancear, a cesta Itaú Top 5 exige exatamente 5 ativos.`,
                type: 'danger',
                onConfirm: () => setModalInfo(prev => ({ ...prev, isOpen: false }))
            });
            return;
        }

        if (totalPercentage !== 100) {
            setModalInfo({
                isOpen: true,
                title: 'Peso Incorreto',
                message: `A soma das porcentagens deve ser exatamente 100%. Atualmente está em ${totalPercentage}%.`,
                type: 'danger',
                onConfirm: () => setModalInfo(prev => ({ ...prev, isOpen: false }))
            });
            return;
        }

        setModalInfo({
            isOpen: true,
            title: 'Rebalancear Carteira',
            message: 'Deseja realmente atualizar a cesta e disparar a readequação automática de todos os clientes?',
            type: 'info',
            onConfirm: performSave
        });
    };

    const performSave = async () => {
        setModalInfo(prev => ({ ...prev, isOpen: false }));
        setIsSaving(true);
        try {
            const token = localStorage.getItem('@ItauAdmin:token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            // Use custom percentages
            const payload = {
                name: basketName,
                items: newBasketItems.map(item => ({
                    ticker: item.ticker,
                    percentage: item.percentage
                }))
            };

            await axios.post('http://localhost:5246/api/v1/admin/basket', payload, config);

            setModalInfo({
                isOpen: true,
                title: 'Sucesso!',
                message: 'A nova cesta foi ativada e o processo de rebalanceamento iniciado.',
                type: 'info',
                onConfirm: () => {
                    setModalInfo(prev => ({ ...prev, isOpen: false }));
                    setIsEditMode(false);
                    fetchCurrentBasket();
                }
            });
        } catch (error) {
            console.error("Erro ao salvar nova cesta:", error);
            alert('Erro ao processar alteração da cesta. Verifique se o backend está ativo.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="home-container">
                <div className="loading-message">Carregando dados da carteira...</div>
            </div>
        );
    }

    return (
        <div className="home-container basket-page">
            <header className="page-header-simple">
                <div className="header-info-wrap">
                    <h1>CESTA TOP FIVE</h1>
                    <p>Gestão e rebalanceamento da carteira de ações padrão Itaú.</p>
                </div>
                <div className="header-actions-wrap">
                    {!isEditMode ? (
                        <Button className="btn-edit" onClick={toggleEdit}>
                            <PlusCircle size={18} />
                            Configurar Nova Cesta
                        </Button>
                    ) : (
                        <div className="edit-actions">
                            <Button className="btn-cancel-edit" onClick={toggleEdit}>
                                <XCircle size={18} />
                                Descartar
                            </Button>
                            <Button className="btn-save" onClick={handleSaveNewBasket} loading={isSaving}>
                                <Save size={18} />
                                Salvar e Rebalancear
                            </Button>
                        </div>
                    )}
                </div>
            </header>

            {!isEditMode ? (
                /* VIEW MODE: Dashboard */
                <>
                    {!basketData ? (
                        <div className="empty-state premium-empty">
                            <AlertTriangle size={48} color="#ec7000" />
                            <h2>Nenhuma Cesta Ativa Encontrada</h2>
                            <p>Não há nenhuma configuração de Cesta Top Five ativa no momento. Clique no botão abaixo para criar a primeira.</p>
                            <Button className="btn-save mt-4" onClick={toggleEdit}>
                                <PlusCircle size={18} />
                                Configurar Cesta
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="basket-overview-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                                <div className="stat-card main-stat">
                                    <div className="stat-icon"><History size={24} /></div>
                                    <div className="stat-content">
                                        <span>Cesta Ativa</span>
                                        <h3>{basketData?.name}</h3>
                                        <p>Criada em {formatDate(basketData?.createdAt)}</p>
                                    </div>
                                    <div className="active-tag">Ativa</div>
                                </div>



                                <div className="stat-card">
                                    <div className="stat-icon green"><CheckCircle2 size={24} /></div>
                                    <div className="stat-content">
                                        <span>Status Algoritmo</span>
                                        <h3>Operacional</h3>
                                    </div>
                                </div>
                            </div>

                            <div className="assets-section">
                                <div className="section-title-wrap">
                                    <h2>Ativos que Compõem a Cesta</h2>
                                    <span>Distribuição de 20% por ativo (Itaú Top 5 Rule)</span>
                                </div>

                                <div className="assets-grid">
                                    {basketData?.items.map((asset, index) => (
                                        <div key={index} className="asset-card">
                                            <div className="asset-header">
                                                <div className="asset-ticker">{asset.ticker}</div>
                                                <div className="asset-percent">{asset.percentage}%</div>
                                            </div>
                                            <div className="asset-details">
                                                <div className="detail-row">
                                                    <span>Preço Atual</span>
                                                    <strong>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(asset.currentQuote)}</strong>
                                                </div>
                                                <div className="detail-row">
                                                    <span>Setor</span>
                                                    <span>Financeiro / Mercado</span>
                                                </div>
                                            </div>

                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </>
            ) : (
                /* EDIT MODE: Asset Selector */
                <div className="edit-basket-container">
                    <div className="edit-column left-col">
                        <div className="edit-card">
                            <div className="card-header">
                                <PlusCircle size={20} color="#032e5e" />
                                <h2>Nova Composição da Cesta</h2>
                            </div>

                            <div className="strategy-name-wrap">
                                <label>Nome da Estratégia</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Carteira Itaú Top 5 - Junho"
                                    value={basketName}
                                    onChange={(e) => setBasketName(e.target.value)}
                                    className="strategy-input"
                                />
                            </div>

                            <p className="edit-hint">Selecione exatamente 5 ativos para configurar a nova estratégia.</p>

                            <div className="draft-items-list">
                                {newBasketItems.length === 0 && <div className="empty-draft">Nenhum ativo selecionado.</div>}
                                {newBasketItems.map((item, index) => (
                                    <div key={index} className="draft-item">
                                        <div className="item-main">
                                            <span className="index-circle">{index + 1}</span>
                                            <span className="ticker-label">{item.ticker}</span>
                                        </div>
                                        <div className="item-meta">
                                            <div className="percentage-input-wrap">
                                                <input
                                                    type="number"
                                                    value={item.percentage}
                                                    onChange={(e) => handlePercentageChange(item.ticker, e.target.value)}
                                                    min="0"
                                                    max="100"
                                                />
                                                <span className="percent-symbol">%</span>
                                            </div>
                                            <button className="remove-btn" onClick={() => removeFromDraft(item.ticker)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {newBasketItems.length < 5 && (
                                    <div className="slots-remaining">
                                        Aguardando +{5 - newBasketItems.length} ativos...
                                    </div>
                                )}
                            </div>

                            <div className={`total-allocation ${totalPercentage > 100 ? 'over' : ''}`}>
                                <span>Total Alocado:</span>
                                <strong className={totalPercentage === 100 ? 'valid' : ''}>
                                    {totalPercentage}%
                                </strong>
                            </div>

                            {newBasketItems.length === 5 && totalPercentage === 100 && (
                                <div className="validation-success">
                                    <CheckCircle2 size={20} />
                                    <span>Cesta pronta e balanceada (100%)!</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="edit-column right-col">
                        <div className="edit-card search-card">
                            <div className="card-header">
                                <Search size={20} color="#666" />
                                <h2>Ativos Disponíveis para Escolha</h2>
                            </div>

                            <div className="search-box-wrap">
                                <Search className="search-inner-icon" size={18} />
                                <input
                                    type="text"
                                    placeholder="Buscar ticker (ex: ITUB4, PETR4...)"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="assets-selection-list">
                                {availableAssets
                                    .filter(ticker => ticker.toLowerCase().includes(searchTerm.toLowerCase()))
                                    .map(ticker => (
                                        <button
                                            key={ticker}
                                            className={`selection-item ${newBasketItems.some(i => i.ticker === ticker) ? 'selected' : ''}`}
                                            disabled={newBasketItems.some(i => i.ticker === ticker)}
                                            onClick={() => addAssetToDraft(ticker)}
                                        >
                                            <span className="ticker">{ticker}</span>
                                            {newBasketItems.some(i => i.ticker === ticker) ? (
                                                <CheckCircle2 size={18} color="#198754" />
                                            ) : (
                                                <PlusCircle size={18} color="#032e5e" />
                                            )}
                                        </button>
                                    ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Modal
                isOpen={modalInfo.isOpen}
                onClose={() => setModalInfo(prev => ({ ...prev, isOpen: false }))}
                onConfirm={modalInfo.onConfirm}
                title={modalInfo.title}
                message={modalInfo.message}
                type={modalInfo.type}
                confirmText={modalInfo.confirmText || "Confirmar"}
            />
        </div>
    );
};

export default Cesta;
