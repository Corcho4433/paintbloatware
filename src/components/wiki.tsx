import { useState, useEffect } from "react";
import { BookOpen, Menu, X } from "lucide-react";
import { lazy } from "react";
const ReactMarkdown = lazy(()=> import("react-markdown"))
import remarkGfm from "remark-gfm";
import dracula from "react-syntax-highlighter/dist/esm/styles/prism/dracula";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import lua from 'react-syntax-highlighter/dist/esm/languages/prism/lua'
SyntaxHighlighter.registerLanguage('lua', lua)
import { useAuthStore } from "../store/useAuthStore";
import { getThemeFromString } from "../utils/theme";
const articleImports = import.meta.glob("../wiki-articles/*.md", {
  query: "?raw",
  import: "default",
});

type WikiSidebarProps = {
  selected: string | null;
  setSelected: (title: string) => void;
  articles: Record<string, string>;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

const WikiSidebar = ({ selected, setSelected, articles, isOpen, setIsOpen }: WikiSidebarProps) => (
  <>
    {/* Overlay for mobile */}
    {isOpen && (
      <div
        className="lg:hidden fixed inset-0 bg-black/50 z-51"
        onClick={() => setIsOpen(false)}
      />
    )}

    {/* Sidebar */}
    <div
      className={`
        fixed lg:static
        top-0 right-0
        h-screen
        w-64 sm:w-72 lg:w-64
        bg-gray-800
        border border-gray-700
        rounded-2xl lg:rounded-2xl
        shadow-xl
        z-52
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        overflow-y-auto
        flex flex-col
        p-6
      `}
    >
      {/* Header */}
      <div className="flex flex-col items-center p-4">
        <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-white mb-2" />
        <h2 className="text-base sm:text-lg font-semibold text-white mb-4 text-center">
          Paintbloatware official wiki
        </h2>
      </div>

      {/* Navigation Items */}
      <div className="space-y-2 flex-1 overflow-y-auto">
        {Object.keys(articles).map((title) => (
          <div
            key={title}
            className={`
              rounded-lg 
              transition-colors 
              cursor-pointer
              ${selected === title
                ? "bg-gray-600 text-white"
                : "hocus:bg-gray-700 text-gray-300"
              }
            `}
            onClick={() => {
              setSelected(title);
              setIsOpen(false); // Close on mobile after selection
            }}
          >
            <span className="flex items-center w-full p-2 sm:p-3">
              <span className="text-sm sm:text-base">{title}</span>
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex flex-col items-center p-4 mt-auto border-t border-gray-700">
        <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-gray-600 mb-2" />
        <h3 className="text-sm sm:text-base text-gray-500 text-center">
          We thank our community for their support! ;)
        </h3>
      </div>
    </div>
  </>
);

const Wiki = () => {
  const [articles, setArticles] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const useAuthTheme = useAuthStore((state) => state.editorTheme);
  const theme = getThemeFromString(useAuthTheme) || dracula;
  const [isOpen, setIsOpen] = useState(false);


  useEffect(() => {
    const loadArticles = async () => {
      const loadedArticles: Record<string, string> = {};
      for (const path in articleImports) {
        const content = await articleImports[path]();
        const filename = path.substring(path.lastIndexOf("/") + 1);
        const title = filename.replace(/\.md$/i, "");
        loadedArticles[title] = content as string;
      }
      setArticles(loadedArticles);
      if (!selected) setSelected(Object.keys(loadedArticles)[0]);
    };
    loadArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="flex gap-3 min-h-screen w-full p-3 !bg-gray-900 rounded-lg shadow-md">

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 right-4 z-53 p-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg hocus:bg-gray-700 transition-colors"
        aria-label="Toggle wiki menu"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Menu className="w-6 h-6 text-white" />
        )}
      </button>


      <div className="hidden lg:block bg-gray-900 rounded-2xl border border-gray-700 shadow-lg w-64 h-screen z-40">
        <WikiSidebar
          selected={selected}
          setSelected={setSelected}
          articles={articles}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
        />
      </div>

      {/* Mobile Sidebar */}
      <div className="lg:hidden">
        <WikiSidebar
          selected={selected}
          setSelected={setSelected}
          articles={articles}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
        />
      </div>

      <div
        className={`
          flex-1 w-full bg-gray-800 rounded-2xl border border-gray-700 p-6 shadow-lg transition-transform duration-500 z-10
          
        `}
      >
        {selected ? (
          <>
            <header className="mb-4">
              <h1 className="text-2xl font-bold text-white">{selected}</h1>
            </header>
            <article className="prose prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-4xl font-bold mb-6 mt-8">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-3xl font-semibold mb-5 mt-7">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-2xl font-semibold mb-4 mt-6">{children}</h3>
                  ),
                  p: ({ children }) => (
                    <p className="whitespace-pre-wrap mb-4">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside mb-4 ml-4">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside mb-4 ml-4">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => <li className="mb-1">{children}</li>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-gray-500 pl-4 italic mb-4">
                      {children}
                    </blockquote>
                  ),
                  // @ts-ignore
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline && match ? (
                      <SyntaxHighlighter
                      // @ts-ignore
                        style={theme}
                        language={match[1]}
                        PreTag="div"
                        className="!bg-gray-900 text-indigo-100 text-base break-all whitespace-pre-wrap w-full max-w-full overflow-x-hidden rounded"
                        customStyle={{ margin: 0 }}
                        codeTagProps={{}}
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
                }}
              >
                {articles[selected]}
              </ReactMarkdown>
            </article>
          </>
        ) : (
          <p className="text-gray-400">Loading articles...</p>
        )}
      </div>
    </section>
  );
};

export default Wiki;
