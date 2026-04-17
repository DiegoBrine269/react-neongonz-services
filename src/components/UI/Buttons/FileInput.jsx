import { useDropzone } from 'react-dropzone';
import { useRef } from 'react';
import { Folder, Camera } from 'lucide-react';

export default function FileInput({ handleSeleccionarFotos }) {

    const cameraInputRef = useRef();

    const { getRootProps, getInputProps } = useDropzone({
        accept: {
            'image/*': []
        },
        multiple: true,
        onDrop: (acceptedFiles) => {
            handleSeleccionarFotos({
                target: { files: acceptedFiles }
            });
        }
    });

    const openCamera = () => {
        cameraInputRef.current.click();
    };

    return (
        <div className="flex flex-col gap-2">

            <div className="grid grid-cols-2 gap-1">
                <div {...getRootProps()} className="btn btn-secondary w-full cursor-pointer">
                    <Folder className="" />
                    <input {...getInputProps()} />
                    De Galería
                </div>

                <button
                    type="button"
                    onClick={openCamera}
                    className="btn btn-secondary"
                >
                    <Camera className="" />
                    De Cámara
                </button>

            </div>

            {/* input oculto para cámara */}
            <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                style={{ display: 'none' }}
                onChange={handleSeleccionarFotos}
            />
        </div>
    );
}