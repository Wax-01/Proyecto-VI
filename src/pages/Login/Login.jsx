import { useContext, useState } from "react";
import styles from "./Login.module.css";
import { AuthContext } from "../../context/authcontext";
import { useNavigate } from "react-router-dom";

/**
 * Página de inicio de sesión — Bhook.
 * Layout editorial: panel decorativo izquierdo + formulario derecho.
 */
function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [warning, setWarning] = useState("");
    const context = useContext(AuthContext);
    const navigate = useNavigate();

    async function handleLogin(e) {
        e.preventDefault();
        const cleanEmail = email.trim();
        const cleanPassword = password.trim();

        if (!cleanEmail || !cleanPassword) {
            setWarning("Por favor completa todos los campos.");
            return;
        }

        setWarning("");
        setLoading(true);
        const success = await context.login(cleanEmail, cleanPassword);
        setLoading(false);

        if (success) {
            navigate("/home");
        } else {
            setWarning("Credenciales incorrectas. Intenta de nuevo.");
        }
    }

    return (
        <div className={styles.page}>
            {/* Panel decorativo izquierdo */}
            <div className={styles.brandPanel}>
                <div className={styles.brandContent}>
                    <h1 className={styles.brandName}>Bhook</h1>
                    <p className={styles.brandTagline}>
                        Tu próxima gran historia te espera.
                    </p>
                    <div className={styles.brandDeco}>📖</div>
                </div>
            </div>

            {/* Panel del formulario */}
            <div className={styles.formPanel}>
                <form className={styles.form} onSubmit={handleLogin} id="login-form">
                    <h2 className={styles.formTitle}>Iniciar sesión</h2>
                    <p className={styles.formSubtitle}>
                        Accede a tu cuenta para explorar el catálogo.
                    </p>

                    {/* Campo Email */}
                    <div className={styles.field}>
                        <label htmlFor="login-email" className={styles.label}>
                            Correo electrónico
                        </label>
                        <input
                            type="email"
                            id="login-email"
                            className={styles.input}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="tu@correo.com"
                            autoComplete="email"
                        />
                    </div>

                    {/* Campo Contraseña */}
                    <div className={styles.field}>
                        <label htmlFor="login-password" className={styles.label}>
                            Contraseña
                        </label>
                        <input
                            type="password"
                            id="login-password"
                            className={styles.input}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            autoComplete="current-password"
                        />
                    </div>

                    {/* Mensaje de error */}
                    {warning && (
                        <div className={styles.alert} role="alert">
                            {warning}
                        </div>
                    )}

                    {/* Botón de submit */}
                    <button
                        type="submit"
                        className={styles.btnSubmit}
                        disabled={loading}
                        id="btn-login"
                    >
                        {loading ? (
                            <span className={styles.spinner}></span>
                        ) : (
                            "Acceder"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;