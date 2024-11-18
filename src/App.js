import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import Dashboard from './components/Dashboard';
import TextEncryption from './components/TextEncryption';
import ImageEncryption from './components/ImageEncryption';
import FileEncryption from './components/FileEncryption';
import TextDecryption from './components/TextDecryption';
import ImageDecryption from './components/ImageDecryption';
import FileDecryption from './components/FileDecryption';
import Histories from './components/Histories';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/histories" element={<Histories />} />
        <Route path="/text-encryption" element={<TextEncryption />} />
        <Route path='/text-decryption' element={<TextDecryption />} />
        <Route path="/image-encryption" element={<ImageEncryption />} />
        <Route path='/image-decryption' element={<ImageDecryption />} />
        <Route path="/file-encryption" element={<FileEncryption />} />
        <Route path='/file-decryption' element={<FileDecryption />} />
      </Routes>
    </Router>
  );
}

export default App;
