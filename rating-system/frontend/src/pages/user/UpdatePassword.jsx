import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updatePassword } from '../../api/users';

export default function UpdatePassword() {
  const { user } = useAuth();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.currentPassword) e.currentPassword = 'Current password is required';
    
    if (form.newPassword.length < 8) {
      e.newPassword = 'Password must be at least 8 characters';
    } else if (form.newPassword.length > 16) {
      e.newPassword = 'Password must not exceed 16 characters';
    } else if (!/(?=.*[A-Z])/.test(form.newPassword)) {
      e.newPassword = 'Password must include at least one uppercase letter';
    } else if (!/(?=.*[\W_])/.test(form.newPassword)) {
      e.newPassword = 'Password must include at least one special character';
    }

    if (form.newPassword !== form.confirmPassword) {
      e.confirmPassword = 'Passwords do not match';
    }
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
      await updatePassword(user.id, {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setSuccess('Password updated successfully!');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Update Password</h1>
        <p>Change your account password</p>
      </div>
      <div className="form-card">
        <form onSubmit={handleSubmit}>
          {serverError && <div className="error-message">{serverError}</div>}
          {success && <div className="success-message">{success}</div>}
          <div className="form-group">
            <label htmlFor="current-password">Current Password</label>
            <input id="current-password" type="password" value={form.currentPassword} onChange={(e) => handleChange('currentPassword', e.target.value)} required />
            {errors.currentPassword && <span className="field-error">{errors.currentPassword}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="new-password">New Password</label>
            <input id="new-password" type="password" value={form.newPassword} onChange={(e) => handleChange('newPassword', e.target.value)} placeholder="8-16 chars" required />
            {errors.newPassword && <span className="field-error">{errors.newPassword}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="confirm-password">Confirm Password</label>
            <input id="confirm-password" type="password" value={form.confirmPassword} onChange={(e) => handleChange('confirmPassword', e.target.value)} required />
            {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
          </div>
          <button type="submit" className="btn-primary btn-full" disabled={loading}>
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
