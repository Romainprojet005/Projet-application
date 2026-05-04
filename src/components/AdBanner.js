import React, { useEffect } from 'react';
import { Platform } from 'react-native';

// Remplace ces valeurs après avoir créé tes unités sur Google AdSense
export const AD_CLIENT = 'ca-pub-XXXXXXXXXXXXXXXX';
export const AD_SLOT   = 'XXXXXXXXXX';

export default function AdBanner() {
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {}
  }, []);

  if (Platform.OS !== 'web') return null;

  return React.createElement(
    'div',
    { style: { width: '100%', minHeight: 90 } },
    React.createElement('ins', {
      className: 'adsbygoogle',
      style: { display: 'block' },
      'data-ad-client': AD_CLIENT,
      'data-ad-slot': AD_SLOT,
      'data-ad-format': 'auto',
      'data-full-width-responsive': 'true',
    })
  );
}
