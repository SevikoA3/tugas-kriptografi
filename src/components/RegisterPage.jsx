import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import CryptoJS from "crypto-js";
import db from "../utils/connect_db";
import { collection, addDoc, getDocs } from "firebase/firestore";
import isLoggedIn from "../utils/loggedIn";

function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoginStatus = async () => {
      const loggedIn = await isLoggedIn();
      if (loggedIn) {
        navigate('/dashboard');
      }
    };
    checkLoginStatus();
  }, [navigate]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleRegister();
    }
  };

  const handleRegister = async () => {
    if (!username || !password) {
      alert("Username and password must be filled");
      return;
    }

    setIsLoading(true);
    abortControllerRef.current = new AbortController();

    try {
      if (username.length < 3) {
        alert("Username must be more than 3 characters");
        setIsLoading(false);
        return;
      }

      if (password.length < 8) {
        alert("Password must be more than 8 characters");
        setIsLoading(false);
        return;
      }

      const hashedPassword = CryptoJS.SHA256(password).toString();
      const usersCollection = collection(db, "users");

      const userSnapshot = await getDocs(usersCollection, {
        signal: abortControllerRef.current.signal,
      });

      if (userSnapshot.docs.some((doc) => doc.data().username === username)) {
        alert("Username is already taken");
        setIsLoading(false);
        return;
      }

      const lowercaseUsername = username.toLowerCase();
      const newUser = {
        username: lowercaseUsername,
        password: hashedPassword,
      };

      await addDoc(usersCollection, newUser);
      setUsername("");
      setPassword("");
      alert("Registration successful!");
      navigate("/login");
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("Registration request cancelled");
      } else {
        console.error("Error adding document: ", error);
        alert("Failed to register, please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="flex flex-col justify-center bg-white p-6 rounded shadow-md text-center">
            <div className="loader mx-auto">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p>Tunggu Sebentar...</p>
            </div>
            <div>
              <button
                className="mt-4 px-4 py-2 font-bold text-white bg-red-500 rounded hover:bg-red-700"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="w-full max-w-md p-8 bg-white rounded shadow-md relative">
        <h1 className="mb-6 text-2xl font-bold text-center">
          SeCrypto Register
        </h1>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            className="w-full px-4 py-2 border rounded"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <button
            className="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700 disabled:bg-blue-300"
            onClick={handleRegister}
            disabled={isLoading}
          >
            Register
          </button>
          <Link
            to="/login"
            className="block text-center text-blue-500 hover:underline"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;