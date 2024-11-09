import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import isLoggedIn from "../utils/loggedIn";
import BackButton from "../features/BackButton";

// Encryption Functions
const caesarCipherEncrypt = (text, key) => {
  const shift = key.length % 26;
  let encryptedText = "";
  text.split("").forEach((char) => {
    if (/[a-zA-Z]/.test(char)) {
      const base = char >= "a" && char <= "z" ? 97 : 65;
      encryptedText += String.fromCharCode(
        ((char.charCodeAt(0) - base + shift) % 26) + base
      );
    } else {
      encryptedText += char;
    }
  });

  return encryptedText;
};

const vigenereCipherEncrypt = (text, key) => {
  let result = "";
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
  let encryptedText = "";
  text.split("").forEach((char) => {
    if (/[a-zA-Z]/.test(char)) {
      const base = char >= "a" && char <= "z" ? 97 : 65;
      encryptedText += String.fromCharCode(
        base + (25 - (char.charCodeAt(0) - base))
      );
    } else {
      encryptedText += char;
    }
  });
  return encryptedText;
};

function TextEncryption() {
  const [plainText, setPlainText] = useState("");
  const [encryptedText, setEncryptedText] = useState("");
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

  const handleEncryption = () => {
    if (!secretKey) {
      alert("Silakan masukkan kunci rahasia.");
      return;
    }

    if (!plainText) {
      alert("Silakan masukkan teks untuk dienkripsi.");
      return;
    }

    // Super Encryption Process
    const normalizedKey = secretKey.replace(/\s+/g, "").toUpperCase();

    let encrypted = plainText;
    encrypted = caesarCipherEncrypt(encrypted, normalizedKey);
    encrypted = vigenereCipherEncrypt(encrypted, normalizedKey);
    encrypted = atbashCipherEncrypt(encrypted);

    setEncryptedText(encrypted);
  };

  const handleCopy = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      // Use the modern Clipboard API
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
      // Use the fallback method
      fallbackCopyTextToClipboard(encryptedText);
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
          Super Enkripsi Teks
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
          </div>
        )}
      </div>
    </div>
  );
}

export default TextEncryption;