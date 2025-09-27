import { useEffect, useRef, useState } from 'react';
import PaintSidebar from '../components/paintsidebar';
import { processorResponse, processorAction, Frame } from '../types/draw';
import styles from '../styles/drawing.module.css';

const GRID_SIZE = 32;
const PIXEL_SIZE = 8;
const INITIAL_FRAME = 1;
const FRAME_RATE = 24;

const MS_TIME = (1 / FRAME_RATE) * 1000; // Fixed: should be 1000, not 10000
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

  // WebSocket connection
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
        saveFrame(newData.data.frame);
      } else if (newData.action === "Error") {
        console.error("Error:", newData.data.error);
      } else if (newData.action === "UploadSuccess") {
        const urlToUpload = newData.data.urlBucket;
        sessionStorage.setItem("post_bucket_url", urlToUpload);
        sessionStorage.setItem("post_source_code", source);
        window.location.href = `/upload`;
      }
    };

    drawFrame();
    setWs(socket);

    return () => {
      socket.close();
      stopAnimation(); // Clean up interval on unmount
    };
  }, []);

  // Fix: Proper interval management
  useEffect(() => {
    if (isRunning) {
      startAnimation();
    } else {
      stopAnimation();
    }

    return () => {
      stopAnimation();
    };
  }, [isRunning]);

  const startAnimation = () => {
    stopAnimation(); // Clear any existing interval
    animationInterval.current = setInterval(nextFrame, MS_TIME);
  };

  const stopAnimation = () => {
    if (animationInterval.current) {
      clearInterval(animationInterval.current);
      animationInterval.current = null;
    }
  };

  const handleAlternativeInputs = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();

      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentValue = textarea.value;

      const editedSource = currentValue.substring(0, start) + '    ' + currentValue.substring(end);
      
      setSource(editedSource);

      // Fix: Use setTimeout to ensure DOM is updated
      setTimeout(() => {
        if (textareaRef.current) {
          const newPos = start + 4; // Fixed: 4 spaces for tab
          textareaRef.current.selectionStart = newPos;
          textareaRef.current.selectionEnd = newPos;
        }
      }, 0);
    }
  };

  const saveFrame = (frame: Frame) => {
    if (frame.frame_id === INITIAL_FRAME) {
      fullFrameAnimation.current.clear();
    }

    fullFrameAnimation.current.set(frame.frame_id, frame);
  };

  const nextFrame = () => {
    if (fullFrameAnimation.current.size > 0) {
      currentFrame.current++;

      if (currentFrame.current > fullFrameAnimation.current.size) {
        currentFrame.current = INITIAL_FRAME;
      }
      
      console.log("current frame: ", currentFrame.current);

      if (!fullFrameAnimation.current.has(currentFrame.current)) return;
      drawFrame(fullFrameAnimation.current.get(currentFrame.current) as Frame);
    }
  };

  const handleRun = () => {
    setIsRunning(true); // Start animation when running code
    if (ws && ws.readyState === WebSocket.OPEN) {
      const packet = {
        action: processorAction.ProcessSourceCode,
        data: {
          source: source,
        },
      };

      ws.send(JSON.stringify(packet));
    } else {
      console.warn("WebSocket no está conectado.");
    }
  };

  const handleStep = () => {
    setIsRunning(false); // Stop automatic animation
    nextFrame(); // Manual step
  };

  const handlePost = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      const packet = {
        action: processorAction.PostToBucket,
        data: {
          source: source,
        },
      };

      ws.send(JSON.stringify(packet));
    } else {
      console.warn("WebSocket no está conectado.");
    }
  };

  const drawFrame = (Frame?: Frame) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const isOdd = (x + y) % 2 == 0;

        const index = y * GRID_SIZE + x;
        let pixel = isOdd ? [128, 128, 128, 255] : [180, 180, 180, 255];
        if (Frame) {
          pixel = Frame.frame_data[index];
        }

        const r = pixel[0];
        const g = pixel[1];
        const b = pixel[2];

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${ pixel[3] / 255})`;
        ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
      }
    }
  };

  return (
    <div className={styles.container}>
      <PaintSidebar />
      <div className={styles.content}>
        <div className={styles.canvasContainer}>
          <div className={styles.previewContainer}>
            <a className={styles.sectionTitle}>PREVIEW</a>
            <canvas
              id="gridCanvas"
              ref={canvasRef}     
              width={GRID_SIZE * PIXEL_SIZE}
              height={GRID_SIZE * PIXEL_SIZE}
              className={styles.canvas}
            />

            <div className={styles.buttonsContainer}>
              <button id="run" onClick={handleRun} className={styles.runButton}>
                Run code
              </button>

              <button id="step" onClick={handleStep} className={styles.stepButton}>
                Step
              </button>

              <button id="Post" onClick={handlePost} className={styles.postButton}>
                Post
              </button>
            </div>
          </div>

          <div className={styles.editorContainer}>
            <a className={styles.sectionTitle}>SOURCE</a>
            <textarea
              ref={textareaRef}
              id="source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              onKeyDown={handleAlternativeInputs}
              className={styles.textarea}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Drawing;