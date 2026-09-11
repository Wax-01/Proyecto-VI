import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Hub from "../pages/Hub/Hub";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import Home from "../pages/Home/Home";
import CartPage from "../pages/Cart/CartPage";
import BookDetail from "../pages/BookDetail/BookDetail";
import AdminBooks from "../pages/Admin/AdminBooks";
import Apodos from "../pages/Apodos/Apodos";
import FotosGallery from "../pages/Fotos/FotosGallery";
import FotoCaptura from "../pages/Fotos/FotoCaptura";
import CartDrawer from "../components/CartDrawer";
import CartFab from "../components/CartFab";

/**
 * El carrito flotante solo tiene sentido dentro de las páginas de Bhook
 * (el Ecommerce), no en el hub principal ni en la sección de Fotos.
 */
function CartWidgets() {
    const location = useLocation();
    const esBhook = ["/bhook", "/carrito", "/admin/libros", "/apodos"].some(
        (base) => location.pathname === base || location.pathname.startsWith(base + "/")
    ) || location.pathname.startsWith("/libro/");

    if (!esBhook) return null;

    return (
        <>
            <CartDrawer />
            <CartFab />
        </>
    );
}

/**
 * Router principal del proyecto.
 * "/" es el hub con acceso a las distintas secciones (por ahora: Bhook y
 * Fotos). Bhook (el Ecommerce de libros) vive bajo "/bhook" y conserva sus
 * propias rutas de catálogo, carrito, ficha de libro y administración.
 * El login/registro ya no son exclusivos de Bhook: viven a nivel del hub.
 */
function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Hub />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Bhook (Ecommerce de libros) */}
                <Route path="/bhook" element={<Home />} />
                <Route path="/carrito" element={<CartPage />} />
                <Route path="/libro/:id" element={<BookDetail />} />
                <Route path="/admin/libros" element={<AdminBooks />} />
                <Route path="/apodos" element={<Apodos />} />

                {/* Fotos (huevo de pascua: recuerdos con foto + texto/audio) */}
                <Route path="/fotos" element={<FotosGallery />} />
                <Route path="/fotos/nueva" element={<FotoCaptura />} />
            </Routes>
            <CartWidgets />
        </BrowserRouter>
    );
}

export default AppRouter;
