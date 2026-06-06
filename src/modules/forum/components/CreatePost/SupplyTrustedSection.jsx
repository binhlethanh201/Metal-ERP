/**
 * SupplyTrustedSection - Bước 3+4 cho dạng Tìm nguồn hàng / Mua chung.
 */
import React from 'react';
import AttachProductSection from './AttachProductSection';
import TechSpecsSection from './TechSpecsSection';

const SupplyTrustedSection = ({ form, quoteProduct }) => (
  <>
    <AttachProductSection form={form} quoteProduct={quoteProduct} />
    <TechSpecsSection form={form} quoteProduct={quoteProduct} />
  </>
);

export default SupplyTrustedSection;
