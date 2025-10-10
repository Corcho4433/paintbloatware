// pages/oauth/success.tsx
import { useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
const OAuthSuccessPopup = () => {
    const setUser = useAuthStore((state) => state.setUser);
    
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('id') || '';
        const profilePicture = decodeURIComponent(urlParams.get('profilePicture') || '');
        setUser({id: userId, pfp: profilePicture});
        if (window.opener) {
            window.opener.location.href = '/';
        }
        const timer = setTimeout(() => {
            
            window.close();
        }, 2000);

        return () => clearTimeout(timer);
    }, [setUser]);

    return (
        <div className="flex justify-center items-center w-full h-full bg-gray-900">
            <div className="text-center">
                <div className="text-6xl mb-4">✅</div>
                <h1 className="text-white text-2xl mb-2">Login Exitoso!</h1>
                <p className="text-gray-300">Esta ventana se cerrará automáticamente...</p>
            </div>
        </div>
    );
};

export default OAuthSuccessPopup;
