import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Pages/Layout";
import Home from "./Pages/Home";
import Register from "./Pages/Auth/Register";
import Login from "./Pages/Auth/Login";
import { AppContext } from "./context/AppContext";
import { useContext } from "react";
import NotFound from "./Pages/NotFound";
import Centros from "./Pages/Centros";
import Servicios from "./Pages/Servicios/Servicios";
import Servicio from "./Pages/Servicios/Servicio";
import Proyectos from "./Pages/Proyectos/Proyectos";
import Proyecto from "./Pages/Proyectos/Proyecto";
import "tabulator-tables/dist/css/tabulator_materialize.min.css";
import Vehiculos from "./Pages/Vehiculos/Vehiculos";


export default function App() {
    const { user } = useContext(AppContext);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route
                        path="/registro"
                        element={user ? <Home /> : <Register />}
                    />
                    <Route
                        path="/login"
                        element={user ? <Home /> : <Login />}
                    />
                    {user?.is_active && (
                        <>
                            {user.role === 'admin' && (
                                <>
                                    <Route path="/centros-de-venta" element={<Centros />} />
                                    <Route path="/servicios" element={<Servicios />} />

                                    <Route path="/servicios/:id" element={<Servicio />} />
                                </>
                            )}
                            <Route path="/vehiculos" element={<Vehiculos />} />
                            <Route path="/proyectos" element={<Proyectos />} />
                            <Route path="/proyectos/:id" element={<Proyecto />} />

                        </>
                    )}
                    <Route
                        path="*"
                        element={<NotFound />}
                    />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
