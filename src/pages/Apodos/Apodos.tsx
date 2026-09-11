import { useContext, useMemo, useState } from "react";
import NavBar from "../../components/NavBar";
import { AuthContext } from "../../context/authcontext";
import { ItemContext, Book } from "../../context/ItemContext";
import { supabase } from "../../utils/Supabase";
import { EggIcon, XIcon } from "../../components/icons";
import styles from "./Apodos.module.css";

/**
 * Huevo de pascua: cada libro puede tener un espacio de "apodos" o nombres
 * alternativos, independiente del nombre oficial. Se guardan en la columna
 * `nombres_alternativos` (text[]) de `libros`, vacía por defecto. Cualquiera
 * puede ver los apodos; solo los admins pueden agregarlos/quitarlos (la RLS
 * de Supabase ya lo exige en `libros.UPDATE`).
 */
function Apodos() {
    const { user } = useContext(AuthContext);
    const { data, isLoading, fetchBooks } = useContext(ItemContext);
    const isAdmin = user?.rol === "admin";

    const [search, setSearch] = useState("");
    const [drafts, setDrafts] = useState<Record<number, string>>({});
    const [savingId, setSavingId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return data;
        return data.filter((b) => b.nombre.toLowerCase().includes(term));
    }, [data, search]);

    async function guardarApodos(book: Book, nuevos: string[]) {
        setSavingId(book.id);
        setError(null);
        try {
            const { error: err } = await supabase
                .from("libros")
                .update({ nombres_alternativos: nuevos.length ? nuevos : null })
                .eq("id", book.id);
            if (err) throw err;
            await fetchBooks();
        } catch (err) {
            setError(err instanceof Error ? err.message : "No se pudo guardar el apodo.");
        } finally {
            setSavingId(null);
        }
    }

    function agregarApodo(book: Book) {
        const nuevo = (drafts[book.id] ?? "").trim();
        if (!nuevo) return;
        const actuales = book.nombres_alternativos ?? [];
        if (actuales.some((a) => a.toLowerCase() === nuevo.toLowerCase())) {
            setDrafts((prev) => ({ ...prev, [book.id]: "" }));
            return;
        }
        guardarApodos(book, [...actuales, nuevo]);
        setDrafts((prev) => ({ ...prev, [book.id]: "" }));
    }

    function quitarApodo(book: Book, apodo: string) {
        const actuales = book.nombres_alternativos ?? [];
        guardarApodos(book, actuales.filter((a) => a !== apodo));
    }

    return (
        <div className={styles.page}>
            <NavBar />

            <main className={styles.main}>
                <h1 className={styles.title}>
                    <EggIcon size={28} className={styles.titleIcon} /> Apodos
                </h1>
                <p className={styles.subtitle}>
                    Un espacio secreto para ponerle nombres alternativos a cada libro.
                    {!isAdmin && " Solo un admin puede editarlos."}
                </p>

                <input
                    type="text"
                    className={styles.search}
                    placeholder="Buscar libro..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    id="apodos-search"
                />

                {error && <div className={styles.msgError}>{error}</div>}

                {isLoading ? (
                    <p className={styles.hint}>Cargando...</p>
                ) : (
                    <ul className={styles.list}>
                        {filtered.map((book) => {
                            const apodos = book.nombres_alternativos ?? [];
                            return (
                                <li key={book.id} className={styles.card}>
                                    <div className={styles.cardHeader}>
                                        <span className={styles.cardTitle}>{book.nombre}</span>
                                        <span className={styles.cardAuthor}>
                                            {book.autor?.nombre || "Sin autor"}
                                        </span>
                                    </div>

                                    <div className={styles.chips}>
                                        {apodos.length === 0 && (
                                            <span className={styles.hint}>Sin apodos todavía.</span>
                                        )}
                                        {apodos.map((apodo) => (
                                            <span key={apodo} className={styles.chip}>
                                                {apodo}
                                                {isAdmin && (
                                                    <button
                                                        className={styles.chipRemove}
                                                        onClick={() => quitarApodo(book, apodo)}
                                                        disabled={savingId === book.id}
                                                        aria-label={`Quitar apodo ${apodo}`}
                                                    >
                                                        <XIcon size={12} />
                                                    </button>
                                                )}
                                            </span>
                                        ))}
                                    </div>

                                    {isAdmin && (
                                        <div className={styles.addRow}>
                                            <input
                                                type="text"
                                                className={styles.addInput}
                                                placeholder="Nuevo apodo..."
                                                value={drafts[book.id] ?? ""}
                                                onChange={(e) =>
                                                    setDrafts((prev) => ({ ...prev, [book.id]: e.target.value }))
                                                }
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") agregarApodo(book);
                                                }}
                                                disabled={savingId === book.id}
                                            />
                                            <button
                                                className={styles.addBtn}
                                                onClick={() => agregarApodo(book)}
                                                disabled={savingId === book.id}
                                            >
                                                Agregar
                                            </button>
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </main>
        </div>
    );
}

export default Apodos;
