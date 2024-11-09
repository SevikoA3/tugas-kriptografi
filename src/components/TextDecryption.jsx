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

// Caesar Cipher Decryption
const caesarCipherDecrypt = (text, key) => {
  const shift = key.length % 26;
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
    if (!secretKey) {
      alert("Silakan masukkan kunci rahasia.");
      return;
    }

    if (!encryptedText) {
      alert("Silakan masukkan teks terenkripsi untuk didekripsi.");
      return;
    }

    try {
      // Super Decryption Process (reverse order)
      let normalizedKey = secretKey.replace(/\s+/g, "").toUpperCase();
      let decrypted = encryptedText;
      decrypted = atbashCipherDecrypt(decrypted);
      decrypted = vigenereCipherDecrypt(decrypted, normalizedKey);
      decrypted = caesarCipherDecrypt(decrypted, normalizedKey);

      setDecryptedText(decrypted);
    } catch (error) {
      alert(
        "Gagal mendekripsi teks. Pastikan teks terenkripsi valid dan kunci yang digunakan benar."
      );
      console.error("Error during decryption:", error);
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
      <div className="w-full max-w-2xl p-8 bg-secondary-bg rounded-3xl shadow-md mx-10">
        <h2 className="mb-6 text-2xl font-bold text-center">
          Super Dekripsi Teks
        </h2>
        <input
          type="text"
          placeholder="Masukkan Kunci Rahasia"
          className="w-full px-4 py-2 mb-4 border border-border-color rounded bg-secondary-bg text-text-primary"
          value={secretKey}
          onChange={(e) => setSecretKey(e.target.value)}
        />
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
          </div>
        )}
      </div>
    </div>
  );
}

export default TextDecryption;