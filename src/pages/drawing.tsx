import { useEffect, useRef, useState } from 'react';
import PaintSidebar from '../components/paintsidebar';
const GRID_SIZE = 32;
const PIXEL_SIZE = 8;
const INITIAL_FRAME = 1;
const FRAME_RATE = 60;


const MS_TIME = (1/FRAME_RATE) * 10000;

type Frame = {
    frame_id: number;
    frame_data: number[][];
}


const Drawing = () => {
    const fullFrameAnimation: Map<number, Frame> = new Map();
    let currentFrame = INITIAL_FRAME;
    let currentInterval: number = 0;
    let isRunning = true;
    
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [ws, setWs] = useState<WebSocket | null>(null);
    const [source, setSource] = useState("");

    // Establece conexión WebSocket
    useEffect(() => {
        const socket = new WebSocket('ws://localhost:8080/ws'); // Cambiar por tu URL

        socket.onopen = () => {
            console.log('Connected to server');
        };

        socket.onerror = (error) => {
            console.error('WebSocket Connection Error:', error);
        };

        socket.onmessage = (event) => {
            const newData = JSON.parse(event.data);

            saveFrame(newData);
        };

        setWs(socket);

        return () => {
            socket.close();
        };
    }, []);


    const drawFrameAnimation = () => {
        if (fullFrameAnimation.size <= 0) return; 
        if (!isRunning) return;

        console.log("Is running?", isRunning);

        nextFrame();
    }

    useEffect(() => {
        currentInterval = setInterval(drawFrameAnimation, MS_TIME);
    })

    const togglePause = () => {
        if (currentInterval) {
            clearInterval(currentInterval);
        }

        isRunning = false;
        console.log("Paused", isRunning);
    }

    const saveFrame = (frame: Frame) => {
        if (frame.frame_id == INITIAL_FRAME) {
            fullFrameAnimation.clear();
        }

        fullFrameAnimation.set(frame.frame_id, frame);
    }

    const nextFrame = () => {
        if (fullFrameAnimation.size > 0) {
            currentFrame++;

            if (currentFrame > fullFrameAnimation.size) {
                currentFrame = INITIAL_FRAME;
            }

            if (!fullFrameAnimation.has(currentFrame)) return;
            drawFrame(fullFrameAnimation.get(currentFrame) as Frame);
        }
    }

    const drawFrame = (Frame: Frame) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                const index = y * GRID_SIZE + x;
                const pixel = Frame.frame_data[index];

                const r = pixel[0];
                const g = pixel[1];
                const b = pixel[2];
                const a = pixel[3] / 255;

                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
                ctx.fillRect(
                    x * PIXEL_SIZE,
                    y * PIXEL_SIZE,
                    PIXEL_SIZE,
                    PIXEL_SIZE
                );
            }
        }
    };

    const handleRun = () => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(source);
        } else {
            console.warn("WebSocket no está conectado.");
        }
    };

    return (
        <div className="flex">
        
            <PaintSidebar />
            <div className="flex-1 min-h-screen bg-gray-900">
            <div className='flex flex-col items-center'>

                 <canvas
                id="gridCanvas"
                ref={canvasRef}
                width={GRID_SIZE * PIXEL_SIZE}
                height={GRID_SIZE * PIXEL_SIZE}
                className='border-2 border-gray-700 rounded-lg mb-4 bg-gradient-to-br from-gray-900 to-black w-[512px] h-[512px]'
            />

            <textarea
                id="source"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className='bg-gray-800 rounded-lg p-2 mb-4'
                style={{
                    width: '500px',
                    height: '200px',
                    display: 'block',
                    marginBottom: '1rem',
                }}
            />

                <button id="run" onClick={handleRun}>
                    Run code
                </button>

                <button id="step" onClick={nextFrame}>
                    Step (+1)
                </button>
                </div>
            </div>
        </div>
    );

}

export default Drawing;