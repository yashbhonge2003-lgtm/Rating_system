import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsers } from '../../api/users';
import SortableTable from '../../components/SortableTable';
import FilterBar from '../../components/FilterBar';

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const navigate = useNavigate();

  const filterConfig = [
    { key: 'filterName', label: 'Name', type: 'text', placeholder: 'Search name...' },
    { key: 'filterEmail', label: 'Email', type: 'text', placeholder: 'Search email...' },
    { key: 'filterAddress', label: 'Address', type: 'text', placeholder: 'Search address...' },
    {
      key: 'filterRole', label: 'Role', type: 'select',
      options: [
        { value: 'admin', label: 'Admin' },
        { value: 'user', label: 'User' },
        { value: 'store_owner', label: 'Store Owner' },
      ],
    },
  ];

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'address', label: 'Address' },
    {
      key: 'role', label: 'Role',
      render: (val) => (
        <span className={`role-badge role-${val}`}>
          {val === 'store_owner' ? 'Store Owner' : val?.charAt(0).toUpperCase() + val?.slice(1)}
        </span>
      ),
    },
  ];

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getUsers(filters);
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const debounce = setTimeout(fetchUsers, 300);
    return () => clearTimeout(debounce);
  }, [fetchUsers]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Users</h1>
        <p>Manage all platform users</p>
      </div>
      <FilterBar filters={filterConfig} values={filters} onChange={handleFilterChange} />
      {loading ? (
        <div className="page-loading"><div className="spinner"></div></div>
      ) : (
        <SortableTable
          columns={columns}
          data={users}
          onRowClick={(row) => navigate(`/admin/users/${row.id}`)}
          emptyMessage="No users found"
        />
      )}
    </div>
  );
}
