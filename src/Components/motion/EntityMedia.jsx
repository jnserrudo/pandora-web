import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { getAbsoluteImageUrl } from '../../services/api';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';

const PLACEHOLDER =
  'https://placehold.co/800x500/0a0612/ffffff/png?text=Pandora';

function normalizeSources(images, coverImage) {
  const list = [];
  if (coverImage) list.push(coverImage);
  if (Array.isArray(images)) {
    images.forEach((img) => {
      if (img && !list.includes(img)) list.push(img);
    });
  }
  return list.filter(Boolean);
}

/**
 * Crossfading gallery media for cards / heroes.
 * Cycles every `intervalMs` when there are 2+ images.
 */
export default function EntityMedia({
  coverImage,
  images,
  alt = '',
  className = '',
  intervalMs = 4200,
  aspectRatio,
  hoverZoom = true,
  fallback = PLACEHOLDER,
}) {
  const sources = useMemo(
    () => normalizeSources(images, coverImage),
    [images, coverImage]
  );
  const reduced = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    setIndex(0);
  }, [coverImage, images]);

  useEffect(() => {
    if (reduced || paused || sources.length < 2) return undefined;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % sources.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [sources.length, intervalMs, paused, reduced]);

  const urls = sources.length
    ? sources.map((s) => getAbsoluteImageUrl(s) || fallback)
    : [fallback];

  return (
    <div
      className={`entity-media ${hoverZoom ? 'entity-media--zoom' : ''} ${className}`.trim()}
      style={aspectRatio ? { aspectRatio } : undefined}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      {urls.map((src, i) => (
        <img
          key={`${src}-${i}`}
          src={src}
          alt={i === index ? alt : ''}
          className={`entity-media__img ${i === index ? 'is-active' : ''}`}
          loading={i === 0 ? 'eager' : 'lazy'}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = fallback;
          }}
        />
      ))}
      {urls.length > 1 && (
        <div className="entity-media__dots" aria-hidden="true">
          {urls.map((_, i) => (
            <span key={i} className={i === index ? 'is-on' : ''} />
          ))}
        </div>
      )}
    </div>
  );
}

EntityMedia.propTypes = {
  coverImage: PropTypes.string,
  images: PropTypes.arrayOf(PropTypes.string),
  alt: PropTypes.string,
  className: PropTypes.string,
  intervalMs: PropTypes.number,
  aspectRatio: PropTypes.string,
  hoverZoom: PropTypes.bool,
  fallback: PropTypes.string,
};
