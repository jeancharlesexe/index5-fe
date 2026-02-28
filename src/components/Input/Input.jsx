import React, { useState } from 'react';
import './Input.css';

const Input = ({ label, type = 'text', value, onChange, placeholder, required = false, id, icon }) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className={`input-group ${isFocused || value ? 'focused' : ''}`}>
            {label && <label htmlFor={id} className="input-label">{label}</label>}
            <div className="input-wrapper">
                {icon && <span className="input-icon">{icon}</span>}
                <input
                    id={id}
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    className="input-field"
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                />
            </div>
        </div>
    );
};

export default Input;
