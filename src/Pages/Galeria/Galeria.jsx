import React, { useEffect } from 'react'
import clienteAxios from '@/config/axios';
import { useContext, useState, useRef } from 'react';
import { AppContext } from '@/context/AppContext';
import { Link } from 'react-router-dom';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';

export default function Galeria() {

    const { token } = useContext(AppContext);
    
    const [images, setImages] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const loaderRef = useRef(null);
    const isFetching = useRef(false);

    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    const fetchImages = async (pageNum) => {
        if (isFetching.current || !hasMore) return;
        isFetching.current = true;
        try {
            const res = await clienteAxios.get('/api/project-vehicles-photos', {
                headers: { Authorization: `Bearer ${token}` },
                params: { page: pageNum }
            });
            setImages((prev) => [...prev, ...res.data.data]);
            setHasMore(res.data.next_page_url !== null);
        } catch (error) {
            console.error('Error fetching images:', error);
        } finally {
            isFetching.current = false;
        }
    };

    // Fetch cuando cambia la página
    useEffect(() => {
        fetchImages(page);
    }, [page]);

    // IntersectionObserver: único responsable de incrementar página
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && hasMore && !isFetching.current) {
                    setPage((p) => p + 1);
                }
            },
            { rootMargin: '200px' }
        );

        if (loaderRef.current) observer.observe(loaderRef.current);
        return () => observer.disconnect();
    }, [hasMore]); // ✅ reconectar solo si hasMore cambia

    const handleLightboxView = ({ index }) => {
        setLightboxIndex(index);
        if (index >= images.length - 2 && hasMore && !isFetching.current) {
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
                {hasMore && <span>Cargando...</span>}
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