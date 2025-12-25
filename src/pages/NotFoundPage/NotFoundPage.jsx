import React from "react";
import { Link } from "react-router-dom"; // Dùng Link để không reload trang

const NotFoundPage = () => {
    return (
        <div style={styles.container}>
            {/* Bạn có thể chèn ảnh SVG vào đây */}
            <img 
                src="https://gw.alipayobjects.com/zos/rmsportal/KpnpchXsobRgLElEozzI.svg" 
                alt="404 illustration" 
                style={styles.image}
            />
            
            <h1 style={styles.title}>404</h1>
            <p style={styles.text}>Oops! Trang bạn tìm kiếm không tồn tại.</p>
            
            <Link to="/" style={styles.button}>
                Quay về trang chủ
            </Link>
        </div>
    );
};

const styles = {
    container: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh", // Full màn hình
        backgroundColor: "#f0f2f5",
        fontFamily: "'Roboto', sans-serif",
    },
    image: {
        width: "300px",
        marginBottom: "20px",
    },
    title: {
        fontSize: "72px",
        margin: "0",
        color: "#434343",
        fontWeight: "bold",
    },
    text: {
        fontSize: "18px",
        color: "#666",
        marginBottom: "30px",
    },
    button: {
        padding: "12px 24px",
        backgroundColor: "#1890ff",
        color: "#fff",
        textDecoration: "none",
        borderRadius: "8px",
        fontWeight: "500",
        boxShadow: "0 4px 14px 0 rgba(24, 144, 255, 0.39)",
        transition: "transform 0.2s",
    }
};

export default NotFoundPage;