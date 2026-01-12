import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ChevronDown, User, LogOut, ShoppingCart } from 'lucide-react';

export default function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const { cartCount } = useCart();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleViewProfile = () => {
    setDropdownOpen(false);
    navigate('/profile');
  };

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="header-logo">
            <img src="/HGU-logo-1536x743.png" alt="Humble Group USA" />
          </Link>
          
          {isAuthenticated && (
            <div className="header-right">
              <Link to="/cart" className="cart-icon">
                <ShoppingCart size={22} />
                {cartCount > 0 && (
                  <span className="cart-badge">{cartCount}</span>
                )}
              </Link>

              <div className="user-dropdown" ref={dropdownRef}>
                <button 
                  className="user-dropdown-btn"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <span>{user?.company || user?.email || 'Account'}</span>
                  <ChevronDown size={16} className={`dropdown-icon ${dropdownOpen ? 'open' : ''}`} />
                </button>
                
                {dropdownOpen && (
                  <div className="dropdown-menu">
                    <button className="dropdown-item" onClick={handleViewProfile}>
                      <User size={16} />
                      <span>View Profile</span>
                    </button>
                    <button className="dropdown-item" onClick={handleLogout}>
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}