import { useState, useEffect, useCallback } from 'react';
import { getStores } from '../../api/stores';
import { createRating, updateRating } from '../../api/ratings';
import RatingStars from '../../components/RatingStars';

export default function UserStoreList() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState('');
  const [searchAddress, setSearchAddress] = useState('');
  const [ratingModal, setRatingModal] = useState(null);
  const [selectedRating, setSelectedRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const fetchStores = useCallback(async () => {
    try {
      const res = await getStores({ searchName, searchAddress });
      setStores(res.data);
    } catch (err) {
      console.error('Failed to fetch stores:', err);
    } finally {
      setLoading(false);
    }
  }, [searchName, searchAddress]);

  useEffect(() => {
    setLoading(true);
    const debounce = setTimeout(fetchStores, 300);
    return () => clearTimeout(debounce);
  }, [fetchStores]);

  const handleSubmitRating = async () => {
    if (!ratingModal || selectedRating === 0) return;
    setSubmitting(true);
    try {
      if (ratingModal.currentUserRatingId) {
        await updateRating(ratingModal.currentUserRatingId, { value: selectedRating });
      } else {
        await createRating({ storeId: ratingModal.id, value: selectedRating });
      }
      setRatingModal(null);
      setSelectedRating(0);
      fetchStores();
    } catch (err) {
      console.error('Failed to submit rating:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const openRatingModal = (store) => {
    setRatingModal(store);
    setSelectedRating(store.currentUserRating || 0);
  };

  if (loading) {
    return <div className="page-loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Stores</h1>
        <p>Browse and rate stores</p>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Search by address..."
          value={searchAddress}
          onChange={(e) => setSearchAddress(e.target.value)}
        />
      </div>

      <div className="store-grid">
        {stores.length === 0 ? (
          <div className="empty-state">No stores found</div>
        ) : (
          stores.map((store) => (
            <div key={store.id} className="store-card">
              <div className="store-card-header">
                <h3>{store.name}</h3>
                <p className="store-address">{store.address || 'No address'}</p>
              </div>
              <div className="store-card-body">
                <div className="rating-row">
                  <span className="rating-label">Overall Rating</span>
                  {store.averageRating ? (
                    <RatingStars value={store.averageRating} readonly size="sm" />
                  ) : (
                    <span className="text-muted">No ratings yet</span>
                  )}
                </div>
                <div className="rating-row">
                  <span className="rating-label">Your Rating</span>
                  {store.currentUserRating ? (
                    <RatingStars value={store.currentUserRating} readonly size="sm" />
                  ) : (
                    <span className="text-muted">Not rated</span>
                  )}
                </div>
              </div>
              <div className="store-card-footer">
                <button
                  className={store.currentUserRating ? 'btn-secondary' : 'btn-primary'}
                  onClick={() => openRatingModal(store)}
                >
                  {store.currentUserRating ? 'Edit Rating' : 'Rate Store'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {ratingModal && (
        <div className="modal-overlay" onClick={() => setRatingModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{ratingModal.currentUserRating ? 'Edit Rating' : 'Rate Store'}</h2>
            <p className="modal-store-name">{ratingModal.name}</p>
            <div className="modal-stars">
              <RatingStars value={selectedRating} onChange={setSelectedRating} size="lg" />
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setRatingModal(null)}>Cancel</button>
              <button
                className="btn-primary"
                onClick={handleSubmitRating}
                disabled={selectedRating === 0 || submitting}
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
