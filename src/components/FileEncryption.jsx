import React, { useEffect, useState, useRef } from "react";
import CryptoJS from "crypto-js";
import { useNavigate } from "react-router-dom";
import isLoggedIn from "../utils/loggedIn";
import BackButton from "../features/BackButton";

function FileEncryption() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [encryptedData, setEncryptedData] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [fileName, setFileName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const isCancelledRef = useRef(false);
  const navigate = useNavigate();
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
    setFileName(file.name);
    setEncryptedData("");
  };

  const handleEncryption = () => {
    if (!selectedFile) {
      alert("Silakan pilih file terlebih dahulu.");
      return;
    }

    if (!secretKey) {
      alert("Silakan masukkan kunci rahasia.");
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
      const wordArray = CryptoJS.lib.WordArray.create(reader.result);
      const encrypted = CryptoJS.RC4.encrypt(wordArray, secretKey).toString();

      // Menggabungkan data terenkripsi dengan ekstensi file asli
      const fileExtension = selectedFile.name.split(".").pop();
      const outputData = `${encrypted}.${fileExtension}`;

      if (!isCancelledRef.current) {
        setEncryptedData(outputData);
        setEncryptionExplanation(
          "File telah dienkripsi menggunakan algoritma RC4. Data file dienkripsi dengan kunci rahasia dan disimpan dalam format teks."
        );
      }
      setIsLoading(false);
    };
    reader.onerror = (error) => {
      console.error("Error reading file:", error);
      alert("Terjadi kesalahan saat membaca file.");
      setIsLoading(false);
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleDownload = () => {
    const blob = new Blob([encryptedData], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName.split(".")[0]}.txt`;
    link.click();
  };

  const handleCancel = () => {
    isCancelledRef.current = true;
    setIsLoading(false);
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
        <h2 className="mb-6 text-2xl font-bold text-center">Enkripsi File</h2>
        <input
          type="file"
          className="w-full px-4 py-2 mb-4 border border-border-color rounded bg-secondary-bg text-text-primary"
          onChange={handleFileChange}
          disabled={isLoading}
        />
        <input
          type="text"
          placeholder="Masukkan Kunci Rahasia"
          className="w-full px-4 py-2 mb-4 border border-border-color rounded bg-secondary-bg text-text-primary"
          value={secretKey}
          onChange={(e) => setSecretKey(e.target.value)}
          disabled={isLoading}
        />
        <button
          className="w-full px-4 py-2 font-bold text-text-secondary rounded bg-accent-bg hover:bg-accent-hover transition delay-100 mb-4"
          onClick={handleEncryption}
          disabled={isLoading}
        >
          Enkripsi File
        </button>
        {encryptedData && (
          <div className="w-full">
            <h3 className="mb-2 text-xl font-semibold">Data Terenkripsi:</h3>
            <textarea
              className="w-full p-4 mb-4 border border-border-color rounded bg-secondary-bg text-text-primary"
              rows="6"
              value={encryptedData}
              readOnly
            />
            <div className="flex flex-col items-center">
              <button
                className="w-full px-4 py-2 font-bold text-text-secondary rounded bg-accent-bg hover:bg-accent-hover transition delay-100"
                onClick={handleDownload}
              >
                Download Encrypted Data as TXT
              </button>
            </div>
            {encryptionExplanation && (
              <div className="mt-4">
                <h3 className="mb-2 text-xl font-semibold">Penjelasan Enkripsi:</h3>
                <p className="text-justify">{encryptionExplanation}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default FileEncryption;