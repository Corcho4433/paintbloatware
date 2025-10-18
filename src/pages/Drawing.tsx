import { useEffect, useRef, useState, useCallback } from "react";
import PaintSidebar from "../components/paintsidebar";
import { processorResponse, processorAction, Frame } from "../types/draw";
import CodeSnippets from "../components/snippets";
import { useAuthStore } from "../store/useAuthStore";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { getAvailableThemes, getThemeFromString } from "../utils/theme";

const snippetImports = import.meta.glob("../code-snippets/*.md", {
  query: "?raw",
  import: "default",
});

const ROUTE = "/render";
const ADDRESS = `ws://localhost:8080${ROUTE}`;
const INITIAL_FRAME = 1;
const FRAME_RATE = 12; // Reduced from 24 to 12 FPS for less CPU usage
const MS_TIME = (1 / FRAME_RATE) * 1000;
const FIXED_CANVAS_SIZE = 512;

const themes = getAvailableThemes();


const Drawing = () => {
  // Get theme from auth store
  const editorTheme = useAuthStore((state) => state.editorTheme);
  const setEditorTheme = useAuthStore((state) => state.setEditorTheme );

  // Get grid size from auth store
  const gridSize = useAuthStore((state) => state.gridSize);
  const setGridSize = useAuthStore((state) => state.setGridSize);


  // Source code from auth store
  const rawSourceCode = useAuthStore((state) => state.sourceCode);
  const setSourceCode = useAuthStore((state) => state.setSourceCode);
  const example_text = `local size = ${gridSize}\n...`;

  const sourceCode = rawSourceCode || example_text;
  // states
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  

  // refs
  const fullFrameAnimation = useRef<Map<number, Frame>>(new Map());
  const currentFrame = useRef(INITIAL_FRAME);
  const animationInterval = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sourceRef = useRef(sourceCode);
  const dimensionRef = useRef(gridSize);

  // Redibuja automáticamente cuando cambia gridSize
  const sendUpdatedSource = () => {
    setIsRunning(true);
    if (ws && ws.readyState === WebSocket.OPEN)
      ws.send(
        JSON.stringify({
          action: processorAction.ProcessSourceCode,
          data: { source: sourceRef.current, dimension: gridSize },
        })
      );
    else console.warn("WebSocket not connected.");
  };

  const firstDivRef = useRef<HTMLPreElement | null>(null);
  const secondDivRef = useRef<HTMLTextAreaElement | null>(null);
  const syntaxRef = useRef<HTMLDivElement | null>(null);

  const handleScroll = (
    scrollingRef: React.RefObject<HTMLElement | null>,
    targetRef: React.RefObject<HTMLElement | null>
  ) => {
    if (scrollingRef.current && targetRef.current) {

      targetRef.current.scrollTop = scrollingRef.current.scrollTop;
      targetRef.current.scrollLeft = scrollingRef.current.scrollLeft;
    }
  };

  const handlePreScroll = () => {
    console.debug('[ScrollSync] handlePreScroll triggered');
    handleScroll(firstDivRef, secondDivRef);
  };
  const handleTextAreaScroll = () => {
    console.debug('[ScrollSync] handleTextAreaScroll triggered');
    handleScroll(secondDivRef, firstDivRef);
  };

  useEffect(() => {
    // Use MutationObserver to detect when <pre> is rendered
    let observer: MutationObserver | null = null;
    let cleanupPre: HTMLPreElement | null = null;
    if (syntaxRef.current) {
      const tryAttach = () => {
        const pre = syntaxRef.current!.querySelector("pre");
        if (pre) {
          console.debug('[ScrollSync] <pre> found and event listener attached:', pre);
          firstDivRef.current = pre;
          pre.addEventListener("scroll", handlePreScroll);
          cleanupPre = pre;
          return true;
        }
        return false;
      };
      if (!tryAttach()) {
        observer = new MutationObserver(() => {
          if (tryAttach() && observer) {
            observer.disconnect();
            observer = null;
          }
        });
        observer.observe(syntaxRef.current, { childList: true, subtree: true });
        console.debug('[ScrollSync] MutationObserver set up to watch for <pre>');
      }
    } else {
      console.debug('[ScrollSync] syntaxRef.current is null');
    }

    return () => {
      if (observer) {
        observer.disconnect();
        observer = null;
        console.debug('[ScrollSync] MutationObserver disconnected');
      }
      if (cleanupPre) {
        console.debug('[ScrollSync] Cleaning up scroll event listener from <pre>');
        cleanupPre.removeEventListener("scroll", handlePreScroll);
      }
    };
  }, []);

  // Debounced source update to prevent excessive re-renders
  const handleSourceChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newSource = e.target.value;
    setSourceCode(newSource);
    sourceRef.current = newSource;
  }, []);

  // Sync scroll between textarea and syntax highlighter


  useEffect(() => {
    dimensionRef.current = gridSize;
  }, [gridSize]);

  useEffect(() => {
    // Only redraw if we have frames, otherwise wait for new data
    if (fullFrameAnimation.current.size > 0) {
      drawFrame(fullFrameAnimation.current.get(currentFrame.current) as Frame, gridSize);
    } else {
      drawFrame(undefined, gridSize); // Draw empty checkerboard
    }
  }, [gridSize]);

  useEffect(() => {
    const socket = new WebSocket(ADDRESS);
    socket.onopen = () => {
      console.log("Connected to server");
    };

    socket.onerror = (error) => {
      console.error("WebSocket Connection Error:", error);
    };

    socket.onmessage = (event) => {
      const newData = JSON.parse(event.data) as processorResponse;

      if (newData.action === "FrameData") {
        console.log(newData.data.frame);
        saveFrame(newData.data.frame);
      } else if (newData.action === "Error")
        console.error("Error:", newData.data.error);
      else if (newData.action === "UploadSuccess") {
        sessionStorage.setItem("post_bucket_url", newData.data.urlBucket);
        sessionStorage.setItem("post_source_code", sourceRef.current);
        window.location.href = `/upload`;
      }
    };

    drawFrame(undefined, gridSize);
    setWs(socket);

    return () => {
      socket.close();
      stopAnimation();
    };
  }, []); // Empty dependency array - only run once

  useEffect(() => {
    if (isRunning) startAnimation();
    else stopAnimation();
    return () => stopAnimation();
  }, [isRunning]);

  const startAnimation = () => {
    stopAnimation();
    animationInterval.current = setInterval(nextFrame, MS_TIME);
  };

  const stopAnimation = () => {
    if (animationInterval.current) {
      clearInterval(animationInterval.current);
      animationInterval.current = null;
    }
  };

  const handleAlternativeInputs = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentValue = textarea.value;
      const editedSource =
        currentValue.substring(0, start) + "    " + currentValue.substring(end);
      setSourceCode(editedSource);
      setTimeout(() => {
        if (textareaRef.current) {
          const newPos = start + 4;
          textareaRef.current.selectionStart = newPos;
          textareaRef.current.selectionEnd = newPos;
        }
      }, 0);
    }
  };

  const saveFrame = (frame: Frame) => {
    if (frame.frame_id === INITIAL_FRAME) fullFrameAnimation.current.clear();
    fullFrameAnimation.current.set(frame.frame_id, frame);
  };

  const nextFrame = () => {
    if (fullFrameAnimation.current.size > 0) {
      currentFrame.current++;
      if (currentFrame.current > fullFrameAnimation.current.size)
        currentFrame.current = INITIAL_FRAME;
      if (!fullFrameAnimation.current.has(currentFrame.current)) return;

      // Use requestAnimationFrame for smoother rendering
      requestAnimationFrame(() => {
        drawFrame(fullFrameAnimation.current.get(currentFrame.current) as Frame, dimensionRef.current);
      });
    }
  };

  const handleStep = () => {
    setIsRunning(false);
    nextFrame();
  };

  const handlePost = () => {
    if (ws && ws.readyState === WebSocket.OPEN)
      ws.send(
        JSON.stringify({
          action: processorAction.PostToBucket,
          data: { source: sourceRef.current, dimension: gridSize },
        })
      );
    else console.warn("WebSocket not connected.");
  };

  // Redibuja y limpia la animación cuando cambia gridSize
  useEffect(() => {
    // Clear the stored animation frames
    fullFrameAnimation.current.clear();
    currentFrame.current = INITIAL_FRAME;

    // Redraw an empty canvas (or a default grid)
    drawFrame(undefined, gridSize); // This will draw without a Frame, using the checkerboard pattern

    // Optional: Automatically request new data from the server with the new grid size
    // sendUpdatedSource();
  }, [gridSize]);

  const drawFrame = (Frame?: Frame, size: number = gridSize) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const currentSize = size;

    // Detect the actual frame data size if we have frame data
    let frameDataSize = currentSize;
    if (Frame && Frame.frame_data) {
      frameDataSize = Math.sqrt(Frame.frame_data.length);
    }

    // Use the frame data size for rendering if we have frame data, otherwise use requested size
    const renderSize = Frame ? frameDataSize : currentSize;
    const renderPixelSize = FIXED_CANVAS_SIZE / renderSize;

    // Use ImageData for much faster rendering
    const imageData = ctx.createImageData(FIXED_CANVAS_SIZE, FIXED_CANVAS_SIZE);
    const data = imageData.data;

    for (let y = 0; y < renderSize; y++) {
      for (let x = 0; x < renderSize; x++) {
        const index = y * renderSize + x;
        const isOdd = (x + y) % 2 === 0;
        let pixel = isOdd ? [40, 40, 40, 255] : [60, 60, 60, 255];

        if (Frame && Frame.frame_data[index]) {
          pixel = Frame.frame_data[index];
        }

        // Calculate exact pixel boundaries
        // Use Math.round to ensure we cover all pixels without gaps
        const startX = Math.round(x * renderPixelSize);
        const startY = Math.round(y * renderPixelSize);
        const endX = Math.round((x + 1) * renderPixelSize);
        const endY = Math.round((y + 1) * renderPixelSize);

        // Fill the pixel block
        for (let canvasY = startY; canvasY < endY && canvasY < FIXED_CANVAS_SIZE; canvasY++) {
          for (let canvasX = startX; canvasX < endX && canvasX < FIXED_CANVAS_SIZE; canvasX++) {
            const pixelIndex = (canvasY * FIXED_CANVAS_SIZE + canvasX) * 4;

            data[pixelIndex] = pixel[0];     // R
            data[pixelIndex + 1] = pixel[1]; // G
            data[pixelIndex + 2] = pixel[2]; // B
            data[pixelIndex + 3] = pixel[3]; // A
          }
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
  };

  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen flex">
      <PaintSidebar />
      <div className="flex flex-1 gap-6 p-6">
        {/* Editor Column */}
        <div className="flex flex-col w-full">
          <div className="flex-row flex gap-3 mb-3 w-full">
            <div className="flex-1 flex flex-col bg-gray-800 rounded-lg border border-gray-700">
              <div className="mx-6 mt-6">
                <h2 className="text-2xl font-bold text-white mb-2">Source Code</h2>
                <p className="text-gray-400 text-sm">Write your Lua code here</p>
              </div>
              <div className="flex-1 bg-gray-900 m-6 rounded-lg relative overflow-hidden">
                {/* Theme selector */}
                <div className="absolute top-2 right-2 z-10">
                  <select
                    value={editorTheme}
                    onChange={(e) => setEditorTheme(e.target.value)}
                    className="bg-gray-700 text-white text-xs px-2 py-1 rounded border border-gray-600 hover:bg-gray-600 focus:outline-none focus:border-blue-500"
                  >
                    {themes.map((themeName) => (
                      <option key={themeName} value={themeName}>
                        {themeName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Shared scrollable container */}
                <div className="absolute inset-0 overflow-hidden w-full h-full">
                  {/* Syntax highlighted background */}
                  <div ref={syntaxRef} className="*:h-full h-full absolute top-0 left-0 w-full pointer-events-none">
                    <SyntaxHighlighter
                      language="lua"
                      style={ getThemeFromString(editorTheme) }
                      customStyle={{
                        margin: 0,
                        padding: '1.5rem',
                        background: 'transparent',
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
                      {sourceRef.current || ' '}
                    </SyntaxHighlighter>
                  </div>

                  {/* Transparent textarea overlay */}
                  <textarea
                    ref={el => {
                      textareaRef.current = el;
                      secondDivRef.current = el;
                    }}
                    onScroll={handleTextAreaScroll}
                    id="source"
                    value={sourceRef.current}
                    onChange={handleSourceChange}
                    onKeyDown={handleAlternativeInputs}
                    className=" relative w-full bg-transparent outline-none text-transparent  caret-white border-none resize-none placeholder-gray-500 whitespace-pre"
                    placeholder="Enter your Lua code here..."
                    spellCheck={false}
                    style={{
                      caretColor: 'white',
                      padding: '1.5rem',
                      fontSize: '0.875rem',
                      lineHeight: '1.5',
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                      minHeight: '100%',
                    }}
                  />
                </div>
              </div>
            </div>
            {/* Preview + Snippets Column */}
            <div className="flex flex-1 flex-col gap-6">
              {/* Preview Section */}
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Preview</h2>
                  <p className="text-gray-400 text-sm">
                    Live preview of your animation
                  </p>
                </div>

                <div className="bg-gray-900 rounded-lg p-6 mb-6 flex justify-center items-center">
                  <canvas
                    ref={canvasRef}
                    width={FIXED_CANVAS_SIZE}
                    height={FIXED_CANVAS_SIZE}
                    className="border-2 border-gray-600 rounded-lg shadow-lg [image-rendering:pixelated]"
                  />
                </div>

                {/* Controls */}
                <div className="flex flex-wrap gap-3 items-center justify-between">
                  <div className="flex gap-2">
                    <button
                      onClick={sendUpdatedSource}
                      className="px-4 py-2 rounded-lg border border-green-600 bg-green-600 text-white hover:bg-green-700 transition-all duration-200 font-medium shadow-sm"
                    >
                      Run
                    </button>
                    <button
                      onClick={handleStep}
                      className="px-4 py-2 rounded-lg border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm"
                    >
                      Step
                    </button>
                    <button
                      onClick={handlePost}
                      className="px-4 py-2 rounded-lg border border-purple-600 bg-purple-600 text-white hover:bg-purple-700 transition-all duration-200 font-medium shadow-sm"
                    >
                      Post
                    </button>
                  </div>

                  <div className="flex items-center gap-3 bg-gray-700 rounded-lg px-3 py-2">
                    <label className="text-gray-300 text-sm font-medium">
                      Grid Size:
                    </label>
                    <input
                      type="number"
                      value={gridSize}
                      min={1}
                      max={512}
                      onChange={(e) =>
                        setGridSize(
                          Math.min(Math.max(parseInt(e.target.value) || 0, 0), 512)
                        )
                      }
                      className="px-3 py-1 rounded-md border border-gray-600 bg-gray-800 text-white hover:bg-gray-700 focus:bg-gray-700 focus:border-blue-500 transition-all duration-200 w-20 text-sm"
                    />
                  </div>
                </div>
              </div>


            </div>
          </div>
          <div className="flex-1 bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-white mb-2">
                Code Snippets
              </h2>
              <p className="text-gray-400 text-sm">
                Ready-to-use code examples
              </p>
            </div>
            <CodeSnippets snippetImports={snippetImports} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Drawing;
