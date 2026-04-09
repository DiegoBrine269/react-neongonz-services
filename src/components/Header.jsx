import Logo from "../assets/Logo.png";
import LogoBlanco from "../assets/Logo-blanco.png";
import { motion, AnimatePresence } from "framer-motion";
import { NavLink } from "react-router-dom";
import {
    Menu, X, Car, Factory, Wrench, User, LogOut,
    Sun, Moon, LogIn, UserRoundPlus, BriefcaseBusiness, Receipt, Users
} from "lucide-react";
import { AppContext } from "../context/AppContext";
import { useContext } from "react";

export default function Header() {
    const { darkMode, toggleDarkMode, user, handleLogout, isMenuOpen, setIsMenuOpen } = useContext(AppContext);

    const handleToggle = () => setIsMenuOpen(!isMenuOpen);

    function Item({ to, text, children, onClick }) {
        return (
            <NavLink
                to={to}
                className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all duration-150 ${
                        isActive
                            ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-medium"
                            : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white"
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

    function Items() {
        return (
            <>
                {user && <Item to="/vehiculos" text="Vehículos" children={<Car size={15} />} />}
                {user && user.role === "admin" && <Item to="/centros-de-venta" text="Centros" children={<Factory size={15} />} />}
                {user && user.role === "admin" && <Item to="/servicios" text="Servicios" children={<Wrench size={15} />} />}
                {user && <Item to="/proyectos" text="Proyectos" children={<BriefcaseBusiness size={15} />} />}
                {user && user.role === "admin" && <Item to="/cotizaciones" text="Cotizaciones" children={<Receipt size={15} />} />}
                {user && <Item to="/mi-cuenta" text="Mi cuenta" children={<User size={15} />} />}
                {user && user.role === "admin" && <Item to="/usuarios" text="Usuarios" children={<Users size={15} />} />}
                {user && <Item to="/logout" text="Cerrar sesión" children={<LogOut size={15} />} onClick={handleLogout} />}
                {!user && <Item to="/login" text="Iniciar sesión" children={<LogIn size={15} />} />}
                {!user && <Item to="/registro" text="Crear una cuenta" children={<UserRoundPlus size={15} />} />}
            </>
        );
    }

    return (
        <header className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 relative">
            <div className="p-5 max-w-screen-lg mx-auto flex items-center justify-between ">

                {/* Controles derecha */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleToggle}
                        className="xl:hidden p-1 text-neutral-700 dark:text-neutral-200"
                    >
                        {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                    {/* Logo */}
                    <NavLink to="/">
                        <img
                            src={darkMode ? LogoBlanco : Logo}
                            alt="Logo"
                            className="w-9"
                        />
                    </NavLink>
                </div>


                {/* Links desktop */}
                <div className="hidden xl:flex items-center gap-1">
                    <Items />
                </div>
                <button
                    onClick={toggleDarkMode}
                    className="w-8 h-8 rounded-full border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                    {darkMode ? <Sun size={15} /> : <Moon size={15} />}
                </button>


                {/* Menú móvil */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            key="mobile-menu"
                            initial={{ opacity: 0, y: -12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.18, ease: "easeInOut" }}
                            className="xl:hidden bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm rounded-xl p-2 absolute top-full left-0 right-0 mx-auto w-11/12 z-10 flex flex-col gap-1"
                        >
                            <Items />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </header>
    );
}