import React from 'react';
import usePageTitle from '../../hooks/usePageTitle';
import '../Home/Home.css';

const Dashboard = () => {
    usePageTitle('Dashboard');
    return (
        <div className="home-container">
            <h1>DASHBOARD</h1>
            <p>Em construção...</p>
        </div>
    );
};

export default Dashboard;
