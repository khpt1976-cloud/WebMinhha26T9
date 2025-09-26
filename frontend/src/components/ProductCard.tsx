import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import starIcon from '../assets/icons/star_5.png';
import { getImageUrl } from '../services/api';

interface ProductCardProps {
  id: number;
  image: string;
  title: string;
  price?: string;
  originalPrice?: string;
  rating?: number;
}

const Card = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
`;

const HotLabel = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  background: #e74c3c;
  color: white;
  padding: 0.3rem 0.6rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: bold;
  z-index: 2;
`;

const ImageContainer = styled.div`
  position: relative;
  overflow: hidden;
  height: 180px;
  background: #f8f9fa;
`;

const ProductImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Content = styled.div`
  padding: 1rem;
  text-align: center;
`;

const Title = styled.h3`
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
  height: 2.6rem;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const RatingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0.5rem 0;
`;

const StarIcon = styled.img`
  width: 80px;
  height: 16px;
`;

const PriceContainer = styled.div`
  margin-top: 0.5rem;
`;

const OriginalPrice = styled.span`
  color: #999;
  text-decoration: line-through;
  font-size: 0.9rem;
  display: block;
  margin-bottom: 0.2rem;
`;

const Price = styled.span`
  color: #e74c3c;
  font-weight: bold;
  font-size: 1.1rem;
`;

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  image,
  title,
  price,
  originalPrice,
  rating = 5
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/san-pham/${id}`);
  };

  return (
    <Card onClick={handleClick}>
      <HotLabel>HOT</HotLabel>
      <ImageContainer>
        <ProductImage src={getImageUrl(image)} alt={title} />
      </ImageContainer>
      <Content>
        <Title>{title}</Title>
        <RatingContainer>
          <StarIcon src={starIcon} alt="5 sao" />
        </RatingContainer>
        <PriceContainer>
          {originalPrice && <OriginalPrice>{originalPrice}</OriginalPrice>}
          {price && <Price>{price}</Price>}
        </PriceContainer>
      </Content>
    </Card>
  );
};

export default ProductCard;