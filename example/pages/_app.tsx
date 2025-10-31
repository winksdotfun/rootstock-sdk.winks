import React from 'react';
import type { AppProps } from 'next/app';
import '@rainbow-me/rainbowkit/styles.css';
import { Winks } from 'rootstockwinks';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Winks 
      apikey="WINKS_ME2L7PB8_XZCK6PC627"
      // fallback={{
      //   title: "Winks Example App",
      //   description: "A NextJS app demonstrating Winks meta tag management",
      //   ogTitle: "Winks Example App",
      //   ogDescription: "A NextJS app demonstrating Winks meta tag management",
      //   ogImage: "https://via.placeholder.com/1200x630/007bff/ffffff?text=Winks+Example",
      //   twitterCard: "summary_large_image",
      //   twitterTitle: "Winks Example App",
      //   twitterDescription: "A NextJS app demonstrating Winks meta tag management",
      //   twitterImage: "https://via.placeholder.com/1200x630/007bff/ffffff?text=Winks+Example",
      //   canonical: "https://example.com",
      //   robots: "index, follow",
      //   viewport: "width=device-width, initial-scale=1",
      //   charset: "utf-8",
      //   author: "Winks Team"
      // }}
    >
      <Component {...pageProps} />
    </Winks>
  );
} 