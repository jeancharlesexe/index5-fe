import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';
import { Bell, User, LogOut } from 'lucide-react';
import Modal from '../Modal/Modal';

const Header = () => {
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [userName, setUserName] = useState('Usuário');
    const dropdownRef = useRef(null);

    useEffect(() => {
        const userData = localStorage.getItem('@ItauAdmin:user');
        if (userData) {
            try {
                const parsed = JSON.parse(userData);
                if (parsed.name) {
                    setUserName(parsed.name);
                }
            } catch (error) {
                console.error("Error parsing user data");
            }
        }

        // Click outside to close
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleLogoffClick = () => {
        setIsDropdownOpen(false);
        setIsLogoutModalOpen(true);
    };

    const handleConfirmLogoff = () => {
        localStorage.removeItem('@ItauAdmin:token');
        localStorage.removeItem('@ItauAdmin:user');
        navigate('/login');
    };
    return (
        <header className="admin-header">
            <div className="header-titles premium-header-titles">
                <span className="greeting-text">Olá, <strong>{userName}</strong>! Bem-vindo(a) de volta.</span>
                <h1>Painel de Administração <span className="title-separator">•</span> Motor Top Five</h1>
            </div>

            <div className="header-actions">
                <div className="notification-icon">
                    <Bell size={20} />
                    <span className="badge">1</span>
                </div>
                <div className="user-profile-container" ref={dropdownRef}>
                    <div className="user-profile" onClick={toggleDropdown}>
                        <div className="avatar">
                            <User size={16} />
                        </div>
                        <span className="dropdown-icon" style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0)' }}>▼</span>
                    </div>

                    {isDropdownOpen && (
                        <div className="profile-dropdown">
                            <div className="dropdown-header">
                                <p className="dropdown-name">{userName}</p>
                                <span className="dropdown-role">Administrador</span>
                            </div>
                            <div className="dropdown-divider"></div>
                            <button className="dropdown-item logoff-btn" onClick={handleLogoffClick}>
                                <LogOut size={16} />
                                <span>Sair</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <Modal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={handleConfirmLogoff}
                title="Confirmar Saída"
                message="Você tem certeza que deseja sair do sistema?"
                confirmText="Sair"
                cancelText="Permanecer"
                type="danger"
            />
        </header>
    );
};

export default Header;
