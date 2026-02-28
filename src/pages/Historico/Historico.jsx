import React from 'react';
import usePageTitle from '../../hooks/usePageTitle';
import '../Home/Home.css';

const Historico = () => {
    usePageTitle('Histórico');
    return (
        <div className="home-container">
            <h1>HISTÓRICO DE CESTAS</h1>
            <p>Em construção...</p>
        </div>
    );
};

export default Historico;
