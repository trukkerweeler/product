import { useState, ChangeEvent } from "react";
import { Link } from "react-router-dom";
import "./AddProduct.css";

function AddProduct() {
  const [productName, setProductName] = useState("");
  const [productProg, setProductProg] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) {
      setSelectedImages([]);
      setImagePreviews([]);
      return;
    }

    setSelectedImages(files);

    // Create previews
    const readers = files.map((file) => {
      return new Promise<string | null>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then((results) => {
      setImagePreviews(results.filter((r): r is string => !!r));
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Build FormData to include multiple image files
    const form = new FormData();
    form.append("name", productName);
    form.append("prog", productProg);
    selectedImages.forEach((f) => form.append("images", f));

    try {
      const resp = await fetch("/api/products", {
        method: "POST",
        body: form,
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        console.error("Failed to save product", err);
        alert("Failed to save product to server");
        return;
      }

      const data = await resp.json();
      const id = data.productId ?? null;

      alert(`Product "${productName}" added successfully! ID: ${id}`);

      // Reset form
      setProductName("");
      setProductProg("");
      setSelectedImages([]);
      setImagePreviews([]);
    } catch (error) {
      console.error("Error saving product", error);
      alert("Error saving product: " + (error as Error).message);
    }
  };

  return (
    <div className="container mt-4">
      <div className="mb-3">
        <Link to="/" className="btn btn-secondary">
          ← Back to Home
        </Link>
        <Link to="/products" className="btn btn-primary ms-2">
          View Products
        </Link>
      </div>

      <div className="add-product-container">
        <h2>Add New Product</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="productName" className="form-label">
              Product Name
            </label>
            <input
              type="text"
              className="form-control"
              id="productName"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="productProg" className="form-label">
              Product Program
            </label>
            <input
              type="text"
              className="form-control"
              id="productProg"
              value={productProg}
              onChange={(e) => setProductProg(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="productImages" className="form-label">
              Product Images (choose one or more)
            </label>
            <input
              type="file"
              className="form-control"
              id="productImages"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              required
            />
          </div>

          {imagePreviews.length > 0 && (
            <div className="mb-3">
              <label className="form-label">Image Previews:</label>
              <div className="image-preview-multiple">
                {imagePreviews.map((src, idx) => (
                  <img key={idx} src={src} alt={`Preview ${idx + 1}`} />
                ))}
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-success">
            Add Product
          </button>
          <button
            type="button"
            className="btn btn-secondary ms-2"
            onClick={() => {
              setProductName("");
              setProductProg("");
              setSelectedImages([]);
              setImagePreviews([]);
            }}
          >
            Reset
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddProduct;
