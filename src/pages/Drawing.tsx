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

const example_text = `local max = 31
for x = 0, max do
    for y = 0, max do
      grid:set_pixel(x, y, 0, 255 - x*8, y*8)
    end
end\n`;

const Drawing = () => {
  const fullFrameAnimation = useRef<Map<number, Frame>>(new Map());
  const currentFrame = useRef(INITIAL_FRAME);
  const animationInterval = useRef<NodeJS.Timeout | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [source, setSource] = useState(example_text);
  const [isRunning, setIsRunning] = useState(false);

  const [gridSize, setGridSize] = useState(32);
  const FIXED_CANVAS_SIZE = 512;

  // Redibuja automáticamente cuando cambia gridSize
  useEffect(() => {
    drawFrame(fullFrameAnimation.current.get(currentFrame.current) as Frame);
  }, [gridSize]);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080/ws");
    socket.onopen = () => console.log("Connected to server");
    socket.onerror = (error) =>
      console.error("WebSocket Connection Error:", error);
    socket.onmessage = (event) => {
      const newData = JSON.parse(event.data) as processorResponse;

      if (newData.action === "FrameData") saveFrame(newData.data.frame);
      else if (newData.action === "Error")
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

  const handleRun = () => {
    setIsRunning(true);
    if (ws && ws.readyState === WebSocket.OPEN)
      ws.send(
        JSON.stringify({
          action: processorAction.ProcessSourceCode,
          data: { source },
        })
      );
    else console.warn("WebSocket not connected.");
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

  const drawFrame = (Frame?: Frame) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pixelSize = FIXED_CANVAS_SIZE / gridSize; // recalculamos cada vez

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const isOdd = (x + y) % 2 === 0;
        const index = y * gridSize + x;
        let pixel = isOdd ? [40, 40, 40, 255] : [60, 60, 60, 255];
        if (Frame) pixel = Frame.frame_data[index];
        ctx.fillStyle = `rgba(${pixel[0]}, ${pixel[1]}, ${pixel[2]}, ${
          pixel[3] / 255
        })`;
        ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
      }
    }
  };

  return (
    <div className="bg-[#121212] text-[#eee] min-h-screen flex">
      <PaintSidebar />
      <div className="flex flex-1 gap-4">
        {/* Editor Column */}
        <div className="flex-1 p-8">
          <span className="text-white font-bold text-3xl mb-4 block">
            SOURCE
          </span>
          <textarea
            ref={textareaRef}
            id="source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            onKeyDown={handleAlternativeInputs}
            className="w-full h-full bg-[#1e1e1e] outline-none text-white border-none p-8 font-mono resize-none"
          />
        </div>

        {/* Preview + Snippets Column */}
        <div className="flex flex-1 flex-col gap-4">
          {/* Preview */}
          <div className="w-full p-8 bg-[#1e1e1e] rounded-lg overflow-auto">
            <span className="text-white text-3xl font-bold mb-4 block">
              PREVIEW
            </span>
            <div className="w-full p-8 rounded-lg flex justify-center items-center">
              <canvas
                ref={canvasRef}
                width={FIXED_CANVAS_SIZE}
                height={FIXED_CANVAS_SIZE}
                className="border border-[#333] [image-rendering:pixelated]"
              />
            </div>

            <div className="flex gap-2 items-center">
              <button
                onClick={handleRun}
                className="px-2 py-1 rounded border border-gray-600 bg-gray-800 text-white hover:bg-gray-700 transition-colors cursor-pointer"
              >
                Run code
              </button>
              <button
                onClick={handleStep}
                className="px-2 py-1 rounded border border-gray-600 bg-gray-800 text-white hover:bg-gray-700 transition-colors cursor-pointer"
              >
                Step
              </button>
              <button
                onClick={handlePost}
                className="px-2 py-1 rounded border border-gray-600 bg-gray-800 text-white hover:bg-gray-700 transition-colors cursor-pointer"
              >
                Post
              </button>

              <label className="text-white ml-auto flex items-center gap-2">
                Grid Size:
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
                  className="px-2 py-1 rounded border border-gray-600 bg-gray-800 text-white hover:bg-gray-700 transition-colors cursor-text w-20"
                />
              </label>
            </div>
          </div>

          {/* Code Snippets */}
          <div className="p-8 flex-1">
            <CodeSnippets snippetImports={snippetImports} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Drawing;
