import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppContext from "../Context/Context";
import unplugged from "../assets/unplugged.png";
import { formatUsd } from "../utils/currency";

const Home = ({ selectedCategory }) => {
  const { data, isError, addToCart, refreshData } = useContext(AppContext);
  const [isDataFetched, setIsDataFetched] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastProduct, setToastProduct] = useState(null);
  const [catalogCategory, setCatalogCategory] = useState("All");

  useEffect(() => {
    if (!isDataFetched) {
      refreshData();
      setIsDataFetched(true);
    }
  }, [refreshData, isDataFetched]);

  useEffect(() => {
    console.log(data, 'data from home page');
  }, [data]);

  useEffect(() => {
    let toastTimer;
    if (showToast) {
      toastTimer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
    }
    return () => clearTimeout(toastTimer);
  }, [showToast]);

  // Function to convert base64 string to data URL
  const convertBase64ToDataURL = (base64String, mimeType = 'image/jpeg') => {
    if (!base64String) return unplugged; // Return fallback image if no data
    
    // If it's already a data URL, return as is
    if (base64String.startsWith('data:')) {
      return base64String;
    }
    
    // If it's already a URL, return as is
    if (base64String.startsWith('http')) {
      return base64String;
    }
    
    // Convert base64 string to data URL
    return `data:${mimeType};base64,${base64String}`;
  };

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    addToCart(product);
    setToastProduct(product);
    setShowToast(true);
  };

  useEffect(() => {
    setCatalogCategory(selectedCategory || "All");
  }, [selectedCategory]);

  const availableCategories = ["All", ...new Set(data.map((p) => p.category).filter(Boolean))];

  const filteredProducts = catalogCategory !== "All"
    ? data.filter((product) => product.category === catalogCategory)
    : data;

  if (isError) {
    return (
      <div className="container d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <div className="text-center">
          <img src={unplugged} alt="Error" className="img-fluid" width="100" />
          <h4 className="mt-3">Something went wrong</h4>
        </div>
      </div>
    );
  }
  
  return (
    <>
      {/* Toast Notification */}
      <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1050 }}>
        <div 
          className={`toast ${showToast ? 'show' : 'hide'}`}
          role="alert" 
          aria-live="assertive" 
          aria-atomic="true"
        >
          <div className="toast-header bg-success text-white">
            <strong className="me-auto">Added to Cart</strong>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={() => setShowToast(false)}
              aria-label="Close"
            ></button>
          </div>
          <div className="toast-body">
            {toastProduct && (
              <div className="d-flex align-items-center">
                <img 
                  src={convertBase64ToDataURL(toastProduct.imageData)} 
                  alt={toastProduct.name} 
                  className="me-2 rounded" 
                  width="40" 
                  height="40"
                  onError={(e) => {
                    e.target.src = unplugged; // Fallback image
                  }}
                />
                <div>
                  <div className="fw-bold">{toastProduct.name}</div>
                  <small>Successfully added to your cart!</small>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <header className="home-hero">
        <div className="container">
          <h1 className="home-hero-title">Shop curated picks</h1>
          <p className="home-hero-sub">Browse the catalog and add items to your cart in one tap.</p>
        </div>
      </header>

      <div className="container pb-5 pt-3">
        <div className="catalog-subbar">
          <div>
            <h2 className="catalog-title mb-1">Products Catalog</h2>
            <p className="page-lead mb-0">
              <strong style={{ color: "var(--text)" }}>{filteredProducts?.length ?? 0}</strong> products
            </p>
          </div>
        </div>
        <div className="catalog-chips mb-4">
          {availableCategories.map((category) => (
            <button
              key={category}
              type="button"
              className={`catalog-chip ${catalogCategory === category ? "active" : ""}`}
              onClick={() => setCatalogCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
          {!filteredProducts || filteredProducts.length === 0 ? (
            <div className="col-12 text-center my-5">
              <h4 className="mt-2">No products available</h4>
              <p className="text-muted">Try again later or add a product from the menu.</p>
            </div>
          ) : (
            filteredProducts.map((product) => {
              const { id, brand, name, price, productAvailable, imageData, stockQuantity } = product;
              
              return (
                <div className="col" key={id}>
                  <div className={`card h-100 shadow-sm ${!productAvailable ? "unavailable" : ""} product-card-surface`}>
                    <Link to={`/product/${id}`} className="text-decoration-none product-card-link">
                      <img
                        src={convertBase64ToDataURL(imageData)} 
                        alt={name}
                        className="card-img-top p-2"
                        style={{ height: "160px", objectFit: "cover" }}
                        onError={(e) => {
                          e.target.src = unplugged; // Fallback image if conversion fails
                        }}
                      />
                      <div className="card-body d-flex flex-column">
                        <h5 className="card-title">{name}</h5>
                        <p className="card-text fst-italic small">~ {brand}</p>
                        <hr className="my-2 opacity-25" />
                        <div className="mt-auto">
                          <div className="price-tag mb-3">
                            {formatUsd(price)}
                          </div>
                          <button
                            className="btn btn-app-primary w-100"
                            onClick={(e) => handleAddToCart(e, product)}
                            disabled={!productAvailable || stockQuantity === 0}
                          >
                            {stockQuantity !== 0 ? "Add to Cart" : "Out of Stock"}
                          </button>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};

export default Home;