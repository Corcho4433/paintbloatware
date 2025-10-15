import { useEffect, useRef, useState } from "react";
import PaintSidebar from "../components/paintsidebar";
import { processorResponse, processorAction, Frame } from "../types/draw";
import CodeSnippets from "../components/snippets";

const snippetImports = import.meta.glob("../code-snippets/*.md", {
  query: "?raw",
  import: "default",
});

const INITIAL_FRAME = 1;
const FRAME_RATE = 24;
const MS_TIME = (1 / FRAME_RATE) * 1000;
const FIXED_CANVAS_SIZE = 512;
const INITIAL_GRID_SIZE = 64;

const example_text = `local max = ${INITIAL_GRID_SIZE - 1}
for x = 0, max do
    for y = 0, max do
      grid:set_pixel(x, y, math.max(255 - (255/${INITIAL_GRID_SIZE}) * x, 0), 0, 0)
    end
end\n`;

const Drawing = () => {
  // states
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [source, setSource] = useState(example_text);
  const [isRunning, setIsRunning] = useState(false);
  const [gridSize, setGridSize] = useState(INITIAL_GRID_SIZE);

  // refs
  const fullFrameAnimation = useRef<Map<number, Frame>>(new Map());
  const currentFrame = useRef(INITIAL_FRAME);
  const animationInterval = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sourceRef = useRef(source);
  const dimensionRef = useRef(gridSize);

  // Redibuja automáticamente cuando cambia gridSize
  const sendUpdatedSource = () => {
    setIsRunning(true);
    if (ws && ws.readyState === WebSocket.OPEN)
      ws.send(
        JSON.stringify({
          action: processorAction.ProcessSourceCode,
          data: { source: sourceRef.current, dimension: dimensionRef.current },
        })
      );
    else console.warn("WebSocket not connected.");
  };

  useEffect(() => {
    sourceRef.current = source;
    dimensionRef.current = gridSize;
  }, [source, gridSize]);

  useEffect(() => {
    drawFrame(fullFrameAnimation.current.get(currentFrame.current) as Frame);
  }, [gridSize]);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080/ws");
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
        sessionStorage.setItem("post_source_code", source);
        window.location.href = `/upload`;
      }
    };

    drawFrame();
    setWs(socket);

    return () => {
      socket.close();
      stopAnimation();
    };
  }, []);

  useEffect(() => {
    setInterval(() => {
      sendUpdatedSource();
    }, 1000);

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
      setSource(editedSource);
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
      drawFrame(fullFrameAnimation.current.get(currentFrame.current) as Frame);
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
          data: { source },
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
    drawFrame(); // This will draw without a Frame, using the checkerboard pattern

    // Optional: Automatically request new data from the server with the new grid size
    // sendUpdatedSource();
  }, [gridSize]);

  const drawFrame = (Frame?: Frame) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const currentSize = dimensionRef.current;
    const pixelSize = FIXED_CANVAS_SIZE / currentSize; // recalculamos cada vez

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < currentSize; y++) {
      for (let x = 0; x < currentSize; x++) {
        const isOdd = (x + y) % 2 === 0;
        const index = y * currentSize + x;
        let pixel = isOdd ? [40, 40, 40, 255] : [60, 60, 60, 255];
        if (Frame) pixel = Frame.frame_data[index];

        if (pixel == undefined) {
          console.log(x, y, " is undef", Frame?.frame_data);
          pixel = [0, 0, 0, 255];
        }

        ctx.fillStyle = `rgba(${pixel[0]}, ${pixel[1]}, ${pixel[2]}, ${
          pixel[3] / 255
        })`;

        ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
      }
    }
  };

  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen flex">
      <PaintSidebar />
      <div className="flex flex-1 gap-6 p-6">
        {/* Editor Column */}
        <div className="flex-1 flex flex-col bg-gray-800 rounded-lg border border-gray-700">
          <div className="mx-6 mt-6">
            <h2 className="text-2xl font-bold text-white mb-2">Source Code</h2>
            <p className="text-gray-400 text-sm">Write your Lua code here</p>
          </div>
          <div className="flex-1 bg-gray-900 m-6 rounded-lg overflow-hidden">
            <textarea
              ref={textareaRef}
              id="source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              onKeyDown={handleAlternativeInputs}
              className="w-full h-full bg-transparent outline-none text-gray-100 border-none p-6 font-mono text-sm resize-none placeholder-gray-500"
              placeholder="Enter your Lua code here..."
            />
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

          {/* Code Snippets */}
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
