import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context";

function ProtectedRoute({ children, requireAdmin = false }) {
    const { user, authReady } = useContext(AuthContext);

    if (!authReady) {
        return <p>Comprobando sesion...</p>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (requireAdmin && user.role !== "admin") {
        return <Navigate to="/" replace />;
    }

    return children;

}

export default ProtectedRoute
