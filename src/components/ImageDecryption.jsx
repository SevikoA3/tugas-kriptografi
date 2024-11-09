import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import isLoggedIn from "../utils/loggedIn";
import BackButton from "../features/BackButton";

function ImageDecryption() {
  const navigate = useNavigate();
  useEffect(() => {
    const checkLoggedIn = async () => {
      const loggedIn = await isLoggedIn();
      if (!loggedIn) {
        navigate("/login");
      }
    };
    checkLoggedIn();
  }, [navigate]);

  const [selectedFile, setSelectedFile] = useState(null);
  const [extractedMessage, setExtractedMessage] = useState("");
  const canvasRef = useRef(null);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setExtractedMessage("");
  };

  const handleDecryption = () => {
    if (!selectedFile) {
      alert("Silakan pilih file gambar terenkripsi.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const data = imageData.data;

        const messageBits = [];
        for (let i = 0; i < data.length / 4; i++) {
          const bit = data[i * 4] & 1;
          messageBits.push(bit);
        }

        const extractedMessage = bitsToMessage(messageBits);
        setExtractedMessage(extractedMessage);
      };
      img.onerror = (err) => {
        console.error("Error loading image:", err);
        alert("Terjadi kesalahan saat memuat gambar.");
      };
      img.src = reader.result;
    };
    reader.onerror = (err) => {
      console.error("Error reading file:", err);
      alert("Terjadi kesalahan saat membaca file gambar.");
    };
    reader.readAsDataURL(selectedFile);
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
      if (charCode === 0) {
        break; // Stop at null character
      }

      if (charCode < 32 || charCode > 126) break;
      chars.push(String.fromCharCode(charCode));
    }
    return chars.join("");
  };

  return (
    <div className="flex items-center justify-center min-h-dvh bg-primary-bg text-text-primary">
      <div className="absolute left-2 top-2">
        <BackButton />
      </div>
      <div className="w-full max-w-2xl p-8 bg-secondary-bg rounded-3xl shadow-md mx-10">
        <h2 className="mb-6 text-2xl font-bold text-center">
          Dekripsi Gambar (Steganografi)
        </h2>
        <input
          type="file"
          accept="image/*"
          className="w-full px-4 py-2 mb-4 border border-border-color rounded bg-secondary-bg text-text-primary"
          onChange={handleFileChange}
        />
        <button
          className="w-full px-4 py-2 font-bold text-text-secondary rounded bg-accent-bg hover:bg-accent-hover transition delay-100"
          onClick={handleDecryption}
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
        {/* Canvas tersembunyi untuk pemrosesan gambar */}
        <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
      </div>
    </div>
  );
}

export default ImageDecryption;