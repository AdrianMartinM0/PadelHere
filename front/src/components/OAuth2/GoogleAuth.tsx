import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useContext, } from 'react';
import { AuthContext } from '../../context/AuthContext';

const GoogleAuth = () => {
  const { login } = useContext(AuthContext)!;

  const handleSuccess = async (response: any) => {
    const token = response.credential;

    try {
      const res = await fetch('https://padelhere-production.up.railway.app/v1/usuario/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

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

  const handleError = () => {
    console.error('Error al autenticar con Google');
  };

  return (
    <GoogleOAuthProvider clientId="104807231315-t3u5d5uvinf5m97lh840gh4jish41s62.apps.googleusercontent.com">
      <div className='flex items-center justify-center w-full'>
        <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        theme={window.matchMedia('(prefers-color-scheme: dark)').matches ? "filled_black" : "outline"}
      />
      </div>
    </GoogleOAuthProvider>
  );
};

export default GoogleAuth;
