import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import isLoggedIn from '../utils/loggedIn';
import Logout from '../features/Logout';
import BackButton from '../features/BackButton';

// Fungsi Enkripsi
const caesarCipherEncrypt = (text, key) => {
  const shift = key.length % 26; // Using key length as shift
  let encryptedText = "";
  text.split('').forEach(char => { // Convert text to an array
    if (/[a-zA-Z]/.test(char)) {
      const base = char >= 'a' && char <= 'z' ? 97 : 65;
      encryptedText += String.fromCharCode(((char.charCodeAt(0) - base + shift) % 26) + base);
    } else {
      encryptedText += char;
    }
  });

  return encryptedText;
};

const vigenereCipherEncrypt = (text, key) => {''
  let result = '';
  let keyIndex = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (/[a-zA-Z]/.test(char)) {
      const base = char >= 'a' && char <= 'z' ? 97 : 65;
      const keyChar = key[keyIndex++ % key.length];
      const shift = keyChar.charCodeAt(0) - 65;
      const encryptedChar = String.fromCharCode(((char.charCodeAt(0) - base + shift) % 26) + base);
      result += encryptedChar;
    } else {
      result += char;
    }
  }
  return result;
};

const atbashCipherEncrypt = (text) => {
  let encryptedText = '';
  text.split('').forEach(char => { // Convert text to an array
    if (/[a-zA-Z]/.test(char)) {
      const base = char >= 'a' && char <= 'z' ? 97 : 65;
      encryptedText += String.fromCharCode(base + (25 - (char.charCodeAt(0) - base)));
    } else {
      encryptedText += char;
    }
  });
  return encryptedText;
};

function TextEncryption() {
  const [plainText, setPlainText] = useState('');
  const [encryptedText, setEncryptedText] = useState('');
  const [secretKey, setSecretKey] = useState('');
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

  const handleEncryption = () => {
    if (!secretKey) {
      alert('Silakan masukkan kunci rahasia.');
      return;
    }

    if (!plainText) {
      alert('Silakan masukkan teks untuk dienkripsi.');
      return;
    }

    // Proses Super Enkripsi
    const normalizedKey = secretKey.replace(/\s+/g, '').toUpperCase();
    console.log('normalizedKey:', normalizedKey);

    let encrypted = plainText;
    encrypted = caesarCipherEncrypt(encrypted, normalizedKey);
    console.log('caesar cipher:', encrypted);
    encrypted = vigenereCipherEncrypt(encrypted, normalizedKey);
    console.log('vigenere cipher:', encrypted);
    encrypted = atbashCipherEncrypt(encrypted);
    console.log('atbash cipher:', encrypted);

    setEncryptedText(encrypted);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(encryptedText);
    alert("Text berhasil disalin!");
  };

  return (
    <div className='h-full'>
      <Logout />
      <BackButton />
      <div className="flex flex-col items-center h-full pt-32 p-4 bg-gray-100">
        <h2 className="mb-6 text-2xl font-bold">Super Enkripsi Teks</h2>
        <input
          type="text"
          placeholder="Masukkan Kunci Rahasia"
          className="w-full max-w-2xl p-4 mb-4 border rounded"
          value={secretKey}
          onChange={(e) => setSecretKey(e.target.value)}
        />
        <textarea
          className="w-full max-w-2xl p-4 mb-4 border rounded"
          rows="6"
          placeholder="Masukkan teks untuk dienkripsi"
          value={plainText}
          onChange={(e) => setPlainText(e.target.value)}
        />
        <button
          className="px-6 py-2 mb-4 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
          onClick={handleEncryption}
        >
          Enkripsi
        </button>
        {encryptedText && (
          <div className="w-full max-w-2xl">
            <h3 className="mb-2 text-xl font-semibold w-full max-w-2xl">Teks Terenkripsi:</h3>
            <textarea
              className="w-full p-4 border rounded"
              rows="6"
              value={encryptedText}
              readOnly
            />
            <div className="flex flex-col w-full items-center">
              <button
                className="px-6 py-2 mt-4 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
                onClick={handleCopy}
              >
                Copy Text
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TextEncryption;