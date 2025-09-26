import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const HeaderContainer = styled.header`
  background: #2d5016;
  padding: 0;
`;

const TopBar = styled.div`
  background: #f8f9fa;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e0e0e0;
`;

const TopBarContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1rem;
  font-size: 0.9rem;
`;

const ContactInfo = styled.div`
  display: flex;
  gap: 2rem;
  color: #666;
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
`;

const SearchInput = styled.input`
  padding: 0.4rem 0.8rem;
  border: 1px solid #ddd;
  border-radius: 3px;
  margin-right: 0.5rem;
  width: 200px;
`;

const SearchButton = styled.button`
  background: #2d5016;
  color: white;
  border: none;
  padding: 0.4rem 1rem;
  border-radius: 3px;
  cursor: pointer;
`;

const MainHeader = styled.div`
  background: white;
  padding: 1rem 0;
  text-align: center;
`;

const MainHeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const CustomLogo = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
`;

const LogoIcon = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #2d5016 0%, #4a7c59 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  box-shadow: 0 4px 15px rgba(45, 80, 22, 0.3);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    width: 70px;
    height: 70px;
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 50%;
  }
`;

const LogoText = styled.div`
  color: white;
  font-size: 24px;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  letter-spacing: 1px;
`;

const BrandName = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const MainBrandText = styled.div`
  font-size: 28px;
  font-weight: bold;
  color: #2d5016;
  letter-spacing: 2px;
  margin-bottom: 2px;
`;

const SubBrandText = styled.div`
  font-size: 14px;
  color: #666;
  font-weight: 500;
  letter-spacing: 1px;
`;

const Slogan = styled.h1`
  color: #2d5016;
  font-size: 1.8rem;
  font-weight: bold;
  margin: 0.5rem 0;
  letter-spacing: 1px;
`;

const SubSlogan = styled.p`
  color: #666;
  font-size: 1rem;
  margin: 0;
`;

const NavigationBar = styled.div`
  background: #2d5016;
  padding: 0;
`;

const Navigation = styled.nav`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
`;

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  font-weight: 500;
  padding: 1rem 1.5rem;
  font-size: 0.9rem;
  text-transform: uppercase;
  transition: background-color 0.3s;
  border-right: 1px solid rgba(255,255,255,0.1);
  display: block;

  &:hover {
    background-color: rgba(255,255,255,0.1);
  }

  &:last-child {
    border-right: none;
  }
`;



const Header: React.FC = () => {
  return (
    <HeaderContainer>
      <TopBar>
        <TopBarContent>
          <ContactInfo>
            <span>📞 0974.876.168 - Cửa Hàng Minh Hà</span>
            <span>📍 417 Ngô Gia Tự - Hải An - Hải Phòng</span>
          </ContactInfo>
          <SearchContainer>
            <SearchInput type="text" placeholder="Nhập từ khóa..." />
            <SearchButton>Tìm</SearchButton>
          </SearchContainer>
        </TopBarContent>
      </TopBar>

      <MainHeader>
        <MainHeaderContent>
          <CustomLogo>
            <LogoIcon>
              <LogoText>MH</LogoText>
            </LogoIcon>
            <BrandName>
              <MainBrandText>MINH HÀ</MainBrandText>
              <SubBrandText>CỬA HÀNG UY TÍN</SubBrandText>
            </BrandName>
          </CustomLogo>
          <Slogan>VÕNG - RÈM - MÀN - GIÁ PHƠI - BÀN GHẾ</Slogan>
          <SubSlogan>Chất lượng cao - Giá cả hợp lý - Bảo hành chính hãng</SubSlogan>
        </MainHeaderContent>
      </MainHeader>

      <NavigationBar>
        <Navigation>
          <NavLink to="/">TRANG CHỦ</NavLink>
          <NavLink to="/danh-muc/vong-xep">VÕNG XẾP</NavLink>
          <NavLink to="/danh-muc/rem-man">RÈM - MÀN</NavLink>
          <NavLink to="/danh-muc/gia-phoi">GIÁ PHƠI ĐỒ</NavLink>
          <NavLink to="/danh-muc/gia-treo">GIÁ TREO ĐỒ</NavLink>
          <NavLink to="/danh-muc/ban-ghe">BÀN GHẾ</NavLink>
          <NavLink to="/danh-muc/giam-gia">GIẢM GIÁ HOT</NavLink>
          <NavLink to="/danh-muc/san-pham-khac">SẢN PHẨM KHÁC</NavLink>
          <NavLink to="/lien-he">LIÊN HỆ</NavLink>
        </Navigation>
      </NavigationBar>
    </HeaderContainer>
  );
};

export default Header;