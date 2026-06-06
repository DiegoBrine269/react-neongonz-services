import React from 'react'
import Modal from '@/components/Modal'
import PeerLabel from '@/components/UI/PeerLabel'



export default function ModalAdjuntarCopia({responsables, isOpen, onClose, setFormData, formData, onContinue}) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="xl"
        >
            <h3 className="title-3">¿Deseas adjuntar copia a alguien?</h3>
            <div className="flex flex-wrap gap-1">
                {
                    responsables.map(r => 
                        <PeerLabel
                            key={r.email}
                            label={r.name}
                            value={r.email}
                            checked={formData.cc && formData.cc.includes(r.email)}
                            onChange={() => setFormData(prev => {
                                const cc = prev.cc || [];
                                if(cc.includes(r.email)) {
                                    return {
                                        ...prev,
                                        cc: cc.filter(email => email !== r.email)
                                    }
                                } else {
                                    return {
                                        ...prev,
                                        cc: [...cc, r.email]
                                    }
                                }   
                            })}
                        />

                    )
                }
            </div>

            <div className="contenedor-botones">
                <button className='btn' onClick={onContinue}>Continuar</button>
            </div>

        </Modal>
    )
}

