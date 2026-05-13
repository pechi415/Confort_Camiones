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
    // 1. Crear en el sistema de Autenticación (para tener un JWT/Token)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: `${usuarioData.username.toLowerCase()}@drummond.com`,
      password: usuarioData.password,
      options: {
        data: {
          nombre: usuarioData.nombre,
          role: usuarioData.role,
          mina: usuarioData.mina
        }
      }
    });

    if (authError) {
      if (authError.message && authError.message.toLowerCase().includes('rate limit')) {
        throw new Error('Límite de seguridad alcanzado (Supabase Rate Limit). Por favor ve a tu panel de Supabase -> Authentication -> Rate Limits, e incrementa el límite de "Email signups".');
      }
      throw authError;
    }
    // 2. Guardar en nuestra tabla de perfiles (usuarios) con el ID de Auth
    const { data, error } = await supabase
      .from('usuarios')
      .insert([{
        id: authData.user.id,
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
