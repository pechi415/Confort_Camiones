import React from 'react';
import { Users, PlusCircle, Edit3, RefreshCcw, Trash2 } from 'lucide-react';
import { generarAliasBase, normalizarNombre } from '../utils/iaEngine';
import { usuarioService } from '../services/usuarioService';
import { minaOptions, grupoOptions } from '../constants/fallas';

const UserManagement = ({
  dbUsuarios,
  setDbUsuarios,
  isCreandoUsuario,
  setIsCreandoUsuario,
  nuevoUsuarioParams,
  setNuevoUsuarioParams,
  usuarioEditando,
  setUsuarioEditando,
  addToast,
  showConfirm
}) => {
  return (
    <div className="card fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ background: '#eef2ff', padding: '0.7rem', borderRadius: '12px', marginRight: '1rem', color: '#4f46e5' }}>
            <Users size={24} />
          </div>
          <div>
            <h2 style={{ margin: 0, color: 'var(--primary-black)', fontSize: '1.4rem' }}>Directorio de Cuentas</h2>
            <p style={{ color: 'var(--text-muted)', margin: '0.2rem 0 0', fontSize: '0.9rem' }}>Control estricto de accesos al sistema y asignación a minas.</p>
          </div>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => { setIsCreandoUsuario(!isCreandoUsuario); setUsuarioEditando(null); }}
          style={{
            background: 'rgba(227, 25, 55, 0.75)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.3)',
            padding: '0.6rem 1.2rem',
            fontSize: '0.85rem',
            boxShadow: '0 4px 15px rgba(227, 25, 55, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          {isCreandoUsuario ? 'Cancelar Formulario' : <><PlusCircle size={16} /> Registrar Operador</>}
        </button>
      </div>

      {/* Formulario de Alta de Usuario */}
      {isCreandoUsuario && (
        <div className="fade-in" style={{ padding: '1.5rem', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '2rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: 'var(--primary-black)' }}>Alta en Base de Datos</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.3rem' }}>Nombre del Profesional</label>
              <input type="text" className="input-field" placeholder="ej: Pedro González" value={nuevoUsuarioParams.nombre} onChange={e => {
                const nuevoNombre = e.target.value;
                setNuevoUsuarioParams({ ...nuevoUsuarioParams, nombre: nuevoNombre, username: generarAliasBase(nuevoNombre, dbUsuarios) });
              }} onBlur={e => setNuevoUsuarioParams({ ...nuevoUsuarioParams, nombre: normalizarNombre(e.target.value) })} />
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.3rem' }}>Usuario Login (Generado)</label>
              <input type="text" className="input-field" placeholder="ej: pgonzalez" value={nuevoUsuarioParams.username} onChange={e => setNuevoUsuarioParams({ ...nuevoUsuarioParams, username: e.target.value.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() })} style={{ background: '#f8fafc', color: '#64748b' }} />
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.3rem' }}>Clave Temporal</label>
              <input type="text" className="input-field" value="con123" disabled style={{ background: '#f1f5f9', color: '#94a3b8' }} />
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.3rem' }}>Estado de la Cuenta</label>
              <select className="input-field" value={nuevoUsuarioParams.estado} onChange={e => setNuevoUsuarioParams({ ...nuevoUsuarioParams, estado: e.target.value })}>
                <option value="Activo">🟢 Activo</option>
                <option value="Inactivo">🔴 Suspendido/Inactivo</option>
              </select>
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.3rem' }}>Rol Operativo</label>
              <select className="input-field" value={nuevoUsuarioParams.role} onChange={e => setNuevoUsuarioParams({ ...nuevoUsuarioParams, role: e.target.value })}>
                <option value="supervisor">Supervisor de Producción</option>
                <option value="lector">Lector KPI (Auditoría)</option>
                <option value="admin">Administrador TI</option>
              </select>
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.3rem' }}>Fijar Mina a Cargo</label>
              <select className="input-field" value={nuevoUsuarioParams.mina} onChange={e => setNuevoUsuarioParams({ ...nuevoUsuarioParams, mina: e.target.value })} disabled={nuevoUsuarioParams.role === 'admin'}>
                {minaOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
                <option value="Ambas">Ambas Minas (PB/ED)</option>
              </select>
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.3rem' }}>Asignar Grupo</label>
              <select className="input-field" value={nuevoUsuarioParams.grupo} onChange={e => setNuevoUsuarioParams({ ...nuevoUsuarioParams, grupo: e.target.value })}>
                {grupoOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ marginTop: '1rem', textAlign: 'right' }}>
            <button className="btn btn-primary" onClick={async () => {
              if (!nuevoUsuarioParams.username || !nuevoUsuarioParams.nombre) return addToast('Por favor, completa nombre y usuario.', 'error');

              try {
                const data = await usuarioService.registrarUsuario({
                  nombre: normalizarNombre(nuevoUsuarioParams.nombre),
                  username: nuevoUsuarioParams.username,
                  password: nuevoUsuarioParams.password,
                  role: nuevoUsuarioParams.role,
                  mina: nuevoUsuarioParams.mina,
                  grupo: nuevoUsuarioParams.grupo,
                  estado: nuevoUsuarioParams.estado,
                  firstTime: true,
                  creado: new Date().toLocaleDateString()
                });

                setDbUsuarios([...dbUsuarios, data[0]]);
                setIsCreandoUsuario(false);
                setNuevoUsuarioParams({ nombre: '', username: '', password: 'con123', mina: 'PB', grupo: '1', role: 'supervisor', estado: 'Activo' });
                addToast('✅ Operador ' + nuevoUsuarioParams.nombre + ' admitido exitosamente.');
              } catch (err) {
                addToast("Error al crear usuario: " + err.message, "error");
              }
            }}>Crear Acreditación</button>
          </div>
        </div>
      )}

      {/* Formulario de Edición de Usuario */}
      {usuarioEditando && (
        <div className="fade-in" style={{ padding: '1.5rem', background: '#faf5ff', border: '1px solid #e879f9', borderRadius: '8px', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#a21caf' }}>✏️ Modificando Ficha Corporativa: @{usuarioEditando.username}</h3>
            <button onClick={() => setUsuarioEditando(null)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}>❌ Cancelar Edición</button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.3rem', color: '#701a75' }}>Corregir Nombre</label>
              <input type="text" className="input-field" value={usuarioEditando.nombre} onChange={e => setUsuarioEditando({ ...usuarioEditando, nombre: e.target.value })} onBlur={e => setUsuarioEditando({ ...usuarioEditando, nombre: normalizarNombre(e.target.value) })} style={{ borderColor: '#fbcfe8' }} />
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.3rem', color: '#701a75' }}>Nuevo Usuario Login</label>
              <input type="text" className="input-field" value={usuarioEditando.username} onChange={e => setUsuarioEditando({ ...usuarioEditando, username: e.target.value.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() })} style={{ borderColor: '#fbcfe8' }} />
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.3rem', color: '#701a75' }}>Ascender o Reasignar Rol</label>
              <select className="input-field" value={usuarioEditando.role} onChange={e => setUsuarioEditando({ ...usuarioEditando, role: e.target.value })} style={{ borderColor: '#fbcfe8' }}>
                <option value="supervisor">Supervisor de Producción</option>
                <option value="lector">Lector KPI (Auditoría)</option>
                <option value="admin">Administrador TI</option>
              </select>
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.3rem', color: '#701a75' }}>Cambiar Mina a Cargo</label>
              <select className="input-field" value={usuarioEditando.mina} onChange={e => setUsuarioEditando({ ...usuarioEditando, mina: e.target.value })} disabled={usuarioEditando.role === 'admin'} style={{ borderColor: '#fbcfe8' }}>
                <option value="PB">Pribbenow (PB)</option>
                <option value="ED">El Descanso (ED)</option>
                <option value="Ambas">Ambas Minas (PB/ED)</option>
              </select>
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.3rem', color: '#701a75' }}>Cambiar Grupo</label>
              <select className="input-field" value={usuarioEditando.grupo || '1'} onChange={e => setUsuarioEditando({ ...usuarioEditando, grupo: e.target.value })} style={{ borderColor: '#fbcfe8' }}>
                <option value="1">Grupo 1</option>
                <option value="2">Grupo 2</option>
                <option value="3">Grupo 3</option>
              </select>
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.3rem', color: '#701a75' }}>Estado Corporativo</label>
              <select className="input-field" value={usuarioEditando.estado} onChange={e => setUsuarioEditando({ ...usuarioEditando, estado: e.target.value })} style={{ borderColor: '#fbcfe8', background: usuarioEditando.estado === 'Activo' ? '#f0fdf4' : '#fef2f2' }}>
                <option value="Activo">🟢 Activo</option>
                <option value="Inactivo">🔴 Inactivo / Suspendido</option>
              </select>
            </div>
          </div>
          <div style={{ marginTop: '1rem', textAlign: 'right' }}>
            <button className="btn btn-primary" style={{ background: '#c026d3', borderColor: '#c026d3' }} onClick={async () => {
              try {
                if (!usuarioEditando.username || !usuarioEditando.nombre) return addToast('No puedes dejar campos principales vacíos.', 'error');
                if (usuarioEditando.role === 'admin') usuarioEditando.mina = 'Ambas';
                const nombreLimpio = normalizarNombre(usuarioEditando.nombre);
                
                await usuarioService.updateUsuario(usuarioEditando.id, { ...usuarioEditando, nombre: nombreLimpio });
                setDbUsuarios(dbUsuarios.map(u => u.id === usuarioEditando.id ? { ...usuarioEditando, nombre: nombreLimpio } : u));
                setUsuarioEditando(null);
                addToast('✅ Modificaciones aplicadas en el directorio.');
              } catch (err) {
                addToast('Error al actualizar: ' + err.message, 'error');
              }
            }}>💾 Guardar Cambios</button>
          </div>
        </div>
      )}

      <div className="table-container">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Nombre Completo</th>
              <th>Estado</th>
              <th>Rol en el Sistema</th>
              <th>Ubicación Fija</th>
              <th>Grupo</th>
              <th>Otorgamiento</th>
              <th style={{ textAlign: 'right' }}>Controles</th>
            </tr>
          </thead>
          <tbody>
            {dbUsuarios.map(u => (
              <tr key={u.id}>
                <td data-label="Nombre Completo">
                  <strong style={{ color: 'var(--primary-black)', fontSize: '1rem' }}>{u.nombre}</strong><br />
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>@{u.username}</span>
                </td>
                <td data-label="Estado">
                  {u.estado === 'Activo' ? (
                    <span style={{ color: '#16a34a', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 'bold' }}>
                      <span style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%' }}></span> Activo
                    </span>
                  ) : (
                    <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 'bold' }}>
                      <span style={{ width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%' }}></span> Inactivo
                    </span>
                  )}
                </td>
                <td data-label="Rol">
                  <span className="badge" style={{ background: u.role === 'admin' ? '#fee2e2' : '#e0e7ff', color: u.role === 'admin' ? '#991b1b' : '#3730a3' }}>
                    {u.role}
                  </span>
                </td>
                <td data-label="Ubicación" style={{ fontWeight: '500' }}>{u.role === 'admin' ? 'Todo' : `Mina ${u.mina}`}</td>
                <td data-label="Grupo">
                  <span className="badge" style={{ background: '#f3f4f6', color: '#374151', fontSize: '0.8rem' }}>
                    G{u.grupo || '1'}
                  </span>
                </td>
                <td data-label="Alta" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{u.creado}</td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button title="Editar Parametros" className="btn btn-secondary" style={{ padding: '0.4rem 0.6rem', fontSize: '1rem', display: 'flex', alignItems: 'center' }} onClick={() => {
                      setUsuarioEditando(u);
                      setIsCreandoUsuario(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}>
                      <Edit3 size={15} />
                    </button>
                    <button title="Resetear Clave" className="btn btn-secondary" style={{ padding: '0.4rem 0.6rem', fontSize: '1rem', border: '1px solid #10b981', color: '#10b981', display: 'flex', alignItems: 'center' }} onClick={() => {
                      showConfirm({
                        type: 'confirm',
                        title: '🔐 Reseteo de Credenciales',
                        message: `¿Forzar a ${u.nombre} a actualizar su contraseña? Se le pedirá cambio obligatorio cuando intente loguearse nuevamente.`,
                        onConfirm: async () => {
                          try {
                            await usuarioService.updateUsuario(u.id, { password: 'con123', firstTime: true });
                            setDbUsuarios(dbUsuarios.map(x => x.id === u.id ? { ...x, password: 'con123', firstTime: true } : x));
                            addToast(`Se ha suspendido temporalmente por reseteo a ${u.nombre}. Usará clave estándar "con123".`);
                          } catch (err) {
                            addToast('Error al resetear clave: ' + err.message, 'error');
                          }
                        }
                      });
                    }}>
                      <RefreshCcw size={15} />
                    </button>
                    <button title="Eliminar del Sistema" className="btn btn-secondary" style={{ padding: '0.4rem 0.6rem', fontSize: '1rem', border: '1px solid #ef4444', color: '#ef4444', display: 'flex', alignItems: 'center' }} onClick={() => {
                      if (u.username === 'admin' || u.username === 'aramirez') {
                        return addToast('No se puede despedir al Administrador Supremo del sistema.', 'error');
                      }
                      showConfirm({
                        type: 'confirm',
                        title: '🗑️ Baja de Colaborador',
                        message: `¿Remover a ${u.username} del ecosistema corporativo absolutamente?`,
                        onConfirm: async () => {
                          try {
                            await usuarioService.eliminarUsuario(u.id);
                            setDbUsuarios(dbUsuarios.filter(x => x.id !== u.id));
                            addToast('Usuario removido del sistema con éxito.');
                          } catch (err) {
                            addToast('Error al eliminar: ' + err.message, 'error');
                          }
                        }
                      });
                    }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
