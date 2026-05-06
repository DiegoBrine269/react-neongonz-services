import React, { useEffect } from 'react'
import clienteAxios from '@/config/axios';
import { useContext, useState, useRef } from 'react';
import { AppContext } from '@/context/AppContext';
import { Link } from 'react-router-dom';

export default function Galeria() {

    const { token } = useContext(AppContext);
    
    const [images, setImages] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const loaderRef = useRef(null);

    const fetchImages = async () => {
        try {
             const res = await clienteAxios.get('/api/project-vehicles-photos', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: { page } // 👈 esto
            });

            setImages((prev) => [...prev, ...res.data.data]);
            setHasMore(res.data.next_page_url !== null);

        } catch (error) {
            console.error('Error fetching images:', error);
        }
    }

    useEffect(() => {
        fetchImages(page);
    }, [page]);

    // Intersection Observer para detectar cuando llega al final
    useEffect(() => {
        const observer = new IntersectionObserver(
        ([entry]) => {
            if (entry.isIntersecting && hasMore) setPage((p) => p + 1);
        },
        { rootMargin: "200px" }
        );

        if (loaderRef.current) observer.observe(loaderRef.current);
        return () => observer.disconnect();
    }, [hasMore]);

    return (
        <>
            <h2 className="title-2">Galería</h2>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2'>
                {images.map((img) => (
                    <div key={img.id}>
                        <p className="text"><Link className='link' to={`/proyectos/${img?.project_vehicle?.project?.id}`}>{img?.project_vehicle?.project?.service?.name}, {img?.project_vehicle?.project?.centre?.name}</Link> - {img?.project_vehicle?.vehicle?.eco}</p>
                        <img 
                            src={img.url} 
                            alt={img.name} 
                            className='w-full h-48 object-cover rounded'
                        />
                    </div>
                ))}
            </div>

            {/* Este div invisible es el trigger del scroll */}
            <div ref={loaderRef}>
                {hasMore && <span>Cargando...</span>}
            </div>
        </>
    )
}
