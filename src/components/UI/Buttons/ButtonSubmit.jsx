import { AppContext } from "@/context/AppContext";
import { useContext } from "react";
import { Loader2 } from "lucide-react";

export default function ButtonSubmit({ children, onClick, icon, disabled, ...props }) {
    const { loading } = useContext(AppContext);

    const isDisabled = loading || disabled;

    return (
        <button
            className={`btn ${isDisabled ? 'cursor-not-allowed opacity-70' : ''}`}
            onClick={onClick}
            disabled={isDisabled}
            {...props}
        >
            {loading 
                ? <Loader2 className="animate-spin" size={18} />
                : <>{icon} {children}</>
            }
        </button>
    )
}