import { useRef, useEffect } from "react";

// ...existing code...

type DrawImageProps = {
  image_json: number[][] | string;
};

export const DrawImage = ({ image_json }: DrawImageProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    console.log("Drawing image on canvas", image_json);
    if (image_json && canvasRef.current) {
      // Parse the JSON if it's a string
      const arr: number[][] = typeof image_json === "string"
        ? JSON.parse(image_json)
        : image_json as number[][];
      console.log("Parsed image_json", arr);

      // Set canvas size to 512x512 for the images
      canvasRef.current.width = 512;
      canvasRef.current.height = 512;

      // Assuming arr is a 2D array: [height][width][4]
      // Support both [height][width][4] and flat [[r,g,b,a], ...] formats
      let height = 0;
      let width = 0;
      let getPixel: (y: number, x: number) => number[];

      if (
        Array.isArray(arr[0]) &&
        Array.isArray((arr[0] as any)[0]) &&
        typeof (arr[0] as any)[0][0] === "number"
      ) {
        // [height][width][4] format
        height = arr.length;
        width = (arr[0] as number[]).length;
        getPixel = (y, x) => ((arr[y] as unknown as number[][])[x]) as number[];
      } else if (
        Array.isArray(arr[0]) &&
        typeof (arr[0] as any)[0] === "number" &&
        arr[0].length === 4
      ) {
        // Flat [[r,g,b,a], ...] format, assume square image
        height = width = Math.sqrt(arr.length);
        if (!Number.isInteger(height)) {
          console.error("Image array length is not a perfect square");
          return;
        }
        getPixel = (y, x) => arr[y * width + x];
      } else {
        // Unknown format
        console.error("Unknown image format");
        return;
      }

      const ctx = canvasRef.current.getContext("2d");
      if (!ctx || width === 0 || height === 0) return;

      // Flatten the 2D array to a 1D Uint8ClampedArray
      const flat = new Uint8ClampedArray(width * height * 4);
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          const [r, g, b, a] = getPixel(y, x);
          flat[idx] = r;
          flat[idx + 1] = g;
          flat[idx + 2] = b;
          flat[idx + 3] = a;
        }
      }

      // Create ImageData
      const imageData = new ImageData(flat, width, height);

      // If the image is smaller than 512x512, center it on the canvas
      const offsetX = Math.floor((512 - width) / 2);
      const offsetY = Math.floor((512 - height) / 2);

      // Clear and fill background with white
      ctx.clearRect(0, 0, 512, 512);
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, 512, 512);

      // Put image data at the calculated offset
      ctx.putImageData(imageData, offsetX, offsetY);
    }
  }, [image_json]);

  return <canvas ref={canvasRef} />;
};