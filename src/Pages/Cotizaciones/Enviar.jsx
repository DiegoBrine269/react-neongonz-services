// import { use } from "react";
import { useContext, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PeerLabel from "@/components/UI/PeerLabel";
import TitleCheckBox from "@/components/UI/TitleCheckBox";
import { useSelection } from "@/hooks/useSelection.js";
import { format } from "@formkit/tempo";
import {formatearDinero} from "@/utils/utils.js";
import { toast } from "react-toastify";
import { AppContext } from "@/context/AppContext";
import clienteAxios from "@/config/axios";

export default function Enviar() {

    const navigate = useNavigate();

    // Se reciben por props los pendientes de envío
    const location = useLocation();
    const { pendientesEnvio } = location.state || []; 
    const { selected, toggle, clear, isSelected, setSelected } = useSelection();
    const { token, setLoading, requestHeader, fetchPendientesEnvio } = useContext(AppContext);
    const [formData, setFormData] = useState({
        invoice_ids: selected,
    });


    // Agrupar por centre_id
    let grouped = pendientesEnvio.reduce((acc, item) => {
        const key = item.centre_id;
        if (!acc[key]) {
            acc[key] = {
                centre: item.centre,
                items: []
            };
        }
        acc[key].items.push(item);
        return acc;
    }, {});
    
    // console.log({grouped});

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);

        try {
            await clienteAxios.post(`/api/invoices/send`, formData, requestHeader);
            toast.success('Cotizaciones enviadas correctamente');
            clear();
            navigate('/cotizaciones');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Error al enviar las cotizaciones');
            console.log(error);
        } 
        finally {
            setLoading(false);
        }    
    };

    useEffect(() => {
        fetchPendientesEnvio();
        setFormData(prev => ({
            ...prev,
            invoice_ids: selected.map(item => item.id),
        }));
    }, [selected]);
    

    return (
        <>
            <h2 className="title-2">Enviar Cotizaciones</h2>

            {pendientesEnvio.length > 0 ? 
                <form action="">
                    {Object.entries(grouped).map(([centreId, group]) => (
                        <div
                            key={centreId}
                            className="border-1 border-neutral-400 p-2 rounded mb-4"
                        >
                            <div key={centreId}>
                                <TitleCheckBox
                                    name= {group.centre.id}
                                    label= {group.centre.name} 
                                    // checked={proyectosSeleccionados[p.id] || false}
                                    // onChange={handleCheckboxProyectoChange}
                                />
                                <h3 className="title-3 mb-1">
                                    
                                </h3>
                                <div className="flex gap-1 flex-wrap pl-2">                
                                    {group.items.map(item => (
                                        <PeerLabel
                                            key={item.id}
                                            label={`${item.invoice_number} ${item.is_budget ? '(Presupuesto)' : ''}`}
                                            onChange={() => toggle(item)}
                                            tooltip={{
                                                concept: {label:'Concepto', value:item.concept},
                                                date: {label:'Fecha', value:format(item.date, 'DD/MM/YYYY')},
                                                total: {label:'Total', value:formatearDinero(item.total)},
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        
                        </div>
                    ))
                    }

                    {selected.length > 0 && <input type="submit" value="Enviar" className="btn" onClick={handleSubmit} />}
                </form>
                :
                <p class=" text confeti">🎉 ¡Felicitaciones, estás al día! 🎉</p>

            }
        </>
    )
}

