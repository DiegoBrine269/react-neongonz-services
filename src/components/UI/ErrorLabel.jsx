
export default function ErrorLabel({ children }) {
    if (!children) return null;
        return <p className="error">{children[0]}</p>;
}
