import React from 'react'
import HomeCars from "../assets/home-cars.png";

export default function Home() {
    return (
        <div className="flex flex-col items-center justify-center h-full">
            <h2 className="text-2xl text-gray-800 dark:text-neutral-200 text-center mb-6">
                Bienvenido a <span className="font-semibold text-red-600">Servicios-NeonGonz</span>, el lugar para el llevar el registro de servicios a Grupo Bimbo.
            </h2>

            <div className='w-5/6 md:w-1/2 lg:w-1/3'>
                <img src={HomeCars} alt="Imagen con carros de bienvenida" />
            </div>
        </div>
    )
}
