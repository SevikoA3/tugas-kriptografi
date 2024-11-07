import { useNavigate } from "react-router-dom";

function BackButton() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/dashboard");
  };

  return (
    <div className="flex w-full justify-start absolute">
      <button
        className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700 ml-4 mt-4"
        onClick={handleBack}
      >
        Back to Dashboard
      </button>
    </div>
  );
}

export default BackButton;