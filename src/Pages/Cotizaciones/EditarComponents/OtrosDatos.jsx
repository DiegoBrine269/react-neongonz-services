
import ErrorLabel  from "@/components/UI/ErrorLabel.jsx";
export default function OtrosDatos({ formData, setFormData, errors = {}, cotizacion }) {

    const statuses = [
        { id: 'envio', label: 'Para envío'},
        { id: 'oc', label: 'Para OC' },
        { id: 'factura', label: 'Para factura' },
        { id: 'f', label: 'Para F' },
        { id: 'complemento', label: 'Para complemento' },
        { id: 'finalizada', label: 'Finalizada' },
    ];

    return (
        <>
            <h3 className="title-3">Otros datos</h3>

            {   
                cotizacion.oc && 
                <>

                    <label htmlFor="oc" className="label">Número de OC</label>
                    <input
                        type="text"
                        id="oc"
                        className="input"
                        value={formData.oc ?? cotizacion?.oc ?? ""}
                        placeholder="Número de OC"
                        onChange={(e) => setFormData({...formData, oc: e.target.value})}
                    />
                    <ErrorLabel>{errors?.oc}</ErrorLabel>
                </>
            }

            {   
                cotizacion.f_receipt && 
                <>
                    <label htmlFor="f_receipt" className="label">Número de F</label>
                    <input
                        type="text"
                        id="f_receipt"
                        className="input"
                        value={formData.f_receipt ?? cotizacion?.f_receipt ?? ""}
                        placeholder="Número de F"
                        onChange={(e) => setFormData({...formData, f_receipt: e.target.value})}
                    />
                    <ErrorLabel>{errors?.f_receipt}</ErrorLabel>
                </>
            }


            {   
                cotizacion.validation_date && 
                <>
                    <label htmlFor="validation_date" className="label">Fecha de validación</label>
                    <input
                        type="date"
                        id="validation_date"
                        className="input"
                        value={formData.validation_date ?? cotizacion?.validation_date ?? ""}
                        placeholder="Número de F"
                        onChange={(e) => setFormData({...formData, validation_date: e.target.value})}
                    />
                    <ErrorLabel>{errors?.validation_date}</ErrorLabel>
                </>
            }

            <label htmlFor="status" className="label">Estatus</label>
            <select name="status" id="status" className="input" onChange={(e) => setFormData({...formData, status: e.target.value})} value={formData.status || cotizacion?.status || ""}>
                {statuses.map(s => (
                    <option
                        key={s.id}
                        value={s.id}
                        selected={formData.status === s.id || cotizacion?.status === s.id}
                        onClick={(e) => setFormData({...formData, status: e.target.value})}
                    >   
                        {s.label}
                    </option>
                ))}
            </select>
            <ErrorLabel>{errors?.status}</ErrorLabel>

        </>
    )
}
