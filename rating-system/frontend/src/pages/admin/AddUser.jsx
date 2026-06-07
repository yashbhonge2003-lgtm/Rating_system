import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUser } from '../../api/users';

export default function AddUser() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', address: '', role: 'user',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.name.trim()) {
      e.name = 'Name is required';
    } else if (form.name.trim().length < 20) {
      e.name = 'Name must be at least 20 characters';
    } else if (form.name.trim().length > 60) {
      e.name = 'Name must not exceed 60 characters';
    }

    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email address';
    
    if (form.password.length < 8) {
      e.password = 'Password must be at least 8 characters';
    } else if (form.password.length > 16) {
      e.password = 'Password must not exceed 16 characters';
    } else if (!/(?=.*[A-Z])/.test(form.password)) {
      e.password = 'Password must include at least one uppercase letter';
    } else if (!/(?=.*[\W_])/.test(form.password)) {
      e.password = 'Password must include at least one special character';
    }

    if (form.address.length > 400) e.address = 'Address must not exceed 400 characters';
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
      await createUser(form);
      setSuccess('User created successfully!');
      setForm({ name: '', email: '', password: '', address: '', role: 'user' });
      setTimeout(() => navigate('/admin/users'), 1500);
    } catch (err) {
      const msg = err.response?.data?.message;
      setServerError(Array.isArray(msg) ? msg.join(', ') : msg || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Add User</h1>
        <p>Create a new platform user</p>
      </div>
      <div className="form-card">
        <form onSubmit={handleSubmit}>
          {serverError && <div className="error-message">{serverError}</div>}
          {success && <div className="success-message">{success}</div>}
          <div className="form-group">
            <label htmlFor="add-name">Name</label>
            <input id="add-name" type="text" value={form.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="Enter user's name" required />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="add-email">Email</label>
            <input id="add-email" type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} placeholder="user@example.com" required />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="add-password">Password</label>
            <input id="add-password" type="password" value={form.password} onChange={(e) => handleChange('password', e.target.value)} placeholder="8-16 chars" required />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="add-address">Address</label>
            <textarea id="add-address" value={form.address} onChange={(e) => handleChange('address', e.target.value)} placeholder="Enter address" rows="2" />
            {errors.address && <span className="field-error">{errors.address}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="add-role">Role</label>
            <select id="add-role" value={form.role} onChange={(e) => handleChange('role', e.target.value)}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="store_owner">Store Owner</option>
            </select>
          </div>
          <button type="submit" className="btn-primary btn-full" disabled={loading}>
            {loading ? 'Creating...' : 'Create User'}
          </button>
        </form>
      </div>
    </div>
  );
}
