# Humble Group USA - Wholesale Frontend

A React-based wholesale catalog application for Humble Group USA, allowing registered users to browse brands, categories, and subcategories with products.

## Features

- **User Authentication**: Secure login for wholesale customers
- **Brand Catalog**: Browse all available brands with their products
- **Subcategory Details**: View detailed product information with image gallery
- **Product Selection**: Choose from available product variants (flavors)
- **Responsive Design**: Works on desktop and mobile devices

## Design

The design matches the provided mockups featuring:
- Clean, professional aesthetic with olive accent colors
- Grid-based product layout
- Image galleries with zoom functionality
- Breadcrumb navigation
- Product variant selection dropdown

## Tech Stack

- **React 18** - UI library
- **React Router v6** - Client-side routing
- **Axios** - HTTP client for API requests
- **Lucide React** - Icon library
- **Vite** - Build tool and dev server

## Project Structure

```
src/
├── api/
│   └── index.js          # API service configuration
├── components/
│   ├── BrandSection.jsx  # Brand with subcategories display
│   ├── Footer.jsx        # Page footer
│   ├── Header.jsx        # Navigation header
│   ├── Loading.jsx       # Loading spinner
│   ├── ProductCard.jsx   # Subcategory product card
│   └── ProtectedRoute.jsx# Auth route protection
├── context/
│   └── AuthContext.jsx   # Authentication state management
├── pages/
│   ├── CatalogPage.jsx   # Main catalog listing
│   ├── LoginPage.jsx     # User login
│   └── SubCategoryPage.jsx# Subcategory/product details
├── App.jsx               # Main app with routing
├── main.jsx              # Entry point
└── index.css             # Global styles
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running (Laravel backend)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your API URL:
   ```
   VITE_API_URL=http://your-api-url/api
   ```

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Production Build

Create a production build:
```bash
npm run build
```

The output will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## API Endpoints Used

- `POST /api/login` - User authentication
- `GET /api/getUserData` - Get authenticated user data
- `GET /api/brands/category/subcategory` - Get catalog with brands, categories, and subcategories

## Authentication

The app uses token-based authentication:
- Token is stored in localStorage
- Token is sent in the `Token` header for authenticated requests
- Automatic redirect to login on 401 responses

## Styling

The CSS uses CSS variables for consistent theming:

```css
--primary-olive: #8B8B4B;
--text-dark: #333333;
--text-gray: #666666;
--border-color: #e5e5e5;
```

Fonts used:
- **Playfair Display** - Headings
- **Source Sans Pro** - Body text

## License

Proprietary - Humble Group USA
