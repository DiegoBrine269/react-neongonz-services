const FacturacionPreview = ({ data }) => (
    <div style={{ textAlign: "left", fontSize: "14px" }}>
        <p><strong>Facturas para complemento:</strong> {data.cotizaciones.map(c=>c.invoice_number).join(', ')} </p>
        <p><strong>Forma de pago:</strong> {data.formData.payment_form} </p>
        
    </div>
);

export default FacturacionPreview;