/**
 * ===== ENTRY POINT =====
 * Điểm khởi chạy ứng dụng React.
 * Mount component <App /> vào DOM element #root.
 */
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
