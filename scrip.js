// ─── FUNCIONES PRINCIPALES ───────────────────────────────────────

  function toggleMenu(titulo) {
    const seccion = titulo.nextElementSibling;
    if (!seccion) return;
    const isOpen = seccion.style.display === "block";
    seccion.style.display = isOpen ? "none" : "block";
    titulo.classList.toggle("open", !isOpen);
  }

  function toggleCantidad(checkbox) {
    const item = checkbox.closest(".item");
    if (!item) return;
    const cantidad = item.querySelector(".cantidad");
    if (!cantidad) return;
    if (checkbox.checked) {
      cantidad.disabled = false;
      if (Number(cantidad.value) === 0) cantidad.value = 1;
    } else {
      cantidad.value = 0;
      cantidad.disabled = true;
    }
    calcularTotal();
  }

  function toggleDescripcion(checkbox) {
    const item = checkbox.closest(".item");
    if (!item) return;
    const desc = item.querySelector(".descripcion");
    if (!desc) return;
    desc.style.display = checkbox.checked ? "block" : "none";
  }

  function calcularTotal() {
    let subtotal = 0;
    document.querySelectorAll(".check-plato").forEach(cb => {
      if (!cb.checked) return;
      const item = cb.closest(".item");
      if (!item) return;
      const cantidad = Number(item.querySelector(".cantidad")?.value) || 0;
      if (cantidad <= 0) return;

      let precio = 0;
      const tamano = item.querySelector(".tamano");
      if (tamano) precio = Number(tamano.value);
      const sabor = item.querySelector(".sabor");
      if (!precio && sabor) precio = Number(sabor.value);
      if (!precio && cb.dataset.precio) precio = Number(cb.dataset.precio);
      if (!precio) {
        const span = item.querySelector("span");
        if (span) precio = Number(span.innerText.replace(/\$|\.|,/g, ""));
      }
      subtotal += precio * cantidad;
    });

    document.getElementById("total").innerText = "$" + subtotal.toLocaleString("es-CO");
    document.getElementById("totalPedido").value = subtotal;
  }

  // ─── MANEJO ENTREGA Y PAGO ────────────────────────────────────────

  function manejarEntrega(valor) {
    document.getElementById("direccionField").style.display = valor === "A domicilio" ? "block" : "none";
    document.getElementById("mesaField").style.display = valor === "Comer dentro del local" ? "block" : "none";
  }

  function manejarPago(valor) {
    const efectivoField = document.getElementById("efectivoField");
    const infoPago = document.getElementById("infoPago");
    const infoNequi = document.getElementById("infoNequi");
    const infoBanco = document.getElementById("infoBanco");
    const infoDaviplata = document.getElementById("infoDaviplata");

    efectivoField.style.display = valor === "Efectivo" ? "block" : "none";
    infoNequi.style.display = "none";
    infoBanco.style.display = "none";
    infoDaviplata.style.display = "none";

    if (valor === "Nequi") {
      infoPago.style.display = "block";
      infoNequi.style.display = "block";
    } else if (valor === "Bancolombia") {
      infoPago.style.display = "block";
      infoBanco.style.display = "block";
    } else if (valor === "Daviplata") {
      infoPago.style.display = "block";
      infoDaviplata.style.display = "block";
    } else {
      infoPago.style.display = "none";
    }
  }

  // ─── ENVÍO DEL PEDIDO ─────────────────────────────────────────────

  let ultimoEnvio = 0;

  function enviarPedido(e) {
    e.preventDefault();

    const ahora = Date.now();
    if (ahora - ultimoEnvio < 5000) {
      alert("⏳ Por favor espera unos segundos antes de enviar de nuevo.");
      return;
    }

    const nombre = document.getElementById("nombre").value.trim();
    const telefono = document.getElementById("telefono").value.trim();
    const tipoEntrega = document.getElementById("tipoEntrega").value;
    const direccion = document.getElementById("direccion").value.trim();
    const numeroMesa = document.getElementById("numeroMesa").value.trim();
    const tipoPago = document.getElementById("tipoPago").value;
    const efectivo = document.getElementById("efectivoCliente").value.trim();
    const especificaciones = document.getElementById("especificaciones").value.trim();
    const total = document.getElementById("totalPedido").value;

    // Construir lista de platos
    let platos = [];
    document.querySelectorAll(".check-plato").forEach(cb => {
      if (!cb.checked) return;
      const item = cb.closest(".item");
      if (!item) return;
      const cantidad = Number(item.querySelector(".cantidad")?.value) || 0;
      if (cantidad <= 0) return;

      let nombre_plato = cb.value;

      // Sabor o tamaño
      const saborSel = item.querySelector(".sabor");
      const tamanoSel = item.querySelector(".tamano");
      if (saborSel && saborSel.value) nombre_plato += ` (${saborSel.value})`;
      if (tamanoSel) {
        const opt = tamanoSel.options[tamanoSel.selectedIndex];
        if (opt) nombre_plato += ` (${opt.text})`;
      }

      let precio = 0;
      if (tamanoSel) precio = Number(tamanoSel.value);
      if (!precio && saborSel) precio = Number(saborSel.value);
      if (!precio) {
        const span = item.querySelector("span");
        if (span) precio = Number(span.innerText.replace(/\$|\.|,/g, ""));
      }

      platos.push(`• ${nombre_plato} × ${cantidad}`);
    });

    if (platos.length === 0) {
      alert("🛒 Por favor selecciona al menos un producto.");
      return;
    }

    // Construir mensaje
    let msg = `🦸 *SUPER HÉROES COMIDAS RÁPIDAS*\n`;
msg += `━━━━━━━━━━━━━━━━━━━\n`;

if (nombre) msg += `👤 *Nombre:* ${nombre}\n\n`;
if (telefono) msg += `📞 *Número:* ${telefono}\n\n`;

msg += `🍽️ *Platos:*\n${platos.join("\n")}\n`;
msg += `━━━━━━━━━━━━━━━━━━━\n`;

let metodoTexto = tipoEntrega;
if (tipoEntrega === "Recoger en el local") metodoTexto = "Recoger en el local";
if (tipoEntrega === "A domicilio") metodoTexto = "Domicilio";
if (tipoEntrega === "Comer dentro del local") metodoTexto = "Comer en el local";
msg += `📦 *Entrega:* ${metodoTexto}\n`;
if (tipoEntrega === "Comer dentro del local" && numeroMesa) msg += `🪑 *Mesa:* ${numeroMesa}\n`;
msg += `\n`;

if (tipoEntrega === "A domicilio" && direccion) msg += `📍 *Dirección:* ${direccion}\n\n`;

if (tipoPago) msg += `💳 *Forma de Pago:* ${tipoPago}\n\n`;
if (tipoPago === "Efectivo" && efectivo) msg += `💵 *Con cuánto paga:* ${efectivo}\n\n`;

if (especificaciones) msg += `📝 *Extras:*\n${especificaciones}\n\n`;

msg += `━━━━━━━━━━━━━━━━━━━\n`;
msg += `💰 *Total:* $${Number(total).toLocaleString("es-CO")}`;
    
  

    const numero = "573008111846";
    const btn = document.getElementById("btnEnviar");
    btn.disabled = true;
    btn.textContent = "⏳ Enviando...";
    ultimoEnvio = Date.now();

    setTimeout(() => {
      btn.disabled = false;
      btn.textContent = "📲 Enviar Pedido por WhatsApp";
    }, 5000);

    // ─── ENVÍO A SUPABASE Y APERTURA DE WHATSAPP ─────────────────────────────
const SUPABASE_URL = "https://rsiqorucrflmrfqejkeb.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzaXFvcnVjcmZsbXJmcWVqa2ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5ODk2MDEsImV4cCI6MjA5MjU2NTYwMX0.Dg8FqwX17zgiNlXOPJgz1IJQR3jDBizBgzQ-x-UvPZs";

const fechaHoy = new Date().toLocaleString("es-CO", { timeZone: "America/Bogota" });

const datosPedido = {
  Fecha:     fechaHoy,
  Nombre:    nombre,
  Telefono:  telefono,
  Platos:    platos.join("\n"),
  Entrega:   tipoEntrega,
  Direccion: tipoEntrega === "A domicilio" ? direccion : "",
  Pago:      tipoPago,
  Total:     "$" + Number(total).toLocaleString("es-CO")
};

fetch(`${SUPABASE_URL}/rest/v1/pedidos`, {
  method: "POST",
  headers: {
    "apikey": SUPABASE_KEY,
    "Authorization": `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
    "Prefer": "return=representation"
  },
  body: JSON.stringify(datosPedido)
})
.then(res => {
  if (!res.ok) {
    return res.json().then(err => { throw new Error(JSON.stringify(err)); });
  }
  return res.json();
})
.then(data => {
  const id = data?.[0]?.id;
  if (id) {
    msg += `\n\n🖨️ *Imprimir ticket:* https://aimx-studio.github.io/Super-H-roes-Girardot/ticket.html?id=${id}`;
  }
  window.location.href = "https://wa.me/" + numero + "?text=" + encodeURIComponent(msg);
  setTimeout(() => { location.reload(); }, 3000);
})
.catch(err => {
  console.error("Error Supabase:", err);
  window.location.href = "https://wa.me/" + numero + "?text=" + encodeURIComponent(msg);
  setTimeout(() => { location.reload(); }, 3000);
});
}
