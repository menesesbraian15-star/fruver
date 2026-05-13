<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Frutería Pro - Inventario y Ventas</title>
    <style>
        body { font-family: sans-serif; background: #f4f4f9; padding: 20px; display: flex; flex-direction: column; align-items: center; }
        .main-container { display: flex; gap: 20px; max-width: 1000px; width: 100%; }
        
        /* Seccion Productos */
        #productos { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 15px; flex: 2; }
        .card { background: white; padding: 15px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); text-align: center; }
        .emoji { font-size: 3rem; }
        .stock { font-size: 0.8rem; color: #666; margin-bottom: 10px; }
        .controles { margin-bottom: 10px; }
        input[type="number"] { width: 60px; padding: 5px; }
        select { padding: 5px; }
        button { cursor: pointer; padding: 8px 15px; border: none; border-radius: 5px; background: #28a745; color: white; font-weight: bold; }
        button:hover { background: #218838; }

        /* Lateral: Carrito e Historial */
        .sidebar { flex: 1; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .carrito-lista { list-style: none; padding: 0; border-bottom: 2px solid #eee; }
        .item-carrito { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 0.9rem; }
        
        /* Historial */
        .historial-section { width: 100%; max-width: 1000px; margin-top: 30px; background: white; padding: 20px; border-radius: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        th { background-color: #f8f9fa; }
        .total-caja { background: #333; color: white; padding: 10px; border-radius: 5px; display: inline-block; margin-top: 10px; }
    </style>
</head>
<body>

    <h1>🍎 Mi Frutería</h1>

    <div class="main-container">
        <div id="productos"></div>

        <div class="sidebar">
            <h3>🛒 Carrito</h3>
            <ul id="listaCarrito" class="carrito-lista"></ul>
            <p><strong>Total: $<span id="total">0</span></strong></p>
            <button onclick="pagar()" style="width: 100%; background: #007bff;">Finalizar Venta</button>
        </div>
    </div>

    <div class="historial-section">
        <h3>📋 Historial de Ventas y Caja</h3>
        <table>
            <thead>
                <tr>
                    <th>Hora</th>
                    <th>Detalle de Productos</th>
                    <th>Total Venta</th>
                </tr>
            </thead>
            <tbody id="cuerpoHistorial"></tbody>
        </table>
        <div class="total-caja">Ventas Totales del Día: $<span id="totalCaja">0</span></div>
    </div>

    <script>
        // 1. Base de Datos de Productos (Inventario Inicial)
        const productos = [
            { nombre: "Banano", precio: 2500, emoji: "🍌", stock: 50.0 },
            { nombre: "Manzana", precio: 3000, emoji: "🍎", stock: 30.0 },
            { nombre: "Papa", precio: 1800, emoji: "🥔", stock: 100.0 },
            { nombre: "Tomate", precio: 2200, emoji: "🍅", stock: 40.0 },
            { nombre: "Zanahoria", precio: 1500, emoji: "🥕", stock: 60.0 },
            { nombre: "Uvas", precio: 5000, emoji: "🍇", stock: 20.0 }
        ];

        let carrito = [];
        let historial = [];
        let totalCarrito = 0;

        const contenedor = document.getElementById("productos");
        const listaCarrito = document.getElementById("listaCarrito");
        const totalHTML = document.getElementById("total");
        const cuerpoHistorial = document.getElementById("cuerpoHistorial");
        const totalCajaHTML = document.getElementById("totalCaja");

        // 2. Mostrar Productos con Stock actualizado
        function mostrarProductos() {
            contenedor.innerHTML = "";
            productos.forEach((p, index) => {
                contenedor.innerHTML += `
                    <div class="card">
                        <div class="emoji">${p.emoji}</div>
                        <h3>${p.nombre}</h3>
                        <div class="stock">Stock: ${p.stock.toFixed(2)} Kg</div>
                        <div class="precio"><strong>$${p.precio} / Kg</strong></div>
                        <div class="controles">
                            <input type="number" id="cant-${index}" min="0.1" step="0.1" placeholder="Cant.">
                            <select id="unit-${index}">
                                <option value="kg">Kg</option>
                                <option value="lb">Lb</option>
                            </select>
                        </div>
                        <button onclick="agregar(${index})">Agregar</button>
                    </div>
                `;
            });
        }

        // 3. Lógica para Agregar al Carrito (Gestionando Unidades)
        function agregar(index) {
            const input = document.getElementById(`cant-${index}`);
            const unidad = document.getElementById(`unit-${index}`).value;
            const cantidad = parseFloat(input.value);
            const producto = productos[index];

            if (isNaN(cantidad) || cantidad <= 0) {
                alert("Por favor, ingresa una cantidad válida.");
                return;
            }

            // Conversión: 1 Libra = 0.5 Kilo (Lógica estándar de frutería)
            let pesoEnKilos = (unidad === "lb") ? cantidad * 0.5 : cantidad;

            if (pesoEnKilos > producto.stock) {
                alert("No hay suficiente stock de " + producto.nombre);
                return;
            }

            // Calcular precio proporcional al peso en Kilos
            let subtotal = pesoEnKilos * producto.precio;

            carrito.push({
                nombre: producto.nombre,
                cantidadOriginal: cantidad,
                unidadUsada: unidad,
                pesoKilos: pesoEnKilos,
                subtotal: subtotal,
                indexOriginal: index
            });

            totalCarrito += subtotal;
            input.value = ""; // Limpiar campo
            renderCarrito();
        }

        function renderCarrito() {
            listaCarrito.innerHTML = "";
            carrito.forEach(item => {
                listaCarrito.innerHTML += `
                    <li class="item-carrito">
                        <span>${item.nombre} (${item.cantidadOriginal} ${item.unidadUsada})</span>
                        <span>$${item.subtotal.toFixed(0)}</span>
                    </li>
                `;
            });
            totalHTML.textContent = totalCarrito.toLocaleString();
        }

        // 4. Pagar: Descontar del stock y registrar en historial
        function pagar() {
            if (carrito.length === 0) {
                alert("El carrito está vacío");
                return;
            }

            const ahora = new Date();
            const hora = ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            let resumenVenta = [];

            // Descontar stock real
            carrito.forEach(item => {
                productos[item.indexOriginal].stock -= item.pesoKilos;
                resumenVenta.push(`${item.cantidadOriginal}${item.unidadUsada} ${item.nombre}`);
            });

            // Agregar al historial
            historial.push({
                hora: hora,
                detalle: resumenVenta.join(", "),
                total: totalCarrito
            });

            alert("Venta procesada con éxito.");

            // Limpiar datos de la venta actual
            carrito = [];
            totalCarrito = 0;

            // Actualizar Interfaz
            renderCarrito();
            mostrarProductos();
            actualizarHistorial();
        }

        function actualizarHistorial() {
            cuerpoHistorial.innerHTML = "";
            let ingresosTotales = 0;

            historial.forEach(v => {
                ingresosTotales += v.total;
                cuerpoHistorial.innerHTML += `
                    <tr>
                        <td>${v.hora}</td>
                        <td>${v.detalle}</td>
                        <td>$${v.total.toLocaleString()}</td>
                    </tr>
                `;
            });
            totalCajaHTML.textContent = ingresosTotales.toLocaleString();
        }

        // Iniciar App
        mostrarProductos();
    </script>
</body>
</html>
