export interface Recuerdo {
    id: number;
    imagen_path: string;
    titulo: string | null;
    texto: string | null;
    audio_path: string | null;
    autor_id: string | null;
    autor_nombre: string | null;
    created_at: string;
}

export const RECUERDOS_BUCKET = "recuerdos";
