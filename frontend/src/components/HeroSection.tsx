import React from 'react';
import styled from 'styled-components';

const HeroContainer = styled.section`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4rem 2rem;
  text-align: center;
`;

const HeroContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const MainTitle = styled.h1`
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const SearchSection = styled.div`
  background: white;
  border-radius: 50px;
  padding: 1rem;
  display: flex;
  max-width: 600px;
  margin: 0 auto;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  
  @media (max-width: 768px) {
    flex-direction: column;
    border-radius: 20px;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  padding: 1rem 1.5rem;
  font-size: 1rem;
  border-radius: 25px;
  
  &::placeholder {
    color: #999;
  }
  
  @media (max-width: 768px) {
    margin-bottom: 1rem;
  }
`;

const SearchButton = styled.button`
  background: #e74c3c;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #c0392b;
    transform: translateY(-2px);
  }
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const HeroSection: React.FC = () => {
  return (
    <HeroContainer>
      <HeroContent>
        <MainTitle>VÕNG XẾP DUY LỢI - CHÍNH HÃNG UY TÍN</MainTitle>
        <Subtitle>
          Võng xếp cao cấp - Giá cả hợp lý - Bảo hành chính hãng
        </Subtitle>
        
        <SearchSection>
          <SearchInput 
            type="text" 
            placeholder="Tìm kiếm võng xếp, rèm màn, giá phơi..." 
          />
          <SearchButton>Tìm kiếm</SearchButton>
        </SearchSection>
      </HeroContent>
    </HeroContainer>
  );
};

export default HeroSection;