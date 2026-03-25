import { useNavigate, useParams } from "react-router-dom";
import { useContext, useEffect } from "react";
import { useState } from "react";
import AppContext from "../Context/Context";
import axios from "../axios";
import { toast } from "react-toastify";
import { formatUsd } from "../utils/currency";

const Product = () => {
  const { id } = useParams();
  const { addToCart, removeFromCart, refreshData } = useContext(AppContext);
  const [product, setProduct] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(
          `${baseUrl}/api/product/${id}`
        );
        setProduct(response.data);
        if (response.data.imageName) {
          const imgRes = await axios.get(
            `${baseUrl}/api/product/${id}/image`,
            { responseType: "blob" }
          );
          setImageUrl(URL.createObjectURL(imgRes.data));
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };

    fetchProduct();
  }, [id, baseUrl]);

  const deleteProduct = async () => {
    try {
      await axios.delete(`${baseUrl}/api/product/${id}`);
      removeFromCart(id);
      toast.success("Product deleted successfully");
      refreshData();
      navigate("/");
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleEditClick = () => {
    navigate(`/product/update/${id}`);
  };

  const handlAddToCart = () => {
    addToCart(product);
    toast.success("Product added to cart");
  };

  if (!product) {
    return (
      <div className="page-shell container d-flex justify-content-center align-items-center" style={{ minHeight: "50vh" }}>
        <div className="text-center">
          <div className="spinner-border loader-app" role="status">
            <span className="visually-hidden">Loading…</span>
          </div>
          <p className="page-lead mt-3 mb-0">Loading product…</p>
        </div>
      </div>
    );
  }

  const inStock = product.productAvailable && product.stockQuantity > 0;

  return (
    <div className="page-shell container">
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb mb-0">
          <li className="breadcrumb-item">
            <button type="button" className="btn btn-link p-0 text-decoration-none align-baseline" onClick={() => navigate("/")}>
              Catalog
            </button>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="row g-4 align-items-start">
        <div className="col-lg-6">
          <div className="product-detail-media">
            {imageUrl ? (
              <img src={imageUrl} alt={product.name} />
            ) : (
              <div className="text-muted py-5">No image</div>
            )}
          </div>
        </div>

        <div className="col-lg-6 product-detail-panel">
          <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
            <span className="badge-app">{product.category}</span>
            {inStock ? (
              <span className="small text-success fw-semibold">
                <i className="bi bi-check-circle-fill me-1" aria-hidden /> In stock ({product.stockQuantity})
              </span>
            ) : (
              <span className="small text-danger fw-semibold">
                <i className="bi bi-x-circle-fill me-1" aria-hidden /> Unavailable
              </span>
            )}
          </div>

          <h1 className="page-title text-capitalize mb-1">{product.name}</h1>
          <p className="fst-italic text-muted mb-4">~ {product.brand}</p>

          <p className="lead-price mb-4">{formatUsd(product.price)}</p>

          <div className="surface-card mb-4">
            <div className="surface-card-body py-3">
              <h2 className="h6 form-section-title mb-2">About</h2>
              <p className="mb-0" style={{ lineHeight: 1.65 }}>
                {product.description || "No description provided."}
              </p>
            </div>
          </div>

          <p className="small text-muted mb-4">
            Release date:{" "}
            <strong>{new Date(product.releaseDate).toLocaleDateString()}</strong>
          </p>

          <div className="d-grid gap-2">
            <button
              className="btn btn-app-primary btn-lg"
              onClick={handlAddToCart}
              disabled={!inStock}
            >
              <i className="bi bi-cart-plus me-2" aria-hidden />
              {inStock ? "Add to cart" : "Out of stock"}
            </button>
            <div className="d-flex flex-wrap gap-2">
              <button
                className="btn btn-app-outline flex-grow-1"
                type="button"
                onClick={handleEditClick}
              >
                <i className="bi bi-pencil me-1" aria-hidden />
                Edit
              </button>
              <button
                className="btn btn-app-ghost text-danger border-danger flex-grow-1"
                type="button"
                onClick={deleteProduct}
              >
                <i className="bi bi-trash me-1" aria-hidden />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product;
