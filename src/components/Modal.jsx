const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-10 flex justify-center items-start bg-black/75 overflow-y-auto py-10"
            onClick={onClose} // 👈 click fuera
        >
            <div
                className="bg-white rounded-2xl shadow-lg p-6 max-w-lg w-full relative mx-2 dark:bg-neutral-800 animate__animated animate__fadeIn"
                onClick={(e) => e.stopPropagation()} // 👈 evita cerrar si click dentro
            >
                <button
                    onClick={onClose}
                    className="cursor-pointer absolute top-4 right-6 text-gray-500 hover:text-gray-800 text-3xl"
                >
                    &times;
                </button>

                {children}
            </div>
        </div>
    );
};

export default Modal;