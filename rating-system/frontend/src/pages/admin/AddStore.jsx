import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createStore } from '../../api/stores';
import { getUsers } from '../../api/users';

export default function AddStore() {
  const [form, setForm] = useState({ name: '', email: '', address: '', ownerId: '' });
  const [owners, setOwners] = useState([]);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const res = await getUsers({ filterRole: 'store_owner' });
        setOwners(res.data);
      } catch (err) {
        console.error('Failed to fetch store owners:', err);
      }
    };
    fetchOwners();
  }, []);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email address';
    if (form.address.length > 400) e.address = 'Address must not exceed 400 characters';
    if (!form.ownerId) e.ownerId = 'Please select a store owner';
    return e;
  };

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setServerError('');
    setLoading(true);
    try {
      await createStore(form);
      setSuccess('Store created successfully!');
      setForm({ name: '', email: '', address: '', ownerId: '' });
      setTimeout(() => navigate('/admin/stores'), 1500);
    } catch (err) {
      const msg = err.response?.data?.message;
      setServerError(Array.isArray(msg) ? msg.join(', ') : msg || 'Failed to create store');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Add Store</h1>
        <p>Register a new store on the platform</p>
      </div>
      <div className="form-card">
        <form onSubmit={handleSubmit}>
          {serverError && <div className="error-message">{serverError}</div>}
          {success && <div className="success-message">{success}</div>}
          <div className="form-group">
            <label htmlFor="store-name">Store Name</label>
            <input id="store-name" type="text" value={form.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="Enter store name" required />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="store-email">Email</label>
            <input id="store-email" type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} placeholder="store@example.com" required />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="store-address">Address</label>
            <textarea id="store-address" value={form.address} onChange={(e) => handleChange('address', e.target.value)} placeholder="Enter store address" rows="2" />
            {errors.address && <span className="field-error">{errors.address}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="store-owner">Owner</label>
            <select id="store-owner" value={form.ownerId} onChange={(e) => handleChange('ownerId', e.target.value)} required>
              <option value="">Select a store owner</option>
              {owners.map((o) => (
                <option key={o.id} value={o.id}>{o.name} ({o.email})</option>
              ))}
            </select>
            <span className="field-hint">Only users created with the role "Store Owner" appear here. To create one, go to "Add User".</span>
            {errors.ownerId && <span className="field-error">{errors.ownerId}</span>}
          </div>
          <button type="submit" className="btn-primary btn-full" disabled={loading}>
            {loading ? 'Creating...' : 'Create Store'}
          </button>
        </form>
      </div>
    </div>
  );
}
