import { useEffect, useRef, useState } from "react";
import PaintSidebar from "../components/paintsidebar";
import { processorResponse, processorAction, Frame } from "../types/draw";
import styles from "../styles/drawing.module.css";
import CodeSnippets from "../components/snippets";

const snippetImports = import.meta.glob("../code-snippets/*.md", {
  query: "?raw",
  import: "default",
});

const GRID_SIZE = 32;
const PIXEL_SIZE = 8;
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

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const isOdd = (x + y) % 2 === 0;
        const index = y * GRID_SIZE + x;
        let pixel = isOdd ? [40, 40, 40, 255] : [60, 60, 60, 255]; // dark colors
        if (Frame) pixel = Frame.frame_data[index];
        ctx.fillStyle = `rgba(${pixel[0]}, ${pixel[1]}, ${pixel[2]}, ${
          pixel[3] / 255
        })`;
        ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
      }
    }
  };

  const darkButtonStyle = (active: boolean) => ({
    padding: "0.25rem 0.5rem",
    background: active ? "#444" : "#222",
    color: "#fff",
    border: "1px solid #555",
    borderRadius: "4px",
    cursor: "pointer",
  });

  return (
    <div
      className={styles.container}
      style={{
        background: "#121212",
        color: "#eee",
        minHeight: "100vh",
        padding: "32px", // <-- padding for all content
      }}
    >
      <PaintSidebar />
      <div className={styles.content} style={{ display: "flex", gap: "16px" }}>
        {/* Editor Column */}
        <div
          className={styles.editorColumn}
          style={{ flex: 1, padding: "32px" }}
        >
          <span
            style={{
              color: "#fff",
              fontWeight: "bold",
              fontSize: "32px",
              marginBottom: "16px",
              display: "block",
            }}
          >
            SOURCE
          </span>
          <textarea
            ref={textareaRef}
            id="source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            onKeyDown={handleAlternativeInputs}
            style={{
              width: "100%",
              height: "100%",
              background: "#1e1e1e",
              outline: "none",
              color: "#fff",
              border: "none",
              padding: "32px",
              fontFamily: "monospace",
            }}
          />
        </div>

        {/* Preview + Snippets Column */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {/* Preview */}
          <div
            style={{
              width: "100%",
              padding: "32px",
              background:
                "#1e1e1e" /*REVISAR backgorung color (que sea consistente lolo) */,
              borderRadius: "8px",
            }}
          >
            <span
              style={{
                color: "#fff",
                fontSize: "32px",
                fontWeight: "bold",
                marginBottom: "16px",
                display: "block",
              }}
            >
              PREVIEW
            </span>
            <canvas
              ref={canvasRef}
              width={GRID_SIZE * PIXEL_SIZE}
              height={GRID_SIZE * PIXEL_SIZE}
              style={{
                display: "block",
                border: "1px solid #333",
                marginBottom: "16px",
                width: "100%",
              }}
            />
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={handleRun} style={darkButtonStyle(false)}>
                Run code
              </button>
              <button onClick={handleStep} style={darkButtonStyle(false)}>
                Step
              </button>
              <button onClick={handlePost} style={darkButtonStyle(false)}>
                Post
              </button>
            </div>
          </div>

          {/* Code Snippets */}
          <div style={{ padding: "32px", flex: 1 }}>
            <CodeSnippets snippetImports={snippetImports} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Drawing;
