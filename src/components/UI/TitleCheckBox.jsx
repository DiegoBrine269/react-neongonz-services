export default function TitleCheckBox({name, label, checked, onChange, }) {
    return (
        <label
            htmlFor={`seleccionar-proyecto-${name}`}
            className="flex gap-1  items-center m-0"
        >
            <input
                className="h-4 w-4"
                name={name}
                type="checkbox"
                id={`seleccionar-proyecto-${name}`}
                checked={checked}
                onChange={onChange}
            />
            <span className="title-3 m-0 select-none">
                {label}
            </span>
        </label>
    );
}
