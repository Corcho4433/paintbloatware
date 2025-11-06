// pages/oauth/success.tsx
import { useEffect } from 'react';
import { fetchAuthMe } from '../hooks/user';

const OAuthSuccessPopup = () => {
    useEffect(() => {
        const handleOAuthSuccess = async () => {
            // Llamar a fetchAuthMe para actualizar el store automáticamente
            await fetchAuthMe();

            
            // Notificar a la ventana principal que se complete el login
            if (window.opener) {
                // Enviar mensaje a la ventana principal (opcional)
                window.opener.postMessage({ type: 'OAUTH_SUCCESS' }, window.location.origin);
                
                // Redirigir la ventana principal
                window.opener.location.href = '/';
            }
            
            // Cerrar el popup después de 2 segundos
            const timer = setTimeout(() => {
                window.close();
            }, 100000000);
            
            return () => clearTimeout(timer);
        };
        
        handleOAuthSuccess();
    }, []);

    return (
        <div className="flex justify-center items-center w-full h-full bg-gray-900 min-h-screen">
            <div className="text-center">
                <div className="text-6xl mb-4">✅</div>
                <h1 className="text-white text-2xl mb-2">Login Exitoso!</h1>
                <p className="text-gray-300">Esta ventana se cerrará automáticamente...</p>
            </div>
        </div>
    );
};

export default OAuthSuccessPopup;