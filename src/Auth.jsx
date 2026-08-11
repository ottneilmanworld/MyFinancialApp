import { useState } from 'react'
import { supabase } from "./supabase";
export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState('')

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (isSignUp) {
      // Registro de nuevo usuario
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setMessage(error.message)
      else setMessage('¡Registro exitoso! Revisa tu correo para confirmar o inicia sesión.')
    } else {
      // Inicio de sesión
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage(error.message)
    }
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', textAlign: 'center', border: '1px solid #333', borderRadius: '8px' }}>
      <h2>{isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}</h2>
      <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input
          type="email"
          placeholder="Tu correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <input
          type="password"
          placeholder="Tu contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button type="submit" disabled={loading} style={{ padding: '10px', cursor: 'pointer', fontWeight: 'bold' }}>
          {loading ? 'Cargando...' : isSignUp ? 'Registrarse' : 'Ingresar'}
        </button>
      </form>

      {message && <p style={{ marginTop: '15px', color: '#ffbd2e' }}>{message}</p>}

      <button 
        onClick={() => { setIsSignUp(!isSignUp); setMessage(''); }}
        style={{ marginTop: '15px', background: 'none', border: 'none', color: '#4caf50', cursor: 'pointer', textDecoration: 'underline' }}
      >
        {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate aquí'}
      </button>
    </div>
  )
}