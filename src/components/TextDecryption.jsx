import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import isLoggedIn from "../utils/loggedIn";
import BackButton from "../features/BackButton";

// Atbash Cipher Decryption
const atbashCipherDecrypt = (text) => {
  return text.replace(/[a-zA-Z]/g, (char) => {
    const base = char >= "a" && char <= "z" ? 97 : 65;
    return String.fromCharCode(base + (25 - (char.charCodeAt(0) - base)));
  });
};

// Vigenere Cipher Decryption
const vigenereCipherDecrypt = (text, key) => {
  let result = "";
  key = key.replace(/[^a-zA-Z]/g, "").toUpperCase();
  let keyIndex = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (/[a-zA-Z]/.test(char)) {
      const base = char >= "a" && char <= "z" ? 97 : 65;
      const keyChar = key[keyIndex % key.length].toUpperCase();
      const shift = keyChar.charCodeAt(0) - 65;
      const decryptedChar = String.fromCharCode(
        ((char.charCodeAt(0) - base - shift + 26) % 26) + base
      );
      result += decryptedChar;
      keyIndex++;
    } else {
      result += char;
    }
  }
  return result;
};

// Updated Caesar Cipher Decryption Function
const caesarCipherDecrypt = (text, shift) => {
  shift = shift % 26; // Ensure shift is within 0-25
  return text.replace(/[a-zA-Z]/g, (char) => {
    const base = char >= "a" && char <= "z" ? 97 : 65;
    return String.fromCharCode(
      ((char.charCodeAt(0) - base - shift + 26) % 26) + base
    );
  });
};

function TextDecryption() {
  const [encryptedText, setEncryptedText] = useState("");
  const [decryptedText, setDecryptedText] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [cipherMethod, setCipherMethod] = useState("superEncryption");
  const [decryptionExplanation, setDecryptionExplanation] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoginStatus = async () => {
      const loggedIn = await isLoggedIn();
      if (!loggedIn) {
        navigate("/login");
      }
    };

    checkLoginStatus();
  }, [navigate]);

  const handleDecryption = () => {
    if (cipherMethod !== "atbashCipher" && !secretKey) {
      alert("Silakan masukkan kunci rahasia yang sesuai.");
      return;
    }

    if (!encryptedText) {
      alert("Silakan masukkan teks terenkripsi untuk didekripsi.");
      return;
    }

    let decrypted = "";
    let explanation = "";

    try {
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
          explanation = `Caesar Cipher menggeser setiap huruf dalam teks kembali sebesar ${shiftValue} mod 26 = ${shiftValue % 26} posisi untuk mendapatkan teks asli.`;
          shiftValue = shiftValue % 26; // Limit shift to 0-25
          decrypted = caesarCipherDecrypt(encryptedText, shiftValue);
          break;
        case "vigenereCipher":
          if (!/^[A-Za-z]+$/.test(secretKey)) {
            alert("Kunci Vigenère hanya boleh mengandung huruf alfabet.");
            return;
          }
          decrypted = vigenereCipherDecrypt(encryptedText, secretKey);
          explanation = `Vigenère Cipher menggunakan kunci Kunci "${secretKey}" diubah menjadi ${Array.from(secretKey).map((char) => char.charCodeAt(0) - 65).join(", ")} untuk menggeser huruf. Jika kunci lebih pendek dari teks, kunci akan diulang untuk setiap karakter.`;
          break;
        case "atbashCipher":
          decrypted = atbashCipherDecrypt(encryptedText);
          const exampleText = encryptedText.slice(0, 5); // Ambil 5 karakter pertama untuk contoh
          const exampleDecryption = Array.from(exampleText)
            .map((char) => {
              if (char === " ") return "spasi";
              return `${char} menjadi ${atbashCipherDecrypt(char)}`;
            }).join(", ");
          explanation = `Atbash Cipher adalah algoritma substitusi sederhana yang memetakan setiap huruf ke huruf yang berlawanan dalam alfabet. Misalnya, ${exampleDecryption}, dan seterusnya.`;
          break;
        case "superEncryption":
          let normalizedKey = secretKey.replace(/\s+/g, "").toUpperCase();
          if (/[^a-zA-Z]/.test(normalizedKey)) {
            alert("Kunci hanya boleh mengandung huruf alfabet (a-z, A-Z).");
            return;
          }
          decrypted = encryptedText;
          decrypted = atbashCipherDecrypt(decrypted);
          decrypted = vigenereCipherDecrypt(decrypted, normalizedKey);
          const superShift = normalizedKey.length % 26;
          decrypted = caesarCipherDecrypt(decrypted, superShift);
          explanation = `Super Dekripsi membalik proses Super Enkripsi dengan menerapkan Atbash Cipher, kemudian Vigenère Cipher dengan kunci '${normalizedKey}', dan akhirnya Caesar Cipher dengan pergeseran ${superShift}.`;
          break;
        default:
          alert("Metode dekripsi tidak valid.");
          return;
      }

      setDecryptedText(decrypted);
      setDecryptionExplanation(explanation);
    } catch (error) {
      // ...existing error handling...
    }
  };

  const handleCopy = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(decryptedText).then(
        () => {
          alert("Teks berhasil disalin!");
        },
        (err) => {
          console.error("Could not copy text: ", err);
          fallbackCopyTextToClipboard(decryptedText);
        }
      );
    } else {
      fallbackCopyTextToClipboard(decryptedText);
    }
  };

  const fallbackCopyTextToClipboard = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;

    // Avoid scrolling to bottom
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
          Dekripsi Teks
        </h2>
        <select
          className="w-full px-4 py-2 mb-4 border border-border-color rounded bg-secondary-bg text-text-primary"
          value={cipherMethod}
          onChange={(e) => setCipherMethod(e.target.value)}
        >
          <option value="caesarCipher">Caesar Cipher</option>
          <option value="vigenereCipher">Vigenère Cipher</option>
          <option value="atbashCipher">Atbash Cipher</option>
          <option value="superEncryption">Super Dekripsi</option>
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
          placeholder="Masukkan teks terenkripsi untuk didekripsi"
          value={encryptedText}
          onChange={(e) => setEncryptedText(e.target.value)}
        />
        <button
          className="w-full px-4 py-2 font-bold text-text-secondary rounded bg-accent-bg hover:bg-accent-hover transition delay-100"
          onClick={handleDecryption}
        >
          Dekripsi
        </button>
        {decryptedText && (
          <div className="w-full mt-6">
            <h3 className="mb-2 text-xl font-semibold">Teks Didekripsi:</h3>
            <textarea
              className="w-full p-4 border border-border-color rounded bg-secondary-bg text-text-primary"
              rows="6"
              value={decryptedText}
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
            {decryptionExplanation && (
              <div className="mt-4">
                <h3 className="mb-2 text-xl font-semibold">Penjelasan Dekripsi:</h3>
                <p className="text-justify">{decryptionExplanation}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default TextDecryption;