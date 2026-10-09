import get from "lodash.get";
import {Trash2, TextAlignJustify} from "lucide-react";
import ErrorLabel from "@/components/UI/ErrorLabel";
import { useContext, useEffect } from "react";
import { AppContext } from "@/context/AppContext";

export default function PartidasCotizacion({
    fields,
    errors,
    remove,
    register,
    onOpenCatalogo,
}) {


    const CATALOGOS = [
        { tipo: "servicios", label: "Servicios" },
        { tipo: "productos", label: "Productos" },
    ];

    const { units, fetchUnits } = useContext(AppContext);
    useEffect(() => {
        fetchUnits();
    }, []);

    return (
        <>
            {fields.map((field, index) => (
                <div
                    key={field.id}
                    className="my-3 relative form-fieldset"
                >
                    <div className="flex justify-between mb-1 center-items">
                        <p className="text ">Fila {index + 1}</p>
                        <button
                            className="btn btn-danger w-auto! p-1! m-0"
                            type="button"
                            onClick={() => remove(index)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="grid md:grid-cols-[1fr_4fr_2fr_1fr_2fr] gap-1 items-start">
                        <div>
                            <input
                                {...register(`items.${index}.quantity`)}
                                placeholder="Cantidad"
                                className="input"
                                type="number"
                                min="1"
                            />
                            <ErrorLabel>
                                {get(errors, `rows.${index}.quantity`)}
                            </ErrorLabel>
                        </div>

                        <div>
                            <textarea
                                {...register(`items.${index}.concept`)}
                                placeholder="Concepto"
                                className="input scrollbar-none"
                                type="text"
                                rows={3}
                            />

                            <ErrorLabel>
                                {get(errors, `rows.${index}.concept`)}
                            </ErrorLabel>
                        </div>

                        <div>
                            <input
                                {...register(`items.${index}.price`)}
                                placeholder="Precio"
                                className="input"
                                type="number"
                                step="any"
                            />
                            <ErrorLabel>
                                {get(errors, `rows.${index}.price`)}
                            </ErrorLabel>
                        </div>

                        <div>
                            <select
                                id="sat_unit_key"
                                // value=""
                                {...register(`items.${index}.sat_unit_key`)}
                            >
                                <option value="" disabled>
                                    Selecciona una unidad de medida
                                </option>
                                {units.map((unit) => (
                                    <option key={unit.key} value={unit.key}>
                                        {unit.name} ({unit.key})
                                    </option>
                                ))}
                            </select>
                            <ErrorLabel>
                                {get(errors, `rows.${index}.sat_unit_key`)}
                            </ErrorLabel>
                        </div>

                        <div>
                            <input
                                {...register(
                                    `items.${index}.sat_key_prod_serv`,
                                )}
                                placeholder="Clave de producto o servicio"
                                className="input"
                                type="number"
                            />
                            <ErrorLabel>
                                {get(errors, `rows.${index}.sat_key_prod_serv`)}
                            </ErrorLabel>
                        </div>
                    </div>

                    <div className="contenedor-botones">
                        {CATALOGOS.map(({ tipo, label }) => (
                            <button
                                key={tipo}
                                className="btn btn-secondary"
                                type="button"
                                onClick={() => onOpenCatalogo(index, tipo)}
                            >
                                <TextAlignJustify /> {label}
                            </button>
                        ))}
                    </div>
                </div>
            ))}
        </>
    );
}
