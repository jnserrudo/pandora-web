import React from 'react';

/** Shared list skeleton — silueta de ficha (cover + título + meta) */
const EntityCardSkeleton = ({ count = 6 }) => (
  <>
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className="skeleton-card" aria-hidden="true">
        <div className="sk-media" />
        <div className="skeleton-card-body">
          <div className="sk-line sk-title" />
          <div className="sk-line sk-body" />
          <div className="sk-line sk-body short" />
        </div>
      </div>
    ))}
  </>
);

export default EntityCardSkeleton;
