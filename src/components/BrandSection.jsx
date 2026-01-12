import ProductCard from './ProductCard';

export default function BrandSection({ brand }) {
  const allSubCategories = [];

  if (brand.categories && brand.categories.length > 0) {
    brand.categories.forEach((category) => {
      if (category.sub_categories && category.sub_categories.length > 0) {
        category.sub_categories.forEach((subCat) => {
          allSubCategories.push({
            ...subCat,
            categoryName: category.name,
            brandName: brand.name,
          });
        });
      }
    });
  }

  if (allSubCategories.length === 0) {
    return null;
  }

  return (
    <div className="product-grid">
      {allSubCategories.map((subCategory) => (
        <ProductCard
          key={subCategory._id || subCategory.id}
          subCategory={subCategory}
          categoryName={subCategory.categoryName}
          brandName={subCategory.brandName}
        />
      ))}
    </div>
  );
}