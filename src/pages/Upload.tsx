import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom'; // if using React Router

export default function Upload() {
    const [savedUrl, setSavedUrl] = useState('');
    const [sourceCode, setSourceCode] = useState('');
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const urlFromParams = sessionStorage.getItem("post_bucket_url");
        const sourceFromParams = sessionStorage.getItem("post_source_code");

        console.log("url: ", urlFromParams);
        console.log("source: ", sourceFromParams);

        if (urlFromParams && sourceFromParams) {
            setSourceCode(sourceFromParams);
            setSavedUrl(urlFromParams);

            sessionStorage.removeItem("post_bucket_url");
            sessionStorage.removeItem("post_source_code");

            console.log('Retrieved data: ', savedUrl, ' and: ', sourceCode);
        }
    }, [searchParams]);

    const handlePost = async () => {
        if (savedUrl) {

        }
    };


    return (
        <div className='flex'>
            <p>Image URL: {savedUrl}</p>
            <p>Source Code: {sourceCode}</p>
            <button onClick={handlePost} disabled={!savedUrl}>
                Post Now
            </button>
        </div>
    );
}