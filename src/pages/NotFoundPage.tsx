
import { Link } from "react-router-dom";

function NotFoundPage() {
    return (
        <section className="container py-5 text-center">
            <h1>404</h1>
            <h2>Page Not Found</h2>
            <p>The page you're looking for doesn't exist.</p>
            <Link to="/" className="btn btn-danger">
                Back to Home
            </Link>
        </section>
    );
}

export default NotFoundPage;
