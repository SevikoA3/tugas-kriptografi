import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import isLoggedIn from '../utils/loggedIn';
import Logout from '../features/Logout';
import BackButton from '../features/BackButton';

function ImageDecryption() {
  const navigate = useNavigate();
  useEffect(() => {
    const checkLoggedIn = async () => {
      const loggedIn = await isLoggedIn();
      if (!loggedIn) {
        navigate('/login');
      }
    };
    checkLoggedIn();
  }, [navigate]);

  const [selectedFile, setSelectedFile] = useState(null);
  const [extractedMessage, setExtractedMessage] = useState('');
  const canvasRef = useRef(null);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setExtractedMessage('');
  };

  const handleDecryption = () => {
    if (!selectedFile) {
      alert('Silakan pilih file gambar terenkripsi.');
      return;
    }

    const imgSrc = URL.createObjectURL(selectedFile);

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
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
    img.src = imgSrc;
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
    return chars.join('');
  };

  return (
    <div className="h-full">
      <Logout />
      <BackButton />
      <div className="flex flex-col items-center h-full pt-32 p-4 bg-gray-100">
        <h2 className="mb-6 text-2xl font-bold">Dekripsi Gambar (Steganografi)</h2>
        <input
          type="file"
          accept="image/*"
          className="mb-4"
          onChange={handleFileChange}
        />
        <button
          className="px-6 py-2 font-bold text-white bg-green-500 rounded hover:bg-green-700"
          onClick={handleDecryption}
        >
          Dekripsi Gambar
        </button>
        {extractedMessage && (
          <div className="w-full max-w-2xl mt-4">
            <h3 className="mb-2 text-xl font-semibold">Pesan Tersembunyi:</h3>
            <textarea
              className="w-full p-4 border rounded"
              rows="4"
              value={extractedMessage}
              readOnly
            />
          </div>
        )}
        {/* Canvas tersembunyi untuk pemrosesan gambar */}
        <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
      </div>
    </div>
  );
}

export default ImageDecryption;