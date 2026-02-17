"use client";

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Eye, EyeOff, Mail, Sparkles, Building2, Loader2, ArrowRight, Lock, X, Check, Smartphone } from "lucide-react";
import { CharacterGroup } from "../ui/CharacterGroup";
import { authAPI } from "../../utils/apiClient";

const LoginPortal = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        organizationId: '',
        rememberMe: false
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [orgSearchTerm, setOrgSearchTerm] = useState("");

    // Forgot Password State
    const [isForgotOpen, setIsForgotOpen] = useState(false);
    const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP & New Pass, 3: Success
    const [forgotData, setForgotData] = useState({
        email: '',
        phone: '',
        otp: '',
        newPassword: ''
    });
    const [resetMethod, setResetMethod] = useState('email'); // 'email' or 'phone'
    const [forgotLoading, setForgotLoading] = useState(false);
    const [forgotError, setForgotError] = useState('');
    const [mouseX, setMouseX] = useState(0);
    const [mouseY, setMouseY] = useState(0);
    const [isPurpleBlinking, setIsPurpleBlinking] = useState(false);
    const [isBlackBlinking, setIsBlackBlinking] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [isLookingAtEachOther, setIsLookingAtEachOther] = useState(false);
    const [isPurplePeeking, setIsPurplePeeking] = useState(false);

    const purpleRef = useRef(null);
    const blackRef = useRef(null);
    const yellowRef = useRef(null);
    const orangeRef = useRef(null);

    const navigate = useNavigate();
    const { login, organizations, refreshOrganizations } = useAuth();

    // Strict rule: Password must always be empty on load
    // Load remembered email if exists
    useEffect(() => {
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        if (rememberedEmail) {
            setFormData(prev => ({
                ...prev,
                username: rememberedEmail,
                rememberMe: true
            }));
        }
    }, []);

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMouseX(e.clientX);
            setMouseY(e.clientY);
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    useEffect(() => {
        const blink = (setter) => {
            setter(true);
            setTimeout(() => setter(false), 150);
        };
        const purpleInterval = setInterval(() => blink(setIsPurpleBlinking), Math.random() * 4000 + 3000);
        const blackInterval = setInterval(() => blink(setIsBlackBlinking), Math.random() * 4000 + 3000);
        return () => { clearInterval(purpleInterval); clearInterval(blackInterval); };
    }, []);

    useEffect(() => {
        if (isTyping) {
            setIsLookingAtEachOther(true);
            const timer = setTimeout(() => setIsLookingAtEachOther(false), 800);
            return () => clearTimeout(timer);
        }
    }, [isTyping]);

    useEffect(() => {
        if (formData.password.length > 0 && showPassword) {
            const peekInterval = setInterval(() => {
                setIsPurplePeeking(true);
                setTimeout(() => setIsPurplePeeking(false), 800);
            }, Math.random() * 3000 + 2000);
            return () => clearInterval(peekInterval);
        }
    }, [formData.password, showPassword]);

    const handleOrgSearchChange = (e) => {
        const value = e.target.value;
        setOrgSearchTerm(value);

        // Find matching org to set ID
        const matched = organizations.find(o => o.name === value);
        if (matched) {
            setFormData(prev => ({ ...prev, organizationId: matched._id || matched.id }));
        }
    };

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

        setError("");
        setIsLoading(true);

        try {
            const res = await login(formData.username.toLowerCase(), formData.password, formData.organizationId);

            // Handle Remember Me
            if (formData.rememberMe) {
                localStorage.setItem('rememberedEmail', formData.username.toLowerCase());
            } else {
                localStorage.removeItem('rememberedEmail');
            }

            // Designation-based redirection
            if (res.user?.designation === 'Manager') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please verify your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotSubmit = async (e) => {
        e.preventDefault();
        setForgotError('');
        setForgotLoading(true);

        try {
            if (forgotStep === 1) {
                const payload = resetMethod === 'email' ? { email: forgotData.email } : { phoneNumber: forgotData.phone };
                await authAPI.forgotPassword(payload);
                setForgotStep(2);
            } else if (forgotStep === 2) {
                const payload = resetMethod === 'email' ?
                    { email: forgotData.email, otp: forgotData.otp, newPassword: forgotData.newPassword } :
                    { phoneNumber: forgotData.phone, otp: forgotData.otp, newPassword: forgotData.newPassword };
                await authAPI.resetPassword(payload);
                setForgotStep(3);
            }
        } catch (err) {
            setForgotError(err.response?.data?.message || 'Action failed. Please try again.');
        } finally {
            setForgotLoading(false);
        }
    };

    const closeForgotModal = () => {
        setIsForgotOpen(false);
        setForgotStep(1);
        setForgotData({ email: '', phone: '', otp: '', newPassword: '' });
        setResetMethod('email');
        setForgotError('');
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2 overflow-hidden bg-background font-sans">
            {/* Left Content Section: Animation */}
            <div className="relative hidden lg:flex flex-col justify-between bg-gradient-to-br from-[#6C3FF5]/90 via-[#6C3FF5] to-[#6C3FF5]/80 p-12 pb-0 text-white">
                <div className="relative z-20">
                    <div className="flex items-center gap-2 text-lg font-semibold">
                        <div className="size-8 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
                            <Sparkles className="size-4" />
                        </div>
                        <span>PRO MANAGER</span>
                    </div>
                </div>

                <div className="relative z-20 mt-auto flex items-end justify-center h-[600px]">
                    <CharacterGroup
                        mouseX={mouseX}
                        mouseY={mouseY}
                        isTyping={isTyping}
                        password={formData.password}
                        showPassword={showPassword}
                        isPurpleBlinking={isPurpleBlinking}
                        isBlackBlinking={isBlackBlinking}
                        isLookingAtEachOther={isLookingAtEachOther}
                        isPurplePeeking={isPurplePeeking}
                        purpleRef={purpleRef}
                        blackRef={blackRef}
                        yellowRef={yellowRef}
                        orangeRef={orangeRef}
                    />
                </div>

                <div className="absolute bottom-8 left-12 z-20 flex items-center gap-8 text-sm text-white/40">
                    <span>Enterprise Grade Security</span>
                    <span>© 2026 PRO MANAGER</span>
                </div>

                <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
            </div>

            {/* Right Login Section: Form */}
            <div className="flex items-center justify-center p-8 bg-background">
                <div className="w-full max-w-[420px]">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Authorized Access</h1>
                        <p className="text-muted-foreground text-sm">Enter your workspace credentials to continue</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="organizationId">Organization</Label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <input
                                    id="organizationId"
                                    name="organizationId"
                                    type="text"
                                    list="org-list"
                                    value={orgSearchTerm}
                                    onChange={handleOrgSearchChange}
                                    onFocus={() => {
                                        setTimeout(() => setIsTyping(true), 50);
                                    }}
                                    onBlur={() => setIsTyping(false)}
                                    placeholder="Type or select organization"
                                    className="flex h-12 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    required
                                />
                                <datalist id="org-list">
                                    {organizations && organizations.map(org => (
                                        <option key={org._id || org.id} value={org.name} />
                                    ))}
                                </datalist>
                                {organizations && organizations.length === 0 && (
                                    <div className="flex items-center justify-between mt-1 px-1">
                                        <p className="text-[10px] text-muted-foreground">No organizations found</p>
                                        <button
                                            type="button"
                                            onClick={refreshOrganizations}
                                            className="text-[10px] text-primary hover:underline font-bold"
                                        >
                                            Refresh List
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="username">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    id="username"
                                    name="username"
                                    type="email"
                                    placeholder="name@company.com"
                                    value={formData.username}
                                    onChange={handleChange}
                                    onFocus={() => {
                                        // Use a small delay for typing state to let browser focus naturally
                                        setTimeout(() => setIsTyping(true), 50);
                                    }}
                                    onBlur={() => setIsTyping(false)}
                                    className="h-12 pl-10 bg-background"
                                    required
                                    autoComplete="username"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Security Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="h-12 pl-10 pr-10 bg-background"
                                    required
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <Checkbox
                                    name="rememberMe"
                                    checked={formData.rememberMe}
                                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, rememberMe: checked }))}
                                />
                                <span className="text-sm font-medium">Remember Me</span>
                            </label>
                            <button
                                type="button"
                                onClick={() => setIsForgotOpen(true)}
                                className="text-sm font-medium text-primary hover:underline"
                            >
                                Forgot Password?
                            </button>
                        </div>

                        {error && (
                            <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={isLoading}>
                            {isLoading ? <Loader2 className="animate-spin mr-2" /> : "Sign In Portal"}
                            {!isLoading && <ArrowRight className="ml-2" size={18} />}
                        </Button>
                    </form>

                    <div className="text-center text-sm text-muted-foreground mt-8">
                        New to Pro Manager? <Link to="/register" className="text-primary font-semibold hover:underline">Create Account</Link>
                    </div>
                </div>
            </div>

            {/* Forgot Password Modal */}
            {isForgotOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-background w-full max-w-md rounded-xl shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
                        <button
                            onClick={closeForgotModal}
                            className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
                        >
                            <X size={20} />
                        </button>

                        <div className="mb-6 text-center">
                            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                                <Lock size={24} />
                            </div>
                            <h2 className="text-2xl font-bold">
                                {forgotStep === 1 ? 'Reset Password' : forgotStep === 2 ? 'Verify & Update' : 'Success!'}
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                {forgotStep === 1 ? (resetMethod === 'email' ? 'Enter your email to receive an OTP' : 'Enter your phone to receive an OTP') :
                                    forgotStep === 2 ? 'Enter the security code sent to your device' :
                                        'Your password has been successfully updated'}
                            </p>
                        </div>

                        {forgotStep === 1 && (
                            <div className="flex p-1 bg-muted rounded-lg mb-6">
                                <button
                                    onClick={() => setResetMethod('email')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${resetMethod === 'email' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    <Mail size={14} />
                                    Email
                                </button>
                                <button
                                    onClick={() => setResetMethod('phone')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${resetMethod === 'phone' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    <Smartphone size={14} />
                                    Phone
                                </button>
                            </div>
                        )}

                        {forgotError && (
                            <div className="p-3 mb-4 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg">
                                {forgotError}
                            </div>
                        )}

                        {forgotStep === 3 ? (
                            <div className="text-center">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Check size={32} />
                                </div>
                                <Button onClick={closeForgotModal} className="w-full">
                                    Back to Login
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleForgotSubmit} className="space-y-4">
                                {forgotStep === 1 ? (
                                    <div className="space-y-2">
                                        <Label>{resetMethod === 'email' ? 'Email Address' : 'Phone Number'}</Label>
                                        <div className="relative">
                                            {resetMethod === 'email' ? (
                                                <>
                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                                    <Input
                                                        type="email"
                                                        placeholder="name@company.com"
                                                        value={forgotData.email}
                                                        onChange={e => setForgotData({ ...forgotData, email: e.target.value })}
                                                        className="pl-10 h-11"
                                                        required
                                                    />
                                                </>
                                            ) : (
                                                <>
                                                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                                    <Input
                                                        type="text"
                                                        placeholder="+91 XXXXX XXXXX"
                                                        value={forgotData.phone}
                                                        onChange={e => setForgotData({ ...forgotData, phone: e.target.value })}
                                                        className="pl-10 h-11"
                                                        required
                                                    />
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-2">
                                            <Label>Enter OTP</Label>
                                            <Input
                                                type="text"
                                                placeholder="6-digit code"
                                                value={forgotData.otp}
                                                onChange={e => setForgotData({ ...forgotData, otp: e.target.value })}
                                                className="text-center tracking-widest text-lg font-mono"
                                                maxLength={6}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>New Password</Label>
                                            <Input
                                                type="password"
                                                placeholder="New secure password"
                                                value={forgotData.newPassword}
                                                onChange={e => setForgotData({ ...forgotData, newPassword: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </>
                                )}

                                <Button type="submit" className="w-full" disabled={forgotLoading}>
                                    {forgotLoading ? <Loader2 className="animate-spin" /> : (forgotStep === 1 ? 'Send OTP' : 'Reset Password')}
                                </Button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};


export default LoginPortal;
