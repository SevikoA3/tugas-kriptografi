import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import isLoggedIn from "../utils/loggedIn";
import Logout from "../features/Logout";

function Dashboard() {
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

  return (
    <div className="h-full">
      <Logout />
      <div className="flex flex-col items-center justify-center min-h-dvh bg-primary-bg mx-5">
        <h2 className="mb-8 text-3xl font-bold text-text-primary text-center">
          Selamat Datang di Dashboard SeCrypto
        </h2>
        <table className="table-auto border-collapse border border-border-color">
          <thead>
            <tr>
              <th className="px-4 py-2 border border-border-color text-text-primary">
                Enkripsi
              </th>
              <th className="px-4 py-2 border border-border-color text-text-primary">
                Dekripsi
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-4 py-2 border border-border-color">
                <Link
                  to="/text-encryption"
                  className="text-xl font-semibold text-accent-bg hover:underline"
                >
                  Enkripsi Teks
                </Link>
              </td>
              <td className="px-4 py-2 border border-border-color">
                <Link
                  to="/text-decryption"
                  className="text-xl font-semibold text-accent-bg hover:underline"
                >
                  Dekripsi Teks
                </Link>
              </td>
            </tr>
            <tr>
              <td className="px-4 py-2 border border-border-color">
                <Link
                  to="/image-encryption"
                  className="text-xl font-semibold text-accent-bg hover:underline"
                >
                  Enkripsi Gambar
                </Link>
              </td>
              <td className="px-4 py-2 border border-border-color">
                <Link
                  to="/image-decryption"
                  className="text-xl font-semibold text-accent-bg hover:underline"
                >
                  Dekripsi Gambar
                </Link>
              </td>
            </tr>
            <tr>
              <td className="px-4 py-2 border border-border-color">
                <Link
                  to="/file-encryption"
                  className="text-xl font-semibold text-accent-bg hover:underline"
                >
                  Enkripsi File
                </Link>
              </td>
              <td className="px-4 py-2 border border-border-color">
                <Link
                  to="/file-decryption"
                  className="text-xl font-semibold text-accent-bg hover:underline"
                >
                  Dekripsi File
                </Link>
              </td>
            </tr>
            <tr>
              <td className="px-4 py-2 border border-border-color text-center" colSpan={2}>
                <Link
                  to="/histories"
                  className="text-xl font-semibold text-accent-bg hover:underline"
                >
                  Histories
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