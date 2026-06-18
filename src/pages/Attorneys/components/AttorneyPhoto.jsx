import { useState } from 'react';
import { resolveMediaUrl } from '../../../services/apiBaseUrl';

const AttorneyPhoto = ({
  photoUrl,
  alt,
  className = 'attorney-photo',
  placeholderClassName = 'attorney-photo-placeholder',
  loading = 'lazy',
}) => {
  const [failed, setFailed] = useState(false);

  if (!photoUrl || failed) {
    return <div className={placeholderClassName} aria-label={alt} />;
  }

  return (
    <img
      className={className}
      src={resolveMediaUrl(photoUrl)}
      alt={alt}
      loading={loading}
      onError={() => setFailed(true)}
    />
  );
};

export default AttorneyPhoto;
