import React, { useState } from 'react';
import axios from 'axios';
import { User, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import usePageTitle from '../../hooks/usePageTitle';
import { translateError } from '../../utils/errorHelper';
import './Login.css';

const Login = () => {
    usePageTitle('Login');
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ user: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { id, value } = e.target;
        setCredentials({ ...credentials, [id]: value });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!credentials.user || !credentials.password) {
            setError('Por favor, preencha todos os campos.');
            return;
        }

        setIsLoading(true);

        try {
            const response = await axios.post('http://localhost:5246/api/v1/auth/login/admin', {
                jKey: credentials.user,
                password: credentials.password
            });

            if (response.data && response.data.status === 200) {
                // Armazenar dados no localStorage ou Context API
                localStorage.setItem('@ItauAdmin:token', token);
                localStorage.setItem('@ItauAdmin:user', JSON.stringify(response.data.data));
                navigate('/admin');
            } else {
                const errorCode = response.data?.data?.code || response.data?.message;
                setError(translateError(errorCode, response.data?.message));
            }
        } catch (err) {
            if (err.response && err.response.data) {
                const res = err.response.data;
                const errorCode = res.data?.code || res.message;
                setError(translateError(errorCode, res.message));
            } else {
                setError(translateError('NETWORK_ERROR', 'Erro de conexão com o servidor.'));
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            {/* Left Side: Branding / Background */}
            <div className="login-banner">
                <div className="banner-content">
                    <div className="brand-header">
                        <div className="brand-logo">Itaú</div>
                        <p className="brand-subtitle">Administrativo</p>
                    </div>
                    <div className="banner-illustration">
                        <div className="banner-text-content">
                            <h1 className="banner-title">Sistema de Compra Programada de Ações</h1>
                            <p className="banner-text">
                                (Top Five) Panel Administrativo.<br />
                                Gerencie e acompanhe cestas de investimentos com segurança.
                            </p>
                        </div>
                        <ShieldCheck size={120} color="var(--primary)" strokeWidth={1} className="floating-icon" />
                    </div>
                </div>
                <div className="banner-overlay"></div>
            </div>

            {/* Right Side: Form */}
            <div className="login-form-wrapper">
                <div className="login-form-container">
                    <div className="form-header">
                        <h2>Acesse sua conta</h2>
                        <p>Insira suas credenciais corporativas</p>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">
                        <Input
                            id="user"
                            label="Usuário (Chave J)"
                            placeholder="Ex: J123456"
                            value={credentials.user}
                            onChange={handleChange}
                            icon={<User size={18} />}
                        />

                        <Input
                            id="password"
                            type="password"
                            label="Senha"
                            placeholder="Digite sua senha"
                            value={credentials.password}
                            onChange={handleChange}
                            icon={<Lock size={18} />}
                        />

                        {error && <div className="error-message">{error}</div>}

                        <div className="form-actions">
                            <a href="#" className="forgot-password">Esqueci minha senha</a>
                        </div>

                        <Button type="submit" className="login-button" disabled={isLoading}>
                            {isLoading ? 'Autenticando...' : (
                                <>
                                    Entrar <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="form-footer">
                        <p>Ambiente seguro e monitorado.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
