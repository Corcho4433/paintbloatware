import { useState } from "react";
import fetchWithRefresh from "../hooks/authorization";

const NitroPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetchWithRefresh("/api/subscribe", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          plan: "PAINT_NITRO",
          amount: 15, 
          email: "test_user_1844090774305363860@testuser.com" 
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error.message || "Error al crear la suscripción");
      }

      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        throw new Error("No se recibió init_point del backend");
      }
    } catch (err: any) {
      setError(err.message || "Ocurrió un error inesperado");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center gap-6">
      <h1 className="text-3xl font-bold text-purple-400">Paint Nitro</h1>
      <p className="text-gray-400">Suscribite por $15/mes para acceder a funciones premium.</p>
      <button
        onClick={handleSubscribe}
        disabled={loading}
        className="px-5 py-3 bg-purple-500 rounded-lg text-white font-semibold hover:bg-purple-600 transition disabled:opacity-50"
      >
        {loading ? "Creando suscripción..." : "Suscribirme"}
      </button>
      {error && <p className="text-red-400 mt-2">{error}</p>}
    </div>
  );
};

export default NitroPage;