
import Logo from "../assets/logo.png";
import LogoBlanco from "../assets/Logo-blanco.png";


import { NavLink } from "react-router-dom";
import { Menu, X, Car, Factory, Wrench, User, LogOut, Sun, Moon, LogIn, UserRoundPlus, BriefcaseBusiness  } from "lucide-react";
import { AppContext } from "../context/AppContext";
import { useContext } from "react";

export default function Header() {

    const { darkMode, toggleDarkMode, user, handleLogout, isMenuOpen, setIsMenuOpen } = useContext(AppContext);

    
    const handleToggle = () => {
        setIsMenuOpen(!isMenuOpen);
    };
    
    function Item({ to, text, children }) {
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
                onClick={() => setIsMenuOpen(false)}
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
                {user && user.role === 'admin' && <Item to="/centros-de-venta" text="Centros de venta" children={<Factory />} />}
                {user && user.role === 'admin' && <Item to="/servicios" text="Servicios" children={<Wrench />} />}
                {user && <Item to="/proyectos" text="Proyectos" children={<BriefcaseBusiness />} />}
                {user && <Item to="/mi-cuenta" text="Mi cuenta" children={<User />} />}
                {user && <button className="`flex items-center gap-2 p-2 rounded-md transition-colors duration-300 dark:text-neutral-200 hover:bg-gray-200 hover:text-neutral-900 dark:hover:bg-neutral-700 dark:hover:text-neutral-200" onClick={handleLogout}>
                         Cerrar sesión
                        </button>     }
                {!user && <Item to="/login" text="Iniciar Sesión" children={<LogIn />}/>}
                {!user && <Item to="/registro" text="Crear una cuenta" children={<UserRoundPlus />}/>}


            </>
        );
    }


    return (
        <header className="relative bg-gray-100 dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-700 py-2">
            <div className="container mx-auto">
                <nav className="flex py-5 items-center gap-4 justify-start md:justify-center">
                    <button onClick={handleToggle} className="md:hidden text-black dark:text-neutral-200">
                        {isMenuOpen ? <X /> : <Menu onClick={handleToggle} />}
                    </button>
                    <NavLink to="/">
                        <img src={darkMode ? LogoBlanco : Logo} alt="Logo" className="w-12 md:w-16" />
                    </NavLink>
                </nav>

                <div className="hidden md:flex md:justify-evenly" >
                    <Items />
                </div>

                {isMenuOpen && (

                    <div className="md:hidden bg-white dark:bg-neutral-800 dark:text-neutral-200 shadow-md rounded-lg p-4 absolute top-16 left-0 right-0 mx-auto w-11/12 z-10">
                        <Items />
                    </div>
                )}
            </div>

            <div className="absolute top-0 right-0 p-5">
                <button 
                    className=" cursor-pointer p-2 rounded-full bg-neutral-900 text-white dark:bg-gray-200 dark:text-neutral-900 hover:bg-gray-300 dark:hover:bg-neutral-700 transition-colors duration-300"
                    onClick={toggleDarkMode}
                >
                    {darkMode ?  <Sun /> : <Moon/> }
                </button>
            </div>
        </header>
    );
}

