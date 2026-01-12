import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api';
import { Eye, EyeOff } from 'lucide-react';

export default function SignupPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    company_name: '',
    website: '',
    shipping_address: {
      address_1: '',
      address_2: '',
      city: '',
      country: '',
      postcode: '',
    },
    agree_min_order: false,
    agree_no_personal_use: false,
    agree_terms: false,
    agree_no_resell: false,
    signature: '',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith('shipping_address.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        shipping_address: {
          ...prev.shipping_address,
          [field]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.password_confirmation) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.agree_min_order || !formData.agree_no_personal_use || 
        !formData.agree_terms || !formData.agree_no_resell) {
      setError('Please agree to all terms and conditions');
      return;
    }

    if (!formData.signature.trim()) {
      setError('Please provide your signature');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        signed_at: new Date().toISOString().split('T')[0],
      };

      await authApi.signup(payload);
      
      // Redirect to login with success message
      navigate('/login', { 
        state: { message: 'Account created successfully! Please wait for admin approval before logging in.' }
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="login-logo">
          <img src="/HGU-logo-1536x743.png" alt="Humble Group USA" />
        </div>

        <h1 className="signup-title">Create Account</h1>
        <p className="signup-subtitle">Register for a wholesale account</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Personal Information */}
          <div className="form-section">
            <h2 className="form-section-title">Personal Information</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  First Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="first_name"
                  className="form-input"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Last Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="last_name"
                  className="form-input"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Email <span className="required">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Phone <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  className="form-input"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Password <span className="required">*</span>
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    className="form-input"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <span className="form-hint">Min 9 chars, uppercase, lowercase, number, symbol</span>
              </div>
              <div className="form-group">
                <label className="form-label">
                  Confirm Password <span className="required">*</span>
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="password_confirmation"
                    className="form-input"
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Company Information */}
          <div className="form-section">
            <h2 className="form-section-title">Company Information</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Company Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="company_name"
                  className="form-input"
                  value={formData.company_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Website</label>
                <input
                  type="url"
                  name="website"
                  className="form-input"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://"
                />
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="form-section">
            <h2 className="form-section-title">Shipping Address</h2>
            
            <div className="form-group">
              <label className="form-label">
                Address Line 1 <span className="required">*</span>
              </label>
              <input
                type="text"
                name="shipping_address.address_1"
                className="form-input"
                value={formData.shipping_address.address_1}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Address Line 2</label>
              <input
                type="text"
                name="shipping_address.address_2"
                className="form-input"
                value={formData.shipping_address.address_2}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  City <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="shipping_address.city"
                  className="form-input"
                  value={formData.shipping_address.city}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Country <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="shipping_address.country"
                  className="form-input"
                  value={formData.shipping_address.country}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Postcode</label>
                <input
                  type="text"
                  name="shipping_address.postcode"
                  className="form-input"
                  value={formData.shipping_address.postcode}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Terms & Agreements */}
          <div className="form-section">
            <h2 className="form-section-title">Terms & Agreements</h2>
            
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="agree_min_order"
                  checked={formData.agree_min_order}
                  onChange={handleChange}
                />
                <span>I agree to the minimum order requirements <span className="required">*</span></span>
              </label>
            </div>

            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="agree_no_personal_use"
                  checked={formData.agree_no_personal_use}
                  onChange={handleChange}
                />
                <span>I confirm this account is not for personal use <span className="required">*</span></span>
              </label>
            </div>

            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="agree_terms"
                  checked={formData.agree_terms}
                  onChange={handleChange}
                />
                <span>I agree to the terms and conditions <span className="required">*</span></span>
              </label>
            </div>

            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="agree_no_resell"
                  checked={formData.agree_no_resell}
                  onChange={handleChange}
                />
                <span>I agree not to resell on unauthorized platforms <span className="required">*</span></span>
              </label>
            </div>
          </div>

          {/* Signature */}
          <div className="form-section">
            <h2 className="form-section-title">Digital Signature</h2>
            
            <div className="form-group">
              <label className="form-label">
                Type your full name as signature <span className="required">*</span>
              </label>
              <input
                type="text"
                name="signature"
                className="form-input signature-input"
                value={formData.signature}
                onChange={handleChange}
                placeholder="Your Full Name"
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-signup" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          <p className="login-link">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}