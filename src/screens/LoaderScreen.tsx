import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDeviceLayout } from "../hooks/useOrientation";

interface LoaderScreenProps {
  onComplete?: () => void;
}

function isAuthenticated() {
  return !!localStorage.getItem("authToken");
}

const LoaderScreen: React.FC<LoaderScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const navigate = useNavigate();
  const { isMobile, isHorizontal } = useDeviceLayout();

  // Preload background image
  useEffect(() => {
    const img = new window.Image();
    img.src = "/backgrounds/MCLoader-01.webp";
    img.onload = () => setImageLoaded(true);
  }, []);

  // Animate progress over 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 1;
        return next > 100 ? 100 : next;
      });
    }, 600); // 100% over 60 seconds

    return () => clearInterval(interval);
  }, []);

  // Redirect after 60s if image is loaded and progress is 100
  useEffect(() => {
    if (progress === 100 && imageLoaded) {
      const timer = setTimeout(() => {
        navigate(isAuthenticated() ? "/home" : "/auth");
        if (onComplete) onComplete();
      }, 800); // small delay for smoother transition
      return () => clearTimeout(timer);
    }
  }, [progress, imageLoaded, navigate, onComplete]);

  return (
    <div
      className="fixed inset-0 w-full h-full flex items-center justify-center"
      style={{
        backgroundImage: `url('/backgrounds/MCLoader-01.webp')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
        minWidth: "100vw",
      }}
    >
      <div
        className="z-20 text-6xl font-bold rounded-2xl mb-[16px]"
        style={{
          backgroundColor: "#164f5fa3",
          boxShadow: "0 4px 16px rgba(31, 38, 135, 0.3)",
          border: "1px solid rgba(59, 130, 246, 0.5)",
          borderRadius: "2rem",
          width: isMobile && isHorizontal ? "220px" : "320px",
          height: isMobile && isHorizontal ? "140px" : "200px",
          textAlign: "center",
          padding: isMobile && isHorizontal ? "12px" : "24px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          position: "absolute",
          top: "60%",
          left: "60%",
          transform: "translate(-50%, -100%)",
          color: "#0a2240",
        }}
      >
        <div
          className="mb-4"
          style={{
            fontSize: isMobile && isHorizontal ? "0.95rem" : "1.25rem",
            fontWeight: 600,
          }}
        >
          SYSTEM LOADING... {Math.min(progress, 100)}%
        </div>

        <div className="w-full bg-gray-200/30 rounded-full h-2 mt-4">
          <div
            className="bg-white text-xl rounded-full transition-all duration-300"
            style={{ width: `${progress}%`, height: "100%" }}
          />
        </div>
      </div>
    </div>
  );
};

export default LoaderScreen;
