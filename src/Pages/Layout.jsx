
import {Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { AppContext } from "../context/AppContext";
import { useContext } from "react";
// import Modal from "react-modal";
import { ToastContainer } from "react-toastify";
import { PacmanLoader, PulseLoader } from "react-spinners";
import useNetworkStatus from "../hooks/useNetworkStatus";
import Snowfall from "react-snowfall";

export default function Layout() {
    const {isMenuOpen, setIsMenuOpen, loading, loadingMessage} = useContext(AppContext);
    const { isOnline } = useNetworkStatus();


    return (
        <>
            {/* Activar en navidad */}
            {/* <Snowfall
                className="pointer-events-none fixed inset-0 w-full"
                snowflakeCount={120}
            />   */}
            {loading && (
                <div className="fixed inset-0 z-50 flex flex-col gap-3 items-center justify-center bg-black/75">
                    <PacmanLoader color="#ffffff" />
                    {loadingMessage && <p className="text-white">{loadingMessage}</p>}
                </div>
            )}

            {!isOnline && (
                <div className="fixed inset-0 z-50 flex gap-2 flex-col items-center justify-center bg-black/75">
                    <p className="text-white font-bold">No hay conexión a internet, reintentando.</p>
                    <PulseLoader color="#ffffff" />
                </div>
            )}

            <div
                className="grid grid-rows-[auto_1fr_auto] min-h-[100dvh]"
                onClick={() => {
                    if (isMenuOpen) {
                        setIsMenuOpen(false);
                    }
                }}
            >
                <Header />

                <div className="bg-gray-100 dark:bg-neutral-900 p-4 md:px-24 lg:px-48 box-border max-w-[100vw]">
                    <Outlet />
                </div>

                <Footer />
            </div>
            <ToastContainer
                autoClose={2500}
                draggable
            />
        </>
    );
}
