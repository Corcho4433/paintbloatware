import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

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
      }}
    >
      {/* Buttons */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
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
              overflowX: "auto",
            }}
          >
            <ReactMarkdown>{snippets[activeSnippet].content}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeSnippets;
