import BookCard from "./BookCard";
import { Book } from "../context/ItemContext";
import styles from "./BookGrid.module.css";

interface BookGridProps {
    books: Book[];
}

/**
 * Grilla de tarjetas de libros.
 * Renderiza un BookCard por cada libro recibido.
 */
function BookGrid({ books }: BookGridProps) {
    if (books.length === 0) {
        return (
            <div className={styles.empty}>
                <p className={styles.emptyText}>No se encontraron libros</p>
                <p className={styles.emptyHint}>
                    Intenta con otro término de búsqueda o presiona el botón de actualizar.
                </p>
            </div>
        );
    }

    return (
        <div className={styles.grid} id="book-grid">
            {books.map((book) => (
                <BookCard key={book.id} book={book} />
            ))}
        </div>
    );
}

export default BookGrid;