import { Navigate, Outlet, useLocation } from "react-router-dom"; // 1. Thêm useLocation
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children, allowedRoles }) => {
    const user = useSelector((state) => state.auth.user);
    const location = useLocation(); // 2. Lấy thông tin trang hiện tại (ví dụ: /upload)

    if (!user) {
        // 3. Thay đổi dòng này:
        // Thay vì chỉ về "/login", ta nối thêm đuôi "?redirect=..."
        // location.pathname + location.search giúp lấy đầy đủ cả đường dẫn và các tham số cũ (nếu có)
        return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return children ? children : <Outlet />;
};

export default ProtectedRoute;