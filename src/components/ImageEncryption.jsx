import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import isLoggedIn from '../utils/loggedIn';
import Logout from '../features/Logout';
import BackButton from '../features/BackButton';

function ImageEncryption() {
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
  const [message, setMessage] = useState('');
  const [encryptedImage, setEncryptedImage] = useState(null);
  const canvasRef = useRef(null);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setEncryptedImage(null);
  };

  const handleEncryption = () => {
    if (!selectedFile) {
      alert('Silakan pilih file gambar.');
      return;
    }
    if (!message) {
      alert('Silakan masukkan pesan untuk disembunyikan.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const data = imageData.data;

        // Konversi pesan menjadi bit
        const messageBits = messageToBits(message);

        // Cek apakah gambar cukup untuk menampung pesan
        if (messageBits.length > data.length / 4) {
          alert('Pesan terlalu panjang untuk disembunyikan dalam gambar yang dipilih.');
          return;
        }

        // Sembunyikan pesan dalam data gambar
        for (let i = 0; i < messageBits.length; i++) {
          data[i * 4] = (data[i * 4] & ~1) | messageBits[i]; // Modifikasi LSB kanal merah
        }

        ctx.putImageData(imageData, 0, 0);

        // Dapatkan URL gambar terenkripsi
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

  return (
    <div className="h-full">
      <Logout />
      <BackButton />
      <div className="flex flex-col items-center h-full pt-32 p-4 bg-gray-100">
        <h2 className="mb-6 text-2xl font-bold">Enkripsi Gambar (Steganografi)</h2>
        <input
          type="file"
          accept="image/*"
          className="mb-4"
          onChange={handleFileChange}
        />
        <textarea
          placeholder="Masukkan pesan untuk disembunyikan"
          className="w-full max-w-2xl p-4 mb-4 border rounded"
          rows="4"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          className="px-6 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
          onClick={handleEncryption}
        >
          Enkripsi Gambar
        </button>
        {encryptedImage && (
          <div className="mt-4">
            <h3 className="mb-2 text-xl font-semibold">Gambar Terenkripsi:</h3>
            <img src={encryptedImage} alt="Gambar terenkripsi" className="max-h-56" />
            <a
              href={encryptedImage}
              download="encrypted.png"
              className="mt-4 text-blue-500 hover:underline"
            >
              Download Gambar Terenkripsi
            </a>
          </div>
        )}
        {/* Canvas tersembunyi untuk pemrosesan gambar */}
        <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
      </div>
    </div>
  );
}

export default ImageEncryption;