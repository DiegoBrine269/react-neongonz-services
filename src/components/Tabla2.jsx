import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import {useState} from "react";

export default function Tabla2({data = [], columns = [], ...props}) {
    const [products, setProducts] = useState([
        { code: "P1000", name: "Product 1", category: "Category 1", quantity: 10 },
        { code: "P1001", name: "Product 2", category: "Category 2", quantity: 20 },
        { code: "P1002", name: "Product 3", category: "Category 1", quantity: 30 },
        { code: "P1003", name: "Product 4", category: "Category 3", quantity: 40 },
        { code: "P1004", name: "Product 5", category: "Category 2", quantity: 50 },
    ]);

    // useEffect(() => {
    //     ProductService.getProductsMini().then((data) => setProducts(data));
    // }, []);

    return (
        <div className="card">
            <DataTable
                sortMode="multiple"
                value={data}
                size={"small"}
                tableStyle={{ minWidth: "50rem" }}
            >
                {columns.map((col, idx) => (
                    <Column key={idx} {...col} />
                ))}
            </DataTable>
        </div>
    );
}
