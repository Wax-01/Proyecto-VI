import { useContext, useState } from "react";
import { ItemContext } from "../context/ItemContext";
import styles from "./Search.module.css";

/**
 * Barra de búsqueda editorial.
 * Permite buscar libros por nombre y refrescar la lista completa.
 */
function Search() {
    const { searchBooks, fetchBooks } = useContext(ItemContext);
    const [word, setWord] = useState("");

    async function handleSearch(e) {
        e.preventDefault();
        await searchBooks(word);
    }

    async function handleRefresh() {
        setWord("");
        await fetchBooks();
    }

    return (
        <form className={styles.searchBar} onSubmit={handleSearch} id="search-form">
            <div className={styles.inputWrapper}>
                {/* Icono de búsqueda (SVG inline) */}
                <svg
                    className={styles.icon}
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                </svg>
                <input
                    type="text"
                    id="input-search"
                    className={styles.input}
                    value={word}
                    onChange={(e) => setWord(e.target.value)}
                    placeholder="Buscar por título..."
                />
            </div>
            <button type="submit" className={styles.btnSearch} id="btn-search">
                Buscar
            </button>
            <button
                type="button"
                className={styles.btnRefresh}
                onClick={handleRefresh}
                id="btn-refresh"
                title="Actualizar catálogo"
            >
                {/* Icono de refresh */}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                </svg>
            </button>
        </form>
    );
}

export default Search;