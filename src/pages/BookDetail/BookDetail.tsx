import { useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import { ItemContext } from "../../context/ItemContext";
import { CartContext } from "../../context/CartContext";
import styles from "./BookDetail.module.css";

/**
 * Ficha de detalle de un libro: portada a la izquierda, datos y
 * compra a la derecha, descripción completa abajo.
 */
function BookDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data, isLoading } = useContext(ItemContext);
    const { items, addToCart, updateQty } = useContext(CartContext);

    const book = data.find((b) => String(b.id) === id);

    const precioFormateado = book
        ? new Intl.NumberFormat("es-CO", {
              style: "currency",
              currency: "COP",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
          }).format(book.precio)
        : "";

    const cartItem = book ? items.find((i) => i.book.id === book.id) : undefined;
    const cantidadEnCarrito = cartItem?.cantidad ?? 0;

    if (isLoading) {
        return (
            <div className={styles.page}>
                <NavBar />
                <main className={styles.main}>
                    <p className={styles.statusText}>Cargando libro...</p>
                </main>
            </div>
        );
    }

    if (!book) {
        return (
            <div className={styles.page}>
                <NavBar />
                <main className={styles.main}>
                    <p className={styles.statusText}>No se encontró este libro.</p>
                    <button className={styles.btnPrimary} onClick={() => navigate("/home")} id="btn-back-catalog">
                        Volver al catálogo
                    </button>
                </main>
            </div>
        );
    }

    const autorNombre = book.autor?.nombre || "Autor desconocido";

    return (
        <div className={styles.page}>
            <NavBar />

            <main className={styles.main}>
                <Link to="/home" className={styles.backLink}>
                    ← Volver al catálogo
                </Link>

                <div className={styles.layout}>
                    {/* Portada */}
                    <div className={styles.imageWrapper}>
                        {book.imagen_url ? (
                            <img
                                src={book.imagen_url}
                                alt={`Portada de ${book.nombre}`}
                                className={styles.image}
                            />
                        ) : (
                            <div className={styles.placeholder}>
                                <span>Sin portada</span>
                            </div>
                        )}
                    </div>

                    {/* Datos y compra */}
                    <div className={styles.info}>
                        <h1 className={styles.title}>{book.nombre}</h1>
                        <p className={styles.author}>{autorNombre}</p>

                        {book.nota_promedio && (
                            <div className={styles.rating}>
                                <span className={styles.star}>★</span>
                                <span>{Number(book.nota_promedio).toFixed(1)}</span>
                            </div>
                        )}

                        <div className={styles.dataGrid}>
                            {book.editorial && (
                                <div className={styles.dataItem}>
                                    <span className={styles.dataLabel}>Editorial</span>
                                    <span className={styles.dataValue}>{book.editorial}</span>
                                </div>
                            )}
                            {book.idioma && (
                                <div className={styles.dataItem}>
                                    <span className={styles.dataLabel}>Idioma</span>
                                    <span className={styles.dataValue}>{book.idioma}</span>
                                </div>
                            )}
                            {book.paginas && (
                                <div className={styles.dataItem}>
                                    <span className={styles.dataLabel}>Páginas</span>
                                    <span className={styles.dataValue}>{book.paginas}</span>
                                </div>
                            )}
                            {book.tipo_tapa && (
                                <div className={styles.dataItem}>
                                    <span className={styles.dataLabel}>Tapa</span>
                                    <span className={styles.dataValue}>{book.tipo_tapa}</span>
                                </div>
                            )}
                            {book.año_publicacion && (
                                <div className={styles.dataItem}>
                                    <span className={styles.dataLabel}>Año</span>
                                    <span className={styles.dataValue}>{book.año_publicacion}</span>
                                </div>
                            )}
                            {book.codigo_producto && (
                                <div className={styles.dataItem}>
                                    <span className={styles.dataLabel}>Código</span>
                                    <span className={styles.dataValue}>{book.codigo_producto}</span>
                                </div>
                            )}
                        </div>

                        <div className={styles.purchaseBox}>
                            <span className={styles.price}>{precioFormateado}</span>

                            {cantidadEnCarrito === 0 ? (
                                <button
                                    className={styles.btnAdd}
                                    onClick={() => addToCart(book)}
                                    id="btn-add-detail"
                                >
                                    Añadir al carrito
                                </button>
                            ) : (
                                <div className={styles.stepper} id="stepper-detail">
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
                </div>

                {/* Descripción */}
                {book.descripcion && (
                    <section className={styles.descriptionSection}>
                        <h2 className={styles.descriptionTitle}>Sinopsis</h2>
                        <p className={styles.descriptionText}>{book.descripcion}</p>
                    </section>
                )}
            </main>
        </div>
    );
}

export default BookDetail;
