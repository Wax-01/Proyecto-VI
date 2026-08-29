import { useContext, useState } from "react";
import styles from "../Login/Login.module.css";
import { AuthContext } from "../../context/authcontext";
import { useNavigate, Link } from "react-router-dom";

/**
 * Página de registro — Bhook.
 * Comparte el layout editorial de Login (mismo módulo de estilos).
 */
function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [warning, setWarning] = useState("");
    const context = useContext(AuthContext);
    const navigate = useNavigate();

    async function handleRegister(e) {
        e.preventDefault();
        const cleanUsername = username.trim();
        const cleanEmail = email.trim();
        const cleanPassword = password.trim();

        if (!cleanUsername || !cleanEmail || !cleanPassword) {
            setWarning("Por favor completa todos los campos.");
            return;
        }
        if (cleanPassword.length < 6) {
            setWarning("La contraseña debe tener al menos 6 caracteres.");
            return;
        }

        setWarning("");
        setLoading(true);
        const result = await context.register(cleanEmail, cleanPassword, cleanUsername);
        setLoading(false);

        if (!result.success) {
            setWarning(result.error || "No se pudo crear la cuenta. Intenta de nuevo.");
            return;
        }

        navigate("/login");
    }

    return (
        <div className={styles.page}>
            <div className={styles.brandPanel}>
                <div className={styles.brandContent}>
                    <h1 className={styles.brandName}>Bhook</h1>
                    <p className={styles.brandTagline}>
                        Únete y empieza a coleccionar puntos con cada lectura.
                    </p>
                </div>
            </div>

            <div className={styles.formPanel}>
                <form className={styles.form} onSubmit={handleRegister} id="register-form">
                    <h2 className={styles.formTitle}>Crear cuenta</h2>
                    <p className={styles.formSubtitle}>
                        Regístrate para guardar tu carrito y ganar puntos.
                    </p>

                    <div className={styles.field}>
                        <label htmlFor="register-username" className={styles.label}>
                            Nombre de usuario
                        </label>
                        <input
                            type="text"
                            id="register-username"
                            className={styles.input}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="lector_curioso"
                            autoComplete="username"
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="register-email" className={styles.label}>
                            Correo electrónico
                        </label>
                        <input
                            type="email"
                            id="register-email"
                            className={styles.input}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="tu@correo.com"
                            autoComplete="email"
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="register-password" className={styles.label}>
                            Contraseña
                        </label>
                        <input
                            type="password"
                            id="register-password"
                            className={styles.input}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            autoComplete="new-password"
                        />
                    </div>

                    {warning && (
                        <div className={styles.alert} role="alert">
                            {warning}
                        </div>
                    )}

                    <button
                        type="submit"
                        className={styles.btnSubmit}
                        disabled={loading}
                        id="btn-register"
                    >
                        {loading ? <span className={styles.spinner}></span> : "Crear cuenta"}
                    </button>

                    <p className={styles.formSubtitle} style={{ marginTop: 0 }}>
                        ¿Ya tienes cuenta? <Link to="/login" style={{ color: "var(--color-primary)", fontWeight: 600 }}>Inicia sesión</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default Register;
