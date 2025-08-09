
const HomeDraw = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-4xl font-bold mb-4">Welcome to Home Draw</h2>
      <canvas className="border border-gray-300 rounded-lg w-full max-w-md h-96 bg-white"></canvas>
      <p className="text-lg">This is a placeholder for the home draw component.</p>
    </div>
  );
}

export default HomeDraw;