import React from 'react';
import './Loading.css';

const Loading = ({ text = "Loading...", fullScreen = false }) => {
    return (
        <div className={`loading-container ${fullScreen ? 'fullscreen' : ''}`}>
            <div className="loader">
                <div className="circle"></div>
                <div className="circle"></div>
                <div className="circle"></div>
                <div className="circle"></div>
            </div>
            <p className="loading-text">{text}</p>
        </div>
    );
};

export default Loading;
