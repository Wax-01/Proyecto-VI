import { useContext, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import { AuthContext } from "../../context/authcontext";
import { ItemContext, Book } from "../../context/ItemContext";
import { supabase } from "../../utils/Supabase";
import styles from "./AdminBooks.module.css";

interface FormState {
    nombre: string;
    autorNombre: string;
    descripcion: string;
    precio: string;
    nota_promedio: string;
    imagen_url: string;
    paginas: string;
    idioma: string;
    tipo_tapa: string;
    editorial: string;
    codigo_producto: string;
    año_publicacion: string;
}

function bookToForm(book: Book): FormState {
    return {
        nombre: book.nombre ?? "",
        autorNombre: book.autor?.nombre ?? "",
        descripcion: book.descripcion ?? "",
        precio: book.precio != null ? String(book.precio) : "",
        nota_promedio: book.nota_promedio != null ? String(book.nota_promedio) : "",
        imagen_url: book.imagen_url ?? "",
        paginas: book.paginas != null ? String(book.paginas) : "",
        idioma: book.idioma ?? "",
        tipo_tapa: book.tipo_tapa ?? "",
        editorial: book.editorial ?? "",
        codigo_producto: book.codigo_producto ?? "",
        año_publicacion: book.año_publicacion != null ? String(book.año_publicacion) : "",
    };
}

/**
 * Panel temporal de administración: permite corregir a mano los datos
 * de libros importados (nombre, autor, portada, páginas, etc.) o borrar
 * entradas duplicadas/erróneas. Solo visible para perfiles con rol "admin".
 */
function AdminBooks() {
    const { user } = useContext(AuthContext);
    const { data, isLoading, fetchBooks } = useContext(ItemContext);

    const [search, setSearch] = useState("");
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [form, setForm] = useState<FormState | null>(null);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return data;
        return data.filter(
            (b) =>
                b.nombre.toLowerCase().includes(term) ||
                (b.autor?.nombre ?? "").toLowerCase().includes(term)
        );
    }, [data, search]);

    if (!user) return <Navigate to="/login" replace />;
    if (user.rol !== "admin") return <Navigate to="/home" replace />;

    function selectBook(book: Book) {
        setSelectedId(book.id);
        setForm(bookToForm(book));
        setMessage(null);
    }

    function updateField(field: keyof FormState, value: string) {
        setForm((prev) => (prev ? { ...prev, [field]: value } : prev));
    }

    async function resolverAutorId(nombreAutor: string): Promise<number | null> {
        const nombreLimpio = nombreAutor.trim();
        if (!nombreLimpio) return null;

        const { data: existente } = await supabase
            .from("autor")
            .select("id")
            .eq("nombre", nombreLimpio)
            .maybeSingle();
        if (existente) return existente.id;

        const { data: nuevo, error } = await supabase
            .from("autor")
            .insert({ nombre: nombreLimpio })
            .select("id")
            .single();
        if (error) throw error;
        return nuevo.id;
    }

    async function handleSave() {
        if (!form || selectedId === null) return;
        setSaving(true);
        setMessage(null);
        try {
            const autor_id = await resolverAutorId(form.autorNombre);

            const { error } = await supabase
                .from("libros")
                .update({
                    nombre: form.nombre.trim(),
                    descripcion: form.descripcion.trim() || null,
                    autor_id,
                    precio: form.precio ? parseInt(form.precio, 10) : 0,
                    nota_promedio: form.nota_promedio ? parseFloat(form.nota_promedio) : null,
                    imagen_url: form.imagen_url.trim() || null,
                    paginas: form.paginas ? parseInt(form.paginas, 10) : null,
                    idioma: form.idioma.trim() || null,
                    tipo_tapa: form.tipo_tapa.trim() || null,
                    editorial: form.editorial.trim() || null,
                    codigo_producto: form.codigo_producto.trim() || null,
                    año_publicacion: form.año_publicacion ? parseInt(form.año_publicacion, 10) : null,
                })
                .eq("id", selectedId);

            if (error) throw error;

            await fetchBooks();
            setMessage({ type: "ok", text: "Guardado." });
        } catch (err) {
            setMessage({ type: "error", text: err instanceof Error ? err.message : "No se pudo guardar." });
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete() {
        if (selectedId === null) return;
        if (!window.confirm(`¿Eliminar "${form?.nombre}"? Esta acción no se puede deshacer.`)) return;

        setSaving(true);
        setMessage(null);
        try {
            const { error } = await supabase.from("libros").delete().eq("id", selectedId);
            if (error) throw error;
            await fetchBooks();
            setSelectedId(null);
            setForm(null);
        } catch (err) {
            setMessage({ type: "error", text: err instanceof Error ? err.message : "No se pudo eliminar." });
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className={styles.page}>
            <NavBar />

            <main className={styles.main}>
                <h1 className={styles.title}>Editar libros</h1>
                <p className={styles.subtitle}>
                    Panel de administración temporal para corregir datos importados.
                </p>

                <div className={styles.layout}>
                    {/* Lista */}
                    <div className={styles.listPanel}>
                        <input
                            type="text"
                            className={styles.search}
                            placeholder="Buscar por título o autor..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            id="admin-search"
                        />

                        {isLoading ? (
                            <p className={styles.hint}>Cargando...</p>
                        ) : (
                            <ul className={styles.list}>
                                {filtered.map((book) => (
                                    <li key={book.id}>
                                        <button
                                            className={`${styles.listItem} ${
                                                selectedId === book.id ? styles.listItemActive : ""
                                            }`}
                                            onClick={() => selectBook(book)}
                                        >
                                            <span className={styles.listItemTitle}>{book.nombre}</span>
                                            <span className={styles.listItemAuthor}>
                                                {book.autor?.nombre || "Sin autor"}
                                            </span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <p className={styles.count}>{filtered.length} libros</p>
                    </div>

                    {/* Formulario */}
                    <div className={styles.formPanel}>
                        {!form ? (
                            <p className={styles.hint}>Selecciona un libro de la lista para editarlo.</p>
                        ) : (
                            <>
                                <div className={styles.previewRow}>
                                    <div className={styles.previewImageWrapper}>
                                        {form.imagen_url ? (
                                            <img src={form.imagen_url} alt="" className={styles.previewImage} />
                                        ) : (
                                            <span className={styles.previewPlaceholder}>Sin portada</span>
                                        )}
                                    </div>
                                    <div className={styles.previewInfo}>
                                        <p className={styles.previewTitle}>{form.nombre || "Sin título"}</p>
                                        <p className={styles.previewAuthor}>{form.autorNombre || "Sin autor"}</p>
                                    </div>
                                </div>

                                <div className={styles.grid}>
                                    <label className={styles.field}>
                                        <span>Nombre</span>
                                        <input
                                            value={form.nombre}
                                            onChange={(e) => updateField("nombre", e.target.value)}
                                        />
                                    </label>

                                    <label className={styles.field}>
                                        <span>Autor</span>
                                        <input
                                            value={form.autorNombre}
                                            onChange={(e) => updateField("autorNombre", e.target.value)}
                                        />
                                    </label>

                                    <label className={styles.field}>
                                        <span>URL de la imagen</span>
                                        <input
                                            value={form.imagen_url}
                                            onChange={(e) => updateField("imagen_url", e.target.value)}
                                        />
                                    </label>

                                    <label className={styles.field}>
                                        <span>Precio (COP)</span>
                                        <input
                                            type="number"
                                            value={form.precio}
                                            onChange={(e) => updateField("precio", e.target.value)}
                                        />
                                    </label>

                                    <label className={styles.field}>
                                        <span>Páginas</span>
                                        <input
                                            type="number"
                                            value={form.paginas}
                                            onChange={(e) => updateField("paginas", e.target.value)}
                                        />
                                    </label>

                                    <label className={styles.field}>
                                        <span>Idioma</span>
                                        <input
                                            value={form.idioma}
                                            onChange={(e) => updateField("idioma", e.target.value)}
                                        />
                                    </label>

                                    <label className={styles.field}>
                                        <span>Tipo de tapa</span>
                                        <input
                                            value={form.tipo_tapa}
                                            onChange={(e) => updateField("tipo_tapa", e.target.value)}
                                        />
                                    </label>

                                    <label className={styles.field}>
                                        <span>Editorial</span>
                                        <input
                                            value={form.editorial}
                                            onChange={(e) => updateField("editorial", e.target.value)}
                                        />
                                    </label>

                                    <label className={styles.field}>
                                        <span>Año de publicación</span>
                                        <input
                                            type="number"
                                            value={form.año_publicacion}
                                            onChange={(e) => updateField("año_publicacion", e.target.value)}
                                        />
                                    </label>

                                    <label className={styles.field}>
                                        <span>Código de producto</span>
                                        <input
                                            value={form.codigo_producto}
                                            onChange={(e) => updateField("codigo_producto", e.target.value)}
                                        />
                                    </label>

                                    <label className={styles.field}>
                                        <span>Nota promedio</span>
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            max="5"
                                            value={form.nota_promedio}
                                            onChange={(e) => updateField("nota_promedio", e.target.value)}
                                        />
                                    </label>
                                </div>

                                <label className={styles.fieldFull}>
                                    <span>Descripción</span>
                                    <textarea
                                        rows={6}
                                        value={form.descripcion}
                                        onChange={(e) => updateField("descripcion", e.target.value)}
                                    />
                                </label>

                                {message && (
                                    <div className={message.type === "ok" ? styles.msgOk : styles.msgError}>
                                        {message.text}
                                    </div>
                                )}

                                <div className={styles.actions}>
                                    <button
                                        className={styles.btnSave}
                                        onClick={handleSave}
                                        disabled={saving}
                                        id="btn-save-book"
                                    >
                                        {saving ? "Guardando..." : "Guardar cambios"}
                                    </button>
                                    <button
                                        className={styles.btnDelete}
                                        onClick={handleDelete}
                                        disabled={saving}
                                        id="btn-delete-book"
                                    >
                                        Eliminar libro
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default AdminBooks;
