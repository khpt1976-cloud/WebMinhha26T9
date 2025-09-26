import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import starIcon from '../assets/icons/star_5.png';
import { getProductById, ProductDetail as ProductDetailType, getImageUrl } from '../services/api';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  min-height: 80vh;
`;

const BackButton = styled.button`
  background: #6c7b3a;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 5px;
  cursor: pointer;
  margin-bottom: 2rem;
  font-size: 1rem;
  transition: background 0.3s ease;

  &:hover {
    background: #5a6632;
  }
`;

const ProductContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const ImageSection = styled.div`
  position: relative;
`;

const ProductImage = styled.img`
  width: 100%;
  height: 400px;
  object-fit: cover;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transition: opacity 0.3s ease;
`;

const ImagePlaceholder = styled.div`
  width: 100%;
  height: 400px;
  background: #f5f5f5;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 1.1rem;
  border: 2px dashed #ddd;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #6c7b3a;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const HotLabel = styled.div`
  position: absolute;
  top: 15px;
  right: 15px;
  background: #e74c3c;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: bold;
`;

const InfoSection = styled.div`
  padding: 1rem 0;
`;

const ProductTitle = styled.h1`
  font-size: 2rem;
  color: #333;
  margin-bottom: 1rem;
  line-height: 1.3;
`;

const RatingContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const StarIcon = styled.img`
  width: 100px;
  height: 20px;
  margin-right: 0.5rem;
`;

const PriceContainer = styled.div`
  margin-bottom: 2rem;
`;

const OriginalPrice = styled.span`
  color: #999;
  text-decoration: line-through;
  font-size: 1.2rem;
  display: block;
  margin-bottom: 0.5rem;
`;

const Price = styled.span`
  color: #e74c3c;
  font-weight: bold;
  font-size: 2rem;
`;

const Description = styled.div`
  margin-bottom: 2rem;
  
  h3 {
    color: #333;
    margin-bottom: 1rem;
    font-size: 1.3rem;
  }
  
  p {
    color: #666;
    line-height: 1.6;
    font-size: 1rem;
  }
`;

const FeaturesList = styled.ul`
  list-style: none;
  padding: 0;
  margin-bottom: 2rem;
  
  li {
    padding: 0.5rem 0;
    color: #666;
    position: relative;
    padding-left: 1.5rem;
    
    &:before {
      content: "✓";
      color: #6c7b3a;
      font-weight: bold;
      position: absolute;
      left: 0;
    }
  }
`;

const SpecsTable = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  
  h3 {
    color: #333;
    margin-bottom: 1rem;
    font-size: 1.3rem;
  }
`;

const SpecRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e0e0e0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const SpecLabel = styled.span`
  font-weight: 600;
  color: #333;
`;

const SpecValue = styled.span`
  color: #666;
`;

const ContactSection = styled.div`
  background: #6c7b3a;
  color: white;
  padding: 2rem;
  border-radius: 10px;
  text-align: center;
  
  h3 {
    margin-bottom: 1rem;
    font-size: 1.5rem;
  }
  
  p {
    margin-bottom: 1.5rem;
    font-size: 1.1rem;
  }
`;

const ContactButton = styled.a`
  background: white;
  color: #6c7b3a;
  padding: 1rem 2rem;
  border-radius: 25px;
  text-decoration: none;
  font-weight: bold;
  font-size: 1.1rem;
  display: inline-block;
  transition: all 0.3s ease;
  
  &:hover {
    background: #f0f0f0;
    transform: translateY(-2px);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  font-size: 1.2rem;
  color: #666;
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: 3rem;
  
  h2 {
    color: #e74c3c;
    margin-bottom: 1rem;
  }
  
  p {
    color: #666;
    margin-bottom: 2rem;
  }
`;

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError('ID sản phẩm không hợp lệ');
        setLoading(false);
        return;
      }

      try {
        // Reset image states when loading new product
        setImageLoading(true);
        setImageError(false);
        const productData = await getProductById(parseInt(id));
        setProduct(productData);
      } catch (err) {
        setError('Không thể tải thông tin sản phẩm');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <Container>
        <LoadingContainer>
          Đang tải thông tin sản phẩm...
        </LoadingContainer>
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container>
        <ErrorContainer>
          <h2>Không tìm thấy sản phẩm</h2>
          <p>{error || 'Sản phẩm bạn tìm kiếm không tồn tại hoặc đã bị xóa.'}</p>
          <BackButton onClick={() => navigate('/')}>
            Quay về trang chủ
          </BackButton>
        </ErrorContainer>
      </Container>
    );
  }

  return (
    <Container>
      <BackButton onClick={() => navigate(-1)}>
        ← Quay lại
      </BackButton>

      <ProductContainer>
        <ImageSection>
          {imageLoading && !imageError && (
            <ImagePlaceholder>
              <LoadingSpinner />
            </ImagePlaceholder>
          )}
          {imageError && (
            <ImagePlaceholder>
              ❌ Không thể tải hình ảnh
            </ImagePlaceholder>
          )}
          <ProductImage 
            src={getImageUrl(product.image)} 
            alt={product.name}
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageLoading(false);
              setImageError(true);
            }}
            style={{ display: imageLoading || imageError ? 'none' : 'block' }}
          />
          <HotLabel>HOT</HotLabel>
        </ImageSection>

        <InfoSection>
          <ProductTitle>{product.name}</ProductTitle>
          
          <RatingContainer>
            <StarIcon src={starIcon} alt="5 sao" />
            <span>(5.0 - Đánh giá tuyệt vời)</span>
          </RatingContainer>

          <PriceContainer>
            {product.originalPrice && (
              <OriginalPrice>{product.originalPrice}</OriginalPrice>
            )}
            <Price>{product.price}</Price>
          </PriceContainer>

          <Description>
            <h3>Mô tả sản phẩm</h3>
            <p>{product.description}</p>
          </Description>

          {product.features && product.features.length > 0 && (
            <div>
              <h3>Tính năng nổi bật</h3>
              <FeaturesList>
                {product.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </FeaturesList>
            </div>
          )}
        </InfoSection>
      </ProductContainer>

      {product.specifications && Object.keys(product.specifications).length > 0 && (
        <SpecsTable>
          <h3>Thông số kỹ thuật</h3>
          {Object.entries(product.specifications).map(([key, value]) => (
            value && (
              <SpecRow key={key}>
                <SpecLabel>
                  {key === 'material' && 'Chất liệu'}
                  {key === 'size' && 'Kích thước'}
                  {key === 'weight' && 'Trọng lượng'}
                  {key === 'color' && 'Màu sắc'}
                  {key === 'warranty' && 'Bảo hành'}
                </SpecLabel>
                <SpecValue>{value}</SpecValue>
              </SpecRow>
            )
          ))}
        </SpecsTable>
      )}

      <ContactSection>
        <h3>Liên hệ đặt hàng</h3>
        <p>Gọi ngay để được tư vấn và đặt hàng với giá tốt nhất!</p>
        <ContactButton href="tel:0974876168">
          📞 0974.876.168
        </ContactButton>
      </ContactSection>
    </Container>
  );
};

export default ProductDetail;