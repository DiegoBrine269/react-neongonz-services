const FacturacionPreview = ({ data }) => (
    <div style={{ textAlign: "left", fontSize: "14px" }}>
        <p><strong>Cotizaciones a facturar:</strong> {data.cotizaciones.map(c=>c.invoice_number).join(', ')} </p>
        <p><strong>Forma de pago:</strong> {data.formData.payment_form} </p>
        <p><strong>Método de pago:</strong> {data.formData.payment_method} </p>
    </div>
);

export default FacturacionPreview;