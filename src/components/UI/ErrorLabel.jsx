import { useEffect, useRef } from "react";

export default function ErrorLabel({ children }) {
    const ref = useRef(null);

    useEffect(() => {
        if (children && ref.current) {
            ref.current.focus();
        }
    }, [children]);

    if (!children) return null;

    return (
        <p
            ref={ref}
            tabIndex={-1}
            className="error animate__animated animate__shakeX"
        >
            {children[0]}
        </p>
    );
}
