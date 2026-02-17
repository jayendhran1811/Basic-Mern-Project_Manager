import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock, ShieldCheck, ArrowRight, Loader2, Building2 } from 'lucide-react';
import './AuthAnimated.css';

const Login = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        organizationId: '',
        isAdmin: false
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const navigate = useNavigate();
    const { login, organizations } = useAuth();

    useEffect(() => {
        const handleMouseMove = (e) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 10;
            const y = (e.clientY / window.innerHeight - 0.5) * 10;
            setMousePos({ x, y });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.organizationId) {
            setError('Please select an organization to proceed');
            return;
        }
        setError('');
        setLoading(true);
        try {
            await login(formData.username, formData.password, formData.organizationId);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please verify your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page-wrapper">
            {/* Left Side: Animated Panel */}
            <div className="auth-side-panel">
                <div className="side-panel-content">
                    <div className="character-animation-container">
                        <svg className="auth-character" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                            {/* Body */}
                            <circle cx="100" cy="100" r="80" fill="#3b82f6" />
                            {/* Eyes */}
                            <g className="eye-group">
                                <circle className="eye" cx="70" cy="80" r="15" />
                                <circle
                                    className="pupil"
                                    cx="70" cy="80" r="6"
                                    style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}
                                />

                                <circle className="eye" cx="130" cy="80" r="15" />
                                <circle
                                    className="pupil"
                                    cx="130" cy="80" r="6"
                                    style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}
                                />
                            </g>
                            {/* Mouth */}
                            <path
                                className="mouth"
                                d={formData.password.length > 0 ? "M 80 130 Q 100 130 120 130" : "M 80 130 Q 100 150 120 130"}
                            />
                        </svg>
                    </div>
                    <h2>Pro Manager</h2>
                    <p>Elevate your enterprise project workflows with professional precision and real-time synchronization.</p>
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="auth-form-side">
                <div className="auth-card-modern">
                    <div className="auth-header">
                        <h1>Authorized Access</h1>
                        <p className="auth-subtitle">Welcome back. Enter your credentials to securely access your workspace.</p>
                    </div>

                    {error && <div className="auth-error-professional">{error}</div>}

                    <form onSubmit={handleSubmit} className="auth-form-professional">
                        <div className="input-group-modern">
                            <label htmlFor="organizationId">Organization</label>
                            <div className="input-wrapper">
                                <Building2 className="input-icon" size={18} />
                                <select
                                    id="organizationId"
                                    name="organizationId"
                                    value={formData.organizationId}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="" disabled>Select Organization</option>
                                    {organizations.map(org => (
                                        <option key={org._id || org.id} value={org._id || org.id}>{org.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="input-group-modern">
                            <label htmlFor="username">Email Address</label>
                            <div className="input-wrapper">
                                <Mail className="input-icon" size={18} />
                                <input
                                    type="email"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="name@company.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="input-group-modern">
                            <label htmlFor="password">Security Password</label>
                            <div className="input-wrapper">
                                <Lock className="input-icon" size={18} />
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-options">
                            <label className="checkbox-wrapper-modern">
                                <input type="checkbox" name="isAdmin" checked={formData.isAdmin} onChange={handleChange} />
                                <span className="checkbox-custom"></span>
                                <span className="checkbox-label">Administrator permissions</span>
                            </label>
                        </div>

                        <button type="submit" className="btn-auth-primary" disabled={loading}>
                            {loading ? <Loader2 className="spinner" size={20} /> : (
                                <>
                                    <span>Authenticate</span>
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="auth-footer-modern">
                        <p>New to Pro Manager? <Link to="/register">Create Enterprise Account</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
