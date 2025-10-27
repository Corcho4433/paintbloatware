import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PaintSidebar from '../components/paintsidebar';
// Removed custom CSS, using Tailwind classes
import styles from '../styles/upload.module.css'
import { Gem, Rocket, Bolt, ArrowBigUp, ChevronsUp } from 'lucide-react';
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
    const [sourceHidden, setSourceHidden] = useState(false);
    console.log("Source hidden state: ", sourceHidden);
    // TODO: Replace with real Nitro check
    const hasNitro = true;
    const [showNitroCard, setShowNitroCard] = useState(false);
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
                source: !sourceHidden ? sourceCode : '',
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
        
        if (!hasNitro) {
            setShowNitroCard(true);
            setSourceHidden(false);
            return;
        }
        setSourceHidden(sourceHidden => !sourceHidden);
        console.log("Toggled source hidden to: ", sourceHidden);


        // If user has Nitro, do nothing for now (could implement hiding logic)
    };

    return (
        <div className="bg-gray-900 text-gray-100 min-h-screen flex">
            <PaintSidebar />
            <div className="flex flex-1 gap-6 p-6">
                {/* Nitro Upsell Card */}
                {showNitroCard && !hasNitro && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowNitroCard(false)}
                    >
                        <div
                            className={`${styles.box} max-w-lg w-full text-center flex flex-col items-center justify-center relative`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="content text-gray-200 px-8 py-10 relative z-10 flex flex-col items-center">
                                <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400 mb-4">
                                    Paint Nitro
                                </h2>

                                <p className="text-gray-100 mb-6 text-lg">
                                    Lleva tu experiencia al siguiente nivel con funciones exclusivas.
                                </p>

                                <ul className="text-left space-y-3 mb-8 text-gray-300">
                                    <li className="flex items-center gap-2">
                                        <Gem className="w-5 h-5 text-violet-400" /> Oculta el código fuente de tus posts.
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Rocket className="w-5 h-5 text-violet-400" /> Posteos con interacciones elevadas.
                                    </li>

                                </ul>

                                <a
                                    href="/comprar-nitro"
                                    className="bg-gray-800 hover:bg-gray-900 p-2 border hover:text-violet-400 border-gray-700 rounded-md hover:shadow-violet-400/50 shadow-lg hover:border-violet-400 transition-all duration-300 text-lg"
                                >
                                    ¡Quiero Paint Nitro!
                                </a>
                            </div>

                            <button
                                onClick={() => setShowNitroCard(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 transition z-20"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                )}


                {/* Left column: Preview & Source */}
                <div className="flex flex-col w-full">
                    <div className="flex-col md:flex-row flex gap-3  w-full">
                        <div className="flex-1 flex flex-col bg-gray-800 rounded-lg border border-gray-700">
                            <div className="mx-6 mt-6">
                                <h2 className="text-2xl font-bold text-white mb-2">Preview & Source</h2>
                                <p className="text-gray-400 text-sm">Preview your image and source code before posting</p>
                            </div>
                            <div className="flex-1 aspect-square bg-gray-900 mx-6 mt-6 rounded-lg relative overflow-hidden flex items-center justify-center">
                                <div className="flex justify-center items-center  w-[300px] h-[300px] md:w-[512px] md:h-[512px] m-3">
                                    <div className="relative w-[300px] h-[300px] md:w-[512px] md:h-[512px] aspect-square flex items-center justify-center">
                                        <img
                                            width={512}
                                            height={512}
                                            src={savedUrl}
                                            alt="Preview"
                                            className="border-2 aspect-square w-[300px] md:w-[512px] [image-rendering:pixelated] border-gray-600 bg-black rounded-lg shadow-lg  object-cover"
                                        />

                                        {/* Default success overlay: green */}
                                        {serverResponse && serverResponse.type === 'success' && (
                                            <div
                                                className="absolute inset-0 rounded-lg flex items-center justify-center pointer-events-none"
                                                style={{
                                                    background: !sourceHidden
                                                        ? 'linear-gradient(135deg, rgba(34,197,94,0.5) 0%, rgba(34,197,94,0.5) 100%)' // green overlay
                                                        : 'linear-gradient(135deg, rgba(139,92,246,0.5) 0%, rgba(139,92,246,0.5) 100%)', // violet overlay
                                                }}
                                            >
                                                <span className="text-white text-3xl font-bold drop-shadow-lg tracking-wide text-center select-none">
                                                   {!sourceHidden ? '¡Post Exitoso!' : '¡Post Oculto Exitoso!'}
                                                </span>
                                            </div>
                                        )}

                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3 p-4 align-center justify-center">
                                <button className="px-4 py-2 border border-gray-700 rounded-lg transition-all cursor-pointer max-w-full text-base duration-150 bg-gray-700 hover:text-green-400 hover:shadow-green-400/25 hover:border-green-400 font-normal shadow-lg hover:bg-gray-900" onClick={handlePost} disabled={!savedUrl}>
                                    Post Now
                                </button>
                                <button
                                    className={`
    px-4 py-2 rounded-lg border transition-all duration-150 cursor-pointer max-w-full text-base font-normal  shadow-lg
    ${!sourceHidden
                                            ? 'border-gray-700 bg-gray-700 text-white hover:bg-gray-900 hover:border-violet-400 hover:text-violet-400 hover:shadow-violet-400/25'
                                            : 'bg-gray-900 border-violet-400 text-violet-400 shadow-violet-400/25 hover:bg-gray-800 hover:border-violet-300 hover:shadow-violet-300/25'
                                        }
    disabled:opacity-50 disabled:cursor-not-allowed
  `}
                                    onClick={handleHideSource}
                                    disabled={!savedUrl}
                                >
                                    {!sourceHidden ? 'Hide Source' : 'Show Source'}
                                </button>
                            </div>
                        </div>
                        {/* Right column: Description & Tags */}
                        <div className="flex-1 flex flex-col bg-gray-800 rounded-lg border border-gray-700 p-6">
                            <h2 className="text-lg font-bold text-white mb-2">Source Code</h2>
                            <div className=" mb-4 max-h-[55vh] w-[50vw] overflow-auto">

                                <SyntaxHighlighter language="lua" className="!bg-gray-900 rounded-xl" style={getThemeFromString(editorTheme)} customStyle={{
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
                            </div>
                            <div className="mb-4">
                                <h2 className="text-xl font-bold text-white mb-2">Tags</h2>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {availableTags.length === 0
                                        ? [...Array(6)].map((_, i) => (
                                            <div
                                                key={i}
                                                className="h-8 w-20 bg-gray-700 rounded-lg animate-pulse border border-gray-700"
                                            />
                                        ))
                                        : availableTags.map(tag => (
                                            <button
                                                key={tag.name}
                                                className={`px-4 py-2 rounded-lg border border-gray-700 text-sm font-medium transition-all duration-150 shadow-lg max-w-full
                                                    ${selectedTags.includes(tag.name)
                                                        ? 'bg-gray-900 text-blue-400 !border-blue-400 shadow-blue-600/25'
                                                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-600'}
                                                `}
                                                onClick={() => toggleTag(tag.name)}
                                                type="button"
                                            >
                                                {tag.name}
                                            </button>
                                        ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}