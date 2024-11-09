import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import isLoggedIn from "../utils/loggedIn";
import BackButton from "../features/BackButton";

function ImageEncryption() {
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
  const [message, setMessage] = useState("");
  const [encryptedImage, setEncryptedImage] = useState(null);
  const canvasRef = useRef(null);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setEncryptedImage(null);
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

        // Convert message to bits
        const messageBits = messageToBits(message);

        // Encode message length in first 32 bits
        const messageLengthBits = intToBits(messageBits.length, 32);

        // Combine length bits and message bits
        const totalBits = messageLengthBits.concat(messageBits);

        // Collect indices of opaque pixels
        const opaquePixelIndices = [];
        for (let i = 0; i < data.length / 4; i++) {
          if (data[i * 4 + 3] !== 0) {
            opaquePixelIndices.push(i);
          }
        }

        // Check if the image can hold the message
        if (totalBits.length > opaquePixelIndices.length) {
          alert(
            "Pesan terlalu panjang untuk disembunyikan dalam gambar yang dipilih."
          );
          return;
        }

        // Hide bits in the LSB of red channel of opaque pixels
        for (let i = 0; i < totalBits.length; i++) {
          const pixelIndex = opaquePixelIndices[i];
          data[pixelIndex * 4] = (data[pixelIndex * 4] & ~1) | totalBits[i];
        }

        ctx.putImageData(imageData, 0, 0);

        // Get the encrypted image URL
        const encryptedImageURL = canvas.toDataURL();
        setEncryptedImage(encryptedImageURL);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(selectedFile);
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
      <div className="w-full max-w-2xl p-8 bg-secondary-bg rounded-3xl shadow-md mx-10">
        <h2 className="mb-6 text-2xl font-bold text-center">
          Enkripsi Gambar (Steganografi)
        </h2>
        <input
          type="file"
          accept="image/*"
          className="w-full px-4 py-2 mb-4 border border-border-color rounded bg-secondary-bg text-text-primary"
          onChange={handleFileChange}
        />
        <textarea
          placeholder="Masukkan pesan untuk disembunyikan"
          className="w-full px-4 py-2 mb-4 border border-border-color rounded bg-secondary-bg text-text-primary"
          rows="4"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          className="w-full px-4 py-2 font-bold text-text-secondary rounded bg-accent-bg hover:bg-accent-hover transition delay-100"
          onClick={handleEncryption}
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
              download="encrypted.png"
              className="inline-block px-4 py-2 font-bold text-text-secondary rounded bg-accent-bg hover:bg-accent-hover transition delay-100"
            >
              Download Gambar Terenkripsi
            </a>
          </div>
        )}
        {/* Hidden canvas for image processing */}
        <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
      </div>
    </div>
  );
}

export default ImageEncryption;