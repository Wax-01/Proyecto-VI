import { useContext, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authcontext";
import { supabase } from "../../utils/Supabase";
import { withTimeout } from "../../utils/withTimeout";
import { RECUERDOS_BUCKET } from "./Fotos.types";
import { ArrowLeftIcon, CameraIcon, CheckIcon, MicIcon, SquareIcon } from "../../components/icons";
import styles from "./Fotos.module.css";

const EXT_BY_MIME: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "audio/webm": "webm",
    "audio/ogg": "ogg",
    "audio/mp4": "m4a",
    "audio/mpeg": "mp3",
};

function extFromMime(mime: string, fallback: string): string {
    return EXT_BY_MIME[mime] ?? mime.split("/")[1] ?? fallback;
}

/**
 * Página de captura de un "recuerdo": foto (obligatoria) + texto y/o audio
 * (opcionales). Pensada para móvil: el input de foto abre la cámara nativa
 * en celulares (capture="environment") y el audio se graba en el navegador
 * con MediaRecorder. Solo accesible para admins.
 */
function FotoCaptura() {
    const { user, isLoading: authLoading } = useContext(AuthContext);
    const navigate = useNavigate();

    const fileInputRef = useRef<HTMLInputElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<BlobPart[]>([]);

    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [titulo, setTitulo] = useState("");
    const [texto, setTexto] = useState("");
    const [recording, setRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioPreview, setAudioPreview] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [ok, setOk] = useState(false);

    if (authLoading) return null;
    if (!user) return <Navigate to="/login" replace />;
    if (user.rol !== "admin") return <Navigate to="/fotos" replace />;

    function handlePhotoChange(e: { target: HTMLInputElement }) {
        const file = e.target.files?.[0] ?? null;
        setPhotoFile(file);
        setPhotoPreview(file ? URL.createObjectURL(file) : null);
        setOk(false);
        setError(null);
    }

    async function startRecording() {
        setError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            audioChunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };
            recorder.onstop = () => {
                const mimeType = recorder.mimeType || "audio/webm";
                const blob = new Blob(audioChunksRef.current, { type: mimeType });
                setAudioBlob(blob);
                setAudioPreview(URL.createObjectURL(blob));
                stream.getTracks().forEach((t) => t.stop());
            };

            mediaRecorderRef.current = recorder;
            recorder.start();
            setRecording(true);
        } catch (err) {
            setError("No se pudo acceder al micrófono.");
        }
    }

    function stopRecording() {
        mediaRecorderRef.current?.stop();
        setRecording(false);
    }

    function eliminarAudio() {
        setAudioBlob(null);
        setAudioPreview(null);
    }

    async function handleSubmit() {
        if (!photoFile) {
            setError("Toma o selecciona una foto primero.");
            return;
        }
        if (!titulo.trim()) {
            setError("Agrega un título a la foto.");
            return;
        }
        setSaving(true);
        setError(null);
        setOk(false);
        try {
            await withTimeout(
                (async () => {
                    const id = crypto.randomUUID();
                    const imgExt = extFromMime(photoFile.type, "jpg");
                    const imagenPath = `imagenes/${id}.${imgExt}`;

                    const { error: imgErr } = await supabase.storage
                        .from(RECUERDOS_BUCKET)
                        .upload(imagenPath, photoFile, { contentType: photoFile.type });
                    if (imgErr) throw imgErr;

                    let audioPath: string | null = null;
                    if (audioBlob) {
                        const audioExt = extFromMime(audioBlob.type, "webm");
                        audioPath = `audios/${id}.${audioExt}`;
                        const { error: audioErr } = await supabase.storage
                            .from(RECUERDOS_BUCKET)
                            .upload(audioPath, audioBlob, { contentType: audioBlob.type });
                        if (audioErr) throw audioErr;
                    }

                    const { error: insertErr } = await supabase.from("recuerdos").insert({
                        imagen_path: imagenPath,
                        titulo: titulo.trim(),
                        texto: texto.trim() || null,
                        audio_path: audioPath,
                        autor_id: user.id,
                        autor_nombre: user.nombre || user.name || user.email || null,
                    });
                    if (insertErr) throw insertErr;
                })(),
                25000,
                "La conexión está tardando demasiado. Revisa tu conexión e inténtalo de nuevo."
            );

            setOk(true);
            setTimeout(() => navigate("/fotos"), 600);
        } catch (err) {
            setError(err instanceof Error ? err.message : "No se pudo guardar el recuerdo.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <button className={styles.btnBack} onClick={() => navigate("/fotos")} id="captura-volver">
                    <ArrowLeftIcon size={16} /> Fotos
                </button>
                <h1 className={styles.title}>Nueva foto</h1>
                <span className={styles.headerSpacer} />
            </header>

            <main className={styles.formMain}>
                <div className={styles.photoField}>
                    <span className={styles.photoLabel}>Foto</span>
                    <button
                        type="button"
                        className={styles.photoPicker}
                        onClick={() => fileInputRef.current?.click()}
                        id="captura-photo-btn"
                    >
                        {photoPreview ? (
                            <>
                                <img src={photoPreview} alt="" className={styles.photoPreview} />
                                {ok && (
                                    <span className={styles.photoUploadedBadge} title="Foto subida">
                                        <CheckIcon size={14} /> Subida
                                    </span>
                                )}
                            </>
                        ) : (
                            <>
                                <CameraIcon size={40} className={styles.photoPickerIcon} />
                                <span>Tomar o elegir foto</span>
                            </>
                        )}
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className={styles.hiddenInput}
                        onChange={handlePhotoChange}
                        id="captura-photo-input"
                    />
                </div>

                <label className={styles.field}>
                    <span>Título</span>
                    <input
                        type="text"
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value)}
                        placeholder="Dale un título a la foto"
                        id="captura-titulo"
                    />
                </label>

                <label className={styles.field}>
                    <span>Texto (opcional)</span>
                    <textarea
                        value={texto}
                        onChange={(e) => setTexto(e.target.value)}
                        placeholder="¿Qué estás viendo?"
                        id="captura-texto"
                    />
                </label>

                <div className={styles.audioSection}>
                    <span className={styles.photoLabel}>Audio (opcional)</span>
                    <div className={styles.audioControls}>
                        {!recording ? (
                            <button
                                type="button"
                                className={styles.btnRecord}
                                onClick={startRecording}
                                id="captura-grabar"
                            >
                                <MicIcon size={16} /> Grabar audio
                            </button>
                        ) : (
                            <button
                                type="button"
                                className={`${styles.btnRecord} ${styles.btnRecordActive}`}
                                onClick={stopRecording}
                                id="captura-detener"
                            >
                                <SquareIcon size={16} /> Detener
                            </button>
                        )}

                        {audioPreview && !recording && (
                            <button type="button" className={styles.btnGhost} onClick={eliminarAudio}>
                                Eliminar audio
                            </button>
                        )}
                    </div>

                    {audioPreview && (
                        <audio controls src={audioPreview} className={styles.audioPlayer} />
                    )}
                </div>

                {error && <div className={styles.msgError}>{error}</div>}
                {ok && <div className={styles.msgOk}>Guardado.</div>}

                <div className={styles.actions}>
                    <button
                        type="button"
                        className={styles.btnSave}
                        onClick={handleSubmit}
                        disabled={saving}
                        id="captura-guardar"
                    >
                        {saving ? "Guardando..." : "Guardar"}
                    </button>
                </div>
            </main>
        </div>
    );
}

export default FotoCaptura;
