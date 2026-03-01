import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useCatalog } from '../context/CatalogContext';
import { ChevronDown, ChevronRight, User, LogOut, ShoppingCart, Package, ShoppingBag } from 'lucide-react';

export default function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const { cartCount } = useCart();
  const { brands } = useCatalog();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [shopMenuOpen, setShopMenuOpen] = useState(false);
  const [activeBrand, setActiveBrand] = useState(null);
  const dropdownRef = useRef(null);
  const shopMenuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (shopMenuRef.current && !shopMenuRef.current.contains(event.target)) {
        setShopMenuOpen(false);
        setActiveBrand(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleViewProfile = () => {
    setDropdownOpen(false);
    navigate('/profile');
  };

  const handleViewOrders = () => {
    setDropdownOpen(false);
    navigate('/orders');
  };

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
  };

  const handleBrandClick = (brand) => {
    navigate(`/#brand-${brand._id || brand.id}`);
    setShopMenuOpen(false);
    setActiveBrand(null);
  };

  const handleSubCategoryClick = (subCat, category, brand) => {
    navigate(`/subcategory/${subCat._id || subCat.id}`, {
      state: {
        subCategory: subCat,
        categoryName: category.name,
        brandName: brand.name,
        brandId: brand._id || brand.id,
      },
    });
    setShopMenuOpen(false);
    setActiveBrand(null);
  };

  const activeBrandData = brands.find(b => (b._id || b.id) === activeBrand);

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="header-logo">
            <img src="/HGU-logo-1536x743.png" alt="Humble Group USA" />
          </Link>

          {isAuthenticated && (
            <nav className="header-nav">
              <div className="shop-menu" ref={shopMenuRef}>
                <button
                  className="shop-menu-btn"
                  onClick={() => {
                    setShopMenuOpen(!shopMenuOpen);
                    setActiveBrand(null);
                  }}
                >
                  <ShoppingBag size={16} />
                  <span>Shop</span>
                  <ChevronDown size={14} className={`dropdown-icon ${shopMenuOpen ? 'open' : ''}`} />
                </button>

                {shopMenuOpen && brands.length > 0 && (
                  <div className="mega-menu">
                    <div className="mega-menu-brands">
                      {brands.map((brand) => (
                        <div
                          key={brand._id || brand.id}
                          className={`mega-menu-brand-item ${activeBrand === (brand._id || brand.id) ? 'active' : ''}`}
                          onMouseEnter={() => setActiveBrand(brand._id || brand.id)}
                          onClick={() => handleBrandClick(brand)}
                        >
                          <span>{brand.name}</span>
                          {brand.categories?.length > 0 && <ChevronRight size={14} />}
                        </div>
                      ))}
                    </div>

                    {activeBrandData && activeBrandData.categories?.length > 0 && (
                      <div className="mega-menu-categories">
                        {activeBrandData.categories.map((category) => (
                          <div key={category._id || category.id} className="mega-menu-category">
                            <div className="mega-menu-category-title">{category.name}</div>
                            {category.sub_categories?.map((subCat) => (
                              <button
                                key={subCat._id || subCat.id}
                                className="mega-menu-subcategory"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSubCategoryClick(subCat, category, activeBrandData);
                                }}
                              >
                                {subCat.name}
                              </button>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </nav>
          )}

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
                    <button className="dropdown-item" onClick={handleViewOrders}>
                      <Package size={16} />
                      <span>My Orders</span>
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
