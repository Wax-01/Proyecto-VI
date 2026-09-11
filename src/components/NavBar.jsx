import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authcontext";
import { ThemeContext } from "../context/ThemeContext";
import { SunIcon, MoonIcon, HomeIcon, EggIcon } from "./icons";
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
    const { theme, toggleTheme } = useContext(ThemeContext);

    function goToLogin() {
        navigate("/login");
    }

    function goToHome() {
        navigate("/bhook");
    }

    function goToHub() {
        navigate("/");
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
                        onClick={goToHub}
                        id="nav-inicio"
                        title="Volver al inicio"
                    >
                        <HomeIcon size={16} /> Inicio
                    </button>

                    <button
                        className={styles.navLink}
                        onClick={goToHome}
                        id="nav-catalogo"
                    >
                        Catálogo
                    </button>

                    <button
                        className={styles.navLink}
                        onClick={() => navigate("/apodos")}
                        id="nav-apodos"
                        title="Apodos secretos de los libros"
                    >
                        <EggIcon size={16} /> Apodos
                    </button>

                    <button
                        className={styles.btnTheme}
                        onClick={toggleTheme}
                        id="nav-theme-toggle"
                        title={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                        aria-label={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                    >
                        {theme === "dark" ? (
                            <SunIcon size={18} className={styles.sunIcon} />
                        ) : (
                            <MoonIcon size={18} />
                        )}
                    </button>

                    {user ? (
                        <>
                            {user.rol === "admin" && (
                                <button
                                    className={styles.navLink}
                                    onClick={() => navigate("/admin/libros")}
                                    id="nav-admin"
                                >
                                    Editar libros
                                </button>
                            )}
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