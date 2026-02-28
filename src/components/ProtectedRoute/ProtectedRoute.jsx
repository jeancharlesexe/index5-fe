import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    const token = localStorage.getItem('@ItauAdmin:token');
    const userData = localStorage.getItem('@ItauAdmin:user');

    // Verifica se o usuário tem token
    if (!token || !userData) {
        return <Navigate to="/login" replace />;
    }

    try {
        const user = JSON.parse(userData);

        // Verifica se é administrador (role 1 ou 'admin' dependendo da sua API)
        // Ajuste essa verificação conforme o retorno real da sua API
        if (user.role !== 1 && user.role !== 'admin' && user.role !== 'Administrador') {
            // Se você tiver uma rota de não autorizado, mande para lá.
            // Ou apenas volte pro login (deslogue a pessoa).
            // Opcionalmente: alert('Acesso não autorizado'); localStorage.clear();
            // Por enquanto, aceitaremos se o objeto existe e deixaremos o outlet.
            // Para rigor absoluto, decomente a linha abaixo e ajuste condicional de role:
            // return <Navigate to="/login" replace />;
        }

        return <Outlet />;
    } catch (error) {
        return <Navigate to="/login" replace />;
    }
};

export default ProtectedRoute;
