import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface ProductImage {
  imageId: number;
  url: string;
}

interface ProductItem {
  productId: number;
  name: string;
  drawingNumber: string;
  images: ProductImage[];
}

function Products() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error('Failed to load products');
        const data = await res.json();
        if (mounted) setProducts(data.products || []);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="container">
      <div className="mt-3 mb-3">
        <Link to="/" className="btn btn-secondary">← Back to Home</Link>
        <Link to="/add-product" className="btn btn-success ms-2">Add New Product</Link>
      </div>

      <h2>Products</h2>
      {loading && <p>Loading...</p>}
      {!loading && products.length === 0 && <p>No products found.</p>}

      <div className="row">
        {products.map((p) => (
          <div key={p.productId} className="col-md-4 mb-3">
            <div className="card">
              {p.images && p.images.length > 0 ? (
                <img src={p.images[0].url} className="card-img-top" alt={p.name} />
              ) : (
                <div style={{height: 180, background: '#f1f1f1'}} />
              )}
              <div className="card-body">
                <h5 className="card-title">{p.name}</h5>
                <p className="card-text">Program: {p.drawingNumber}</p>
                {p.images.length > 1 && (
                  <div className="d-flex gap-2 flex-wrap">
                    {p.images.slice(1).map((img) => (
                      <img key={img.imageId} src={img.url} alt={p.name} style={{width:60, height:60, objectFit:'cover'}} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Products;
