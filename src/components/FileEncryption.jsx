import React, { useEffect, useState } from "react";
import CryptoJS from "crypto-js";
import { useNavigate } from "react-router-dom";
import isLoggedIn from "../utils/loggedIn";
import Logout from "../features/Logout";
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
    link.download = `${fileName.split('.')[0]}.txt`;
    link.click();
  };

  return (
    <div className="h-full">
      <Logout />
      <BackButton />
      <div className="flex flex-col items-center h-full pt-32 p-4 bg-gray-100">
        <h2 className="mb-6 text-2xl font-bold">Enkripsi File</h2>
        <input type="file" className="mb-4" onChange={handleFileChange} />
        <input
          type="text"
          placeholder="Masukkan Kunci Rahasia"
          className="w-full max-w-2xl p-4 mb-4 border rounded"
          value={secretKey}
          onChange={(e) => setSecretKey(e.target.value)}
        />
        <button
          className="px-6 py-2 mb-4 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
          onClick={handleEncryption}
        >
          Enkripsi File
        </button>
        {encryptedData && (
          <div className="w-full max-w-2xl">
            <h3 className="mb-2 text-xl font-semibold">Data Terenkripsi:</h3>
            <textarea
              className="w-full p-4 border rounded"
              rows="6"
              value={encryptedData}
              readOnly
            />
            <div className="flex flex-col w-full items-center">
              <button
                className="px-6 py-2 mt-4 font-bold text-white bg-green-500 rounded hover:bg-green-700"
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