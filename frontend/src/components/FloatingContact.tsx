import React from 'react';
import './FloatingContact.css';

const FloatingContact: React.FC = () => {
  const phoneNumber = '0974876168';
  const zaloLink = `https://zalo.me/${phoneNumber}`;
  const facebookLink = 'https://www.facebook.com/cuahangminhha'; // Có thể thay đổi link Facebook thực tế
  
  const handlePhoneCall = () => {
    window.open(`tel:${phoneNumber}`, '_self');
  };

  const handleZaloChat = () => {
    window.open(zaloLink, '_blank');
  };

  const handleFacebookChat = () => {
    window.open(facebookLink, '_blank');
  };

  return (
    <div className="floating-contact">
      {/* Nút gọi điện */}
      <div className="contact-item phone" onClick={handlePhoneCall} title="Gọi điện ngay">
        <div className="contact-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" fill="white"/>
          </svg>
        </div>
        <span className="contact-text">Gọi ngay</span>
      </div>

      {/* Nút Zalo */}
      <div className="contact-item zalo" onClick={handleZaloChat} title="Chat Zalo">
        <div className="contact-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.09 0 2.14-.18 3.12-.5l4.38 1.5-1.5-4.38c.32-.98.5-2.03.5-3.12 0-5.52-4.48-10-10-10zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="white"/>
            <path d="M8.5 9.5h7v1h-7v-1zm0 2h7v1h-7v-1zm0 2h5v1h-5v-1z" fill="white"/>
          </svg>
        </div>
        <span className="contact-text">Chat Zalo</span>
      </div>

      {/* Nút Facebook */}
      <div className="contact-item facebook" onClick={handleFacebookChat} title="Chat Facebook">
        <div className="contact-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="white"/>
          </svg>
        </div>
        <span className="contact-text">Facebook</span>
      </div>

      {/* Hiển thị số điện thoại */}
      <div className="phone-number">
        <a href={`tel:${phoneNumber}`} className="phone-link">
          📞 {phoneNumber}
        </a>
      </div>
    </div>
  );
};

export default FloatingContact;