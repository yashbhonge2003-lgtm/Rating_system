import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminStores } from '../../api/stores';
import SortableTable from '../../components/SortableTable';
import RatingStars from '../../components/RatingStars';
import FilterBar from '../../components/FilterBar';

export default function AdminStoreList() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const navigate = useNavigate();

  const filterConfig = [
    { key: 'filterName', label: 'Name', type: 'text', placeholder: 'Search store name...' },
    { key: 'filterEmail', label: 'Email', type: 'text', placeholder: 'Search store email...' },
    { key: 'filterAddress', label: 'Address', type: 'text', placeholder: 'Search store address...' },
  ];

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'address', label: 'Address' },
    {
      key: 'averageRating', label: 'Avg Rating',
      render: (val) => val ? <RatingStars value={val} readonly size="sm" /> : <span className="text-muted">No ratings</span>,
    },
  ];

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminStores(filters);
      setStores(res.data);
    } catch (err) {
      console.error('Failed to fetch stores:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const debounce = setTimeout(fetchStores, 300);
    return () => clearTimeout(debounce);
  }, [fetchStores]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Stores</h1>
        <p>All registered stores on the platform (Click a row to edit/assign owner)</p>
      </div>
      <FilterBar filters={filterConfig} values={filters} onChange={handleFilterChange} />
      {loading ? (
        <div className="page-loading"><div className="spinner"></div></div>
      ) : (
        <SortableTable
          columns={columns}
          data={stores}
          onRowClick={(row) => navigate(`/admin/stores/edit/${row.id}`)}
          emptyMessage="No stores found"
        />
      )}
    </div>
  );
}
