import React, { useEffect, useState } from "react";
import { db, storage } from "../utils/connect_db";
import { collection, getDocs, query, where, deleteDoc, doc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import BackButton from "../features/BackButton";

function Histories() {
  const [histories, setHistories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingIds, setDeletingIds] = useState([]);

  useEffect(() => {
    const fetchHistories = async () => {
      try {
        const session = JSON.parse(localStorage.getItem("session"));
        if (!session || !session.username) {
          alert("User tidak ditemukan. Silakan login kembali.");
          return;
        }

        const historiesCollection = collection(db, "histories");
        const q = query(historiesCollection, where("username", "==", session.username));
        const historySnapshot = await getDocs(q);
        const historyList = historySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setHistories(historyList);
      } catch (error) {
        console.error("Error fetching histories:", error);
        alert("Gagal mengambil data histori.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistories();
  }, []);

  const deleteHistory = async (historyId, storagePath) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus histori ini?")) return;

    setDeletingIds(prev => [...prev, historyId]);

    try {
      await deleteDoc(doc(db, "histories", historyId));

      if (storagePath) {
        const storageRefPath = ref(storage, storagePath);
        await deleteObject(storageRefPath);
      }

      setHistories(histories.filter(history => history.id !== historyId));
    } catch (error) {
      console.error("Error deleting history:", error);
      alert("Gagal menghapus histori.");
    } finally {
      setDeletingIds(prev => prev.filter(id => id !== historyId));
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-primary-bg text-text-primary relative">
      {/* Tombol Kembali */}
      <div className="absolute left-2 top-2 sm:left-4 sm:top-4">
        <BackButton />
      </div>

      {/* Kontainer Histori */}
      <div className="w-full max-w-4xl px-4 py-6 sm:p-8 bg-secondary-bg rounded-3xl shadow-lg mx-2 sm:mx-4">
        <h2 className="mb-6 text-2xl sm:text-3xl font-extrabold text-center text-accent-bg">Histori Enkripsi</h2>
        
        {/* Status Loading */}
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="loader animate-spin rounded-full h-8 w-8 border-t-4 border-b-4 border-accent-bg"></div>
            <p className="ml-4 text-base sm:text-lg">Loading...</p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {histories.length === 0 ? (
              <div className="text-center text-base sm:text-lg text-accent-hover">Tidak ada histori yang ditemukan.</div>
            ) : (
              histories.map((history) => (
                <div key={history.id} className="p-4 sm:p-6 bg-primary-bg border-l-4 border-accent-bg rounded shadow-md transition hover:bg-accent-hover relative">
                  {/* Tombol Hapus */}
                  <button
                    className="absolute top-2 right-2 sm:top-4 sm:right-4 text-red-500 hover:text-red-700"
                    onClick={() => deleteHistory(history.id, history.storagePath)}
                    disabled={deletingIds.includes(history.id)}
                  >
                    {deletingIds.includes(history.id) ? (
                      <div className="loader animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-500"></div>
                    ) : (
                      "Hapus"
                    )}
                  </button>

                  {history.plainText && (
                    <div className="mb-1 sm:mb-2">
                      <span className="font-semibold">Teks Asli:</span>
                      <p className="mt-1 max-h-24 overflow-y-auto p-2 bg-secondary-bg rounded">
                        {history.plainText}
                      </p>
                    </div>
                  )}
                  {history.encryptedText && (
                    <div className="mb-1 sm:mb-2">
                      <span className="font-semibold">Teks Terenkripsi:</span>
                      <p className="mt-1 max-h-24 overflow-y-auto p-2 bg-secondary-bg rounded">
                        {history.encryptedText}
                      </p>
                    </div>
                  )}
                  {history.downloadURL && (
                    <div className="mb-1 sm:mb-2">
                      <span className="font-semibold">Download URL:</span>
                      <a href={history.downloadURL} className="ml-2 text-accent-bg underline hover:text-accent-hover" target="_blank" rel="noreferrer">Download</a>
                    </div>
                  )}
                  {history.imageURL && (
                    <div className="mb-1 sm:mb-2">
                      <span className="font-semibold">Gambar:</span>
                      <img src={history.imageURL} alt="Encrypted" className="ml-2 max-w-full h-auto" />
                    </div>
                  )}
                  <div className="mb-1 sm:mb-2">
                    <span className="font-semibold">Kunci Rahasia:</span>
                    <p className="mt-1 max-h-24 overflow-y-auto p-2 bg-secondary-bg rounded">
                      {history.secretKey}
                    </p>
                  </div>
                  <div className="mb-1 sm:mb-2">
                    <span className="font-semibold">Metode Cipher:</span>
                    <p className="mt-1 max-h-24 overflow-y-auto p-2 bg-secondary-bg rounded">
                      {history.cipherMethod}
                    </p>
                  </div>
                  {history.encryptionExplanation && (
                    <div className="mb-1 sm:mb-2">
                      <span className="font-semibold">Penjelasan:</span>
                      <p className="mt-1 max-h-24 overflow-y-auto p-2 bg-secondary-bg rounded">
                        {history.encryptionExplanation}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Histories;