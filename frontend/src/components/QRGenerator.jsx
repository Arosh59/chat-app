import { useState } from "react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const QRGenerator = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/communities/qr/generate");
      setData(res.data);
    } catch (error) {
      toast.error("Failed to generate QR data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <button className="btn" onClick={handleGenerate} disabled={loading}>
        {loading ? "Generating..." : "Generate QR / Share Link"}
      </button>

      {data && (
        <div className="mt-4">
          <p className="font-medium">Share URL</p>
          <div className="break-all bg-base-200 p-2 rounded mt-2">{data.shareUrl}</div>

          <p className="font-medium mt-3">Payload</p>
          <textarea className="w-full h-32 mt-2 p-2" value={JSON.stringify(data.payload, null, 2)} readOnly />
        </div>
      )}
    </div>
  );
};

export default QRGenerator;
