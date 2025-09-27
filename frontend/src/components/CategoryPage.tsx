import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { getProducts, Product } from '../services/api';
import ProductCard from './ProductCard';

const PageContainer = styled.div`
  min-height: 100vh;
  background-color: #f8f9fa;
`;

const HeaderSection = styled.div`
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 2rem 0;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: #2c5530;
  cursor: pointer;
  font-size: 1rem;
  margin-bottom: 1.5rem;
  padding: 0.5rem 0;
  transition: color 0.2s;
  font-family: inherit;

  &:hover {
    color: #1a3d1f;
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #2c5530;
  margin-bottom: 0.5rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const ProductCount = styled.p`
  color: #6c757d;
  font-size: 1.1rem;
  margin: 0;
  
  strong {
    color: #2c5530;
    font-weight: 600;
  }
`;

const ContentSection = styled.div`
  padding: 2rem 0;
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);

  .icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  h3 {
    color: #6c757d;
    margin-bottom: 1rem;
    font-size: 1.5rem;
  }

  p {
    color: #adb5bd;
    font-size: 1rem;
  }
`;

const LoadingContainer = styled.div`
  min-height: 100vh;
  background-color: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LoadingContent = styled.div`
  text-align: center;

  .spinner {
    width: 4rem;
    height: 4rem;
    border: 3px solid #e9ecef;
    border-top: 3px solid #2c5530;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  p {
    color: #6c757d;
    font-size: 1.1rem;
  }
`;

const CallToAction = styled.div`
  background: linear-gradient(135deg, #2c5530 0%, #4a7c59 100%);
  color: white;
  padding: 3rem 0;

  .content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
    text-align: center;
  }

  h3 {
    font-size: 2rem;
    margin-bottom: 1rem;
    font-weight: 600;
  }

  p {
    font-size: 1.1rem;
    opacity: 0.9;
    margin-bottom: 2rem;
  }

  a {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    background: white;
    color: #2c5530;
    text-decoration: none;
    padding: 1rem 2rem;
    border-radius: 50px;
    font-weight: 600;
    font-size: 1.1rem;
    transition: all 0.3s ease;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(0,0,0,0.15);
    }

    svg {
      width: 20px;
      height: 20px;
    }
  }
`;

const categoryNames: { [key: string]: string } = {
  'vong-xep': 'Võng Xếp',
  'rem-man': 'Rèm - Màn',
  'gia-phoi': 'Giá Phơi Đồ',
  'gia-treo': 'Giá Treo Đồ',
  'ban-ghe': 'Bàn Ghế',
  'giam-gia': 'Giảm Giá Hot',
  'san-pham-khac': 'Sản Phẩm Khác'
};

const CategoryPage: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const allProducts = await getProducts();
        
        console.log('Category from URL:', category);
        console.log('All products:', allProducts.length);
        
        // Show all products if no category or if filtering fails
        if (!category) {
          setProducts(allProducts);
          return;
        }
        
        const filteredProducts = allProducts.filter((product: Product) => {
          // Try multiple matching strategies
          const categoryMatch = 
            product.category === category ||
            product.category?.toLowerCase() === category?.toLowerCase() ||
            product.category_name === category ||
            product.category_name?.toLowerCase() === category?.toLowerCase() ||
            // Also try slug matching
            category.includes(product.category?.toLowerCase() || '') ||
            (product.category?.toLowerCase() || '').includes(category.toLowerCase());
          
          return categoryMatch;
        });
        
        console.log('Filtered products:', filteredProducts.length);
        
        // If no products found with filtering, show all products
        setProducts(filteredProducts.length > 0 ? filteredProducts : allProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  const handleBackClick = () => {
    navigate('/');
  };
  if (loading) {
    return (
      <LoadingContainer>
        <LoadingContent>
          <div className="spinner"></div>
          <p>Đang tải sản phẩm...</p>
        </LoadingContent>
      </LoadingContainer>
    );
  }

  const categoryName = categoryNames[category || ''] || 'Sản phẩm';

  return (
    <PageContainer>
      {/* Header */}
      <HeaderSection>
        <Container>
          <BackButton onClick={handleBackClick}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại
          </BackButton>
          <Title>{categoryName}</Title>
          <ProductCount>
            Tìm thấy <strong>{products.length}</strong> sản phẩm
          </ProductCount>
        </Container>
      </HeaderSection>

      {/* Products Grid */}
      <ContentSection>
        <Container>
          {products.length === 0 ? (
            <EmptyState>
              <div className="icon">📦</div>
              <h3>Không có sản phẩm nào</h3>
              <p>Hiện tại chưa có sản phẩm nào trong danh mục này.</p>
            </EmptyState>
          ) : (
            <ProductGrid>
              {products.map((product) => (
                <ProductCard 
                  key={product.id} 
                  id={product.id}
                  image={product.image}
                  title={product.title}
                  price={product.price}
                  originalPrice={product.original_price?.toString() || ''}
                  rating={product.rating}
                  isHot={product.is_hot || false}
                />
              ))}
            </ProductGrid>
          )}
        </Container>
      </ContentSection>

      {/* Call to Action */}
      <CallToAction>
        <div className="content">
          <h3>Cần tư vấn thêm?</h3>
          <p>Liên hệ ngay với chúng tôi để được tư vấn miễn phí</p>
          <a href="tel:0974876168">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
            📞 0974.876.168
          </a>
        </div>
      </CallToAction>
    </PageContainer>
  );
};

export default CategoryPage;