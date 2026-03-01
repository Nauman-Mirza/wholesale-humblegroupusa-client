import { createContext, useContext, useState, useEffect } from 'react';
import { catalogApi } from '../api';
import { useAuth } from './AuthContext';

const CatalogContext = createContext(null);

export function CatalogProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCatalog();
    }
  }, [isAuthenticated]);

  const fetchCatalog = async (page = 1) => {
    try {
      setLoading(true);
      const response = await catalogApi.getBrandsWithCategories(page, 20);
      if (response.data && response.data[0]) {
        const data = response.data[0];
        setBrands(data.items || []);
        setPagination(data.pagination || null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load catalog');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CatalogContext.Provider value={{ brands, loading, error, pagination, fetchCatalog }}>
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog() {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error('useCatalog must be used within a CatalogProvider');
  }
  return context;
}
