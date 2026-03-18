import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import AppProvider from "./context/AppContext.jsx";
import CotizacionesProvider from "./context/CotizacionesContext.jsx";


createRoot(document.getElementById("root")).render(
    <AppProvider>
        {/* <StrictMode> */}
            <CotizacionesProvider>
                <App />
            </CotizacionesProvider>
        {/* </StrictMode> */}
    </AppProvider>
);
