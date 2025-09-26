import React from 'react';
import ProductGrid from './ProductGrid';
import HeroSection from './HeroSection';

const Home: React.FC = () => {
  return (
    <>
      <HeroSection />
      <ProductGrid />
    </>
  );
};

export default Home;