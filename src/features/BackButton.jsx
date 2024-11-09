import { useNavigate } from "react-router-dom";
import backIcon from '../assets/back.svg';

function BackButton() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/dashboard");
  };

  return (
    <div className="flex w-full justify-start absolute">
      <button
        className="p-2 pl-3 font-bold text-text-secondary rounded bg-accent-bg hover:bg-accent-hover transition delay-100 ml-4 mt-4 z-50"
        onClick={handleBack}
      >
        <img src={backIcon} alt="Back" className="w-4 h-4 mr-5" />
      </button>
    </div>
  );
}

export default BackButton;
