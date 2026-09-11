/**
 * Evita que una acción se quede "esperando" para siempre (p. ej. si la
 * conexión se cae a mitad de una subida). Si `promise` no resuelve dentro
 * de `ms`, se rechaza con un mensaje claro que la UI puede mostrar.
 */
export function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
    let timer: ReturnType<typeof setTimeout>;
    const timeout = new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(message)), ms);
    });
    return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}
