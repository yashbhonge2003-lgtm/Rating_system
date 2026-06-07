export default function FilterBar({ filters, values, onChange }) {
  return (
    <div className="filter-bar">
      {filters.map((filter) => (
        <div key={filter.key} className="filter-item">
          <label htmlFor={`filter-${filter.key}`}>{filter.label}</label>
          {filter.type === 'select' ? (
            <select
              id={`filter-${filter.key}`}
              value={values[filter.key] || ''}
              onChange={(e) => onChange(filter.key, e.target.value)}
            >
              <option value="">All</option>
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              id={`filter-${filter.key}`}
              type="text"
              placeholder={filter.placeholder || `Filter by ${filter.label.toLowerCase()}`}
              value={values[filter.key] || ''}
              onChange={(e) => onChange(filter.key, e.target.value)}
            />
          )}
        </div>
      ))}
    </div>
  );
}
