import { createContext, useEffect, useState } from "react";
import { supabase } from "../utils/Supabase";

interface AuthContextProps {
    user: any,
    isLoading: boolean,
    login: (email: string, password: string) => Promise<any>,
    register: (email: string, password: string, username:string) => Promise<any>,
    logout: () => void
}

export const AuthContext = createContext ({} as AuthContextProps)
export const AuthProvider = ({ children }: any) => {

    const [user, setUser] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(false);

const login = async (email: string, password: string) => {
  setIsLoading(true);
  try {
    console.log("Entró - login start", { email });

    const res = await supabase.auth.signInWithPassword({ email, password });
    console.log("signInWithPassword response:", JSON.stringify(res, null, 2));

    const { data, error } = res;

    if (error) {
      console.error('Login error (supabase):', error.message, error);
      setIsLoading(false);
      return false;
    }

    if (!data?.user) {
      console.error('Login error: usuario no retornado', data);
      setIsLoading(false);
      return false;
    }

    console.log("Login correcto, obteniendo perfil", { userId: data.user.id });

    const { data: profileData, error: profileError } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.warn('Profile fetch error:', profileError);
      setUser({
        id: data.user.id,
        email: data.user.email,
        name: (data.user.user_metadata as any)?.name ?? data.user.email?.split('@')[0]
      });
    } else {
      setUser(profileData);
    }

    setIsLoading(false);
    return true;
  } catch (err) {
    console.error('Login exception:', err);
    setIsLoading(false);
    return false;
  }
};

        const register = async (email: string, password: string, username: string) => {
          try {
            const { data, error } = await supabase.auth.signUp({ email, password });
            if (error) {
              return { success: false, error: error.message };
            }

            // Si el usuario se creó correctamente, crea el perfil
            const user = data.user;
            if (user) {
              const { error: profileError } = await supabase
                .from("perfiles")
                .insert([
                  {
                    id: user.id, 
                    Email: user.email,
                    nombre: username,
                    rol: "usuario"
                  },
                ]);
              if (profileError) {
                return { success: false, error: profileError.message };
              }
            }

            return { success: true };
          } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : String(error) };
          }
    }

    const logout = async () => {
        setUser(null);
    }

    useEffect(() => {
    // Al montar, intenta obtener el usuario autenticado y cargar su profile
    const init = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        const authUser = data?.user ?? null;
        if (authUser) {
          const { data: profileData, error: profileError } = await supabase
            .from('perfiles')
            .select('*')
            .eq('id', authUser.id)
            .single();
          if (!profileError && profileData) {
            setUser(profileData);
          } else {
            setUser({
              id: authUser.id,
              email: authUser.email,
              name: authUser.user_metadata?.name ?? authUser.email?.split('@')[0]
            });
          }
        }
      } catch (e) {
        console.error('Init auth error', e);
      }
    };

    init();

    // Suscribirse a cambios de sesión (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const authUser = session?.user ?? null;
      if (!authUser) {
        setUser(null);
        return;
      }
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('perfiles')
          .select('*')
          .eq('id', authUser.id)
          .single();
        if (!profileError && profileData) setUser(profileData);
        else setUser({ id: authUser.id, email: authUser.email });
      } catch (err) {
        console.error('Auth state change error', err);
      }
    });

    return () => {
      // cleanup
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

    return <AuthContext.Provider
        value={{
            user,
            isLoading,
            login,
            register,
            logout,
        }}
    >
        {children}
    </AuthContext.Provider>
}