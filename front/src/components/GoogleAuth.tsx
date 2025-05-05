import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const GoogleAuth = () => {
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

      if (res.ok) {
        const data = await res.json();
        console.log('Usuario autenticado:', data);
        // Aquí puedes guardar el token JWT en el almacenamiento local o cookies
        localStorage.setItem('authToken', data.access_token);
      } else {
        console.error('Error al autenticar en el backend');
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
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
      />
    </GoogleOAuthProvider>
  );
};

export default GoogleAuth;