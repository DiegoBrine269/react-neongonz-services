import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Pages/Layout";
import Home from "./Pages/Home";
import Register from "./Pages/Auth/Register";
import Login from "./Pages/Auth/Login";
import { AppContext } from "./context/AppContext";
import { useContext } from "react";
import NotFound from "@/Pages/NotFound";
import Responsables from "@/Pages/Responsables/Responsables";
import Centros from "@/Pages/Centros/Centros";
import EditarCentros from "@/Pages/Centros/Editar";

import Servicios from "@/Pages/Servicios/Servicios";
import Servicio from "@/Pages/Servicios/Servicio";
import Usuarios from "@/Pages/Usuarios/Usuarios";
import Proyectos from "@/Pages/Proyectos/Proyectos";
import Proyecto from "@/Pages/Proyectos/Proyecto/Proyecto";
import "tabulator-tables/dist/css/tabulator_materialize.min.css";
import Vehiculos from "@/Pages/Vehiculos/Vehiculos";
import MiCuenta from "@/Pages/MiCuenta"
import ForgotPassword from "@/Pages/Auth/ForgotPassword";
import Cotizaciones from "@/Pages/Cotizaciones/Cotizaciones";
import Nueva from "@/Pages/Cotizaciones/Nueva";
import Personalizadas from "@/Pages/Cotizaciones/Personalizadas";
import Enviar from "@/Pages/Cotizaciones/Enviar";
import Editar from "@/Pages/Cotizaciones/Editar";

import Desempeno from "@/Pages/Reportes/Desempeno"
import ResetPassword from "@/Pages/Auth/ResetPassword";
// import { PrimeReactProvider, PrimeReactContext } from 'primereact/api';



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
                        <Route
                            path="/forgot-password"
                            element={user ? <Home /> : <ForgotPassword />}
                        />
                        <Route
                            path="/reset-password"
                            element={user ? <NotFound /> : <ResetPassword />}
                        />
                        {user?.is_active && (
                            <>
                                {user.role === 'admin' && (
                                    <>
                                        <Route path="/centros-de-venta" element={<Centros />} />
                                        <Route path="/centros-de-venta/editar/:id" element={<EditarCentros />} />

                                        <Route path="/responsables" element={<Responsables />} />
                                        <Route path="/servicios" element={<Servicios />} />
                                        <Route path="/cotizaciones" element={<Cotizaciones />} />
                                        <Route path="/cotizaciones/nueva" element={<Nueva />} />
                                        <Route path="/cotizaciones/personalizadas" element={<Personalizadas />} />
                                        <Route path="/cotizaciones/enviar" element={<Enviar />} />
                                        <Route path="/cotizaciones/editar/:id" element={<Editar />} />
                                        <Route path="/servicios/:id" element={<Servicio />} />
                                        <Route path="/usuarios" element={<Usuarios />} />
                                        <Route path="/usuarios/desempeno" element={<Desempeno />} />
                                    </>
                                )}
                                <Route path="/vehiculos" element={<Vehiculos />} />
                                <Route path="/proyectos" element={<Proyectos />} />
                                <Route path="/proyectos/:id" element={<Proyecto />} />
                                <Route path="/mi-cuenta" element={<MiCuenta />} />

                                
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
