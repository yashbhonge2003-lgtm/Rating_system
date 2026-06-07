import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUser, updateUserRole } from '../../api/users';
import RatingStars from '../../components/RatingStars';

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingRole, setUpdatingRole] = useState(false);
  const [roleMsg, setRoleMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getUser(id);
        setUser(res.data);
      } catch (err) {
        console.error('Failed to fetch user:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const handleRoleChange = async (newRole) => {
    setUpdatingRole(true);
    setRoleMsg({ text: '', type: '' });
    try {
      await updateUserRole(id, newRole);
      setRoleMsg({ text: 'Role updated successfully!', type: 'success' });
      // Refresh user details to reflect the changes
      const res = await getUser(id);
      setUser(res.data);
    } catch (err) {
      console.error('Failed to update role:', err);
      const msg = err.response?.data?.message || 'Failed to update user role';
      setRoleMsg({ text: msg, type: 'error' });
    } finally {
      setUpdatingRole(false);
    }
  };

  if (loading) {
    return <div className="page-loading"><div className="spinner"></div></div>;
  }

  if (!user) {
    return (
      <div className="page">
        <div className="error-message">User not found</div>
        <button onClick={() => navigate('/admin/users')} className="btn-secondary">Back to Users</button>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <button onClick={() => navigate('/admin/users')} className="btn-back">← Back to Users</button>
        <h1>User Details</h1>
        <p>View details and manage user settings</p>
      </div>
      <div className="detail-card">
        {roleMsg.text && (
          <div className={roleMsg.type === 'success' ? 'success-message' : 'error-message'}>
            {roleMsg.text}
          </div>
        )}
        <div className="detail-avatar">
          {user.name?.charAt(0).toUpperCase()}
        </div>
        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-label">Name</span>
            <span className="detail-value">{user.name}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Email</span>
            <span className="detail-value">{user.email}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Address</span>
            <span className="detail-value">{user.address || '-'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Role (Change below)</span>
            <div className="role-edit-container">
              <select
                value={user.role}
                onChange={(e) => handleRoleChange(e.target.value)}
                disabled={updatingRole}
                className="role-select-dropdown"
              >
                <option value="user">Normal User</option>
                <option value="store_owner">Store Owner</option>
                <option value="admin">System Administrator</option>
              </select>
            </div>
          </div>
        </div>
        {user.role === 'store_owner' && user.storeName && (
          <div className="detail-extra">
            <h3>Store Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Store Name</span>
                <span className="detail-value">{user.storeName}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Average Rating</span>
                <div className="detail-value">
                  {user.storeAverageRating ? (
                    <RatingStars value={user.storeAverageRating} readonly size="sm" />
                  ) : (
                    'No ratings yet'
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
