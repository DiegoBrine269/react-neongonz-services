
import {Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { AppContext } from "../context/AppContext";
import { useContext } from "react";
// import Modal from "react-modal";
import { ToastContainer } from "react-toastify";
import { PacmanLoader } from "react-spinners";


export default function Layout() {
    const {isMenuOpen, setIsMenuOpen, loading} = useContext(AppContext);



    return (
        <>
            {loading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75">
                    <PacmanLoader color="#ffffff" />
                </div>
            )}

            <div
                className="grid grid-rows-[auto_1fr_auto] min-h-screen"
                onClick={() => {
                    if (isMenuOpen) {
                        setIsMenuOpen(false);
                    }
                }}
            >
                <Header />

                <div className="bg-gray-100 dark:bg-neutral-900 p-5 md:px-24 lg:px-48 max-w-[100vw]">
                    <Outlet />
                </div>

                <Footer />
            </div>
            <ToastContainer />
        </>
    );
}
