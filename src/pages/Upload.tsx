import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom'; // if using React Router

export default function Upload() {
    const [savedUrl, setSavedUrl] = useState('');
    const [searchParams] = useSearchParams();
    
    useEffect(() => {
        const urlFromParams = searchParams.get('url');
        if (urlFromParams) {
        setSavedUrl(urlFromParams);
        console.log('URL loaded and saved:', urlFromParams);
        }
    }, [searchParams]);

    const handlePost = async () => {
        if (savedUrl) {
        // do something
        }
    };

    return (
        <div>
        <p>Loaded URL: {savedUrl}</p>
        <button onClick={handlePost} disabled={!savedUrl}>
            Post Now
        </button>
        </div>
    );
}