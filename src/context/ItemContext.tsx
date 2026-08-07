import { createContext, useEffect, useState } from "react";

// Interfaz del libro tal como lo devuelve GET /api/items
export interface Book {
    id: number;
    nombre: string;
    descripcion: string | null;
    autor: { id: number; nombre: string } | null;
    precio: number;
    nota_promedio: number | null;
    imagen_url: string | null;
    paginas: number | null;
    idioma: string | null;
    tipo_tapa: string | null;
    editorial: string | null;
    codigo_producto: string | null;
    año_publicacion: number | null;
}

interface ItemsContextProps {
    data: Book[];
    isLoading: boolean;
    fetchBooks: () => Promise<void>;
    searchBooks: (word: string) => Promise<void>;
}

// URL base del backend API
const API_BASE = "http://localhost:3000";

export const ItemContext = createContext({} as ItemsContextProps);

export const ItemProvider = ({ children }: any) => {
    const [data, setData] = useState<Book[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    /**
     * Obtiene todos los libros desde el backend (GET /api/items).
     * El backend consulta Supabase y devuelve la data con el JOIN de autor.
     */
    const fetchBooks = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE}/api/items`);
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            const books: Book[] = await response.json();
            setData(books);
        } catch (error) {
            console.error("Error obteniendo libros del backend:", error);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Filtra libros por nombre (filtrado en el cliente).
     * Si la palabra está vacía, recarga todos los libros.
     */
    const searchBooks = async (word: string) => {
        if (!word.trim()) {
            await fetchBooks();
            return;
        }
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE}/api/items`);
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            const allBooks: Book[] = await response.json();
            const filtered = allBooks.filter((book) =>
                book.nombre.toLowerCase().includes(word.toLowerCase())
            );
            setData(filtered);
        } catch (error) {
            console.error("Error buscando libros:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Cargar libros al montar el contexto
    useEffect(() => {
        fetchBooks();
    }, []);

    return (
        <ItemContext.Provider
            value={{
                data,
                isLoading,
                fetchBooks,
                searchBooks,
            }}
        >
            {children}
        </ItemContext.Provider>
    );
};