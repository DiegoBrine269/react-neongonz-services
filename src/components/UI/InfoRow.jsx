export default function InfoRow({label, value}) {
    return (
        <div className="text">
            <span className="font-bold border-b-1 block border-neutral-400">
                {label}
            </span>{" "}
            <p>{value}</p>
        </div>
    );
}
