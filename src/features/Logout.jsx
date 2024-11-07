import { useNavigate } from "react-router-dom";

function Logout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("session");
    navigate("/login");
  };

  return (
    <div className="flex w-full justify-end absolute">
      <button
        className="px-4 py-2 font-bold text-white bg-red-500 rounded hover:bg-red-700 mr-4 mt-4"
        onClick={handleLogout}
      >
        Logout
      </button>
    </div>
  );
}

export default Logout;
