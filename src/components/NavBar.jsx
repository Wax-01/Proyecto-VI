import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authcontext";
import styles from "./NavBar.module.css";

/**
 * Header principal de Bhook.
 * Contiene el logo/wordmark, los puntos del usuario y los botones
 * de navegación (Login/Logout). El carrito vive en un botón flotante
 * aparte (ver CartFab).
 * Diseño: estilo editorial con fondo superficie limpio.
 */
function NavBar() {
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);

    function goToLogin() {
        navigate("/login");
    }

    function goToHome() {
        navigate("/home");
    }

    async function handleLogout() {
        await logout();
        navigate("/login");
    }

    return (
        <header className={styles.header}>
            <div className={styles.inner}>
                {/* Logo / Wordmark */}
                <button className={styles.logo} onClick={goToHome} id="nav-logo">
                    Bhook
                </button>

                {/* Navegación derecha */}
                <nav className={styles.nav}>
                    <button
                        className={styles.navLink}
                        onClick={goToHome}
                        id="nav-catalogo"
                    >
                        Catálogo
                    </button>

                    {user ? (
                        <>
                            <span className={styles.greeting}>
                                Hola, {user.nombre || user.email || "Lector"}
                            </span>
                            <span className={styles.points} title="Tus puntos">
                                {user.puntos ?? 0} pts
                            </span>
                            <button
                                className={styles.btnSecondary}
                                onClick={handleLogout}
                                id="nav-logout"
                            >
                                Cerrar sesión
                            </button>
                        </>
                    ) : (
                        <button
                            className={styles.btnPrimary}
                            onClick={goToLogin}
                            id="nav-login"
                        >
                            Iniciar sesión
                        </button>
                    )}
                </nav>
            </div>
        </header>
    );
}

export default NavBar;