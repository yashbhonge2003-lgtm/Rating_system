import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStore, updateStore } from '../../api/stores';
import { getUsers } from '../../api/users';

export default function EditStore() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', address: '', ownerId: '' });
  const [owners, setOwners] = useState([]);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ownersRes, storeRes] = await Promise.all([
          getUsers({ filterRole: 'store_owner' }),
          getStore(id)
        ]);
        setOwners(ownersRes.data);
        const { name, email, address, ownerId } = storeRes.data;
        setForm({ name, email, address: address || '', ownerId });
      } catch (err) {
        console.error('Failed to load data:', err);
        setServerError('Failed to fetch store details');
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, [id]);

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
      await updateStore(id, form);
      setSuccess('Store updated successfully!');
      setTimeout(() => navigate('/admin/stores'), 1500);
    } catch (err) {
      const msg = err.response?.data?.message;
      setServerError(Array.isArray(msg) ? msg.join(', ') : msg || 'Failed to update store');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="page-loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="page">
      <div className="page-header">
        <button onClick={() => navigate('/admin/stores')} className="btn-back">← Back to Stores</button>
        <h1>Edit Store</h1>
        <p>Modify store details and assign owner</p>
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
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
