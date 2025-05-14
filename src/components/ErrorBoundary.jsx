import React from "react";

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        // Actualiza el estado para mostrar el fallback en la siguiente renderización
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        // Puedes enviar este error a un sistema de monitoreo, como Sentry o LogRocket
        console.error("Error capturado por ErrorBoundary:", error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-4 bg-red-100 text-red-800 rounded">
                    <h2>Algo salió mal.</h2>
                    <pre>{this.state.error?.toString()}</pre>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
