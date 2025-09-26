import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home';
import Contact from './components/Contact';
import ProductDetail from './components/ProductDetail';
import CategoryPage from './components/CategoryPage';
import Footer from './components/Footer';
import FloatingContact from './components/FloatingContact';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lien-he" element={<Contact />} />
          <Route path="/san-pham/:id" element={<ProductDetail />} />
          <Route path="/danh-muc/:category" element={<CategoryPage />} />
        </Routes>
        <Footer />
        <FloatingContact />
      </div>
    </Router>
  );
}

export default App;
