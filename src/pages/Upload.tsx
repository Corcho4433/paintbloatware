import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PaintSidebar from '../components/paintsidebar';
import styles from "../styles/upload.module.css"
import { createPost } from '../hooks/posts';
import { fetchAllTags } from '../hooks/trending';

interface Tag {
    name: string;
}

export default function Upload() {
    const navigate = useNavigate();
    const [savedUrl, setSavedUrl] = useState('');
    const [sourceCode, setSourceCode] = useState('');
    const [searchParams] = useSearchParams();
    const [availableTags, setAvailableTags] = useState<Tag[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [description, setDescription] = useState('');
    const [serverResponse, setServerResponse] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Effect 1: Only for session storage data
    useEffect(() => {
        const urlFromParams = sessionStorage.getItem("post_bucket_url");
        const sourceFromParams = sessionStorage.getItem("post_source_code");

        if (urlFromParams && sourceFromParams) {
            setSourceCode(sourceFromParams);
            setSavedUrl(urlFromParams);
        }
    }, [searchParams]); // This can stay if you actually use searchParams

    // Effect 2: Only for fetching tags (runs once on mount)
 // Empty dependency array = runs once

    useEffect(() => {
        fetchAllTags().then(tags => {
            console.log("Available tags: ", tags, availableTags.length);

            console.log("Tags: ", tags[0]);
            if (availableTags.length === 0) {
                setAvailableTags(tags);
            } 
            // setAvailableTags(tags);
        });
    }, []);


    const handlePost = async () => {
        if (savedUrl) {
            setServerResponse(null); // Limpiar mensajes anteriores
            
            const sentPacket = {
                image: savedUrl,
                description: description,
                source: sourceCode,
                tags: selectedTags,
            }

            await createPost(sentPacket, (data: any) => {
                if (data.error) {
                    setServerResponse({ 
                        message: data.error || 'Error al crear el post', 
                        type: 'error' 
                    });
                } else {
                    setServerResponse({ 
                        message: data.message || 'Post creado exitosamente!', 
                        type: 'success' 
                    });
                    
                    // Limpiar formulario después del éxito
                    
                    
                    
                    
                    // Redirigir a home después de 1.5 segundos
                    setTimeout(() => {
                    sessionStorage.removeItem("post_bucket_url");
                    sessionStorage.removeItem("post_source_code");
                    setSavedUrl('');        
                    setSourceCode('');
                    setSelectedTags([]);
                    setDescription('');
                    navigate('/home');
                    }, 1500);
                }
            });
        }
    };

    const toggleTag = (tag: string) => {
        setSelectedTags(prev => {
            if (prev.includes(tag)) {
                return prev.filter(t => t !== tag);
            } else {
                return [...prev, tag];
            }
        });
    };

    const handleHideSource = () => {
        console.log("Hide source clicked");
    };

    return (
        <div className={styles.page_container}>
            <PaintSidebar />
            <div className={styles.columncontainer}>
                <div className={styles.container}>
                    <div className={styles.imgpreview}>
                        <img
                            width={512}
                            height={512}
                            src={savedUrl}
                            alt="Preview"
                        />
                    </div>
                    <div className={styles.sourcecontainer}>
                        <p className={styles.source_title_text}>Source Code:</p>
                        <p className={styles.source_text}>{sourceCode}</p>
                    </div>
                </div>
                <div className={styles.buttons_container}>
                    <button className={styles.postbutton} onClick={handlePost} disabled={!savedUrl}>
                        Post Now
                    </button>
                    <button className={styles.hidesourcebutton} onClick={handleHideSource} disabled={!savedUrl}>
                        Hide Source
                    </button>
                </div>  
            </div>

            <div className={styles.columncontainer}>
                <div className={styles.container}>
                    <p className={styles.edit_post_text_label}>Description</p>
                    <textarea 
                        className={styles.post_description_area}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe tu dibujo..."
                    />

                    {serverResponse && (
                        <div className={`${styles.server_response} ${serverResponse.type === 'success' ? styles.success : styles.error}`}>
                            {serverResponse.message}
                        </div>
                    )}

                    <p className={styles.edit_post_text_label}>Tags</p>
                    <div className={styles.tags_container}>
                        {availableTags.map(tag => (
                            <button
                                key={tag.name}
                                className={`${styles.tag} ${selectedTags.includes(tag.name) ? styles.tag_selected : ''}`}
                                onClick={() => toggleTag(tag.name)}
                                type="button"
                            >
                                {tag.name}
                            </button>
                        ))}
                    </div>
                    {selectedTags.length > 0 && (
                        <div className={styles.selected_tags_info}>
                            <p>Selected tags: {selectedTags.join(', ')}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}