import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import styles from "./CartDrawer.module.css";

/**
 * Panel lateral de carrito (mini-cart). Se abre al añadir un libro
 * y permite ajustar cantidades o ir a la página completa del carrito.
 */
function CartDrawer() {
    const { items, isOpen, closeCart, removeFromCart, updateQty, totalPrice, clearCart } =
        useContext(CartContext);
    const navigate = useNavigate();

    const precio = (n: number) =>
        new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(n);

    function goToCart() {
        closeCart();
        navigate("/carrito");
    }

    return (
        <>
            <div
                className={`${styles.overlay} ${isOpen ? styles.overlayOpen : ""}`}
                onClick={closeCart}
                aria-hidden="true"
            />
            <aside
                className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ""}`}
                id="cart-drawer"
                aria-label="Carrito de compras"
            >
                <div className={styles.header}>
                    <h3 className={styles.title}>Tu carrito</h3>
                    <button className={styles.btnClose} onClick={closeCart} id="btn-close-cart" aria-label="Cerrar carrito">
                        ✕
                    </button>
                </div>

                {items.length === 0 ? (
                    <div className={styles.empty}>
                        <p>Tu carrito está vacío.</p>
                    </div>
                ) : (
                    <>
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
                                        <div className={styles.itemFooter}>
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
                                            <span className={styles.itemPrice}>{precio(book.precio * cantidad)}</span>
                                        </div>
                                    </div>
                                    <button
                                        className={styles.btnRemove}
                                        onClick={() => removeFromCart(book.id)}
                                        aria-label={`Eliminar ${book.nombre} del carrito`}
                                    >
                                        Eliminar
                                    </button>
                                </li>
                            ))}
                        </ul>

                        <div className={styles.footer}>
                            <div className={styles.subtotalRow}>
                                <span>Subtotal</span>
                                <span className={styles.subtotalValue}>{precio(totalPrice)}</span>
                            </div>
                            <button className={styles.btnCheckout} onClick={goToCart} id="btn-go-to-cart">
                                Ver carrito y pagar
                            </button>
                            <button className={styles.btnClear} onClick={clearCart} id="btn-clear-cart-drawer">
                                Vaciar carrito
                            </button>
                        </div>
                    </>
                )}
            </aside>
        </>
    );
}

export default CartDrawer;
