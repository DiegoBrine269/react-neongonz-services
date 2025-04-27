import React from 'react'

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center h-full">
            <h1 className="text-4xl font-bold text-red-600">404</h1>
            <p className="mt-4 text-lg text-gray-700">Página no encontrada</p>
            <p className="mt-2 text-sm text-gray-500">Lo sentimos, la página que buscas no existe.</p>
        </div>
    )
}
