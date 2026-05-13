// 1. Datos iniciales con Stock y Precios base por Kilo
const productos = [
  { nombre: "Banano", precio: 2500, emoji: "🍌", stock: 50.0 },
  { nombre: "Manzana", precio: 3000, emoji: "🍎", stock: 30.0 },
  { nombre: "Papa", precio: 1800, emoji: "🥔", stock: 100.0 },
  { nombre: "Tomate", precio: 2200, emoji: "🍅", stock: 40.0 },
  { nombre: "Zanahoria", precio: 1500, emoji: "🥕", stock: 60.0 },
  { nombre: "Uvas", precio: 5000, emoji: "🍇", stock: 20.0 }
];

const contenedor = document.getElementById("productos");
const listaCarrito = document.getElementById("listaCarrito");
const totalHTML = document.getElementById("total");
const historialHTML = document.getElementById("historialVentas");

let carrito = [];
let historial = [];
let total = 0;

// 2. Mostrar productos con input de cantidad y unidad
function mostrarProductos() {
  contenedor.innerHTML = "";
  productos.forEach((producto, index) => {
    contenedor.innerHTML += `
      <div class="card">
        <div class="emoji">${producto.emoji}</div>
        <h3>${producto.nombre}</h3>
        <div class="precio">$${producto.precio} / Kg</div>
        <div class="stock">Disponible: ${producto.stock.toFixed(2)} Kg</div>
        
        <div class="controles">
          <input type="number" id="cant-${index}" placeholder="Cant." min="0.1" step="0.1">
          <select id="unit-${index}">
            <option value="kg">Kg</option>
            <option value="lb">Lb</option>
          </select>
        </div>

        <button onclick="prepararAgregar(${index})">Agregar</button>
      </div>
    `;
  });
}

// 3. Lógica para procesar el peso antes de agregar al carrito
function prepararAgregar(index) {
  const inputCant = document.getElementById(`cant-${index}`);
  const selectUnit = document.getElementById(`unit-${index}`);
  
  const cantidadPedida = parseFloat(inputCant.value);
  const unidad = selectUnit.value;
  const producto = productos[index];

  if (isNaN(cantidadPedida) || cantidadPedida <= 0) {
    alert("Por favor ingresa una cantidad válida");
    return;
  }

  // Convertimos a Kilos para validar stock (1 Lb = 0.5 Kg aprox para fruterías)
  let pesoEnKilos = unidad === "lb" ? cantidadPedida * 0.5 : cantidadPedida;

  if (pesoEnKilos > producto.stock) {
    alert("No hay suficiente stock disponible");
    return;
  }

  // Calcular precio proporcional
  let subtotal = pesoEnKilos * producto.precio;

  const itemCarrito = {
    nombre: producto.nombre,
    cantidad: cantidadPedida,
    unidad: unidad,
    pesoKilos: pesoEnKilos, // Guardamos esto para descontar luego
    subtotal: subtotal,
    indexOriginal: index
  };

  carrito.push(itemCarrito);
  total += subtotal;
  
  // Limpiar input
  inputCant.value = "";
  renderCarrito();
}

function renderCarrito() {
  listaCarrito.innerHTML = "";
  carrito.forEach((item, i) => {
    listaCarrito.innerHTML += `
      <div class="item">
        <span>${item.nombre} (${item.cantidad} ${item.unidad})</span>
        <span>$${item.subtotal.toFixed(0)}</span>
      </div>
    `;
  });
  totalHTML.textContent = "$" + total.toLocaleString();
}

// 4. Función Pagar: Descuenta stock y guarda en historial
function pagar() {
  if (carrito.length === 0) {
    alert("El carrito está vacío");
    return;
  }

  // Procesar cada item del carrito
  carrito.forEach(item => {
    // Descontar del inventario real
    productos[item.indexOriginal].stock -= item.pesoKilos;
    
    // Guardar en el historial global
    historial.push({
      fecha: new Date().toLocaleTimeString(),
      producto: item.nombre,
      venta: `${item.cantidad} ${item.unit}`,
      total: item.subtotal
    });
  });

  alert("Venta realizada con éxito ✅");
  
  // Limpiar todo y actualizar vista
  carrito = [];
  total = 0;
  renderCarrito();
  mostrarProductos(); // Para actualizar los números de stock en pantalla
  renderHistorial();
}

function renderHistorial() {
  if(!historialHTML) return;
  historialHTML.innerHTML = "<h4>Historial de Ventas</h4>";
  historial.forEach(v => {
    historialHTML.innerHTML += `<p>${v.fecha} - ${v.producto}: $${v.total.toFixed(0)}</p>`;
  });
}

mostrarProductos();
