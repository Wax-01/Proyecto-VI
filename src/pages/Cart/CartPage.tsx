import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import { CartContext } from "../../context/CartContext";
import { AuthContext } from "../../context/authcontext";
import styles from "./CartPage.module.css";

/**
 * Página completa del carrito de compras.
 * Permite ajustar cantidades, vaciar el carrito y pagar: el pago
 * ejecuta la función segura `checkout_cart` en Supabase, que registra
 * la venta y otorga puntos al perfil del usuario.
 */
function CartPage() {
    const { items, totalPrice, totalItems, updateQty, removeFromCart, clearCart, checkout } =
        useContext(CartContext);
    const { user, addPoints } = useContext(AuthContext);
    const navigate = useNavigate();

    const [isPaying, setIsPaying] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [success, setSuccess] = useState<{ total: number; puntos_ganados: number } | null>(null);

    const precio = (n: number) =>
        new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(n);

    async function handleCheckout() {
        if (!user) {
            navigate("/login");
            return;
        }
        setErrorMsg("");
        setIsPaying(true);
        const result = await checkout();
        setIsPaying(false);

        if (!result.success) {
            setErrorMsg(result.error || "No se pudo completar la compra.");
            return;
        }

        addPoints(result.puntos_ganados || 0);
        setSuccess({ total: result.total || 0, puntos_ganados: result.puntos_ganados || 0 });
    }

    return (
        <div className={styles.page}>
            <NavBar />

            <main className={styles.main}>
                <h1 className={styles.title}>Carrito de compras</h1>

                {success ? (
                    <div className={styles.successBox}>
                        <h2>¡Compra realizada!</h2>
                        <p>
                            Pagaste {precio(success.total)} y ganaste{" "}
                            <strong>{success.puntos_ganados} puntos</strong>.
                        </p>
                        <button className={styles.btnPrimary} onClick={() => navigate("/home")} id="btn-back-to-catalog">
                            Volver al catálogo
                        </button>
                    </div>
                ) : items.length === 0 ? (
                    <div className={styles.empty}>
                        <p className={styles.emptyText}>Tu carrito está vacío.</p>
                        <button className={styles.btnPrimary} onClick={() => navigate("/home")} id="btn-explore-catalog">
                            Explorar catálogo
                        </button>
                    </div>
                ) : (
                    <div className={styles.layout}>
                        <ul className={styles.list}>
                            {items.map(({ book, cantidad }) => (
                                <li className={styles.item} key={book.id}>
                                    <div className={styles.itemImageWrapper}>
                                        {book.imagen_url ? (
                                            <img src={book.imagen_url} alt={book.nombre} className={styles.itemImage} />
                                        ) : (
                                            <span className={styles.itemPlaceholder}>Sin portada</span>
                                        )}
                                    </div>
                                    <div className={styles.itemInfo}>
                                        <p className={styles.itemTitle}>{book.nombre}</p>
                                        <p className={styles.itemAuthor}>{book.autor?.nombre || "Autor desconocido"}</p>
                                        <span className={styles.itemUnitPrice}>{precio(book.precio)} c/u</span>
                                    </div>
                                    <div className={styles.stepper}>
                                        <button
                                            className={styles.stepperBtn}
                                            onClick={() => updateQty(book.id, cantidad - 1)}
                                            aria-label="Disminuir cantidad"
                                        >
                                            −
                                        </button>
                                        <span className={styles.stepperValue}>{cantidad}</span>
                                        <button
                                            className={styles.stepperBtn}
                                            onClick={() => updateQty(book.id, cantidad + 1)}
                                            aria-label="Aumentar cantidad"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <span className={styles.itemSubtotal}>{precio(book.precio * cantidad)}</span>
                                    <button
                                        className={styles.btnRemove}
                                        onClick={() => removeFromCart(book.id)}
                                        aria-label={`Eliminar ${book.nombre}`}
                                    >
                                        Eliminar
                                    </button>
                                </li>
                            ))}
                        </ul>

                        <aside className={styles.summary}>
                            <h2 className={styles.summaryTitle}>Resumen del pedido</h2>
                            <div className={styles.summaryRow}>
                                <span>{totalItems} {totalItems === 1 ? "artículo" : "artículos"}</span>
                                <span>{precio(totalPrice)}</span>
                            </div>
                            <div className={styles.summaryRow}>
                                <span>Envío</span>
                                <span>Gratis</span>
                            </div>
                            <div className={styles.summaryTotal}>
                                <span>Total</span>
                                <span>{precio(totalPrice)}</span>
                            </div>
                            <p className={styles.pointsHint}>
                                Ganarás <strong>{Math.floor(totalPrice / 1000)} puntos</strong> con esta compra.
                            </p>

                            {errorMsg && <div className={styles.alert}>{errorMsg}</div>}
                            {!user && (
                                <div className={styles.alertInfo}>Inicia sesión para pagar y ganar puntos.</div>
                            )}

                            <button
                                className={styles.btnPay}
                                onClick={handleCheckout}
                                disabled={isPaying}
                                id="btn-checkout"
                            >
                                {isPaying ? "Procesando..." : user ? "Pagar" : "Iniciar sesión para pagar"}
                            </button>
                            <button className={styles.btnClear} onClick={clearCart} id="btn-clear-cart">
                                Vaciar carrito
                            </button>
                        </aside>
                    </div>
                )}
            </main>
        </div>
    );
}

export default CartPage;
