import React from 'react';
import './Button.css';

const Button = ({ children, onClick, type = 'button', variant = 'primary', style, className = '', disabled = false }) => {
    return (
        <button
            className={`btn btn-${variant} ${className}`}
            onClick={onClick}
            type={type}
            style={style}
            disabled={disabled}
        >
            {children}
        </button>
    );
};

export default Button;
