import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  background-color: #2c3e50;
  color: white;
  padding: 3rem 2rem 1rem;
  margin-top: 4rem;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const FooterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
`;

const FooterSection = styled.div`
  h3 {
    font-size: 1.2rem;
    font-weight: bold;
    margin-bottom: 1rem;
    color: #ecf0f1;
  }
  
  p, a {
    color: #bdc3c7;
    line-height: 1.6;
    margin-bottom: 0.5rem;
    text-decoration: none;
    
    &:hover {
      color: #ecf0f1;
    }
  }
`;

const ContactInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const PhoneNumber = styled.a`
  font-weight: bold;
  color: #e74c3c !important;
  font-size: 1.1rem;
  
  &:hover {
    color: #c0392b !important;
  }
`;

const ShowroomInfo = styled.div`
  background-color: #34495e;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1rem;
`;

const Copyright = styled.div`
  text-align: center;
  padding-top: 2rem;
  border-top: 1px solid #34495e;
  color: #95a5a6;
  font-size: 0.9rem;
`;

const Footer: React.FC = () => {
  return (
    <FooterContainer>
      <FooterContent>
        <FooterGrid>
          <FooterSection>
            <h3>Cửa Hàng Minh Hà</h3>
            <ContactInfo>
              <PhoneNumber href="tel:0974876168">📞 0974.876.168</PhoneNumber>
              <p>Chuyên võng, rèm, màn, giá phơi, bàn ghế</p>
            </ContactInfo>
          </FooterSection>
          
          <FooterSection>
            <h3>Địa chỉ cửa hàng</h3>
            <ShowroomInfo>
              <p>📍 417 Ngô Gia Tự</p>
              <p>Hải An - Hải Phòng</p>
            </ShowroomInfo>
          </FooterSection>
          
          <FooterSection>
            <h3>Giờ mở cửa</h3>
            <ShowroomInfo>
              <p>🕐 Thứ 2 - Chủ nhật: 8:00 - 20:00</p>
              <p>📞 Tư vấn 24/7</p>
            </ShowroomInfo>
          </FooterSection>
          
          <FooterSection>
            <h3>Chính sách</h3>
            <a href="#privacy">Chính sách bảo mật thông tin</a>
            <a href="#shipping">Chính sách vận chuyển</a>
            <a href="#payment">Hình thức thanh toán</a>
            <a href="#warranty">Quy định về bảo hành</a>
          </FooterSection>
        </FooterGrid>
        
        <Copyright>
          <p>© 2025 Cửa Hàng Minh Hà - 417 Ngô Gia Tự, Hải An, Hải Phòng</p>
        </Copyright>
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer;