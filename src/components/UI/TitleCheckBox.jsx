import { Link } from "react-router-dom";
import { DollarSign } from "lucide-react";

export default function TitleCheckBox({id, name, label, checked, onChange, }) {
    return (
        
            <div className="flex gap-3">
                <label
                    htmlFor={`seleccionar-proyecto-${name}`}
                    className="flex gap-1  items-center m-0"
                >
                    <input
                        className="h-4 w-4"
                        name={name}
                        type="checkbox"
                        id={`seleccionar-proyecto-${name}`}
                        checked={checked}
                        onChange={onChange}
                    />
                    <span className="title-3 m-0 select-none">
                        {label}
                    </span>
                </label>
                <Link
                    to={`/servicios/${id}`}
                    className="btn bg-green-600 w-10 h-10"
                >
                    <DollarSign
                        
                    />  
                </Link>
            
            </div>


    );
}
