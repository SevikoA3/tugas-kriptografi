import React, { useEffect, useState } from "react";
import CryptoJS from "crypto-js";
import { useNavigate } from "react-router-dom";
import isLoggedIn from "../utils/loggedIn";
import BackButton from "../features/BackButton";

function FileEncryption() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [encryptedData, setEncryptedData] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [fileName, setFileName] = useState("");
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

    const reader = new FileReader();
    reader.onload = () => {
      const wordArray = CryptoJS.lib.WordArray.create(reader.result);
      const encrypted = CryptoJS.RC4.encrypt(wordArray, secretKey).toString();

      // Combine encrypted data with the original file extension
      const fileExtension = selectedFile.name.split(".").pop();
      const outputData = `${encrypted}.${fileExtension}`;

      setEncryptedData(outputData);
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

  return (
    <div className="flex items-center justify-center min-h-dvh bg-primary-bg text-text-primary">
      <div className="absolute left-2 top-2">
        <BackButton />
      </div>
      <div className="w-full max-w-2xl p-8 bg-secondary-bg rounded-3xl shadow-md  mx-10">
        <h2 className="mb-6 text-2xl font-bold text-center">Enkripsi File</h2>
        <input
          type="file"
          className="w-full px-4 py-2 mb-4 border border-border-color rounded bg-secondary-bg text-text-primary"
          onChange={handleFileChange}
        />
        <input
          type="text"
          placeholder="Masukkan Kunci Rahasia"
          className="w-full px-4 py-2 mb-4 border border-border-color rounded bg-secondary-bg text-text-primary"
          value={secretKey}
          onChange={(e) => setSecretKey(e.target.value)}
        />
        <button
          className="w-full px-4 py-2 font-bold text-text-secondary rounded bg-accent-bg hover:bg-accent-hover transition delay-100 mb-4"
          onClick={handleEncryption}
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
          </div>
        )}
      </div>
    </div>
  );
}

export default FileEncryption;
