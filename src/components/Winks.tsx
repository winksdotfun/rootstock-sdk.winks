import React, { useEffect, useMemo, useState } from 'react';
const RAINBOWKIT_STYLES_URL = 'https://cdnjs.cloudflare.com/ajax/libs/rainbowkit/1.3.7/rainbowkit.min.css';
import axios from 'axios';
import { getApiBaseUrl } from '../config/api';
import { WinksProps, MetaData } from '../types';

const Winks: React.FC<WinksProps> = ({ 
  apikey, 
  children, 
  fallback = {} 
}) => {
  const styleElement = useMemo(() => {
    if (typeof document === 'undefined') {
      return undefined;
    }

    let existing = document.querySelector<HTMLLinkElement>('link[data-winks-rainbowkit]');
    if (existing) {
      return existing;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = RAINBOWKIT_STYLES_URL;
    link.setAttribute('data-winks-rainbowkit', 'true');
    document.head.appendChild(link);
    return link;
  }, []);

  const [metaData, setMetaData] = useState<MetaData>(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetaData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${getApiBaseUrl()}/api/meta/${apikey}`);
        setMetaData(response.data);
        setError(null);
      } catch (err) {
        console.error('Winks: Failed to fetch metadata:', err);
        setError('Failed to fetch metadata');
        // Use fallback data if available
        if (Object.keys(fallback).length > 0) {
          setMetaData(fallback);
        }
      } finally {
        setLoading(false);
      }
    };

    if (apikey) {
      fetchMetaData();
    }
      }, [apikey, fallback]);

  useEffect(() => {
    if (!loading && metaData) {
      // Update document title
      if (metaData.title) {
        document.title = metaData.title;
      }

      // Update or create meta tags
      const updateMetaTag = (name: string, content: string) => {
        let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
        if (!meta) {
          meta = document.createElement('meta');
          meta.name = name;
          document.head.appendChild(meta);
        }
        meta.content = content;
      };

      const updatePropertyMetaTag = (property: string, content: string) => {
        let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('property', property);
          document.head.appendChild(meta);
        }
        meta.content = content;
      };

      // Update standard meta tags
      if (metaData.description) {
        updateMetaTag('description', metaData.description);
      }
      if (metaData.keywords) {
        updateMetaTag('keywords', metaData.keywords);
      }
      if (metaData.author) {
        updateMetaTag('author', metaData.author);
      }
      if (metaData.robots) {
        updateMetaTag('robots', metaData.robots);
      }
      if (metaData.viewport) {
        updateMetaTag('viewport', metaData.viewport);
      }
      if (metaData.charset) {
        updateMetaTag('charset', metaData.charset);
      }

      // Update Open Graph tags
      if (metaData.ogTitle) {
        updatePropertyMetaTag('og:title', metaData.ogTitle);
      }
      if (metaData.ogDescription) {
        updatePropertyMetaTag('og:description', metaData.ogDescription);
      }
      if (metaData.ogImage) {
        updatePropertyMetaTag('og:image', metaData.ogImage);
      }
      if (metaData.ogUrl) {
        updatePropertyMetaTag('og:url', metaData.ogUrl);
      }

      // Update Twitter Card tags
      if (metaData.twitterCard) {
        updateMetaTag('twitter:card', metaData.twitterCard);
      }
      if (metaData.twitterTitle) {
        updateMetaTag('twitter:title', metaData.twitterTitle);
      }
      if (metaData.twitterDescription) {
        updateMetaTag('twitter:description', metaData.twitterDescription);
      }
      if (metaData.twitterImage) {
        updateMetaTag('twitter:image', metaData.twitterImage);
      }

      // Update canonical URL
      if (metaData.canonical) {
        let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
        if (!canonical) {
          canonical = document.createElement('link');
          canonical.rel = 'canonical';
          document.head.appendChild(canonical);
        }
        canonical.href = metaData.canonical;
      }
    }
  }, [metaData, loading]);

  // Show loading state if needed
  if (loading) {
    return <div style={{ display: 'none' }}>Loading...</div>;
  }

  // Show error state if needed
  if (error && Object.keys(fallback).length === 0) {
    console.error('Winks Error:', error);
  }

  return <>{children}</>;
};

export default Winks; 