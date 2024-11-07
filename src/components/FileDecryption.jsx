import React, { useEffect, useState } from "react";
import CryptoJS from "crypto-js";
import { useNavigate } from "react-router-dom";
import isLoggedIn from "../utils/loggedIn";
import Logout from "../features/Logout";
import BackButton from "../features/BackButton";

function FileDecryption() {
  const [encryptedData, setEncryptedData] = useState("");
  const [decryptedBlob, setDecryptedBlob] = useState(null);
  const [fileName, setFileName] = useState("");
  const [secretKey, setSecretKey] = useState("");
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
    setFileName(file.name.replace(".txt", ""));
    const reader = new FileReader();
    reader.onload = () => {
      setEncryptedData(reader.result);
    };
    reader.readAsText(file);
  };

  const handleDecryption = () => {
    if (!encryptedData) {
      alert("Silakan masukkan data terenkripsi.");
      return;
    }

    if (!secretKey) {
      alert("Silakan masukkan kunci rahasia.");
      return;
    }

    try {
      // Extract the encrypted data and the original file extension
      const lastDotIndex = encryptedData.lastIndexOf(".");
      const encryptedText = encryptedData.substring(0, lastDotIndex);
      const fileExtension = encryptedData.substring(lastDotIndex + 1);

      const decrypted = CryptoJS.RC4.decrypt(encryptedText, secretKey);
      const typedArray = convertWordArrayToUint8Array(decrypted);
      const blob = new Blob([typedArray]);
      const url = URL.createObjectURL(blob);
      setDecryptedBlob({ url, extension: fileExtension });
    } catch (error) {
      alert(
        "Gagal mendekripsi file. Pastikan data terenkripsi valid dan kunci yang digunakan benar."
      );
      console.error("Error during file decryption:", error);
    }
  };

  const convertWordArrayToUint8Array = (wordArray) => {
    const words = wordArray.words;
    const sigBytes = wordArray.sigBytes;

    const u8 = new Uint8Array(sigBytes);
    let index = 0;
    for (let i = 0; i < words.length; i++) {
      let word = words[i];
      for (let b = 3; b >= 0; b--) {
        if (index < sigBytes) {
          u8[index++] = (word >> (b * 8)) & 0xff;
        }
      }
    }
    return u8;
  };

  return (
    <div className="h-full">
      <Logout />
      <BackButton />
      <div className="flex flex-col items-center h-full pt-32 p-4 bg-gray-100">
        <h2 className="mb-6 text-2xl font-bold">Dekripsi File</h2>
        <input
          type="text"
          className="w-full max-w-2xl p-4 mb-4 border rounded"
          placeholder="Masukkan Kunci Rahasia"
          value={secretKey}
          onChange={(e) => setSecretKey(e.target.value)}
        />
        <input type="file" className="mb-4" onChange={handleFileChange} />
        <button
          className="px-6 py-2 mb-4 font-bold text-white bg-green-500 rounded hover:bg-green-700"
          onClick={handleDecryption}
        >
          Dekripsi File
        </button>
        {decryptedBlob && (
          <div className="w-full max-w-2xl">
            <h3 className="mb-2 text-xl font-semibold">File Didekripsi:</h3>
            <a
              href={decryptedBlob.url}
              download={`${fileName}.${decryptedBlob.extension}`}
              className="text-blue-500 hover:underline"
            >
              Download File Didekripsi
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default FileDecryption;
