
import ErrorLabel from '@/components/UI/ErrorLabel';

export default function FilaCotizacion({setFormData, formData, errors, id}) {
    return (
        <div className="pl-3 grid grid-cols-[2fr_1fr_1fr] md:grid-cols-[3fr_1fr_1fr] gap-2 ">

            <div>
                <label className="label" htmlFor="concept">
                    Concepto {id+1}
                </label>
                <textarea
                    className="input"
                    type="text"
                    id="concept"
                    placeholder="Concepto"
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            rows: {...formData.rows, [id]: { ...formData.rows[id], concept: e.target.value } },
                        })
                    }
                    // value={formData?.concept ?? ""}
                    value={formData?.rows[id]?.concept || ""}
                >
                </textarea>          
                <ErrorLabel>{errors?.concept}</ErrorLabel>
            </div>

            <div>
                <label className="label" htmlFor="quantity">
                    Cantidad {id+1}
                </label>
                <input
                    className="input"
                    type="number"
                    id="quantity"
                    placeholder="Cantidad"
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            rows: {...formData.rows, [id]: { ...formData.rows[id], quantity: e.target.value } },
                        })
                    }
                    value={formData?.rows[id].quantity || ""}
                />
                <ErrorLabel>{errors?.quantity}</ErrorLabel>
            </div>


            <div>
                <label className="label" htmlFor="price">
                    Precio {id+1}
                </label>
                <input
                    className="input"
                    type="number"
                    id="price"
                    placeholder="Precio"
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            rows: {...formData.rows, [id]: { ...formData.rows[id], price: e.target.value } },
                        })
                    }
                    value={formData?.rows[id]?.price || ""}
                />
                <ErrorLabel>{errors?.price}</ErrorLabel>
            </div>
        </div>
    )
}
