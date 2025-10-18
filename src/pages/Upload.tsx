import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PaintSidebar from '../components/paintsidebar';
// Removed custom CSS, using Tailwind classes
import { createPost } from '../hooks/posts';
import { fetchAllTags } from '../hooks/trending';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { useAuthStore } from '../store/useAuthStore';
import { getThemeFromString } from '../utils/theme';


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

    const editorTheme = useAuthStore(state => state.editorTheme);
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
        <div className="bg-gray-900 text-gray-100 min-h-screen flex">
            <PaintSidebar />
            <div className="flex flex-1 gap-6 p-6">
                {/* Left column: Preview & Source */}
                <div className="flex flex-col w-full">
                    <div className="flex-row flex gap-3  w-full">
                        <div className="flex-1 flex flex-col bg-gray-800 rounded-lg border border-gray-700">
                            <div className="mx-6 mt-6">
                                <h2 className="text-2xl font-bold text-white mb-2">Preview & Source</h2>
                                <p className="text-gray-400 text-sm">Preview your image and source code before posting</p>
                            </div>
                            <div className="flex-1 aspect-square bg-gray-900 mx-6 mt-6 rounded-lg relative overflow-hidden flex items-center justify-center">
                                <div className="flex justify-center items-center w-full h-full">
                                    <div className="relative w-[512px] h-[512px] flex items-center justify-center">
                                        <img
                                            width={512}
                                            height={512}
                                            src={savedUrl}
                                            alt="Preview"
                                            className="border-2 border-gray-600 bg-black rounded-lg shadow-lg w-full h-full object-cover"
                                        />
                                        {serverResponse && serverResponse.type === 'success' && (
                                            <div className="absolute inset-0 rounded-lg flex items-center justify-center pointer-events-none" style={{background: 'linear-gradient(135deg, rgba(34,197,94,0.92) 0%, rgba(34,197,94,0.85) 100%)'}}>
                                                <span className="text-white text-3xl font-extrabold drop-shadow-lg tracking-wide text-center select-none">
                                                    ¡Post Exitoso!
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3 p-4 align-center justify-center">
                                    <button className="px-4 py-2 rounded-lg border border-green-600 bg-green-600 text-white hover:bg-green-700 transition-all duration-200 font-medium shadow-sm" onClick={handlePost} disabled={!savedUrl}>
                                        Post Now
                                    </button>
                                    <button className="px-4 py-2 rounded-lg border border-gray-600 bg-gray-700 text-white hover:bg-gray-800 transition-all duration-200 font-medium shadow-sm" onClick={handleHideSource} disabled={!savedUrl}>
                                        Hide Source
                                    </button>
                                </div>
                        </div>
                        {/* Right column: Description & Tags */}
                        <div className="flex-1 flex flex-col bg-gray-800 rounded-lg border border-gray-700 p-6">
                            <div className=" mb-4">
                                <h2 className="text-lg font-bold text-white mb-2">Source Code</h2>
                                <SyntaxHighlighter language="lua" className="!bg-gray-900 rounded-xl" style={ getThemeFromString(editorTheme)} customStyle={{
                                    margin: 0,
                                    padding: '1.5rem',
                                    fontSize: '0.875rem',
                                    lineHeight: '1.5',
                                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                                }}
                                    codeTagProps={{
                                        style: {
                                            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                                            fontSize: '0.875rem',
                                            lineHeight: '1.5',
                                        }
                                    }}
                                >
                                    {sourceCode}
                                </SyntaxHighlighter>


                            </div>
                            <div className="mb-4">
                                <h2 className="text-xl font-bold text-white mb-2">Description</h2>
                                <textarea
                                    className="w-full min-h-[80px] bg-gray-900 text-gray-100 rounded-lg p-3 border border-gray-700 focus:border-blue-500 focus:outline-none mb-2"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe tu dibujo..."
                                />
                                {serverResponse && (
                                    <div className={`mt-2 p-2 rounded text-sm ${serverResponse.type === 'success' ? 'bg-green-700 text-green-100' : 'bg-red-700 text-red-100'}`}>
                                        {serverResponse.message}
                                    </div>
                                )}
                            </div>
                            <div className="mb-4">
                                <h2 className="text-xl font-bold text-white mb-2">Tags</h2>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {availableTags.map(tag => (
                                        <button
                                            key={tag.name}
                                            className={`px-3 py-1 rounded border border-blue-900 text-sm font-medium transition-colors duration-150 ${selectedTags.includes(tag.name) ? 'bg-blue-500 text-white' : 'bg-blue-700 text-white'}`}
                                            onClick={() => toggleTag(tag.name)}
                                            type="button"
                                        >
                                            {tag.name}
                                        </button>
                                    ))}
                                </div>
                                {selectedTags.length > 0 && (
                                    <div className="mt-2 text-gray-300">
                                        <p>Selected tags: {selectedTags.join(', ')}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}