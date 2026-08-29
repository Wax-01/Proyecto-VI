import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import Home from "../pages/Home/Home";
import CartPage from "../pages/Cart/CartPage";
import BookDetail from "../pages/BookDetail/BookDetail";
import CartDrawer from "../components/CartDrawer";
import CartFab from "../components/CartFab";

/**
 * Router principal de Bhook.
 * Define las rutas de la aplicación: home (catálogo), login, registro,
 * ficha de libro y carrito. La ruta raíz "/" redirige al catálogo.
 * El CartDrawer y el CartFab viven fuera de <Routes> para estar disponibles
 * en cualquier página (necesitan el contexto del Router).
 */
function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="/home" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/carrito" element={<CartPage />} />
                <Route path="/libro/:id" element={<BookDetail />} />
            </Routes>
            <CartDrawer />
            <CartFab />
        </BrowserRouter>
    );
}

export default AppRouter;