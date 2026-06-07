import { useState, useEffect } from 'react';
import { getStoreOwnerDashboard } from '../../api/dashboard';
import RatingStars from '../../components/RatingStars';
import SortableTable from '../../components/SortableTable';

export default function OwnerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getStoreOwnerDashboard();
        setData(res.data);
      } catch (err) {
        console.error('Failed to fetch dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="page-loading"><div className="spinner"></div></div>;
  }

  if (!data) {
    return (
      <div className="page">
        <div className="error-message">Failed to load dashboard</div>
      </div>
    );
  }

  const columns = [
    { key: 'userName', label: 'User Name' },
    {
      key: 'value', label: 'Rating',
      render: (val) => <RatingStars value={val} readonly size="sm" />,
    },
    {
      key: 'createdAt', label: 'Date',
      render: (val) => new Date(val).toLocaleDateString(),
    },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h1>Store Dashboard</h1>
        <p>{data.storeName || 'Your Store'}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card" style={{ '--accent': '#6366f1' }}>
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <span className="stat-value">{data.averageRating?.toFixed(1) || 'N/A'}</span>
            <span className="stat-label">Average Rating</span>
          </div>
        </div>
        <div className="stat-card" style={{ '--accent': '#8b5cf6' }}>
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <span className="stat-value">{data.totalRatings}</span>
            <span className="stat-label">Total Ratings</span>
          </div>
        </div>
      </div>

      <div className="section">
        <h2>All Ratings</h2>
        <SortableTable columns={columns} data={data.ratings || []} emptyMessage="No ratings yet" />
      </div>
    </div>
  );
}
