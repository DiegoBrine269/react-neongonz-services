
import Logo from "../assets/Logo.png";
import Gorro from "../assets/gorro-navidad.png";

import LogoBlanco from "../assets/Logo-blanco.png";
import { motion, AnimatePresence } from "framer-motion";

import { NavLink } from "react-router-dom";
import { Menu, X, Car, Factory, Wrench, User, LogOut, Sun, Moon, LogIn, UserRoundPlus, BriefcaseBusiness, Receipt, Users  } from "lucide-react";
import { AppContext } from "../context/AppContext";
import { useContext } from "react";

export default function Header() {

    const { darkMode, toggleDarkMode, user, handleLogout, isMenuOpen, setIsMenuOpen } = useContext(AppContext);

    
    const handleToggle = () => {
        setIsMenuOpen(!isMenuOpen);
    };
    function Item({ to, text, children, onClick }) {
        return (
            <NavLink
                to={to}
                className={({ isActive }) =>
                    `flex items-center gap-2 p-2 rounded-md transition-colors duration-300 dark:text-neutral-200 hover:bg-gray-200 hover:text-neutral-900 dark:hover:bg-neutral-700 dark:hover:text-neutral-200 ${
                        isActive
                            ? "bg-neutral-900 text-neutral-200 font-bold dark:bg-neutral-200 dark:text-neutral-900"
                            : ""
                    }`
                }
                onClick={(e) => {
                    setIsMenuOpen(false);
                    if (onClick) onClick(e);
                }}
            >
                {children}
                <span>{text}</span>
            </NavLink>
        );
    }

    function Items () {
        return (
                    <>
                        {user && <Item to="/vehiculos" text="Vehículos" children={<Car />} />}
                        {user && user.role === 'admin' && <Item to="/centros-de-venta" text="Centros" children={<Factory />} />}
                        {user && user.role === 'admin' && <Item to="/servicios" text="Servicios" children={<Wrench />} />}
                        {user && <Item to="/proyectos" text="Proyectos" children={<BriefcaseBusiness />} />}
                        {user && user.role === 'admin' && <Item to="/cotizaciones" text="Cotizaciones" children={<Receipt />} />}
                        {user && <Item to="/mi-cuenta" text="Mi cuenta" children={<User />} />}
                        {user && user.role === 'admin' && <Item to="/reportes-desempeno" text="Desempeño" children={<Users />} />}
                        {user && (<Item to="/logout" text="Cerrar sesión" children={<LogOut />} onClick={handleLogout} />)}
                        {!user && <Item to="/login" text="Iniciar Sesión" children={<LogIn />}/>}
                        {!user && <Item to="/registro" text="Crear una cuenta" children={<UserRoundPlus />}/>}
                    </>
                );
    }


    return (
        <header className="relative bg-gray-100 dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-700 py-2 snow">

            <div className="px-4 md:px-24 lg:px-48">
                <nav className="px-0 items-center gap-4 justify-start xl:justify-center">
                    <button
                        onClick={handleToggle}
                        className="xl:hidden text-black dark:text-neutral-200 cursor-pointer"
                    >
                        {isMenuOpen ? <X /> : <Menu onClick={handleToggle} />}
                    </button>
                    <NavLink to="/" className="relative">
                        <img
                            src={darkMode ? LogoBlanco : Logo}
                            alt="Logo"
                            className="w-12 xl:w-16"
                        />
                        {/* Activar en navidad */}
                        {/* <img
                            src={Gorro}
                            alt="Gorro de Navidad"
                            className="
                                w-10 xl:w-12
                                absolute 
                                -top-[9px] -right-[12px]
                                -translate-y-2 translate-x-2      
                                xl:-translate-y-3 xl:translate-x-3
                                pointer-events-none
                            "
                        /> */}
                    </NavLink>
                </nav>

                <div className="hidden xl:flex xl:justify-between">
                    <Items />
                </div>

                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                        key="mobile-menu"
                        initial={{ opacity: 0, y: -12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.18, ease: "easeInOut" }}
                        className="xl:hidden bg-white dark:bg-neutral-800 dark:text-neutral-200 shadow-md rounded-lg p-4 absolute top-16 left-0 right-0 mx-auto w-11/12 z-10"
                        >
                            <Items />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="absolute top-0 right-0 p-5">
                <button
                    className=" cursor-pointer p-2 rounded-full bg-neutral-900 text-white dark:bg-gray-200 dark:text-neutral-900 hover:bg-gray-300 dark:hover:bg-neutral-700 transition-colors duration-300"
                    onClick={toggleDarkMode}
                >
                    {darkMode ? <Sun /> : <Moon />}
                </button>
            </div>
        </header>
    );
}

