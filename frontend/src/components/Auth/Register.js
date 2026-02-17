"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { User, Mail, Lock, Building, ArrowRight, Loader2, Sparkles, Eye, EyeOff } from 'lucide-react';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { CharacterGroup } from "../ui/CharacterGroup";

const Register = () => {
  const [mode, setMode] = useState('create'); // 'create' or 'join'
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    organizationName: '',
    designation: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(''); // Added success state
  const [loading, setLoading] = useState(false);
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
  const { createOrganization, registerEmployee } = useAuth();

  // Strict rule: Register page must always load with completely empty fields
  useEffect(() => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      organizationName: '',
      designation: '',
    });
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'create') {
        const orgSlug = formData.organizationName.replace(/\s+/g, '').toLowerCase();
        // Dynamic regex for admin: username@orgname.ac.in
        // We match case-insensitively or loosely based on user input
        const adminRegex = new RegExp(`^[a-zA-Z0-9._%+-]+@${formData.organizationName.replace(/\s+/g, '')}\\.ac\\.in$`, 'i');

        if (!adminRegex.test(formData.email)) {
          setError(`Admin email must follow the pattern: name@${formData.organizationName.replace(/\s+/g, '')}.ac.in`);
          setLoading(false);
          return;
        }
        await createOrganization(formData);
      } else {
        await registerEmployee(formData);
      }

      setSuccess('Registration successful! Redirecting to your dashboard...');

      // Small delay to allow browser to trigger "Save Password" prompt
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 overflow-hidden bg-background font-sans">
      {/* Left Side: Animated Panel */}
      <div className="relative hidden lg:flex flex-col justify-between bg-gradient-to-br from-[#a855f7]/90 via-[#a855f7] to-[#a855f7]/80 p-12 pb-0 text-white">
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
          <span>Global Collaboration Platform</span>
          <span>© 2026 PRO MANAGER</span>
        </div>

        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
      </div>

      {/* Right Side: Register Form */}
      <div className="flex items-center justify-center p-8 bg-background overflow-y-auto">
        <div className="w-full max-w-[480px] py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Initialize Identity</h1>
            <p className="text-muted-foreground text-sm">Begin your professional journey with Pro Manager tools</p>
          </div>

          <div className="flex bg-muted/50 p-1 rounded-xl mb-8">
            <button
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${mode === 'create' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:bg-white/50'}`}
              onClick={() => {
                setMode('create');
                setFormData({
                  firstName: '',
                  lastName: '',
                  email: '',
                  password: '',
                  organizationName: '',
                  designation: '',
                });
              }}
            >
              New Organization
            </button>
            <button
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${mode === 'join' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:bg-white/50'}`}
              onClick={() => {
                setMode('join');
                setFormData({
                  firstName: '',
                  lastName: '',
                  email: '',
                  password: '',
                  organizationName: '',
                  designation: '',
                });
              }}
            >
              Join Existing
            </button>
          </div>

          {error && <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg mb-6">{error}</div>}
          {success && <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg mb-6 font-semibold animate-pulse">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Organization Name at the Top */}
            <div className="space-y-2">
              <Label>Organization Name</Label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  name="organizationName"
                  value={formData.organizationName}
                  onChange={handleChange}
                  placeholder={mode === 'create' ? "Acme Corp" : "Enter Organization Name"}
                  className="pl-10 h-11"
                  required
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="John"
                    className="pl-10 h-11"
                    required
                    autoComplete="given-name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                    className="pl-10 h-11"
                    required
                    autoComplete="family-name"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Work Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setIsTyping(true)}
                  onBlur={() => setIsTyping(false)}
                  placeholder={mode === 'create' ? "admin@company.com" : "name@company.com"}
                  className="pl-10 h-11"
                  required
                  autoComplete="email"
                />
              </div>
              {mode === 'create' && (
                <p className="text-[10px] text-muted-foreground px-1">
                  Use your professional organization email
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Security Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Choose a strong password"
                  className="pl-10 pr-10 h-11"
                  required
                  autoComplete="new-password"
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

            {mode === 'join' && (
              <div className="space-y-2">
                <Label>Work Designation</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <select
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    className="flex h-11 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                    required
                  >
                    <option value="">Select Professional Designation</option>
                    <option value="Business Analyst">Business Analyst (BA)</option>
                    <option value="Business Development">Business Development (BD)</option>
                    <option value="Team Lead">Team Lead (TL)</option>
                    <option value="Developer">Developer (DEV)</option>
                    <option value="DevOps">DevOps Engineer</option>
                    <option value="Tester">QA / Tester</option>
                  </select>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full h-12 text-base font-semibold mt-4" disabled={loading}>
              {loading ? (
                <Loader2 className="animate-spin mr-2" />
              ) : (
                <>
                  <span>{mode === 'create' ? 'Create Enterprise' : 'Join Workspace'}</span>
                  <ArrowRight className="ml-2" size={18} />
                </>
              )}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground mt-8">
            Already registered? <Link to="/login" className="text-primary font-semibold hover:underline">Sign In Portal</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
