import { useContext, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authcontext";
import { supabase } from "../../utils/Supabase";
import { Recuerdo, RECUERDOS_BUCKET } from "./Fotos.types";
import { ArrowLeftIcon, PlusIcon, XIcon } from "../../components/icons";
import styles from "./Fotos.module.css";

interface RecuerdoConUrl extends Recuerdo {
    imagenUrl: string | null;
}

/**
 * Galería de "recuerdos": fotos ordenadas de más recientes a más antiguas.
 * Cualquier usuario logueado puede ver la grilla y abrir una foto para leer
 * el texto o escuchar el audio; solo un admin puede subir nuevas (botón "+").
 * Las imágenes/audios viven en el bucket privado de Storage "recuerdos",
 * por eso se piden URLs firmadas en vez de usar URLs públicas.
 */
function FotosGallery() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const isAdmin = user?.rol === "admin";

    const [items, setItems] = useState<RecuerdoConUrl[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selected, setSelected] = useState<RecuerdoConUrl | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [audioLoading, setAudioLoading] = useState(false);

    useEffect(() => {
        if (user) fetchRecuerdos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    async function fetchRecuerdos() {
        setIsLoading(true);
        setError(null);
        try {
            const { data, error: err } = await supabase
                .from("recuerdos")
                .select("*")
                .order("created_at", { ascending: false });
            if (err) throw err;

            const rows = (data ?? []) as Recuerdo[];
            const paths = rows.map((r) => r.imagen_path);

            let urlByPath = new Map<string, string>();
            if (paths.length > 0) {
                const { data: signed, error: signError } = await supabase.storage
                    .from(RECUERDOS_BUCKET)
                    .createSignedUrls(paths, 3600);
                if (signError) throw signError;
                urlByPath = new Map(
                    (signed ?? [])
                        .filter((s) => s.signedUrl)
                        .map((s) => [s.path ?? "", s.signedUrl as string])
                );
            }

            setItems(rows.map((r) => ({ ...r, imagenUrl: urlByPath.get(r.imagen_path) ?? null })));
        } catch (err) {
            setError(err instanceof Error ? err.message : "No se pudieron cargar las fotos.");
        } finally {
            setIsLoading(false);
        }
    }

    async function abrir(item: RecuerdoConUrl) {
        setSelected(item);
        setAudioUrl(null);
        if (item.audio_path) {
            setAudioLoading(true);
            const { data, error: err } = await supabase.storage
                .from(RECUERDOS_BUCKET)
                .createSignedUrl(item.audio_path, 3600);
            setAudioLoading(false);
            if (!err && data) setAudioUrl(data.signedUrl);
        }
    }

    function cerrar() {
        setSelected(null);
        setAudioUrl(null);
    }

    if (!user) return <Navigate to="/login" replace />;

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <button className={styles.btnBack} onClick={() => navigate("/")} id="fotos-inicio">
                    <ArrowLeftIcon size={16} /> Inicio
                </button>
                <h1 className={styles.title}>Fotos</h1>
                {isAdmin ? (
                    <button className={styles.btnAdd} onClick={() => navigate("/fotos/nueva")} id="fotos-nueva">
                        <PlusIcon size={16} /> Nueva
                    </button>
                ) : (
                    <span className={styles.headerSpacer} />
                )}
            </header>

            <main className={styles.main}>
                {error && <div className={styles.msgError}>{error}</div>}

                {isLoading ? (
                    <p className={styles.hint}>Cargando...</p>
                ) : items.length === 0 ? (
                    <p className={styles.hint}>Todavía no hay fotos.</p>
                ) : (
                    <div className={styles.grid}>
                        {items.map((item) => (
                            <button
                                key={item.id}
                                className={styles.thumb}
                                onClick={() => abrir(item)}
                                aria-label="Ver foto"
                            >
                                {item.imagenUrl ? (
                                    <img src={item.imagenUrl} alt="" className={styles.thumbImage} />
                                ) : (
                                    <span className={styles.thumbPlaceholder}>Sin imagen</span>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </main>

            {selected && (
                <div className={styles.modalOverlay} onClick={cerrar}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <button className={styles.modalClose} onClick={cerrar} aria-label="Cerrar">
                            <XIcon size={18} />
                        </button>

                        {selected.imagenUrl && (
                            <img src={selected.imagenUrl} alt="" className={styles.modalImage} />
                        )}

                        <div className={styles.modalBody}>
                            <span className={styles.modalDate}>
                                {new Date(selected.created_at).toLocaleString("es-CO")}
                            </span>

                            {selected.texto && <p className={styles.modalText}>{selected.texto}</p>}

                            {selected.audio_path && (
                                <div className={styles.modalAudio}>
                                    {audioLoading ? (
                                        <span className={styles.hint}>Cargando audio...</span>
                                    ) : audioUrl ? (
                                        <audio controls src={audioUrl} className={styles.audioPlayer} />
                                    ) : null}
                                </div>
                            )}

                            {!selected.texto && !selected.audio_path && (
                                <p className={styles.hint}>Sin nota adicional.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default FotosGallery;
