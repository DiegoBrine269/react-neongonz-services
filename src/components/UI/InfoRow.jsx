import { Link } from "react-router-dom";

export default function InfoRow({label, value, link}) {
    return (
        <div className="text">
            <span className="font-bold border-b-1 block border-neutral-400">
                {label}
            </span>{" "}
            {link ? (
                <Link to={link} className="link">
                    {value}
                </Link>
            ) : (
                <span>{value}</span>
            )}
        </div>
    );
}
