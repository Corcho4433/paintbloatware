
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import {getThemeFromString} from "../utils/theme";
import { useAuthStore } from "../store/useAuthStore";

interface CodeSnippetsProps {
  snippetImports: Record<string, () => Promise<string>>;
}

const CodeSnippets = ({ snippetImports }: CodeSnippetsProps) => {
  const [snippets, setSnippets] = useState<{ name: string; content: string }[]>(
    []
  );
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
    <div className="bg-gray-800 text-indigo-100 p-4 rounded-lg w-full max-w-full">
      {/* Buttons */}
      <div className="flex flex-wrap gap-2 mb-4 max-w-full pb-1 overflow-x-auto scrollbar-thin">
        {snippets.map((s, i) => (
          <button
            key={i}
            onClick={() => setActiveSnippet(i)}
            className={`border border-blue-900 rounded-md cursor-pointer px-3 py-2 min-w-[120px] max-w-full text-base font-medium transition-colors duration-150 ${i === activeSnippet ? 'bg-blue-500' : 'bg-blue-700'} text-white`}
            style={{ whiteSpace: 'normal', overflow: 'visible' }}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* Snippet display */}
      {snippets[activeSnippet] && (
        <div className="relative">
          <button
            onClick={() => copyToClipboard(snippets[activeSnippet].content)}
            className="absolute top-2 right-2 bg-gray-700 text-indigo-100 border-none rounded px-2 py-1 text-xs cursor-pointer"
          >
            Copy
          </button>
          <div className="bg-gray-900 p-4 w-full max-w-full break-all whitespace-pre-wrap">
            <ReactMarkdown
              components={{
                code({node, inline, className, children, ...props}) {
                  const match = /language-(\w+)/.exec(className || "");
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={theme}
                      language={match[1]}
                      PreTag="div"
                      className="!bg-gray-800 text-indigo-100 text-base break-all whitespace-pre-wrap w-full max-w-full overflow-x-hidden rounded"
                      customStyle={{ margin: 0 }}
                      codeTagProps={{ }}
                      {...props}
                    >
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  ) : (
                    <code
                      className="bg-gray-900 rounded-xl px-1 py-0.5 text-base break-all whitespace-pre-wrap w-full max-w-full overflow-x-hidden"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                h1: ({children}) => <h1 className="!text-lg font-bold my-2">{children}</h1>,
                p: ({children}) => <p className="!text-sm my-2">{children}</p>,
              }}
            >
              {snippets[activeSnippet].content}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeSnippets;
