import React from 'react';
import styled from 'styled-components';

const ContactContainer = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
`;

const ContactTitle = styled.h1`
  color: #2d5016;
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 2rem;
  font-weight: bold;
`;

const ContactContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const ContactInfo = styled.div`
  background: #f8f9fa;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const ContactForm = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
`;

const InfoTitle = styled.h2`
  color: #2d5016;
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  font-weight: bold;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
`;

const InfoIcon = styled.span`
  font-size: 1.5rem;
  margin-right: 1rem;
  min-width: 2rem;
`;

const InfoText = styled.div`
  color: #333;
  line-height: 1.6;
`;

const InfoLabel = styled.div`
  font-weight: bold;
  color: #2d5016;
  margin-bottom: 0.3rem;
`;

const InfoValue = styled.div`
  color: #666;
`;

const FormTitle = styled.h2`
  color: #2d5016;
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  font-weight: bold;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const FormLabel = styled.label`
  display: block;
  color: #333;
  font-weight: 500;
  margin-bottom: 0.5rem;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  transition: border-color 0.3s;

  &:focus {
    outline: none;
    border-color: #2d5016;
  }
`;

const FormTextarea = styled.textarea`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  min-height: 120px;
  resize: vertical;
  transition: border-color 0.3s;

  &:focus {
    outline: none;
    border-color: #2d5016;
  }
`;

const SubmitButton = styled.button`
  background: #2d5016;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 5px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background: #1a3009;
  }
`;

const MapContainer = styled.div`
  margin-top: 3rem;
  text-align: center;
`;

const MapTitle = styled.h2`
  color: #2d5016;
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  font-weight: bold;
`;

const MapFrame = styled.iframe`
  width: 100%;
  height: 400px;
  border: none;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Contact: React.FC = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.');
  };

  return (
    <ContactContainer>
      <ContactTitle>LIÊN HỆ VỚI CHÚNG TÔI</ContactTitle>
      
      <ContactContent>
        <ContactInfo>
          <InfoTitle>Thông Tin Liên Hệ</InfoTitle>
          
          <InfoItem>
            <InfoIcon>🏪</InfoIcon>
            <InfoText>
              <InfoLabel>Tên cửa hàng:</InfoLabel>
              <InfoValue>Cửa Hàng Minh Hà</InfoValue>
            </InfoText>
          </InfoItem>

          <InfoItem>
            <InfoIcon>📍</InfoIcon>
            <InfoText>
              <InfoLabel>Địa chỉ:</InfoLabel>
              <InfoValue>Số 417 Ngô Gia Tự, Hải An, Hải Phòng</InfoValue>
            </InfoText>
          </InfoItem>

          <InfoItem>
            <InfoIcon>📞</InfoIcon>
            <InfoText>
              <InfoLabel>Số điện thoại:</InfoLabel>
              <InfoValue>0974876168</InfoValue>
            </InfoText>
          </InfoItem>

          <InfoItem>
            <InfoIcon>📧</InfoIcon>
            <InfoText>
              <InfoLabel>Email:</InfoLabel>
              <InfoValue>hoangngocanh7686@gmail.com</InfoValue>
            </InfoText>
          </InfoItem>

          <InfoItem>
            <InfoIcon>🕒</InfoIcon>
            <InfoText>
              <InfoLabel>Giờ làm việc:</InfoLabel>
              <InfoValue>
                Thứ 2 - Chủ nhật: 8:00 - 20:00<br />
                Nghỉ các ngày lễ tết
              </InfoValue>
            </InfoText>
          </InfoItem>

          <InfoItem>
            <InfoIcon>🛍️</InfoIcon>
            <InfoText>
              <InfoLabel>Chuyên kinh doanh:</InfoLabel>
              <InfoValue>
                Võng xếp, rèm màn, giá phơi đồ,<br />
                giá treo đồ, bàn ghế và các<br />
                sản phẩm gia dụng khác
              </InfoValue>
            </InfoText>
          </InfoItem>
        </ContactInfo>

        <ContactForm>
          <FormTitle>Gửi Tin Nhắn Cho Chúng Tôi</FormTitle>
          <form onSubmit={handleSubmit}>
            <FormGroup>
              <FormLabel htmlFor="name">Họ và tên *</FormLabel>
              <FormInput 
                type="text" 
                id="name" 
                name="name" 
                required 
                placeholder="Nhập họ và tên của bạn"
              />
            </FormGroup>

            <FormGroup>
              <FormLabel htmlFor="phone">Số điện thoại *</FormLabel>
              <FormInput 
                type="tel" 
                id="phone" 
                name="phone" 
                required 
                placeholder="Nhập số điện thoại"
              />
            </FormGroup>

            <FormGroup>
              <FormLabel htmlFor="email">Email</FormLabel>
              <FormInput 
                type="email" 
                id="email" 
                name="email" 
                placeholder="Nhập địa chỉ email (không bắt buộc)"
              />
            </FormGroup>

            <FormGroup>
              <FormLabel htmlFor="subject">Chủ đề</FormLabel>
              <FormInput 
                type="text" 
                id="subject" 
                name="subject" 
                placeholder="Chủ đề tin nhắn"
              />
            </FormGroup>

            <FormGroup>
              <FormLabel htmlFor="message">Nội dung tin nhắn *</FormLabel>
              <FormTextarea 
                id="message" 
                name="message" 
                required 
                placeholder="Nhập nội dung tin nhắn của bạn..."
              />
            </FormGroup>

            <SubmitButton type="submit">
              GỬI TIN NHẮN
            </SubmitButton>
          </form>
        </ContactForm>
      </ContactContent>

      <MapContainer>
        <MapTitle>Vị Trí Cửa Hàng</MapTitle>
        <MapFrame
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3728.0123456789!2d106.6123456!3d20.8123456!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjDCsDQ4JzQ0LjQiTiAxMDbCsDM2JzQ0LjQiRQ!5e0!3m2!1svi!2s!4v1234567890123!5m2!1svi!2s"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Vị trí Cửa Hàng Minh Hà"
        />
      </MapContainer>
    </ContactContainer>
  );
};

export default Contact;