import { useState } from 'react';

export default function RatingStars({ value = 0, onChange, readonly = false, size = 'md' }) {
  const [hoverValue, setHoverValue] = useState(0);

  const sizeClass = size === 'sm' ? 'stars-sm' : size === 'lg' ? 'stars-lg' : 'stars-md';

  return (
    <div className={`rating-stars ${sizeClass} ${readonly ? 'readonly' : 'interactive'}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${(hoverValue || value) >= star ? 'filled' : 'empty'}`}
          onClick={() => !readonly && onChange && onChange(star)}
          onMouseEnter={() => !readonly && setHoverValue(star)}
          onMouseLeave={() => !readonly && setHoverValue(0)}
        >
          ★
        </span>
      ))}
      {value > 0 && <span className="rating-value">{value.toFixed?.(1) || value}/5</span>}
    </div>
  );
}
