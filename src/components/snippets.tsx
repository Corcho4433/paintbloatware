import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeSnippetsProps {
  snippetImports: Record<string, () => Promise<string>>;
}

const CodeSnippets = ({ snippetImports }: CodeSnippetsProps) => {
  const [snippets, setSnippets] = useState<{ name: string; content: string }[]>(
    []
  );
  const [activeSnippet, setActiveSnippet] = useState(0);

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
    <div
      style={{
        background: "#1F2937",
        color: "#E0E7FF",
        padding: "1rem",
        borderRadius: "8px",
        width: '100%',
        boxSizing: 'border-box',
        maxWidth: '100%',
      }}
    >
      {/* Buttons */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.5rem",
          marginBottom: "1rem",
          maxWidth: "100%",
          paddingBottom: "0.25rem",
          scrollbarWidth: "thin",
        }}
      >
        {snippets.map((s, i) => (
          <button
            key={i}
            onClick={() => setActiveSnippet(i)}
            style={{
              background: i === activeSnippet ? "#3B82F6" : "#2563EB",
              color: "#fff",
              border: "1px solid #1E40AF",
              borderRadius: "6px",
              cursor: "pointer",
              padding: "0.4rem 0.8rem",
              whiteSpace: "normal",
              flex: "1 1 auto",
              fontSize: "0.95em",
              minWidth: "120px",
              maxWidth: "100%",
              overflow: "visible",
            }}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* Snippet display */}
      {snippets[activeSnippet] && (
        <div style={{ position: "relative" }}>
          <button
            onClick={() => copyToClipboard(snippets[activeSnippet].content)}
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              background: "#374151",
              color: "#E0E7FF",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              padding: "0.3rem 0.6rem",
              fontSize: "0.8rem",
            }}
          >
            Copy
          </button>
          <div
            style={{
              background: "#273349",
              padding: "1rem",
              borderRadius: "6px",
              width: "100%",
              maxWidth: "100%",
              wordBreak: "break-all",
              whiteSpace: "pre-wrap",
            }}
          >
            <ReactMarkdown
              components={{
                code({node, inline, className, children, ...props}) {
                  const match = /language-(\w+)/.exec(className || "");
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={vscDarkPlus}
                      language={match[1]}
                      PreTag="div"
                      customStyle={{
                        margin: 0,
                        background: 'transparent',
                        fontSize: '1em',
                        wordBreak: 'break-all',
                        whiteSpace: 'pre-wrap',
                        width: '100%',
                        maxWidth: '100%',
                        overflowX: 'hidden',
                      }}
                      {...props}
                    >
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  ) : (
                    <code
                      style={{
                        background: '#222',
                        borderRadius: '4px',
                        padding: '0.2em 0.4em',
                        fontSize: '0.95em',
                        wordBreak: 'break-all',
                        whiteSpace: 'pre-wrap',
                        width: '100%',
                        maxWidth: '100%',
                        overflowX: 'hidden',
                      }}
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                h1: ({children}) => <h1 style={{fontSize: '1.5em', fontWeight: 700, margin: '0.5em 0'}}>{children}</h1>,
                h2: ({children}) => <h2 style={{fontSize: '1.2em', fontWeight: 600, margin: '0.5em 0'}}>{children}</h2>,
                h3: ({children}) => <h3 style={{fontSize: '1em', fontWeight: 600, margin: '0.5em 0'}}>{children}</h3>,
                p: ({children}) => <p style={{margin: '0.5em 0'}}>{children}</p>,
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
