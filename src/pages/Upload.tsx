import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import PaintSidebar from '../components/paintsidebar';
// Removed custom CSS, using Tailwind classes
import { Crown, Gem, Rocket, Sparkles } from 'lucide-react';
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
    const hasNitro = useAuthStore(state => state.user?.nitro);
    const [showNitroCard, setShowNitroCard] = useState(false);
    const [serverResponse, setServerResponse] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const editorTheme = useAuthStore(state => state.editorTheme);
    const [disabled, setDisabled] = useState(false);
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
                sourceHidden: sourceHidden
            }

            await createPost(sentPacket, (data: any) => {
                if (data.error) {
                    setServerResponse({
                        message: data.error || 'Error al crear el post',
                        type: 'error'
                    });
                    setDisabled(false);
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
        <div className="bg-gray-900 text-gray-100 min-h-screen w-full flex">
            <PaintSidebar />
            <div className="flex w-full flex-1 gap-6 p-6 lg:items-center">
                {/* Nitro Upsell Card */}
                {showNitroCard && !hasNitro && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn"
                        onClick={() => setShowNitroCard(false)}
                    >
                        {/* Glow effect background */}

                        <div
                            className="relative max-w-lg w-full mx-4 animate-slideUp"
                            onClick={(e) => e.stopPropagation()}
                        >

                            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-purple-600 opacity-30 rounded-3xl blur-2xl animate-pulse" />
                            {/* Main card */}
                            <div className={` relative bg-gradient-to-br from-black via-gray-800 to-black rounded-3xl border-2 border-violet-500/50 overflow-hidden shadow-2xl`}>
                                {/* Animated border gradient */}
                                <div className="absolute inset-0 rounded-3xl overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-purple-500 animate-spin-slow opacity-20"
                                        style={{ animationDuration: '6s' }} />
                                </div>

                                {/* Close button */}
                                <button
                                    onClick={() => setShowNitroCard(false)}
                                    className="absolute top-4 right-4 z-20 p-2 rounded-full bg-gray-800/80 hover:bg-gray-700 text-gray-400 hover:text-white transition-all duration-300 hover:rotate-90"
                                >
                                    ✕
                                </button>

                                {/* Content */}
                                <div className="relative z-10 px-8 py-12 text-center">
                                    {/* Crown icon with animation */}
                                    <div className="mb-6 flex justify-center">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-gradient-to-r from-violet-400 to-fuchsia-400 rounded-full blur-xl opacity-50 animate-pulse" />
                                            <Crown className="w-16 h-16 text-violet-400 relative animate-bounce" style={{ animationDuration: '2s' }} />
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <h2 className="text-5xl font-extrabold mb-3 animate-fadeInUp">
                                        <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-purple-400 bg-clip-text text-transparent">
                                            Paint Nitro
                                        </span>
                                    </h2>

                                    {/* Subtitle */}
                                    <p className="text-gray-300 mb-8 text-lg animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                                        Lleva tu experiencia al siguiente nivel con funciones exclusivas
                                    </p>

                                    {/* Features */}
                                    <div className="space-y-4 mb-8">
                                        <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-800/50 border border-violet-500/20 hover:border-violet-500/40 transition-all duration-300 hover:scale-105 animate-fadeInUp"
                                            style={{ animationDelay: '0.2s' }}>
                                            <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20">
                                                <Gem className="w-6 h-6 text-violet-400" />
                                            </div>
                                            <span className="text-gray-200 text-left flex-1">Oculta el código fuente de tus posts</span>
                                        </div>

                                        <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-800/50 border border-violet-500/20 hover:border-violet-500/40 transition-all duration-300 hover:scale-105 animate-fadeInUp"
                                            style={{ animationDelay: '0.3s' }}>
                                            <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20">
                                                <Rocket className="w-6 h-6 text-violet-400" />
                                            </div>
                                            <span className="text-gray-200 text-left flex-1">Posteos con interacciones elevadas</span>
                                        </div>

                                        <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-800/50 border border-violet-500/20 hover:border-violet-500/40 transition-all duration-300 hover:scale-105 animate-fadeInUp"
                                            style={{ animationDelay: '0.4s' }}>
                                            <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20">
                                                <Sparkles className="w-6 h-6 text-violet-400" />
                                            </div>
                                            <span className="text-gray-200 text-left flex-1">Badge exclusivo de Nitro</span>
                                        </div>
                                    </div>

                                    {/* CTA Button */}
                                    <Link to="/comprar-nitro" className="inline-block relative group animate-fadeInUp"
                                        style={{ animationDelay: '0.5s' }}>
                                        {/* Button glow effect */}
                                        <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300 animate-pulse" />

                                        {/* Button */}
                                        <button className="cursor-pointer relative px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-2xl text-white font-bold text-lg hover:scale-105 transition duration-300 shadow-lg">
                                            <span className="flex items-center gap-2">
                                                <Sparkles className="w-5 h-5" />
                                                ¡Quiero Paint Nitro!
                                                <Sparkles className="w-5 h-5" />
                                            </span>
                                        </button>
                                    </Link>

                                    {/* Price tag */}
                                    <p className="mt-4 text-gray-400 text-sm animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
                                        Solo $100 ARS/mes
                                    </p>
                                </div>

                                {/* Decorative elements */}
                                <div className="absolute top-0 left-0 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl" />
                                <div className="absolute bottom-0 right-0 w-40 h-40 bg-fuchsia-500/10 rounded-full blur-3xl" />
                            </div>
                        </div>
                    </div>
                )}



                <div className="flex flex-col w-full ">
                    <div className="flex-col md:flex-row flex gap-3  w-full">
                        {/* Left column: Preview & Source */}
                        <div className="flex-1 flex md:w-[45%] flex-col bg-gray-800 rounded-lg border border-gray-700 p-6">
                            <div className="mb-2">
                                <h2 className="text-2xl font-bold text-white mb-2">Preview & Source</h2>
                                <p className="text-gray-400 text-sm">Preview your image and source code before posting</p>
                            </div>
                            <div className="flex-1 aspect-square bg-gray-900  rounded-lg relative overflow-hidden flex items-center justify-center">
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
                                <button className="px-4 py-2 border border-gray-700 rounded-lg transition-all cursor-pointer max-w-full text-base duration-150 bg-gray-700 hocus:text-green-400 hocus:shadow-green-400/25 hocus:border-green-400 font-normal shadow-lg hocus:bg-gray-900"
                                    onClick={() => { handlePost(); setDisabled(true) }} disabled={!savedUrl || disabled}>
                                    Post Now
                                </button>
                                <button
                                    className={`
    px-4 py-2 rounded-lg border transition-all duration-150 cursor-pointer max-w-full text-base font-normal  shadow-lg
    ${!sourceHidden
                                            ? 'border-gray-700 bg-gray-700 text-white hocus:bg-gray-900 hocus:border-violet-400 hocus:text-violet-400 hocus:shadow-violet-400/25'
                                            : 'bg-gray-900 border-violet-400 text-violet-400 shadow-violet-400/25 hocus:bg-gray-800 hocus:border-violet-300 hocus:shadow-violet-300/25'
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
                        <div className="flex-1 flex md:w-[10vw] flex-col bg-gray-800 rounded-lg border border-gray-700 p-6 min-w-0 overflow-hidden">
                            <h2 className="text-lg font-bold text-white mb-2">Source Code</h2>
                            <div className="mb-4 overflow-auto  max-h-[55vh] ">
                                <SyntaxHighlighter
                                    language="lua"
                                    className="!bg-gray-900 rounded-xl !w-auto !min-w-0"
                                    style={getThemeFromString(editorTheme)}
                                    customStyle={{
                                        margin: 0,
                                        padding: '1.5rem',
                                        fontSize: '0.875rem',
                                        lineHeight: '1.5',
                                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                                        width: 'fit-content',
                                        height: "40vh"
                                        
                                    }}
                                    codeTagProps={{
                                        style: {
                                            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                                            fontSize: '0.875rem',
                                            lineHeight: '1.5',
                                            display: 'block',
                                            width: "10%"
                                            
                                        }
                                    }}
                                    wrapLongLines={false}
                                    PreTag="div"
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
                                                    : 'bg-gray-800 text-gray-300 hocus:bg-gray-700 hocus:text-white hocus:border-gray-600'}
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
        </div >
    );
}