import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import isLoggedIn from "../utils/loggedIn";
import BackButton from "../features/BackButton";
import { db } from "../utils/connect_db";
import { addDoc, collection } from "firebase/firestore";

const uploadToHistories = async (data) => {
  const session = JSON.parse(localStorage.getItem("session"));
  const historiesCollection = collection(db, "histories");
  await addDoc(historiesCollection, {
    username: session.username,
    ...data,
    timestamp: new Date()
  });
};

const caesarCipherEncrypt = (text, shift) => {
  shift = shift % 26;
  return text.replace(/[a-zA-Z]/g, (char) => {
    const base = char >= 'a' && char <= 'z' ? 97 : 65;
    return String.fromCharCode(((char.charCodeAt(0) - base + shift) % 26) + base);
  });
};

const vigenereCipherEncrypt = (text, key) => {
  let result = "";
  key = key.replace(/[^a-zA-Z]/g, "").toUpperCase();
  let keyIndex = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (/[a-zA-Z]/.test(char)) {
      const base = char >= "a" && char <= "z" ? 97 : 65;
      const keyChar = key[keyIndex++ % key.length];
      const shift = keyChar.charCodeAt(0) - 65;
      const encryptedChar = String.fromCharCode(
        ((char.charCodeAt(0) - base + shift) % 26) + base
      );
      result += encryptedChar;
    } else {
      result += char;
    }
  }
  return result;
};

const atbashCipherEncrypt = (text) => {
  return text.replace(/[a-zA-Z]/g, (char) => {
    const base = char >= "a" && char <= "z" ? 97 : 65;
    return String.fromCharCode(base + (25 - (char.charCodeAt(0) - base)));
  });
};

const superEncrypt = (text, key) => {
  const normalizedKey = key.replace(/\s+/g, "").toUpperCase();
  const superShift = normalizedKey.length % 26;
  let encrypted = caesarCipherEncrypt(text, superShift);
  encrypted = vigenereCipherEncrypt(encrypted, normalizedKey);
  encrypted = atbashCipherEncrypt(encrypted);
  return {
    encrypted,
    explanation: `Super Enkripsi menerapkan Caesar Cipher dengan pergeseran ${superShift}, kemudian Vigenère Cipher dengan kunci '${normalizedKey}', dan akhirnya Atbash Cipher pada teks.`,
  };
};

function TextEncryption() {
  const [plainText, setPlainText] = useState("");
  const [encryptedText, setEncryptedText] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [cipherMethod, setCipherMethod] = useState("superEncryption");
  const [encryptionExplanation, setEncryptionExplanation] = useState("");
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

  const handleEncryption = async () => {
    if (cipherMethod !== "atbashCipher" && !secretKey) {
      alert("Silakan masukkan kunci rahasia yang sesuai.");
      return;
    }

    if (!plainText) {
      alert("Silakan masukkan teks untuk dienkripsi.");
      return;
    }

    let encrypted = "";
    let explanation = "";

    switch (cipherMethod) {
      case "caesarCipher":
        if (!/^\d+$/.test(secretKey)) {
          alert("Kunci untuk Caesar Cipher harus berupa angka positif.");
          return;
        }
        let shiftValue = parseInt(secretKey, 10);
        if (shiftValue <= 0) {
          alert("Kunci harus berupa angka positif lebih dari 0.");
          return;
        }
        explanation = `Caesar Cipher menggeser setiap huruf dalam teks kembali sebesar ${shiftValue} mod 26 = ${shiftValue % 26} posisi untuk mendapatkan teks enkripsi.`;
        shiftValue = shiftValue % 26;
        encrypted = caesarCipherEncrypt(plainText, shiftValue);
        break;
      case "vigenereCipher":
        if (!/^[A-Za-z\s]+$/.test(secretKey)) {
          alert("Kunci Vigenère hanya boleh mengandung huruf alfabet.");
          return;
        }
        let key = secretKey.replace(/\s+/g, "");
        encrypted = vigenereCipherEncrypt(plainText, key);

        const keyExplanation = Array.from(key).map((char) => {
          const charCode = char.charCodeAt(0);
          if (/[A-Za-z]/.test(char)) {
            return charCode >= 97 && charCode <= 122 ? charCode - 97 : charCode - 65;
          }
          return '';
        }).filter(Boolean).join(", ");
        explanation = `Vigenère Cipher menggunakan kunci "${key}" diubah menjadi ${keyExplanation} untuk menggeser huruf. Jika kunci lebih pendek dari teks, kunci akan diulang untuk setiap karakter.`;

        break;
      case "atbashCipher":
        encrypted = atbashCipherEncrypt(plainText);
        const exampleText = plainText.slice(0, 5); // Ambil 5 karakter pertama untuk contoh
        const exampleEncryption = Array.from(exampleText)
          .map((char) => {
            if (char === " ") return "spasi";
            return `${char} menjadi ${atbashCipherEncrypt(char)}`;
          }).join(", ");
        explanation = `Atbash Cipher adalah algoritma substitusi sederhana yang memetakan setiap huruf ke huruf yang berlawanan dalam alfabet. Misalnya, ${exampleEncryption}, dan seterusnya.`;
        break;
      case "superEncryption":
        if (/[^a-zA-Z]/.test(secretKey.replace(/\s+/g, ""))) {
          alert("Kunci hanya boleh mengandung huruf alfabet (a-z, A-Z).");
          return;
        }
        ({ encrypted, explanation } = superEncrypt(plainText, secretKey));
        break;
      default:
        alert("Metode enkripsi tidak valid.");
        return;
    }

    setEncryptedText(encrypted);
    setEncryptionExplanation(explanation);

    // Upload ke histories
    try {
      let uploadCipherMethod;
      if (cipherMethod === "caesarCipher") {
        uploadCipherMethod = "Caesar Cipher";
      } else if (cipherMethod === "vigenereCipher") {
        uploadCipherMethod = "Vigenère Cipher";
      } else if (cipherMethod === "atbashCipher") {
        uploadCipherMethod = "Atbash Cipher";
      } else {
        uploadCipherMethod = "Super Enkripsi";
      }
      await uploadToHistories({ plainText, encryptedText: encrypted, secretKey, cipherMethod: uploadCipherMethod });
    } catch (error) {
      console.error("Error uploading to histories:", error);
    }
  };

  const handleCopy = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      // menggunakan Clipboard API
      navigator.clipboard.writeText(encryptedText).then(
        () => {
          alert("Teks berhasil disalin!");
        },
        (err) => {
          console.error("Could not copy text: ", err);
          fallbackCopyTextToClipboard(encryptedText);
        }
      );
    } else {
      // menggunakan metode fallback
      fallbackCopyTextToClipboard(encryptedText);
    }
  };

  const fallbackCopyTextToClipboard = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;

    // Agar tidak scroll ke bawah
    textArea.style.position = "fixed";
    textArea.style.top = "-1000px";
    textArea.style.left = "-1000px";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand("copy");
      if (successful) {
        alert("Teks berhasil disalin!");
      } else {
        alert("Gagal menyalin teks.");
      }
    } catch (err) {
      console.error("Fallback: Oops, unable to copy", err);
      alert("Gagal menyalin teks.");
    }

    document.body.removeChild(textArea);
  };

  return (
    <div className="flex items-center justify-center min-h-dvh bg-primary-bg text-text-primary">
      <div className="absolute left-2 top-2">
        <BackButton />
      </div>
      <div className="w-full max-w-2xl p-8 bg-secondary-bg rounded-3xl shadow-md mx-5">
        <h2 className="mb-6 text-2xl font-bold text-center">
          Enkripsi Teks
        </h2>
        <select
          className="w-full px-4 py-2 mb-4 border border-border-color rounded bg-secondary-bg text-text-primary"
          value={cipherMethod}
          onChange={(e) => setCipherMethod(e.target.value)}
        >
          <option value="caesarCipher">Caesar Cipher</option>
          <option value="vigenereCipher">Vigenère Cipher</option>
          <option value="atbashCipher">Atbash Cipher</option>
          <option value="superEncryption">Super Enkripsi</option>
        </select>
        {cipherMethod !== "atbashCipher" && (
          <input
            type="text"
            placeholder="Masukkan Kunci Rahasia"
            className="w-full px-4 py-2 mb-4 border border-border-color rounded bg-secondary-bg text-text-primary"
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
          />
        )}
        <textarea
          className="w-full px-4 py-2 mb-4 border border-border-color rounded bg-secondary-bg text-text-primary"
          rows="6"
          placeholder="Masukkan teks untuk dienkripsi"
          value={plainText}
          onChange={(e) => setPlainText(e.target.value)}
        />
        <button
          className="w-full px-4 py-2 font-bold text-text-secondary rounded bg-accent-bg hover:bg-accent-hover transition delay-100"
          onClick={handleEncryption}
        >
          Enkripsi
        </button>
        {encryptedText && (
          <div className="w-full mt-6">
            <h3 className="mb-2 text-xl font-semibold">Teks Terenkripsi:</h3>
            <textarea
              className="w-full p-4 border border-border-color rounded bg-secondary-bg text-text-primary"
              rows="6"
              value={encryptedText}
              readOnly
            />
            <div className="flex flex-col items-center">
              <button
                className="w-full px-4 py-2 mt-4 font-bold text-text-secondary rounded bg-accent-bg hover:bg-accent-hover transition delay-100"
                onClick={handleCopy}
              >
                Salin Teks
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

export default TextEncryption;