import { useState, useEffect } from "react";
import { Sidebar, SidebarItem, SidebarItemGroup } from "flowbite-react";
import { BookOpen } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
const articleImports = import.meta.glob("../wiki-articles/*.md", {
  query: "?raw",
  import: "default",
});

type WikiSidebarProps = {
  selected: string | null;
  setSelected: (title: string) => void;
  articles: Record<string, string>;
  animateSidebar: boolean;
};

const WikiSidebar = ({ selected, setSelected, articles, animateSidebar }: WikiSidebarProps) => (
  <div
    className={`
      transition-transform duration-600 ease-in-out
      ${animateSidebar ? "translate-x-0" : "-translate-x-full"}
    `}
  >
    <Sidebar className="[&>div]:!bg-gray-800 w-64 h-screen rounded-r-2xl z-40 shadow-xl !bg-gray-800">
      <div className="flex flex-col items-center p-4">
        <BookOpen className="w-10 h-10 text-white mb-2" />
        <h2 className="text-lg font-semibold text-white mb-4 text-center">
          Paintbloat official wiki
        </h2>
      </div>
      <SidebarItemGroup className="space-y-2 bg-gray-800">
        {Object.keys(articles).map((title) => (
          <SidebarItem
            key={title}
            className={`!hover:bg-gray-600 rounded-lg transition-colors ${
              selected === title ? "!bg-gray-600 text-white" : ""
            }`}
            onClick={() => setSelected(title)}
          >
            <span className="flex items-center w-full p-2 cursor-pointer">
              <span className="text-sm md:text-base">{title}</span>
            </span>
          </SidebarItem>
        ))}
      </SidebarItemGroup>
      <div className="flex flex-col items-center p-4">
        <BookOpen className="w-10 h-10 text-gray-800 mb-2" />
        <h3 className="text-lg text-gray-700 mb-4 text-center">
          We thank our community for their support! ; )
        </h3>
      </div>
    </Sidebar>
  </div>
);

const Wiki = () => {
  const [articles, setArticles] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [animateSidebar, setAnimateSidebar] = useState(false);
  const [animateContent, setAnimateContent] = useState(false);

  useEffect(() => {
    setAnimateSidebar(true);
    const timeout = setTimeout(() => setAnimateContent(true), 300);
    return () => clearTimeout(timeout);
  }, []);

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
    <section className="flex gap-6 min-h-screen w-full p-6 !bg-gray-800 rounded-lg shadow-md">
      <WikiSidebar
        selected={selected}
        setSelected={setSelected}
        articles={articles}
        animateSidebar={animateSidebar}
      />
      <div
        className={`
          flex-1 text-gray-200 transition-transform duration-500 z-10
          ${
            animateContent
              ? "translate-x-0 opacity-100"
              : "translate-x-full opacity-0"
          }
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
