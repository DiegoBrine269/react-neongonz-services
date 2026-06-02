
import Modal from '@/components/Modal'
import { useEffect, useState, useContext } from 'react';
import clienteAxios from '@/config/axios';
import { AppContext } from '@/context/AppContext';
import {Reply} from "lucide-react";
import { CotizacionesContext } from '@/context/CotizacionesContext';

export default function ModalInbox({isOpen, onClose, onSelectEmail}) {

    const { user, requestHeader, inbox, fetchInbox } = useContext(CotizacionesContext);

    useEffect(() => {
        if (isOpen)
            fetchInbox();
    }, [isOpen]);



    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <h2 className="title-3">Bandeja de entrada</h2>

            <div 
                className="flex justify-end"
                onClick={() => onSelectEmail(null)}

            >
                <button className="link">Continuar sin responder a ningún correo</button>
            </div>

            <div className="card text">
                {
                    inbox?.length === 0 ? (
                        <p>No hay mensajes en la bandeja de entrada.</p>
                    ) : (
                        <div>
                            {inbox?.map((email) => (
                                <div key={email.uid} className="mb-4 p-4 border rounded-lg flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-bold">{email.subject}</h3>
                                            <p><strong>De:</strong> {email.from}</p>
                                            <p><strong>Fecha:</strong> {new Date(email.date).toLocaleString()}</p>
                                        </div>

                                        <button 
                                            className='btn'
                                            onClick={() => onSelectEmail(email)}
                                        >
                                            <Reply  />
                                            Responder a este correo
                                        </button>
                                    </div>
                                    <p>
                                        <iframe
                                            srcDoc={email.html}
                                            className="w-full h-64 border-0 bg-white"
                                            sandbox="allow-same-origin"
                                            title={email.subject}
                                        />
                                    </p>
                                </div>
                            ))}
                        </div>
                    )
                }
            </div>
        </Modal>
    )
}
