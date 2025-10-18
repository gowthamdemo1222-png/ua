import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const AuthContext = createContext();

// ✅ Use .env for backend URL
const API_URL = process.env.REACT_APP_BACKEND_URL || "https://ua9zkv.vercel.app";

// ✅ Configure axios
axios.defaults.baseURL = `${API_URL}/api`;
axios.defaults.headers.common['Content-Type'] = 'application/json';

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('auth_token'));
  const [loading, setLoading] = useState(true);

  // ✅ Apply token to axios headers
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // ✅ Auto-check logged-in user
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const res = await axios.get('/auth/me');
          setUser(res.data.user);
        } catch (err) {
          console.error('Auth check failed:', err.response?.data || err.message);
          logout();
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, [token]);

  // ✅ Register user
  const register = async (data) => {
    try {
      const res = await axios.post('/auth/register', data);
      toast.success(res.data.message || 'Registration successful!');
      return res.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      toast.error(message);
      throw new Error(message);
    }
  };

  // ✅ Login user
  const login = async (credentials) => {
    try {
      const res = await axios.post('/auth/login', credentials);
      
      // Handle backend response shape
      const token = res.data.access_token || res.data.token;
      const userData = res.data.user || null;

      if (!token) throw new Error('Invalid response from server');

      setToken(token);
      setUser(userData);
      localStorage.setItem('auth_token', token);

      toast.success(res.data.message || 'Login successful!');
      return res.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      toast.error(message);
      throw new Error(message);
    }
  };

  // ✅ Logout user
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth_token');
    delete axios.defaults.headers.common['Authorization'];
    toast.success('Logged out successfully');
  };

  // ✅ Forgot password
  const forgotPassword = async (email) => {
    try {
      const res = await axios.post('/auth/forgot-password', { email });
      toast.success(res.data.message);
      return res.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to send reset code';
      toast.error(message);
      throw new Error(message);
    }
  };

  // ✅ Verify OTP
  const verifyOTP = async (otpData) => {
    try {
      const res = await axios.post('/auth/verify-otp', otpData);
      toast.success(res.data.message);
      return res.data;
    } catch (err) {
      const message = err.response?.data?.message || 'OTP verification failed';
      toast.error(message);
      throw new Error(message);
    }
  };

  // ✅ Resend OTP
  const resendOTP = async (email) => {
    try {
      const res = await axios.post('/auth/resend-otp', { email });
      toast.success(res.data.message);
      return res.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to resend OTP';
      toast.error(message);
      throw new Error(message);
    }
  };

  const value = {
    user,
    token,
    loading,
    register,
    login,
    logout,
    forgotPassword,
    verifyOTP,
    resendOTP,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
