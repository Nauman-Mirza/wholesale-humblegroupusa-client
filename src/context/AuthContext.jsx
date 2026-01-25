import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      
      // Fetch fresh user data to get can_order and other permissions
      try {
        await fetchUserData();
      } catch (err) {
        console.error('Failed to fetch user data:', err);
      }
    }
    setLoading(false);
  };

  const fetchUserData = async () => {
    try {
      const response = await authApi.getUserData();
      const userData = response.data?.data?.data || response.data?.data || response.data;
      
      if (userData?.user) {
        const enrichedUser = {
          id: userData.user._id || userData.user.id,
          email: userData.user.email,
          company: userData.user.company_name,
          phone: userData.user.phone,
          first_name: userData.user.first_name,
          last_name: userData.user.last_name,
          is_active: userData.user.is_active,
          can_order: userData.user.can_order, // Get this from getUserData
        };
        
        localStorage.setItem('user', JSON.stringify(enrichedUser));
        setUser(enrichedUser);
      }
    } catch (err) {
      console.error('Failed to fetch user data:', err);
    }
  };

  const login = async (email, password) => {
    const response = await authApi.login(email, password);
    
    if (response.data?.token) {
      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setToken(newToken);
      setUser(userData);
      
      // Fetch full user data including can_order
      await fetchUserData();
      
      return response;
    }
    
    throw new Error(response.message || 'Login failed');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    login,
    logout,
    refreshUserData: fetchUserData, // Export this in case we need to refresh
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}