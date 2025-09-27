// Fix for image loading issue
export const getImageUrl = (imagePath: string): string => {
  if (!imagePath) {
    return 'http://localhost:8000/static/images/product1.jpg'; // Default fallback
  }
  
  if (imagePath.startsWith('http')) {
    return imagePath; // Already a full URL
  }
  
  // Force use localhost:8000 for images
  const baseUrl = 'http://localhost:8000';
  
  if (imagePath.startsWith('/static/')) {
    return `${baseUrl}${imagePath}`;
  }
  if (imagePath.startsWith('static/')) {
    return `${baseUrl}/${imagePath}`;
  }
  
  return `${baseUrl}/static/images/product1.jpg`; // Default fallback image
};
