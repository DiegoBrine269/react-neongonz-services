import React, { useEffect } from 'react'
import clienteAxios from '@/config/axios';
import { useContext, useState, useRef } from 'react';
import { AppContext } from '@/context/AppContext';

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
                }
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

            {images.map((img) => (
                <img key={img.id} src={img.path} alt={img.name} />
            ))}

            {/* Este div invisible es el trigger del scroll */}
            <div ref={loaderRef}>
                {hasMore && <span>Cargando...</span>}
            </div>
        </>
    )
}
