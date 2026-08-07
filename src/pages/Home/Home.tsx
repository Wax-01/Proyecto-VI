import NavBar from "../../components/NavBar";
import Search from "../../components/Search";
import BookGrid from "../../components/ListItems";
import { ItemContext } from "../../context/ItemContext";
import { useContext } from "react";
import styles from "./Home.module.css";

/**
 * Página principal del catálogo Bhook.
 * Panel de visualización interactivo que consume datos del backend
 * y los renderiza mediante tarjetas dinámicas (BookCard).
 * Incluye barra de búsqueda y botón de refresh para sincronizar
 * los nuevos registros cargados por el scraper.
 */
function Home() {
    const { data, isLoading } = useContext(ItemContext);

    return (
        <div className={styles.page}>
            <NavBar />

            <main className={styles.main}>
                {/* Hero / encabezado de la sección */}
                <section className={styles.hero}>
                    <h1 className={styles.title}>Explora nuestro catálogo</h1>
                    <p className={styles.subtitle}>
                        Descubre los mejores títulos de fantasía y ciencia ficción, directamente desde las mejores editoriales.
                    </p>
                </section>

                {/* Barra de búsqueda + refresh */}
                <section className={styles.searchSection}>
                    <Search />
                </section>

                {/* Contador de resultados */}
                {!isLoading && (
                    <p className={styles.count}>
                        {data.length} {data.length === 1 ? "libro encontrado" : "libros encontrados"}
                    </p>
                )}

                {/* Grilla de libros o skeleton loading */}
                <section className={styles.catalog}>
                    {isLoading ? (
                        <div className={styles.skeletonGrid}>
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className={styles.skeletonCard}>
                                    <div className={styles.skeletonImage} />
                                    <div className={styles.skeletonInfo}>
                                        <div className={styles.skeletonLine} style={{ width: "80%" }} />
                                        <div className={styles.skeletonLine} style={{ width: "50%" }} />
                                        <div className={styles.skeletonLine} style={{ width: "30%" }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <BookGrid books={data} />
                    )}
                </section>
            </main>

            {/* Footer simple */}
            <footer className={styles.footer}>
                <p>© 2026 Bhook — Tu librería online</p>
            </footer>
        </div>
    );
}

export default Home;