import ProductCard from './ProductCard';

export default function BrandSection({ brand }) {
  // Collect all subcategories from all categories
  const allSubCategories = [];
  
  if (brand.categories) {
    brand.categories.forEach(category => {
      if (category.sub_categories) {
        category.sub_categories.forEach(sub => {
          allSubCategories.push({
            ...sub,
            categoryName: category.name,
            categoryId: category._id || category.id,
          });
        });
      }
    });
  }

  if (allSubCategories.length === 0) {
    return null;
  }

  return (
    <section className="brand-section">
      <div className="brand-header">
        <h2 className="brand-title">{brand.name}</h2>
        {brand.description && (
          <p className="brand-description">{brand.description}</p>
        )}
      </div>
      
      <div className="products-grid">
        {allSubCategories.map((subCategory) => (
          <ProductCard
            key={subCategory._id || subCategory.id}
            subCategory={subCategory}
            categoryName={subCategory.categoryName}
            brandName={brand.name}
            brandId={brand._id || brand.id}
          />
        ))}
      </div>
    </section>
  );
}
