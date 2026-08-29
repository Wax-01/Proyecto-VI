import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import styles from "./CartFab.module.css";

/**
 * Botón flotante de carrito, fijo abajo a la derecha en todas las páginas.
 * Muestra el número de unidades que lleva el usuario.
 */
function CartFab() {
    const { totalItems, toggleCart } = useContext(CartContext);

    return (
        <button
            className={styles.fab}
            onClick={toggleCart}
            id="cart-fab"
            aria-label="Abrir carrito de compras"
        >
            <span aria-hidden="true">🛒</span>
            {totalItems > 0 && <span className={styles.badge}>{totalItems}</span>}
        </button>
    );
}

export default CartFab;
