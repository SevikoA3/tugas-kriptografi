import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import isLoggedIn from "../utils/loggedIn";
import BackButton from "../features/BackButton";

function ImageDecryption() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [extractedMessage, setExtractedMessage] = useState("");
  const canvasRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const isCancelledRef = useRef(false);

  useEffect(() => {
    const checkLoggedIn = async () => {
      const loggedIn = await isLoggedIn();
      if (!loggedIn) {
        navigate("/login");
      }
    };
    checkLoggedIn();
  }, [navigate]);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setExtractedMessage("");
  };

  const handleDecryption = () => {
    if (!selectedFile) {
      alert("Silakan pilih file gambar terenkripsi.");
      return;
    }

    setIsLoading(true);
    isCancelledRef.current = false;

    const reader = new FileReader();
    reader.onload = () => {
      if (isCancelledRef.current) {
        setIsLoading(false);
        return;
      }
      const img = new Image();
      img.onload = () => {
        if (isCancelledRef.current) {
          setIsLoading(false);
          return;
        }
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const data = imageData.data;

        const opaquePixelIndices = [];
        for (let i = 0; i < data.length / 4; i++) {
          if (data[i * 4 + 3] !== 0) {
            opaquePixelIndices.push(i);
          }
        }

        let lengthBits = [];
        for (let i = 0; i < 32; i++) {
          const pixelIndex = opaquePixelIndices[i];
          const bit = data[pixelIndex * 4] & 1;
          lengthBits.push(bit);
        }
        const messageLength = bitsToInt(lengthBits);

        const messageBits = [];
        for (let i = 32; i < 32 + messageLength; i++) {
          const pixelIndex = opaquePixelIndices[i];
          const bit = data[pixelIndex * 4] & 1;
          messageBits.push(bit);
        }

        const extractedMessage = bitsToMessage(messageBits);
        if (!isCancelledRef.current) {
          setExtractedMessage(extractedMessage);
        }
        setIsLoading(false);
      };
      img.onerror = (err) => {
        console.error("Error loading image:", err);
        alert("Terjadi kesalahan saat memuat gambar.");
        setIsLoading(false);
      };
      img.src = reader.result;
    };
    reader.onerror = (err) => {
      console.error("Error reading file:", err);
      alert("Terjadi kesalahan saat membaca file gambar.");
      setIsLoading(false);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleCancel = () => {
    isCancelledRef.current = true;
    setIsLoading(false);
  };

  const bitsToInt = (bits) => {
    let num = 0;
    for (let i = 0; i < bits.length; i++) {
      num = (num << 1) | bits[i];
    }
    return num;
  };

  const bitsToMessage = (bits) => {
    let chars = [];
    for (let i = 0; i < bits.length; i += 8) {
      let charCode = 0;
      for (let bit = 0; bit < 8; bit++) {
        if (i + bit < bits.length) {
          charCode = (charCode << 1) | bits[i + bit];
        }
      }
      chars.push(String.fromCharCode(charCode));
    }
    return chars.join("");
  };

  return (
    <div className="flex items-center justify-center min-h-dvh bg-primary-bg text-text-primary">
      <div className="absolute left-2 top-2">
        <BackButton />
      </div>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="flex flex-col justify-center bg-secondary-bg p-6 shadow-md text-center rounded-2xl">
            <div className="loader mx-auto">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-text-primary">Proses sedang berjalan...</p>
            </div>
            <div>
              <button
                className="mt-4 px-4 py-2 font-bold text-text-secondary rounded bg-accent-bg hover:bg-accent-hover"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="w-full max-w-2xl p-8 bg-secondary-bg rounded-3xl shadow-md mx-10 relative">
        <h2 className="mb-6 text-2xl font-bold text-center">
          Dekripsi Gambar (Steganografi)
        </h2>
        <input
          type="file"
          accept="image/*"
          className="w-full px-4 py-2 mb-4 border border-border-color rounded bg-secondary-bg text-text-primary"
          onChange={handleFileChange}
          disabled={isLoading}
        />
        <button
          className="w-full px-4 py-2 font-bold text-text-secondary rounded bg-accent-bg hover:bg-accent-hover transition delay-100"
          onClick={handleDecryption}
          disabled={isLoading}
        >
          Dekripsi Gambar
        </button>
        {extractedMessage && (
          <div className="w-full mt-6">
            <h3 className="mb-2 text-xl font-semibold">Pesan Tersembunyi:</h3>
            <textarea
              className="w-full p-4 border border-border-color rounded bg-secondary-bg text-text-primary"
              rows="4"
              value={extractedMessage}
              readOnly
            />
          </div>
        )}
        {/* Hidden canvas for image processing */}
        <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
      </div>
    </div>
  );
}

export default ImageDecryption;