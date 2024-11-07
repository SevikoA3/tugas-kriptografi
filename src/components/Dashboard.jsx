import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import isLoggedIn from '../utils/loggedIn';
import Logout from "../features/Logout";

function Dashboard() {
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

  return (
    <div>
      <Logout />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h2 className="mb-8 text-3xl font-bold">Selamat Datang di Dashboard SeCrypto</h2>
        <table className="table-auto border-collapse border border-gray-400">
          <thead>
            <tr>
              <th className="px-4 py-2 border border-gray-300">Enkripsi</th>
              <th className="px-4 py-2 border border-gray-300">Dekripsi</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-4 py-2 border border-gray-300">
                <Link
                  to="/text-encryption"
                  className="text-xl font-semibold text-blue-500 hover:underline"
                >
                  Enkripsi Teks
                </Link>
              </td>
              <td className="px-4 py-2 border border-gray-300">
                <Link
                  to="/text-decryption"
                  className="text-xl font-semibold text-blue-500 hover:underline"
                >
                  Dekripsi Teks
                </Link>
              </td>
            </tr>
            <tr>
              <td className="px-4 py-2 border border-gray-300">
                <Link
                  to="/image-encryption"
                  className="text-xl font-semibold text-blue-500 hover:underline"
                >
                  Enkripsi Gambar
                </Link>
              </td>
              <td className="px-4 py-2 border border-gray-300">
                <Link
                  to="/image-decryption"
                  className="text-xl font-semibold text-blue-500 hover:underline"
                >
                  Dekripsi Gambar
                </Link>
              </td>
            </tr>
            <tr>
              <td className="px-4 py-2 border border-gray-300">
                <Link
                  to="/file-encryption"
                  className="text-xl font-semibold text-blue-500 hover:underline"
                >
                  Enkripsi File
                </Link>
              </td>
              <td className="px-4 py-2 border border-gray-300">
                <Link
                  to="/file-decryption"
                  className="text-xl font-semibold text-blue-500 hover:underline"
                >
                  Dekripsi File
                </Link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;