import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

const GoogleAuth = () => {
  const { login } = useContext(AuthContext)!;
  const [showTelForm, setShowTelForm] = useState(false);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [pendingUser, setPendingUser] = useState<any>(null);

  const handleSuccess = async (response: any) => {
    const token = response.credential;

    try {
      const res = await fetch('http://localhost:8000/v1/usuario/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (data.require_tel) {
        setShowTelForm(true);
        setGoogleToken(token);
        setPendingUser(data.user_google_data);
        return;
      }

      if (data.access_token) {
        login(data.access_token);
      } else if (data.user && data.user.access_token) {
        login(data.user.access_token);
      } else {
        console.error('Respuesta inesperada del backend');
      }
    } catch (error) {
      console.error('Error al conectar con el backend:', error);
    }
  };

  const handleTelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tel = (e.target as any).tel.value;
    if (!googleToken) return;

    try {
      const res = await fetch('http://localhost:8000/v1/usuario/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: googleToken, tel }),
      });
      const data = await res.json();

      if (data.access_token) {
        login(data.access_token);
        setShowTelForm(false);
        setGoogleToken(null);
        setPendingUser(null);
      } else {
        // Mostrar error si hace falta
        alert('Error al completar el registro. Inténtalo de nuevo.');
      }
    } catch (error) {
      console.error('Error al enviar el teléfono:', error);
    }
  };

  const handleError = () => {
    console.error('Error al autenticar con Google');
  };

  return (
    <GoogleOAuthProvider clientId="104807231315-t3u5d5uvinf5m97lh840gh4jish41s62.apps.googleusercontent.com">
      {showTelForm ? (
        <form onSubmit={handleTelSubmit} style={{ display: "flex", flexDirection: "column", gap: "1em", marginTop: "2em" }}>
          <p>
            {pendingUser?.name
              ? `Hola ${pendingUser.name}, necesitamos tu teléfono para completar el registro.`
              : "Necesitamos tu teléfono para completar el registro."}
          </p>
          <input
            type="tel"
            name="tel"
            placeholder="Teléfono"
            required
            pattern="[0-9]{9,15}"
            autoFocus
          />
          <button type="submit">Enviar</button>
        </form>
      ) : (
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
        />
      )}
    </GoogleOAuthProvider>
  );
};

export default GoogleAuth;