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
      postcode: '',
    },
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await authApi.getUserData();
      // Handle nested data.data structure
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
            postcode: shipping_address?.postcode || '',
          },
        }));
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
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    name="shipping_address.city"
                    className="form-input"
                    value={formData.shipping_address.city}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Country</label>
                  <input
                    type="text"
                    name="shipping_address.country"
                    className="form-input"
                    value={formData.shipping_address.country}
                    onChange={handleChange}
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