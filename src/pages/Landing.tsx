import { Link } from "react-router-dom";
import "./Landing.css";

function Landing() {
  return (
    <div className="landing-container">
      <div className="landing-content">
        <h1>Welcome to Product Management</h1>
        <p>Manage your products efficiently and effectively</p>
        <div className="landing-buttons">
          <Link to="/products" className="btn btn-primary btn-lg">
            View Products
          </Link>
          <Link to="/add-product" className="btn btn-success btn-lg">
            Add New Product
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Landing;
