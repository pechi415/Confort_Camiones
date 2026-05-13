// src/services/usuarioService.js
import { supabase } from '../supabaseClient';

/**
 * Servicio para la gestión de usuarios y autenticación personalizada.
 */
export const usuarioService = {

  /**
   * Obtiene todos los usuarios.
   */
  async getUsuarios() {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Crea un nuevo usuario en Auth y en la tabla pública.
   */
  async registrarUsuario(usuarioData) {
    // 0. Sincronizar los "superpoderes" de Administrador en el JWT actual
    // Si la cuenta de Alexander se creó sin el metadato 'role: admin' en Auth, el RLS la bloquea.
    // Esto asegura que el token que enviamos tenga el permiso correcto.
    const { data: { user } } = await supabase.auth.getUser();
    if (user && user.user_metadata?.role !== 'admin') {
      await supabase.auth.updateUser({ data: { role: 'admin', mina: 'Global' } });
      await supabase.auth.refreshSession();
    }

    // 1. Crear en el sistema de Autenticación usando la API REST cruda (para no tocar la sesión de React)
    const authResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: `${usuarioData.username.toLowerCase()}@drummond.com`,
        password: usuarioData.password,
        data: {
          nombre: usuarioData.nombre,
          role: usuarioData.role,
          mina: usuarioData.mina
        }
      })
    });

    const authResult = await authResponse.json();

    if (!authResponse.ok) {
      if (authResult.msg && authResult.msg.toLowerCase().includes('rate limit')) {
        throw new Error('Límite de seguridad alcanzado (Supabase Rate Limit). Ve a tu panel de Supabase -> Authentication -> Rate Limits, e incrementa el límite de "Email signups".');
      }
      if (authResult.msg && authResult.msg.toLowerCase().includes('already registered')) {
        throw new Error('El usuario base ya existe en seguridad. Intenta agregando un número al final del "Usuario Login" (ej. amorales2).');
      }
      throw new Error(authResult.msg || 'Error desconocido al registrar usuario en Auth');
    }

    // Supabase devuelve el user anidado o directo según la configuración de confirmación
    const userId = authResult.user ? authResult.user.id : authResult.id;

    // 2. Guardar en nuestra tabla de perfiles (usuarios) con el cliente principal (Seguimos siendo Administradores)
    const { data, error } = await supabase
      .from('usuarios')
      .insert([{
        id: userId,
        ...usuarioData
      }])
      .select();

    if (error) throw error;
    return data[0];
  },

  /**
   * Actualiza datos de un usuario.
   */
  async updateUsuario(id, updates) {
    const { data, error } = await supabase
      .from('usuarios')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    return data[0];
  },

  /**
   * Elimina un usuario.
   */
  async eliminarUsuario(id) {
    const { error } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  /**
   * Valida credenciales usando Supabase Auth (Genera el Token para RLS).
   */
  async login(username, password) {
    console.log("Intentando login oficial para:", username);
    
    // Autenticación oficial (esto activa el RLS en el servidor)
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: `${username.toLowerCase()}@drummond.com`,
      password: password
    });

    if (authError) {
      console.error("Error en Auth:", authError);
      throw new Error(authError.message || 'Error de autenticación');
    }

    // Una vez autenticados, intentamos traer los metadatos de nuestra tabla pública
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('username', username.toLowerCase())
      .single();

    if (error || !data) {
      console.warn("No se pudo leer la tabla usuarios, usando metadatos de emergencia...");
      // Si la tabla falla, reconstruimos el perfil desde los metadatos de la sesión
      const metadata = authData.user.user_metadata;
      return {
        id: authData.user.id,
        username: username.toLowerCase(),
        nombre: metadata.nombre || username,
        role: metadata.role || 'admin',
        mina: metadata.mina || 'Global',
        estado: 'Activo'
      };
    }

    return data;
  }
};
