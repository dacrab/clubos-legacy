import React from 'react';

import FooterClient from './_FooterClient';

export function Footer() {
  const year = new Date().getFullYear();

  return <FooterClient year={year} />;
}
