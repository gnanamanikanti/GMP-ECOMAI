/** Bootstrap Icons class for product category (e.g. bi-laptop). */
export function getCategoryIconClass(category) {
  const c = String(category || "").toLowerCase();
  if (c.includes("laptop")) return "bi-laptop";
  if (c.includes("mobile") || c.includes("phone")) return "bi-phone";
  if (c.includes("headphone")) return "bi-headphones";
  if (c.includes("electronic")) return "bi-lightning-charge";
  if (c.includes("toy")) return "bi-controller";
  if (c.includes("fashion")) return "bi-bag-heart";
  return "bi-box-seam";
}
