import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi, locationApi } from '../api';
import { Eye, EyeOff } from 'lucide-react';

const brandStyles = `

  .signup-page {
    font-family: 'Source Sans Pro', sans-serif;
    background: #fafafa;
    min-height: 100vh;
  }

  /* Page Title above hero */
  .signup-page-title {
    text-align: center;
    padding: 36px 24px 28px;
    background: #fff;
    border-bottom: 1px solid #e5e5e5;
  }

  .signup-page-title h1 {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(1.4rem, 4vw, 2rem);
    font-weight: 600;
    color: #222;
    margin: 0;
    letter-spacing: -0.01em;
  }

  /* Hero / Cover */
  .signup-hero {
    width: 100%;
    background: #f5f0e8;
    overflow: hidden;
  }

  .signup-hero img {
    width: 100%;
    max-height: 380px;
    object-fit: cover;
    display: block;
  }

  /* Intro Section */
  .signup-intro {
    max-width: 820px;
    margin: 0 auto;
    padding: 40px 24px 32px;
  }

  .signup-intro p {
    font-size: 14px;
    color: #444;
    line-height: 1.8;
    margin: 0 0 12px;
  }

  .signup-intro a {
    color: #2563eb;
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .signup-intro a:hover {
    color: #1d4ed8;
  }

  /* Brand Logos Strip — light, no dark background */
  .brands-strip {
    background: #f5f5f3;
    border-top: 1px solid #e5e5e5;
    border-bottom: 1px solid #e5e5e5;
    padding: 32px 24px;
  }

  .brands-strip-inner {
    max-width: 820px;
    margin: 0 auto;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
  }

  .brand-card {
    flex: 1;
    min-width: 180px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 20px 32px;
    text-decoration: none;
    border-right: 1px solid #ddd;
    transition: opacity 0.2s;
  }

  .brand-card:last-child {
    border-right: none;
  }

  .brand-card:hover {
    opacity: 0.7;
  }

  .brand-logo-wrap {
    height: 70px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .brand-logo-wrap img {
    max-height: 65px;
    max-width: 160px;
    object-fit: contain;
  }

  .brand-tagline {
    color: #888;
    font-size: 11px;
    letter-spacing: 0.04em;
    text-align: center;
    line-height: 1.4;
  }

  /* Form Container */
  .signup-container {
    max-width: 820px;
    margin: 0 auto;
    padding: 40px 24px 80px;
  }

  .form-section {
    background: #fff;
    border: 1px solid #e5e5e5;
    border-radius: 6px;
    padding: 18px 20px;
    margin-bottom: 14px;
  }

  .form-section-title {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 0.88rem;
    font-weight: 600;
    color: #222;
    margin: 0 0 14px;
    padding-bottom: 9px;
    border-bottom: 1px solid #e5e5e5;
    text-transform: none;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  @media (max-width: 600px) {
    .form-row { grid-template-columns: 1fr; }
    .brand-card { border-right: none; border-bottom: 1px solid #ddd; }
    .brand-card:last-child { border-bottom: none; }
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 10px;
  }

  .form-group:last-child {
    margin-bottom: 0;
  }

  .form-label {
    font-size: 11px;
    font-weight: 600;
    color: #444;
  }

  .required {
    color: #c00;
  }

  .form-input {
    width: 100%;
    padding: 7px 10px;
    font-size: 12px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    font-family: inherit;
    color: #222;
    background: #fff;
    transition: border-color 0.15s, box-shadow 0.15s;
    box-sizing: border-box;
    outline: none;
  }

  .form-input:focus {
    border-color: #8B8B4B;
    box-shadow: 0 0 0 2px rgba(139,139,75,0.12);
  }

  select.form-input {
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23666' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;
    padding-right: 28px;
  }

  .form-hint {
    font-size: 10px;
    color: #999;
    margin-top: 1px;
  }

  .password-input-wrapper {
    position: relative;
  }

  .password-toggle {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: #aaa;
    padding: 0;
    display: flex;
    align-items: center;
  }

  .password-toggle:hover { color: #555; }

  /* Checkboxes */
  .checkbox-group {
    margin-bottom: 8px;
  }

  .checkbox-label {
    display: flex;
    align-items: flex-start;
    gap: 7px;
    font-size: 12px;
    color: #333;
    line-height: 1.5;
    cursor: pointer;
  }

  .checkbox-label input[type="checkbox"] {
    width: 13px;
    height: 13px;
    min-width: 13px;
    margin-top: 1px;
    accent-color: #8B8B4B;
    cursor: pointer;
  }

  .checkbox-label a {
    color: #2563eb;
    text-decoration: underline;
  }

  /* Signature */
  .signature-input {
    font-family: 'Brush Script MT', cursive;
    font-size: 15px;
    font-style: italic;
  }

  /* Submit */
  .btn-signup {
    width: 100%;
    background: #1a3a3a;
    color: #fff;
    border: none;
    border-radius: 4px;
    padding: 10px;
    font-family: 'Source Sans Pro', sans-serif;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.03em;
    cursor: pointer;
    transition: background 0.2s;
    margin-top: 4px;
  }

  .btn-signup:hover { background: #0f2828; }
  .btn-signup:disabled { opacity: 0.6; cursor: not-allowed; }

  .login-link {
    text-align: center;
    margin-top: 12px;
    font-size: 12px;
    color: #888;
  }

  .login-link a {
    color: #8B8B4B;
    font-weight: 600;
    text-decoration: underline;
  }

  .error-message {
    background: #fff0f0;
    border: 1px solid #fca5a5;
    color: #cc3333;
    border-radius: 4px;
    padding: 8px 12px;
    font-size: 12px;
    margin-bottom: 12px;
  }
`;

const BRANDS = [
  {
    name: 'True Dates',
    tagline: 'Candy flavored True Dates from Denmark',
    url: 'http://www.truecompany.us',
    logo: '/truedates.jpg',
  },
  {
    name: 'SwedishCandy.com',
    tagline: 'The Official Swedish Candy Company',
    url: 'http://www.swedishcandy.com',
    logo: '/swedishcandy.jpg',
  },
  {
    name: 'PÄNDY',
    tagline: "World's #1 sugar-free Swedish Candy brand",
    url: 'http://www.pandy-candy.com',
    logo: '/pandy.jpg',
  },
];

export default function SignupPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);

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
      country_code: '',
      state: '',
      state_code: '',
      postcode: '',
    },
    agree_min_order: false,
    agree_no_personal_use: false,
    agree_terms: false,
    agree_no_resell: false,
    signature: '',
  });

  useEffect(() => { fetchCountries(); }, []);

  useEffect(() => {
    if (formData.shipping_address.country_code) {
      fetchStates(formData.shipping_address.country_code);
    } else {
      setStates([]);
      setFormData(prev => ({
        ...prev,
        shipping_address: { ...prev.shipping_address, state: '', state_code: '' },
      }));
    }
  }, [formData.shipping_address.country_code]);

  const fetchCountries = async () => {
    try {
      setLoadingCountries(true);
      const response = await locationApi.getCountries();
      if (response.data?.countries) setCountries(response.data.countries);
    } catch (err) {
      console.error('Failed to load countries:', err);
    } finally {
      setLoadingCountries(false);
    }
  };

  const fetchStates = async (iso2) => {
    try {
      setLoadingStates(true);
      const response = await locationApi.getStatesByCountry(iso2);
      if (response.data?.states) setStates(response.data.states);
    } catch (err) {
      console.error('Failed to load states:', err);
      setStates([]);
    } finally {
      setLoadingStates(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('shipping_address.')) {
      const field = name.split('.')[1];
      if (field === 'country_code') {
        const selectedCountry = countries.find(c => c.code === value);
        setFormData(prev => ({
          ...prev,
          shipping_address: {
            ...prev.shipping_address,
            country_code: value,
            country: selectedCountry?.name || '',
            state: '',
            state_code: '',
          },
        }));
      } else if (field === 'state') {
        const selectedState = states.find(s => s.name === value);
        setFormData(prev => ({
          ...prev,
          shipping_address: {
            ...prev.shipping_address,
            state: value,
            state_code: selectedState?.code || '',
          },
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          shipping_address: { ...prev.shipping_address, [field]: value },
        }));
      }
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
      const payload = { ...formData, signed_at: new Date().toISOString().split('T')[0] };
      await authApi.signup(payload);
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
    <>
      <style>{brandStyles}</style>
      <div className="signup-page">

        {/* Title sits above the cover image */}
        <div className="signup-page-title">
          <h1>Wholesale Application Form and Login</h1>
        </div>

        {/* Hero Cover Image */}
        <div className="signup-hero">
          <img
            src="/cover.jpg"
            alt="Humble Group USA Wholesale"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>

        {/* Intro Text */}
        <div className="signup-intro">
          <p>
            Thank you for your interest in becoming a Wholesale Partner where you can order from
            our range including{' '}
            <a href="http://www.truecompany.us" target="_blank" rel="noopener noreferrer">
              True Dates (http://www.truecompany.us)
            </a>
            ,{' '}
            <a href="http://www.swedishcandy.com" target="_blank" rel="noopener noreferrer">
              SwedishCandy.com (http://www.swedishcandy.com)
            </a>{' '}
            and{' '}
            <a href="http://www.pandy-candy.com" target="_blank" rel="noopener noreferrer">
              Pändy (http://www.pandy-candy.com)
            </a>.
          </p>
          <p>
            To qualify for wholesale purchases, you must be a valid business and agree to our{' '}
            <a href="http://www.humblegroupusa.com/terms-and-conditions" target="_blank" rel="noopener noreferrer">
              terms and conditions (http://www.humblegroupusa.com/terms-and-conditions)
            </a>.
          </p>
          <p>Please submit your details beneath, and our team will review your application and get back to you.</p>
          <p>
            Existing customers please login{' '}
            <a href="https://wholesale.humblegroupusa.com/login">
              here. (https://wholesale.humblegroupusa.com/login)
            </a>
          </p>
        </div>

        {/* Brand Logos Strip — light background */}
        <div className="brands-strip">
          <div className="brands-strip-inner">
            {BRANDS.map((brand) => (
              <a
                key={brand.name}
                href={brand.url}
                target="_blank"
                rel="noopener noreferrer"
                className="brand-card"
              >
                <div className="brand-logo-wrap">
                  <img src={brand.logo} alt={brand.name} />
                </div>
                <span className="brand-tagline">{brand.tagline}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="signup-container">
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Personal Information */}
            <div className="form-section">
              <h2 className="form-section-title">Personal Information</h2>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">First Name <span className="required">*</span></label>
                  <input type="text" name="first_name" className="form-input"
                    value={formData.first_name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name <span className="required">*</span></label>
                  <input type="text" name="last_name" className="form-input"
                    value={formData.last_name} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Email <span className="required">*</span></label>
                  <input type="email" name="email" className="form-input"
                    value={formData.email} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone <span className="required">*</span></label>
                  <input type="tel" name="phone" className="form-input"
                    value={formData.phone} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Password <span className="required">*</span></label>
                  <div className="password-input-wrapper">
                    <input type={showPassword ? 'text' : 'password'} name="password"
                      className="form-input" value={formData.password} onChange={handleChange} required />
                    <button type="button" className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <span className="form-hint">Min 9 chars, uppercase, lowercase, number, symbol</span>
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password <span className="required">*</span></label>
                  <div className="password-input-wrapper">
                    <input type={showConfirmPassword ? 'text' : 'password'} name="password_confirmation"
                      className="form-input" value={formData.password_confirmation} onChange={handleChange} required />
                    <button type="button" className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
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
                  <label className="form-label">Company Name <span className="required">*</span></label>
                  <input type="text" name="company_name" className="form-input"
                    value={formData.company_name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Website (if any)</label>
                  <input type="url" name="website" className="form-input"
                    value={formData.website} onChange={handleChange} placeholder="https://" />
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="form-section">
              <h2 className="form-section-title">Shipping Address</h2>

              <div className="form-group">
                <label className="form-label">Address 1 <span className="required">*</span></label>
                <input type="text" name="shipping_address.address_1" className="form-input"
                  value={formData.shipping_address.address_1} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label className="form-label">Address 2</label>
                <input type="text" name="shipping_address.address_2" className="form-input"
                  value={formData.shipping_address.address_2} onChange={handleChange} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Town / City <span className="required">*</span></label>
                  <input type="text" name="shipping_address.city" className="form-input"
                    value={formData.shipping_address.city} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Country <span className="required">*</span></label>
                  <select name="shipping_address.country_code" className="form-input"
                    value={formData.shipping_address.country_code} onChange={handleChange}
                    required disabled={loadingCountries}>
                    <option value="">{loadingCountries ? 'Loading...' : 'Select a country'}</option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>{country.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Postcode / ZIP</label>
                  <input type="text" name="shipping_address.postcode" className="form-input"
                    value={formData.shipping_address.postcode} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">State / Province</label>
                  <select name="shipping_address.state" className="form-input"
                    value={formData.shipping_address.state} onChange={handleChange}
                    disabled={!formData.shipping_address.country_code || loadingStates}>
                    <option value="">
                      {!formData.shipping_address.country_code
                        ? 'Select country first'
                        : loadingStates ? 'Loading...'
                        : states.length === 0 ? 'N/A'
                        : 'Select a state'}
                    </option>
                    {states.map((state, index) => (
                      <option key={index} value={state.name}>{state.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Terms & Agreements */}
            <div className="form-section">
              <h2 className="form-section-title">Terms &amp; Agreements</h2>

              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input type="checkbox" name="agree_min_order"
                    checked={formData.agree_min_order} onChange={handleChange} />
                  <span>
                    I agree that to maintain my account in good standing I must place orders of at
                    least $1,000 per calendar year <span className="required">*</span>
                  </span>
                </label>
              </div>

              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input type="checkbox" name="agree_no_personal_use"
                    checked={formData.agree_no_personal_use} onChange={handleChange} />
                  <span>
                    I agree that I will not purchase from Humble Group USA as a wholesale customer
                    for personal use <span className="required">*</span>
                  </span>
                </label>
              </div>

              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input type="checkbox" name="agree_terms"
                    checked={formData.agree_terms} onChange={handleChange} />
                  <span>
                    I have read and agree to adhere to the{' '}
                    <a href="https://humblegroupusa.com/terms-and-conditions/" target="_blank" rel="noopener noreferrer">
                      terms and conditions
                    </a>{' '}
                    <span className="required">*</span>
                  </span>
                </label>
              </div>

              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input type="checkbox" name="agree_no_resell"
                    checked={formData.agree_no_resell} onChange={handleChange} />
                  <span>
                    I agree I will not resell any Humble Group USA products on any online portal
                    aside from those I own as part of my business, without the express written
                    consent of Humble Group USA <span className="required">*</span>
                  </span>
                </label>
              </div>
            </div>

            {/* Signature */}
            <div className="form-section">
              <h2 className="form-section-title">Signature</h2>
              <div className="form-group">
                <label className="form-label">
                  Type your full name as signature <span className="required">*</span>
                </label>
                <input type="text" name="signature" className="form-input signature-input"
                  value={formData.signature} onChange={handleChange}
                  placeholder="Your Full Name" required />
              </div>
            </div>

            <button type="submit" className="btn-signup" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit'}
            </button>

            <p className="login-link">
              Already have an account? <Link to="/login">Log in here</Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}