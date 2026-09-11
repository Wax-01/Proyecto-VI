import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authcontext";
import { ThemeContext } from "../../context/ThemeContext";
import { SunIcon, MoonIcon, BookOpenIcon, CameraIcon } from "../../components/icons";
import styles from "./Hub.module.css";

/**
 * Hub principal del proyecto: punto de entrada con acceso a las distintas
 * secciones (por ahora Bhook y Fotos). Sin diseño definitivo todavía,
 * solo botones grandes a cada apartado.
 */
function Hub() {
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);
    const { theme, toggleTheme } = useContext(ThemeContext);

    async function handleLogout() {
        await logout();
        navigate("/");
    }

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <span className={styles.brand}>Proyecto VI</span>

                <div className={styles.headerActions}>
                    <button
                        className={styles.btnTheme}
                        onClick={toggleTheme}
                        id="hub-theme-toggle"
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
                            <span className={styles.greeting}>
                                Hola, {user.nombre || user.email || "Lector"}
                            </span>
                            <button className={styles.btnSecondary} onClick={handleLogout} id="hub-logout">
                                Cerrar sesión
                            </button>
                        </>
                    ) : (
                        <button className={styles.btnPrimary} onClick={() => navigate("/login")} id="hub-login">
                            Iniciar sesión
                        </button>
                    )}
                </div>
            </header>

            <main className={styles.main}>
                <h1 className={styles.title}>Bienvenido</h1>
                <p className={styles.subtitle}>Elige a dónde quieres ir.</p>

                <div className={styles.grid}>
                    <button
                        className={styles.card}
                        onClick={() => navigate("/bhook")}
                        id="hub-btn-bhook"
                    >
                        <BookOpenIcon size={40} className={styles.cardIcon} />
                        <span className={styles.cardTitle}>Bhook</span>
                        <span className={styles.cardDesc}>Entra al Ecommerce de libros.</span>
                    </button>

                    <button
                        className={styles.card}
                        onClick={() => navigate("/fotos")}
                        id="hub-btn-fotos"
                    >
                        <CameraIcon size={40} className={styles.cardIcon} />
                        <span className={styles.cardTitle}>Subir fotos</span>
                        <span className={styles.cardDesc}>Fotos con una nota o un audio.</span>
                    </button>
                </div>
            </main>
        </div>
    );
}

export default Hub;
