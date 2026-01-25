import { useState, useEffect } from 'react';
import { authApi } from '../api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Loading from '../components/Loading';
import { Save, Eye, EyeOff } from 'lucide-react';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Location data
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
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
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  useEffect(() => {
    fetchUserData();
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      setLoadingCountries(true);
      const response = await fetch('https://api.humblegroupusa.com/api/countries');
      const data = await response.json();
      if (data.data?.countries) {
        setCountries(data.data.countries);
      }
    } catch (err) {
      console.error('Failed to load countries:', err);
    } finally {
      setLoadingCountries(false);
    }
  };

  const fetchStates = async (countryCode) => {
    if (!countryCode) {
      setStates([]);
      return;
    }

    try {
      setLoadingStates(true);
      const response = await fetch(`https://api.humblegroupusa.com/api/countries/states?iso2=${countryCode}`);
      const data = await response.json();
      if (data.data?.states) {
        setStates(data.data.states);
      } else {
        setStates([]);
      }
    } catch (err) {
      console.error('Failed to load states:', err);
      setStates([]);
    } finally {
      setLoadingStates(false);
    }
  };

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await authApi.getUserData();
      const userData = response.data?.data?.data || response.data?.data || response.data;
      
      if (userData) {
        const user = userData.user || userData;
        const shipping_address = userData.shipping_address || {};
        
        setFormData(prev => ({
          ...prev,
          first_name: user?.first_name || '',
          last_name: user?.last_name || '',
          email: user?.email || '',
          phone: user?.phone || '',
          company_name: user?.company_name || '',
          website: user?.website || '',
          shipping_address: {
            address_1: shipping_address?.address_1 || '',
            address_2: shipping_address?.address_2 || '',
            city: shipping_address?.city || '',
            country: shipping_address?.country || '',
            country_code: shipping_address?.country_code || '',
            state: shipping_address?.state || '',
            state_code: shipping_address?.state_code || '',
            postcode: shipping_address?.postcode || '',
          },
        }));

        // Load states if country_code exists
        if (shipping_address?.country_code) {
          await fetchStates(shipping_address.country_code);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
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
        [name]: value,
      }));
    }
  };

  const handleCountryChange = async (e) => {
    const countryCode = e.target.value;
    const selectedCountry = countries.find(c => c.code === countryCode);

    setFormData(prev => ({
      ...prev,
      shipping_address: {
        ...prev.shipping_address,
        country_code: countryCode,
        country: selectedCountry?.name || '',
        state: '',
        state_code: '',
      },
    }));

    if (countryCode) {
      await fetchStates(countryCode);
    } else {
      setStates([]);
    }
  };

  const handleStateChange = (e) => {
    const stateName = e.target.value;
    const selectedState = states.find(s => s.name === stateName);

    setFormData(prev => ({
      ...prev,
      shipping_address: {
        ...prev.shipping_address,
        state: stateName,
        state_code: selectedState?.code || '',
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        company_name: formData.company_name,
        website: formData.website || null,
        shipping_address: formData.shipping_address,
      };

      // Only include password fields if user is changing password
      if (formData.password) {
        payload.current_password = formData.current_password;
        payload.password = formData.password;
        payload.password_confirmation = formData.password_confirmation;
      }

      await authApi.updateProfile(payload);
      setSuccess('Profile updated successfully!');
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        current_password: '',
        password: '',
        password_confirmation: '',
      }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <Loading />
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="container">
        <div className="profile-page">
          <h1 className="profile-title">My Profile</h1>
          
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="profile-section">
              <h2 className="section-title">Personal Information</h2>
              <div className="profile-grid">
                <div className="form-group">
                  <label className="form-label">First Name</label>
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
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    className="form-input"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
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
                  <label className="form-label">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    className="form-input"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Company Name</label>
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

            <div className="profile-section">
              <h2 className="section-title">Shipping Address</h2>
              <div className="profile-grid">
                <div className="form-group full-width">
                  <label className="form-label">Address Line 1</label>
                  <input
                    type="text"
                    name="shipping_address.address_1"
                    className="form-input"
                    value={formData.shipping_address.address_1}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group full-width">
                  <label className="form-label">Address Line 2</label>
                  <input
                    type="text"
                    name="shipping_address.address_2"
                    className="form-input"
                    value={formData.shipping_address.address_2}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Country</label>
                  <select
                    className="form-input"
                    value={formData.shipping_address.country_code}
                    onChange={handleCountryChange}
                    disabled={loadingCountries}
                    required
                  >
                    <option value="">
                      {loadingCountries ? 'Loading countries...' : 'Select a country'}
                    </option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">State / Province</label>
                  <select
                    className="form-input"
                    value={formData.shipping_address.state}
                    onChange={handleStateChange}
                    disabled={!formData.shipping_address.country_code || loadingStates}
                    required
                  >
                    <option value="">
                      {!formData.shipping_address.country_code
                        ? 'Select country first'
                        : loadingStates
                        ? 'Loading states...'
                        : states.length === 0
                        ? 'No states available'
                        : 'Select a state'}
                    </option>
                    {states.map((state, index) => (
                      <option key={index} value={state.name}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">City</label>
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
                  <label className="form-label">Postcode / ZIP</label>
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

            <div className="profile-section">
              <h2 className="section-title">Change Password</h2>
              <p className="section-hint">Leave blank to keep current password</p>
              <div className="profile-grid">
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="current_password"
                      className="form-input"
                      value={formData.current_password}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      name="password"
                      className="form-input"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="password_confirmation"
                      className="form-input"
                      value={formData.password_confirmation}
                      onChange={handleChange}
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

            <div className="profile-actions">
              <button type="submit" className="btn-save" disabled={saving}>
                <Save size={18} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}