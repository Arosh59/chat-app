import { useState, useRef, useEffect } from "react";
import { Camera, X, Send } from "lucide-react";
import toast from "react-hot-toast";

const CameraCapture = ({ onCapture, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState("user"); // "user" for front camera, "environment" for back

  // Initialize camera
  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsCameraActive(true);
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
        toast.error("Unable to access camera. Please check permissions.");
        onClose();
      }
    };

    initCamera();

    // Cleanup: stop camera stream on unmount
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [facingMode, onClose]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      const imageData = canvasRef.current.toDataURL("image/jpeg");
      setCapturedImage(imageData);
    }
  };

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  const sendPhoto = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="relative w-full max-w-md h-screen sm:h-auto sm:rounded-lg overflow-hidden">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 bg-linear-to-b from-black to-transparent z-10">
          <h3 className="text-white font-semibold">Camera</h3>
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Camera or Preview */}
        {!capturedImage ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            {/* Capture Controls */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-center items-center gap-4 p-4 bg-linear-to-t from-black to-transparent">
              <button
                onClick={toggleCamera}
                className="btn btn-sm btn-circle btn-ghost text-white"
                title="Switch camera"
              >
                🔄
              </button>
              <button
                onClick={capturePhoto}
                className="btn btn-circle btn-primary"
                disabled={!isCameraActive}
              >
                <Camera size={24} />
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Image Preview */}
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full h-full object-cover"
            />
            {/* Preview Controls */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-center items-center gap-4 p-4 bg-linear-to-t from-black to-transparent">
              <button
                onClick={retakePhoto}
                className="btn btn-sm btn-ghost text-white"
              >
                Retake
              </button>
              <button
                onClick={sendPhoto}
                className="btn btn-sm btn-primary gap-2"
              >
                <Send size={18} />
                Send
              </button>
            </div>
          </>
        )}

        {/* Hidden canvas for image capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default CameraCapture;
