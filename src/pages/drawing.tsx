import { useEffect, useRef, useState } from 'react';

const GRID_SIZE = 32;
const PIXEL_SIZE = 8;

const Drawing = () => {

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
            console.error('WebSocket Error:', error);
        };

        socket.onmessage = (event) => {
            const newData = JSON.parse(event.data);
            drawGrid(newData);
        };

        setWs(socket);

        return () => {
            socket.close();
        };
    }, []);

    const drawGrid = (gridData: number[][]) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                const index = y * GRID_SIZE + x;
                const pixel = gridData[index];

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
        <div style={{ padding: '1rem' }}>
            <canvas
                id="gridCanvas"
                ref={canvasRef}
                width={GRID_SIZE * PIXEL_SIZE}
                height={GRID_SIZE * PIXEL_SIZE}
                style={{
                    border: '1px solid #000',
                    imageRendering: 'pixelated',
                    display: 'block',
                    marginBottom: '1rem',
                }}
            />

            <textarea
                id="source"
                value={source}
                onChange={(e) => setSource(e.target.value)}
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
        </div>
    );

}

export default Drawing;