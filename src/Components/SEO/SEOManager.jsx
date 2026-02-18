import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * SEOManager
 * @param {Object} props
 * @param {string} props.title - Page title
 * @param {string} props.description - Meta description
 * @param {string} props.image - OpenGraph image
 * @param {string} props.url - Canonical URL
 */
const SEOManager = ({ title, description, image, url }) => {
  const siteName = "Pandora Web";
  const defaultDescription = "Descubrí el ecosistema Pandora. Comercios, eventos y magazine local.";
  const defaultImage = "/og-image.jpg"; // Placeholder path

  const fullTitle = title ? `${title} | ${siteName}` : siteName;

  return (
    <Helmet>
      {/* Basic Metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={description || defaultDescription} />

      {/* OpenGraph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url || window.location.href} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:image" content={image || defaultImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
      <meta name="twitter:image" content={image || defaultImage} />
    </Helmet>
  );
};

export default SEOManager;
