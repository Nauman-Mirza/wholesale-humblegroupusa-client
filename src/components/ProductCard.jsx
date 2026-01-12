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
      return `$${Number(subCategory.price.amount || 0).toFixed(2)}`;
    }
    
    if (subCategory.price_type === 'range') {
      const min = Number(subCategory.price.min || 0).toFixed(2);
      const max = Number(subCategory.price.max || 0).toFixed(2);
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
      <div className="product-card-image">
        {image ? (
          <img 
            src={image} 
            alt={subCategory.name}
            loading="lazy"
          />
        ) : (
          <div className="product-placeholder">
            {subCategory.name?.charAt(0) || 'P'}
          </div>
        )}
      </div>
      <div className="product-card-info">
        {(categoryName || brandName) && (
          <div className="product-card-category">{categoryName || brandName}</div>
        )}
        <h3 className="product-card-name">{subCategory.name}</h3>
        <div className="product-card-price">{formatPrice()}</div>
      </div>
    </div>
  );
}