
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { getThemeFromString } from "../utils/theme";
import { useAuthStore } from "../store/useAuthStore";

interface CodeSnippetsProps {
  snippetImports: Record<string, () => Promise<string>>;
  setSourceCode: (newSource: string) => void;
}

const CodeSnippets = ({ snippetImports, setSourceCode }: CodeSnippetsProps) => {
  const [snippets, setSnippets] = useState<{ name: string; content: string }[]>(
    []
  );
  const [actionStatus, setActionStatus] = useState<"copied" | "replaced" | null>(null);
  const editorTheme = useAuthStore(state => state.editorTheme);
  const theme = getThemeFromString(editorTheme);
  const activeSnippet = useAuthStore(state => state.snippet);
  const setActiveSnippet = useAuthStore(state => state.setSnippet);
  useEffect(() => {
    const loadSnippets = async () => {
      const keys = Object.keys(snippetImports);
      const loaded = [];
      for (const key of keys) {
        const module = await snippetImports[key]();
        const name = key.split("/").pop()?.replace(".md", "") || "Snippet";
        loaded.push({ name, content: module as string });
      }
      setSnippets(loaded);
    };
    loadSnippets();
  }, [snippetImports]);

  const extractCode = (markdown: string) => {
    const match = markdown.match(/```lua\s*([\s\S]*?)```/i);
    return match ? match[1].trim() : markdown.trim();
  };

  const copyToClipboard = async (text: string) => {
    const codeOnly = extractCode(text);
    await navigator.clipboard.writeText(codeOnly);
  };

  return (
    <div className="bg-gray-800  text-indigo-100 p-4 rounded-lg w-full md:w-[70vw] max-w-full">
      {/* Buttons */}
      <div className="flex flex-wrap gap-2 mb-4 max-w-full pb-1 overflow-x-auto scrollbar-thin">
        {snippets.map((s, i) => (
          <button
            key={i}
            onClick={() => setActiveSnippet(i)}
            className={`border border-gray-700 rounded-lg transition-all  px-3 py-2 min-w-[120px] max-w-full text-base duration-150
              ${i === activeSnippet
                ? 'bg-gray-900 text-white shadow-lg  border-gray-700 font-medium '
                : 'bg-gray-700 text-gray-300 cursor-pointer font-normal shadow-lg hover:bg-gray-800'}
            `}
            style={{ whiteSpace: 'normal', overflow: 'visible' }}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* Snippet display */}
      {snippets[activeSnippet] && (
        <div className="relative">

          <div className="bg-gray-900 rounded-xl p-4 w-full  max-w-full break-all whitespace-pre-wrap">
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={theme}
                      language={match[1]}
                      PreTag="div"
                      className="!bg-gray-800 text-indigo-100 text-base break-all whitespace-pre-wrap w-full max-w-full overflow-x-hidden rounded"
                      customStyle={{ margin: 0 }}
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
                      {...props}
                    >
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  ) : (
                    <code
                      className="bg-gray-900 overflow-auto rounded-xl px-1 py-0.5 text-base break-all whitespace-pre-wrap w-full overflow-x-hidden"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                h1: ({ children }) => <h1 className="!text-lg font-bold my-2">{children}</h1>,
                p: ({ children }) => <p className="!text-sm my-2">{children}</p>,
              }}
            >
              {snippets[activeSnippet].content}
            </ReactMarkdown>
            <div className="space-x-2 mt-4">
              <button
                onClick={() => { copyToClipboard(extractCode(snippets[activeSnippet].content)); setActionStatus("copied"); setTimeout(() => setActionStatus(null), 2000); }}
                className="border border-gray-700 rounded-lg transition-all cursor-pointer px-3 py-2  max-w-full text-base duration-150 bg-gray-700 text-gray-300 font-normal shadow-lg hover:bg-gray-800"
              >
                Copy
              </button>
              <button
                onClick={() => {
                  setSourceCode(extractCode(snippets[activeSnippet].content));
                  setActionStatus("replaced");
                  setTimeout(() => setActionStatus(null), 2000);
                }}
                className="border border-gray-700 rounded-lg transition-all cursor-pointer px-3 py-2  max-w-full text-base duration-150 bg-gray-700 text-gray-300 font-normal shadow-lg hover:bg-gray-800"
              >
                Replace
              </button>
            </div>
            {actionStatus && (
              <div className="flex  w-full mt-3">
                <div className=" px-4 py-2 rounded-lg border border-green-400 bg-gray-800 pointer-events-none inline-flex items-center">
                  <span className="text-green-400 text-lg drop-shadow-lg">
                    {actionStatus === "copied"
                      ? "¡Copied Successfully!"
                      : "¡Replaced Successfully!"}
                  </span>
                </div>
              </div>
            )}


          </div>
        </div>
      )}
    </div>
  );
};

export default CodeSnippets;
