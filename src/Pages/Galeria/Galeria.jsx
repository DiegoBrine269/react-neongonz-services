import React, { useEffect } from 'react'
import { useContext, useState, useRef } from 'react';
import { AppContext } from '@/context/AppContext';
import { Link } from 'react-router-dom';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';

export default function Galeria() {

    const {  images, hasMoreImages, fetchImages, isFetchingImages } = useContext(AppContext);
    

    const [page, setPage] = useState(1);
    const loaderRef = useRef(null);

    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);



    // Fetch cuando cambia la página
    useEffect(() => {
        fetchImages(page);
    }, [page]);

    // IntersectionObserver: único responsable de incrementar página
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && hasMoreImages && !isFetchingImages.current) {
                    setPage((p) => p + 1);
                }
            },
            { rootMargin: '200px' }
        );

        if (loaderRef.current) observer.observe(loaderRef.current);
        return () => observer.disconnect();
    }, [hasMoreImages, isFetchingImages]); 

    const handleLightboxView = ({ index }) => {
        setLightboxIndex(index);
        if (index >= images.length - 2 && hasMoreImages && !isFetchingImages.current) {
            setPage((p) => p + 1);
        }
    };

    return (
        <>
            <h2 className="title-2">Galería</h2>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2'>
                {images.map((img) => (
                    <div key={img.id}>
                        <p className="text">
                            <Link className='link' to={`/proyectos/${img?.project_vehicle?.project?.id}`}>
                                {img?.project_vehicle?.project?.service?.name}, {img?.project_vehicle?.project?.centre?.name}
                            </Link> - {img?.project_vehicle?.vehicle?.eco}
                        </p>
                        <img 
                            src={img.url} 
                            alt={img.name} 
                            className='w-full h-48 object-cover rounded cursor-pointer'
                            onClick={() => {
                                setLightboxIndex(images.findIndex(i => i.id === img.id));
                                setLightboxOpen(true);
                            }}
                        />
                    </div>
                ))}
            </div>

            <div ref={loaderRef}>
                {hasMoreImages && <span>Cargando...</span>}
            </div>

            <Lightbox
                open={lightboxOpen}
                close={() => setLightboxOpen(false)}
                index={lightboxIndex}
                slides={images.map(img => ({ src: img.url, alt: img.name }))}
                plugins={[Zoom]}
                on={{ view: handleLightboxView }}
                controller={{ closeOnBackdropClick: true }}
            />
        </>
    );
}