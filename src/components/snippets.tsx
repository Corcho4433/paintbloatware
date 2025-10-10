import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

// Props for the component
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
      const loaded: { name: string; content: string }[] = [];

      for (const key of keys) {
        const module = await snippetImports[key]();
        const name = key.split("/").pop()?.replace(".md", "") || "Snippet";
        loaded.push({ name, content: module as string });
      }

      setSnippets(loaded);
    };

    loadSnippets();
  }, [snippetImports]);

  const buttonStyle = (active: boolean) => ({
    padding: "0.25rem 0.5rem",
    background: active ? "#3b82f6" : "#60a5fa",
    color: "#fff",
    border: "1px solid #2563eb",
    borderRadius: "4px",
    cursor: "pointer",
  });

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
      }}
    >
      

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
        {snippets.map((s, idx) => (
          <button
            key={idx}
            onClick={() => setActiveSnippet(idx)}
            style={buttonStyle(idx === activeSnippet)}
          >
            {s.name}
          </button>
        ))}
      </div>

      {snippets[activeSnippet] && (
        <div
          style={{
            background: "#bfdbfe",
            padding: "0.5rem",
            borderRadius: "4px",
            flex: 1,
            overflowY: "auto",
            color: "#1e3a8a",
          }}
        >
          <ReactMarkdown>{snippets[activeSnippet].content}</ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default CodeSnippets;
