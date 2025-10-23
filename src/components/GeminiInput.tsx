import { useState } from "react";
import { serverPath } from "../utils/servers";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { getThemeFromString } from "../utils/theme";
import { useAuthStore } from "../store/useAuthStore";
import { ArrowRight, Square } from 'lucide-react'

interface GeminiInputProps {
    setSourceCode: (newSource: string) => void;
}

const GeminiInput = ({ setSourceCode }: GeminiInputProps) => {
    const [geminiPrompt, setGeminiPrompt] = useState("");
    const [oldGeminiPrompt, setOldGeminiPrompt] = useState("");
    const [geminiLoading, setGeminiLoading] = useState(false);
    const [geminiResult, setGeminiResult] = useState<string | null>(null);
    const gridSize = useAuthStore(state => state.gridSize);
    const editorTheme = useAuthStore(state => state.editorTheme);
    const [actionStatus, setActionStatus] = useState<"copied" | "replaced" | null>(null);

    // Gemini API call
    const handleGeminiPrompt = async () => {
        if (!geminiPrompt.trim()) return;
        setOldGeminiPrompt(geminiPrompt);
        setGeminiLoading(true);
        setGeminiResult(null);
        try {
            const res = await fetch(`${serverPath}/api/gemini`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: geminiPrompt, gridSize: gridSize })
            });
            let data;
            try {
                const text = await res.text();
                if (!text) throw new Error("Empty response from server");
                data = JSON.parse(text);
            } catch (jsonErr) {
                setGeminiResult("Error: Invalid or empty JSON response from server.");
                setGeminiLoading(false);
                return;
            }
            // Try to extract text from Gemini response
            if (data.error) {
                setGeminiResult("Error: " + data.error.message || "Unknown error from Gemini.");
                return;
            }
            let resultText = "";
            if (data?.result?.candidates?.[0]?.content?.parts?.[0]?.text) {
                resultText = data.result.candidates[0].content.parts[0].text;
            } else {
                resultText = JSON.stringify(data.result, null, 2);
            }
            // Remove Markdown code fences if present
            const codeFenceRegex = /^```(?:lua)?\s*([\s\S]*?)\s*```$/i;
            const match = resultText.match(codeFenceRegex);
            setGeminiResult(match ? match[1] : resultText);

        } catch (err) {
            setGeminiResult("Error: " + (err instanceof Error ? err.message : String(err)));
        }
        setGeminiLoading(false);
    };
    return (<div className="mb-6 w-full max-w-full  rounded-lg ">
        <div className="gap-3 mb-6">
            <h2 className="text-xl mb-3 font-bold text-white block">Gemini Lua Generator</h2>
            <p className="text-gray-400 text-sm">
                Prompt Gemini to generate Lua code for your drawing!
            </p>

        </div>
        <div className="flex gap-2 mb-2">
            <div className="flex items-center gap-2 w-full">
                <input
                    type="text"
                    className="flex-1 focus:!outline-none focus:border-white px-2 py-1 rounded border border-gray-600 bg-gray-900 text-white"
                    placeholder="Describe what you want to draw in Lua..."
                    value={geminiPrompt}
                    onChange={e => setGeminiPrompt(e.target.value)}
                    onKeyDown={e =>
                        e.key === 'Enter' &&
                        !geminiLoading &&
                        geminiPrompt.trim() &&
                        handleGeminiPrompt()
                    }
                    disabled={geminiLoading}
                />

                <button
                    onClick={handleGeminiPrompt}
                    disabled={geminiLoading || !geminiPrompt.trim()}
                    className={`aspect-square ${geminiLoading ? '' : 'cursor-pointer'} p-1.5 rounded bg-gray-700 text-white shadow-lg hover:bg-gray-900 disabled:text-gray-400 disabled:bg-gray-700 flex items-center justify-center transition-all duration-200`}
                >
                    {geminiLoading ? (
                        <Square className="w-5 h-5 animate-pulse" />
                    ) : (
                        // ✈️ Paper plane (send) icon
                        <ArrowRight className="w-5 h-5" />
                    )}
                </button>
            </div>

        </div>
        {geminiLoading && (
            <div className="flex flex-col items-center justify-center py-8 gap-4">
                <svg aria-hidden="true" className="w-12 h-12 text-gray-600 animate-spin fill-blue-500" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                </svg>
                <p className="text-gray-400 text-sm">Gemini is thinking... This may take a moment.</p>
            </div>
        )}
        {(geminiResult && !geminiLoading) && (
            <div className="w-full bg-gray-900 p-4 rounded-xl overflow-x-auto relative">
                <div className="space-y-1.5 mb-3">
                    <h3 className="font-bold text-lg">Code Result</h3>
                    <p className="text-gray-200 text-sm">Prompt:</p>
                    <p className="text-gray-400 text-sm">{oldGeminiPrompt}</p>
                </div>


                <SyntaxHighlighter
                    language="lua"
                    className="!bg-gray-800 rounded  overflow-y-auto mt-4"
                    style={getThemeFromString(editorTheme)}
                    customStyle={{
                        padding: '1.5rem',
                        fontSize: '0.875rem',
                        lineHeight: '1.5',
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                        whiteSpace: 'pre',
                        overflow: 'visible',
                    }}
                    codeTagProps={{
                        style: {
                            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                            fontSize: '0.875rem',
                            lineHeight: '1.5',
                            overflow: 'auto',
                            whiteSpace: 'pre',
                            maxHeight: '30vh',
                            display: 'inline-block',
                            minWidth: '100%',
                        }
                    }}
                >
                    {geminiResult
                        .replace(/```lua\n?/g, '')
                        .replace(/```\n?/g, '')
                        .replace(/\\n/g, '\n')
                        .replace(/^"|"$/g, '')
                        .trim()}
                </SyntaxHighlighter>
                <div className="space-x-2">
                    <button
                        type="button"
                        onClick={() => {
                            const code = geminiResult
                                .replace(/```lua\n?/g, '')
                                .replace(/```\n?/g, '')
                                .replace(/\\n/g, '\n')
                                .replace(/^"|"$/g, '')
                                .trim();
                            navigator.clipboard.writeText(code);
                            setActionStatus("copied");
                            setTimeout(() => setActionStatus(null), 2000);
                        }}
                        className={`border border-gray-700 rounded-lg transition-all cursor-pointer px-3 py-2 min-w-[70px] max-w-full text-base duration-150 bg-gray-700 text-gray-300 font-normal shadow-lg hover:bg-gray-800 `}
                        style={{ whiteSpace: 'normal', overflow: 'visible' }}
                    >
                        Copy
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            const code = geminiResult
                                .replace(/```lua\n?/g, '')
                                .replace(/```\n?/g, '')
                                .replace(/\\n/g, '\n')
                                .replace(/^"|"$/g, '')
                                .trim();
                            setSourceCode(code);
                            setActionStatus("replaced");
                            setTimeout(() => setActionStatus(null), 2000);
                        }}
                        className={`border border-gray-700 rounded-lg transition-all cursor-pointer px-3 py-2 max-w-full text-base duration-150 bg-gray-700 text-gray-300 font-normal shadow-lg hover:bg-gray-800 `}
                        style={{ whiteSpace: 'normal', overflow: 'visible' }}
                    >
                        Replace
                    </button>
                </div>
                {actionStatus && (
                    <div className="flex  w-full mt-3">
                        <div  className=" px-4 py-2 rounded-lg border border-green-400 bg-gray-800 pointer-events-none inline-flex items-center">
                            <span className="text-green-400 text-lg drop-shadow-lg">
                                {actionStatus === "copied"
                                    ? "¡Copied Successfully!"
                                    : "¡Replaced Successfully!"}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        )}
    </div>)
}

export default GeminiInput;