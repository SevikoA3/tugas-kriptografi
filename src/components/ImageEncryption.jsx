import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import isLoggedIn from "../utils/loggedIn";
import BackButton from "../features/BackButton";

function ImageEncryption() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState("");
  const [encryptedImage, setEncryptedImage] = useState(null);
  const [outputFileName, setOutputFileName] = useState("encrypted.png");
  const canvasRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const isCancelledRef = useRef(false);
  const [encryptionExplanation, setEncryptionExplanation] = useState("");

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
    const file = e.target.files[0];
    setSelectedFile(file);
    setEncryptedImage(null);

    if (file) {
      // Always set output file name to "encrypted.png"
      setOutputFileName("encrypted.png");
    }
  };

  const handleEncryption = () => {
    if (!selectedFile) {
      alert("Silakan pilih file gambar.");
      return;
    }
    if (!message) {
      alert("Silakan masukkan pesan untuk disembunyikan.");
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

        const messageBits = messageToBits(message);
        const messageLengthBits = intToBits(messageBits.length, 32);
        const totalBits = messageLengthBits.concat(messageBits);

        const opaquePixelIndices = [];
        for (let i = 0; i < data.length / 4; i++) {
          if (data[i * 4 + 3] !== 0) {
            opaquePixelIndices.push(i);
          }
        }

        if (totalBits.length > opaquePixelIndices.length) {
          alert(
            "Pesan terlalu panjang untuk disembunyikan dalam gambar yang dipilih."
          );
          setIsLoading(false);
          return;
        }

        for (let i = 0; i < totalBits.length; i++) {
          const pixelIndex = opaquePixelIndices[i];
          data[pixelIndex * 4] = (data[pixelIndex * 4] & ~1) | totalBits[i];
        }

        ctx.putImageData(imageData, 0, 0);

        // Always save as PNG to preserve data integrity
        const mimeType = "image/png";
        const encryptedImageURL = canvas.toDataURL(mimeType);

        // After successfully embedding the message
        if (!isCancelledRef.current) {
          setEncryptedImage(encryptedImageURL);
          setEncryptionExplanation("Pesan telah disembunyikan ke dalam gambar menggunakan teknik steganografi dengan metode LSB (Least Significant Bit). Setiap bit pesan disisipkan ke dalam bit paling tidak signifikan dari piksel gambar.");
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

  const messageToBits = (message) => {
    const messageBits = [];
    for (let i = 0; i < message.length; i++) {
      const charCode = message.charCodeAt(i);
      for (let bit = 7; bit >= 0; bit--) {
        messageBits.push((charCode >> bit) & 1);
      }
    }
    return messageBits;
  };

  const intToBits = (num, bits) => {
    const result = [];
    for (let i = bits - 1; i >= 0; i--) {
      result.push((num >> i) & 1);
    }
    return result;
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
      <div className="w-full max-w-2xl p-8 bg-secondary-bg rounded-3xl shadow-md mx-5 relative">
        <h2 className="mb-6 text-2xl font-bold text-center">
          Enkripsi Gambar (Steganografi)
        </h2>
        <input
          type="file"
          accept="image/*"
          className="w-full px-4 py-2 mb-4 border border-border-color rounded bg-secondary-bg text-text-primary"
          onChange={handleFileChange}
          disabled={isLoading}
        />
        <textarea
          placeholder="Masukkan pesan untuk disembunyikan"
          className="w-full px-4 py-2 mb-4 border border-border-color rounded bg-secondary-bg text-text-primary"
          rows="4"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={isLoading}
        />
        <button
          className="w-full px-4 py-2 font-bold text-text-secondary rounded bg-accent-bg hover:bg-accent-hover transition delay-100"
          onClick={handleEncryption}
          disabled={isLoading}
        >
          Enkripsi Gambar
        </button>
        {encryptedImage && (
          <div className="mt-6 text-center">
            <h3 className="mb-4 text-xl font-semibold">Gambar Terenkripsi:</h3>
            <img
              src={encryptedImage}
              alt="Gambar terenkripsi"
              className="max-h-56 mx-auto mb-4 rounded border border-border-color"
            />
            <a
              href={encryptedImage}
              download={outputFileName}
              className="inline-block px-4 py-2 font-bold text-text-secondary rounded bg-accent-bg hover:bg-accent-hover transition delay-100"
            >
              Download Gambar Terenkripsi
            </a>
            {encryptionExplanation && (
              <div className="mt-4">
                <h3 className="mb-4 text-xl font-semibold">Penjelasan Enkripsi:</h3>
                <p className="text-justify">{encryptionExplanation}</p>
              </div>
            )}
          </div>
        )}
        {/* Hidden canvas for image processing */}
        <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
      </div>
    </div>
  );
}

export default ImageEncryption;