import React, { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AppContext from "../Context/Context";
import unplugged from "../assets/unplugged.png";
import { formatUsd } from "../utils/currency";

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useContext(AppContext);
  const [searchData, setSearchData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (location.state && location.state.searchData) {
      setSearchData(location.state.searchData);
      setLoading(false);
    } else {
      navigate("/");
    }
  }, [location, navigate]);

  const handleViewProduct = (productId) => {
    navigate(`/product/${productId}`);
  };

  const convertBase64ToDataURL = (base64String, mimeType = "image/jpeg") => {
    if (!base64String) return unplugged;
    if (base64String.startsWith("data:")) return base64String;
    if (base64String.startsWith("http")) return base64String;
    return `data:${mimeType};base64,${base64String}`;
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    toast.success(`Added “${product.name}” to cart`);
  };

  if (loading) {
    return (
      <div className="page-shell container d-flex justify-content-center align-items-center" style={{ minHeight: "50vh" }}>
        <div className="spinner-border loader-app" role="status">
          <span className="visually-hidden">Loading…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell container">
      <div className="catalog-subbar">
        <div>
          <h1 className="page-title mb-1">Search results</h1>
          <p className="page-lead mb-0">
            {searchData.length === 0
              ? "No matches for that query."
              : `${searchData.length} product${searchData.length === 1 ? "" : "s"} found`}
          </p>
        </div>
        <button type="button" className="btn btn-app-ghost" onClick={() => navigate("/")}>
          <i className="bi bi-arrow-left me-2" aria-hidden />
          Back to catalog
        </button>
      </div>

      {searchData.length === 0 ? (
        <div className="surface-card">
          <div className="surface-card-body text-center py-5">
            <i className="bi bi-search display-4 text-muted opacity-50 d-block mb-3" aria-hidden />
            <p className="page-lead mb-0">Try different keywords or browse the home catalog.</p>
          </div>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
          {searchData.map((product) => {
            const desc = product.description || "";
            const snippet =
              desc.length > 100 ? `${desc.substring(0, 100)}…` : desc;

            return (
              <div key={product.id} className="col">
                <div
                  className={`card h-100 shadow-sm product-card-surface ${!product.productAvailable ? "unavailable" : ""}`}
                >
                  <button
                    type="button"
                    className="border-0 bg-transparent p-0 text-start w-100 product-card-link"
                    onClick={() => handleViewProduct(product.id)}
                  >
                    <img
                      src={convertBase64ToDataURL(product.imageData)}
                      className="card-img-top p-2"
                      alt={product.name}
                      style={{ height: "160px", objectFit: "cover" }}
                      onError={(e) => {
                        e.target.src = unplugged;
                      }}
                    />
                  </button>
                  <div className="card-body d-flex flex-column">
                    <h2 className="card-title h6">{product.name}</h2>
                    <p className="card-text small fst-italic mb-2">~ {product.brand}</p>
                    <span className="badge-app align-self-start mb-2">{product.category}</span>
                    {snippet && (
                      <p className="card-text small flex-grow-1" style={{ color: "var(--muted)" }}>
                        {snippet}
                      </p>
                    )}
                    <div className="price-tag mb-3">{formatUsd(product.price)}</div>
                    <div className="d-grid gap-2 mt-auto">
                      <button
                        type="button"
                        className="btn btn-app-outline btn-sm"
                        onClick={() => handleViewProduct(product.id)}
                      >
                        View details
                      </button>
                      <button
                        type="button"
                        className="btn btn-app-primary btn-sm"
                        onClick={() => handleAddToCart(product)}
                        disabled={!product.productAvailable || product.stockQuantity <= 0}
                      >
                        {product.productAvailable && product.stockQuantity > 0
                          ? "Add to cart"
                          : "Out of stock"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
