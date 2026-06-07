import { useState, useEffect } from 'react';
import { getAdminDashboard } from '../../api/dashboard';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getAdminDashboard();
        setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="page-loading"><div className="spinner"></div></div>;
  }

  const cards = [
    { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: '#6366f1' },
    { label: 'Total Stores', value: stats.totalStores, icon: '🏪', color: '#8b5cf6' },
    { label: 'Total Ratings', value: stats.totalRatings, icon: '⭐', color: '#a78bfa' },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>Overview of your platform</p>
      </div>
      <div className="stats-grid">
        {cards.map((card) => (
          <div key={card.label} className="stat-card" style={{ '--accent': card.color }}>
            <div className="stat-icon">{card.icon}</div>
            <div className="stat-content">
              <span className="stat-value">{card.value}</span>
              <span className="stat-label">{card.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
