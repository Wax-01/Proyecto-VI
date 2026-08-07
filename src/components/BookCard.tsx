import { Book } from "../context/ItemContext";
import styles from "./BookCard.module.css";

interface BookCardProps {
    book: Book;
}

/**
 * Tarjeta de libro para el catálogo.
 * Muestra: portada, título, autor, precio y botón CTA.
 * Diseño: Modern Editorial con hover suave y sombra.
 */
function BookCard({ book }: BookCardProps) {
    // Formatear el precio en COP: $ 48.900
    const precioFormateado = new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(book.precio);

    // Nombre del autor (viene del JOIN)
    const autorNombre = book.autor?.nombre || "Autor desconocido";

    return (
        <article className={styles.card} id={`book-card-${book.id}`}>
            {/* Portada del libro */}
            <div className={styles.imageWrapper}>
                {book.imagen_url ? (
                    <img
                        src={book.imagen_url}
                        alt={`Portada de ${book.nombre}`}
                        className={styles.image}
                        loading="lazy"
                    />
                ) : (
                    <div className={styles.placeholder}>
                        <span>📖</span>
                    </div>
                )}
            </div>

            {/* Información del libro */}
            <div className={styles.info}>
                <h3 className={styles.title}>{book.nombre}</h3>
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

                {/* Precio y CTA */}
                <div className={styles.footer}>
                    <span className={styles.price}>{precioFormateado}</span>
                    <button className={styles.btnAdd} id={`btn-add-${book.id}`}>
                        Añadir
                    </button>
                </div>
            </div>
        </article>
    );
}

export default BookCard;
