import { useEffect, useContext, useState } from "react"
import clienteAxios from '@/config/axios';
import { AppContext } from '@/context/AppContext';
import { toast } from 'react-toastify';
import { PieChart, Pie, BarChart, Legend, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import {tabs, formatearDinero} from "@/utils/utils.js"

const COLORS = ['#4f46e5', '#059669', '#d97706', '#dc2626', '#7c3aed'];
const COLORS2 = ['#4f46e5', '#059669', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#db2777'];


export default function Estadisticas() {


    const {requestHeader, token } = useContext(AppContext)

    const [summary, setSummary] = useState([]);
    const [paymentPending, setPaymentPending] = useState([]);
    const [incomes, setIncomes] = useState([]);

    const [period, setPeriod] = useState('30');


    async function fetchSummary() {
        try {
            const res = await clienteAxios.get(`/api/statistics/summary`, requestHeader);
            setSummary(res.data);
            console.log("Summary data:", res.data);
            // const tabLabels = Object.fromEntries(tabs.map(t => [t.id, t.label]));
        } catch (error) {
            setSummary([]);
            toast.error("Error al cargar las estadísticas");
        }
    }

    async function fetchPaymentPending() {
        try {
            const res = await clienteAxios.get(`/api/statistics/payment-pending`, requestHeader);
            setPaymentPending(res.data);
            console.log("Payment pending data:", res.data);
        } catch (error) {
            setPaymentPending([]);
            toast.error("Error al cargar las cotizaciones por pagar");
        }
    }

        async function fetchIncomes() {
        try {
            const res = await clienteAxios.get(`/api/statistics/incomes?period=${period}`, requestHeader);
            setIncomes(res.data);
            console.log("Incomes data:", res.data);
        } catch (error) {
            setIncomes([]);
        }
    }

    useEffect(() => {
        fetchSummary();
        fetchPaymentPending();
        fetchIncomes();
    }, [])
    
    useEffect(() => {
        fetchIncomes();
    }, [period])

    return (
        <>
            <h2 className="title-2">Estadísticas de Cotizaciones</h2>




            <h3 className="title-3">Distribución por status</h3>

            <p className="text">Total de cotizaciones: <span className="bold">{summary.total_invoices}</span></p>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={summary.invoices_by_status}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {summary?.invoices_by_status?.map((entry, index) => (
                            <Cell key={entry.status} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            <h3 className="title-3">Centros de venta con deudas</h3>
            <p className="text">Deuda pendiente: <span className="bold">{formatearDinero(paymentPending.total_pending)}</span></p>

            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={paymentPending.distribution}
                        dataKey="invoices_sum_total"
                        nameKey="name"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                    >
                        {paymentPending?.distribution?.map((entry, index) => (
                            <Cell key={entry.id} fill={COLORS2[index % COLORS2.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>

            <h3 className="title-3">Ingresos por fecha</h3>



            <select id="period" value={period} onChange={(e) => setPeriod(e.target.value)}>
                <option value="7">Esta semana</option>
                <option value="30">Este mes</option>
                <option value="90">Últimos 3 meses</option>
                <option value="180">Últimos 6 meses</option>
                <option value="365">Último año</option>
            </select>

            <p className="text">Ingresos: <span className="bold">{formatearDinero(incomes.total)}</span></p>

        </>
    )
}
