import { useContext } from "react";
import { Link } from "react-router-dom";
import { Book } from "../context/ItemContext";
import { CartContext } from "../context/CartContext";
import styles from "./BookCard.module.css";

interface BookCardProps {
    book: Book;
}

/**
 * Tarjeta de libro para el catálogo.
 * Muestra: portada, título, autor, precio y control de compra.
 * Diseño: Modern Editorial con hover suave y sombra.
 */
function BookCard({ book }: BookCardProps) {
    const { items, addToCart, updateQty } = useContext(CartContext);

    // Formatear el precio en COP: $ 48.900
    const precioFormateado = new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(book.precio);

    // Nombre del autor (viene del JOIN)
    const autorNombre = book.autor?.nombre || "Autor desconocido";

    const cartItem = items.find((i) => i.book.id === book.id);
    const cantidadEnCarrito = cartItem?.cantidad ?? 0;

    return (
        <article className={styles.card} id={`book-card-${book.id}`}>
            {/* Portada del libro — enlaza a la ficha de detalle */}
            <Link to={`/libro/${book.id}`} className={styles.imageWrapper}>
                {book.imagen_url ? (
                    <img
                        src={book.imagen_url}
                        alt={`Portada de ${book.nombre}`}
                        className={styles.image}
                        loading="lazy"
                    />
                ) : (
                    <div className={styles.placeholder}>
                        <span>Sin portada</span>
                    </div>
                )}
            </Link>

            {/* Información del libro */}
            <div className={styles.info}>
                <Link to={`/libro/${book.id}`}>
                    <h3 className={styles.title}>{book.nombre}</h3>
                </Link>
                <p className={styles.author}>{autorNombre}</p>

                {/* Metadatos opcionales */}
                <div className={styles.meta}>
                    {book.paginas && (
                        <span className={styles.metaItem}>{book.paginas} págs</span>
                    )}
                    {book.idioma && (
                        <span className={styles.metaItem}>{book.idioma}</span>
                    )}
                </div>

                {/* Rating (si existe) */}
                {book.nota_promedio && (
                    <div className={styles.rating}>
                        <span className={styles.star}>★</span>
                        <span>{Number(book.nota_promedio).toFixed(1)}</span>
                    </div>
                )}

                {/* Precio y control de compra */}
                <div className={styles.footer}>
                    <span className={styles.price}>{precioFormateado}</span>
                    {cantidadEnCarrito === 0 ? (
                        <button
                            className={styles.btnAdd}
                            id={`btn-add-${book.id}`}
                            onClick={() => addToCart(book)}
                        >
                            Añadir
                        </button>
                    ) : (
                        <div className={styles.stepper} id={`stepper-${book.id}`}>
                            <button
                                className={styles.stepperBtn}
                                onClick={() => updateQty(book.id, cantidadEnCarrito - 1)}
                                aria-label="Quitar una unidad"
                            >
                                −
                            </button>
                            <span className={styles.stepperValue}>{cantidadEnCarrito}</span>
                            <button
                                className={styles.stepperBtn}
                                onClick={() => updateQty(book.id, cantidadEnCarrito + 1)}
                                aria-label="Añadir una unidad más"
                            >
                                +
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </article>
    );
}

export default BookCard;
