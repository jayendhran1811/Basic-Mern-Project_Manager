import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../utils/apiClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [organizations, setOrganizations] = useState([]);

  // Load user and organizations on mount
  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const savedSessionId = localStorage.getItem('sessionId');
        const savedOrganization = localStorage.getItem('organization');

        if (token && savedSessionId) {
          setSessionId(savedSessionId);
          if (savedOrganization) {
            setOrganization(JSON.parse(savedOrganization));
          }

          // Fetch current user
          try {
            const response = await authAPI.getCurrentUser();
            setUser(response.data);
            localStorage.setItem('user', JSON.stringify(response.data));
          } catch (userError) {
            console.error('Failed to fetch current user:', userError);
            // Clear auth if user fetch fails
            localStorage.removeItem('authToken');
            localStorage.removeItem('sessionId');
            localStorage.removeItem('organization');
          }
        }
      } catch (error) {
        console.error('Failed to load auth data:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('sessionId');
        localStorage.removeItem('organization');
      } finally {
        setLoading(false);
      }
    };

    const loadOrganizations = async () => {
      try {
        const orgsResponse = await authAPI.getOrganizations();
        // Handle both array response and object with data property
        const orgsData = Array.isArray(orgsResponse) ? orgsResponse : orgsResponse.data;
        setOrganizations(orgsData || []);
      } catch (orgsError) {
        console.warn('Failed to load organizations:', orgsError);
        setOrganizations([]);
      }
    };

    loadAuthData();
    loadOrganizations();
  }, []);

  const refreshOrganizations = async () => {
    try {
      const orgsResponse = await authAPI.getOrganizations();
      const orgsData = Array.isArray(orgsResponse) ? orgsResponse : orgsResponse.data;
      setOrganizations(orgsData || []);
    } catch (orgsError) {
      console.warn('Manual organization refresh failed:', orgsError);
    }
  };

  const createOrganization = async (data) => {
    try {
      const response = await authAPI.createOrganization(data);
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('sessionId', response.data.user.id);
      localStorage.setItem('organization', JSON.stringify(response.data.organization));
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
      setOrganization(response.data.organization);
      setSessionId(response.data.user.id);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const registerEmployee = async (data) => {
    try {
      const response = await authAPI.registerEmployee(data);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const login = async (email, password, organizationId) => {
    try {
      const response = await authAPI.login(email, password, organizationId);
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('sessionId', response.data.sessionId);
      localStorage.setItem('organization', JSON.stringify({ id: organizationId }));
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
      setOrganization({ id: organizationId });
      setSessionId(response.data.sessionId);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      if (sessionId) {
        await authAPI.logout(sessionId);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear sensitive state
      localStorage.removeItem('authToken');
      localStorage.removeItem('sessionId');
      localStorage.removeItem('organization');
      localStorage.removeItem('user');

      // Note: we do NOT remove 'rememberedEmail' here as it's intended to persist

      setUser(null);
      setOrganization(null);
      setSessionId(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        organization,
        sessionId,
        loading,
        organizations,
        refreshOrganizations,
        createOrganization,
        registerEmployee,
        login,
        logout,
        updateUser,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
