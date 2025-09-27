import React from 'react';

const TestDeleteButton: React.FC = () => {
  const handleClick = () => {
    alert('✅ TEST BUTTON WORKS!');
    console.log('✅ Test button clicked successfully');
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', margin: '10px' }}>
      <h3>🧪 Test Delete Button</h3>
      <button 
        onClick={handleClick}
        style={{ 
          backgroundColor: '#dc3545', 
          color: 'white', 
          padding: '10px 20px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        🗑️ TEST DELETE
      </button>
    </div>
  );
};

export default TestDeleteButton;
