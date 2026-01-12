import { useNavigate } from 'react-router-dom';

export default function ProductCard({ subCategory, categoryName, brandName, brandId }) {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/subcategory/${subCategory._id || subCategory.id}`, {
      state: { subCategory, categoryName, brandName, brandId }
    });
  };

  const formatPrice = () => {
    if (!subCategory.price) return '$0.00';
    
    if (subCategory.price_type === 'single') {
      return `$${subCategory.price.amount?.toFixed(2) || '0.00'}`;
    }
    
    if (subCategory.price_type === 'range') {
      const min = subCategory.price.min?.toFixed(2) || '0.00';
      const max = subCategory.price.max?.toFixed(2) || '0.00';
      return `$${min} – $${max}`;
    }
    
    return '$0.00';
  };

  const getImage = () => {
    if (subCategory.images && subCategory.images.length > 0) {
      return subCategory.images[0];
    }
    return null;
  };

  const image = getImage();

  return (
    <div className="product-card" onClick={handleClick}>
      <div className="product-image-wrapper">
        {image ? (
          <img 
            src={image} 
            alt={subCategory.name}
            className="product-image"
          />
        ) : (
          <div className="product-placeholder">
            {subCategory.name?.charAt(0) || 'P'}
          </div>
        )}
      </div>
      <div className="product-info">
        <div className="product-category">{categoryName || brandName}</div>
        <div className="product-name">{subCategory.name}</div>
        <div className="product-price">{formatPrice()}</div>
      </div>
    </div>
  );
}
