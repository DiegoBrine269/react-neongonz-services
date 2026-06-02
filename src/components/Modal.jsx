const Modal = ({ isOpen, onClose, children, size }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-10 flex justify-center items-start bg-black/75 overflow-y-auto py-10"
            onClick={onClose} 
        >
            <div
                className={`bg-white rounded-2xl shadow-lg p-6  w-full relative mx-2 dark:bg-neutral-800 animate__animated animate__fadeIn ${size === 'sm' ? 'max-w-md' : size === 'lg' ? 'max-w-3xl' : size === 'xl' ? 'max-w-6xl' : 'max-w-lg'}`}
                onClick={(e) => e.stopPropagation()} 
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