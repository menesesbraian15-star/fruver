<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Frutería POS Pro</title>
    <style>
        :root {
            --primary: #28a745;
            --dark: #333;
            --light: #f4f4f9;
        }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; background: var(--light); }
        
        /* Navegación */
        nav { background: var(--dark); color: white; padding: 1rem; display: flex; justify-content: center; gap: 10px; sticky: top; }
        nav button { background: #444; border: none; color: white; padding: 10px 15px; cursor: pointer; border-radius: 5px; transition: 0.3s; }
        nav button:hover { background: var(--primary); }
        nav button.active { background: var(--primary); font-weight: bold; }

        .container { padding: 20px; max-width: 1000px; margin: auto; }
        .view { display: none; } /* Oculto por defecto */
        .view.active { display: block; } /* Solo se muestra la activa */

        /* Grid de Ventas */
        .ventas-layout { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; }
        .grid-productos { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 15px; }
        .card { background: white; padding: 15px; border-radius: 8px; text-align: center; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .card .emoji { font-size: 2.5rem; }

        /* Tablas */
        table { width: 100%; border-collapse: collapse; background: white; margin-top: 10px; }
        th, td { padding: 12px; border: 1px solid #ddd; text-align: left; }
        th { background: #eee; }

        .btn-pagar { width: 100%; padding: 15px; background: var(--primary); color: white; border: none; font-size: 1.1rem; cursor: pointer; border-radius: 5px; }
        .badge-stock { font-size: 0.8rem; color: #666; display: block; margin-bottom: 5px; }
    </style>
</head>
<body>

<nav>
    <button onclick="irA('inicio')" id="btn-inicio">🏠 Inicio</button>
    <button onclick="irA('ventas')" id="btn-ventas">🛒 Ventas</button>
    <button onclick="irA('stock')" id="btn-stock">📦 Stock</button>
    <button onclick="irA('caja')" id="btn-caja">💰 Caja</button>
</nav>

<div class="container">
    
    <div id="view-inicio" class="view active">
        <h1>🍏 Bienvenido al POS de Frutería</h1>
        <p>Seleccione una opción en el menú superior para comenzar.</p>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div class="card"><h3>Ventas de hoy</h3><h2 id="resumen-ventas">$0</h2></div>
            <div class="card"><h3>Items en Carrito</h3><h2 id="resumen-carrito">0</h2></div>
        </div>
    </div>

    <div id="view-ventas" class="view">
        <div class="ventas-layout">
            <div id="lista-productos" class="grid-productos"></div>
            <div class="sidebar card">
                <h3>🛒 Carrito</h3>
                <div id="carrito-items"></div>
                <hr>
                <h4>Total: $<span id="total-carrito">0</span></h4>
                <button class="btn-pagar" onclick="finalizarVenta()">Finalizar Venta</button>
            </div>
        </div>
    </div>

    <div id="view-stock" class="view">
        <h2>📦 Gestión de Inventario</h2>
        <table>
            <thead>
                <tr>
                    <th>Producto</th>
                    <th>Precio/Kg</th>
                    <th>Stock Actual</th>
                    <th>Acción</th>
                </tr>
            </thead>
            <tbody id="tabla-stock"></tbody>
        </table>
    </div>

    <div id="view-caja" class="view">
        <h2>💰 Historial de Caja</h2>
        <table>
            <thead>
                <tr>
                    <th>Hora</th>
                    <th>Detalle</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody id="tabla-historial"></tbody>
        </table>
        <h3 style="text-align: right;">Total Recaudado: $<span id="gran-total-caja">0</span></h3>
    </div>

</div>

<script>
    // --- DATOS ---
    let productos = [
        { nombre: "Banano", precio: 2500, emoji: "🍌", stock: 50 },
        { nombre: "Manzana", precio: 3000, emoji: "🍎", stock: 30 },
        { nombre: "Papa", precio: 1800, emoji: "🥔", stock: 100 },
        { nombre: "Tomate", precio: 2200, emoji: "🍅", stock: 40 }
    ];

    let carrito = [];
    let historial = [];
    let totalVendidoHoy = 0;

    // --- NAVEGACIÓN ---
    function irA(vista) {
        // Ocultar todas las vistas
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
        
        // Mostrar la seleccionada
        document.getElementById(`view-${vista}`).classList.add('active');
        document.getElementById(`btn-${vista}`).classList.add('active');

        // Refrescar datos según la vista
        if(vista === 'ventas') renderVentas();
        if(vista === 'stock') renderStock();
        if(vista === 'caja') renderCaja();
        if(vista === 'inicio') actualizarResumen();
    }

    // --- LÓGICA DE VENTAS ---
    function renderVentas() {
        const div = document.getElementById('lista-productos');
        div.innerHTML = "";
        productos.forEach((p, i) => {
            div.innerHTML += `
                <div class="card">
                    <span class="emoji">${p.emoji}</span>
                    <h4>${p.nombre}</h4>
                    <span class="badge-stock">Stock: ${p.stock.toFixed(1)}kg</span>
                    <input type="number" id="q-${i}" step="0.1" placeholder="Cant" style="width:50px">
                    <select id="u-${i}"><option value="kg">Kg</option><option value="lb">Lb</option></select>
                    <button onclick="agregarAlCarrito(${i})" style="margin-top:5px">+</button>
                </div>
            `;
        });
    }

    function agregarAlCarrito(index) {
        const cant = parseFloat(document.getElementById(`q-${index}`).value);
        const unidad = document.getElementById(`u-${index}`).value;
        const p = productos[index];

        if(!cant || cant <= 0) return alert("Cantidad inválida");
        
        let pesoKg = unidad === 'lb' ? cant * 0.5 : cant;
        if(pesoKg > p.stock) return alert("No hay suficiente stock");

        carrito.push({
            nombre: p.nombre,
            subtotal: pesoKg * p.precio,
            pesoKg: pesoKg,
            detalle: `${cant}${unidad}`,
            indexOriginal: index
        });

        actualizarCarritoUI();
    }

    function actualizarCarritoUI() {
        const div = document.getElementById('carrito-items');
        const totalTxt = document.getElementById('total-carrito');
        div.innerHTML = "";
        let suma = 0;
        carrito.forEach(item => {
            div.innerHTML += `<div class="item-carrito"><span>${item.nombre} (${item.detalle})</span> <span>$${item.subtotal.toFixed(0)}</span></div>`;
            suma += item.subtotal;
        });
        totalTxt.innerText = suma.toLocaleString();
        document.getElementById('resumen-carrito').innerText = carrito.length;
    }

    function finalizarVenta() {
        if(carrito.length === 0) return;
        
        let totalVenta = 0;
        let detalleTexto = [];

        carrito.forEach(item => {
            productos[item.indexOriginal].stock -= item.pesoKg;
            totalVenta += item.subtotal;
            detalleTexto.push(`${item.detalle} ${item.nombre}`);
        });

        historial.push({
            hora: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            detalle: detalleTexto.join(", "),
            total: totalVenta
        });

        totalVendidoHoy += totalVenta;
        carrito = [];
        actualizarCarritoUI();
        renderVentas();
        alert("Venta guardada");
    }

    // --- LÓGICA DE STOCK ---
    function renderStock() {
        const tabla = document.getElementById('tabla-stock');
        tabla.innerHTML = "";
        productos.forEach((p, i) => {
            tabla.innerHTML += `
                <tr>
                    <td>${p.emoji} ${p.nombre}</td>
                    <td>$${p.precio}</td>
                    <td>${p.stock.toFixed(2)} Kg</td>
                    <td><button onclick="sumarStock(${i})">Añadir 10kg</button></td>
                </tr>
            `;
        });
    }

    function sumarStock(i) {
        productos[i].stock += 10;
        renderStock();
    }

    // --- LÓGICA DE CAJA ---
    function renderCaja() {
        const tabla = document.getElementById('tabla-historial');
        const totalCaja = document.getElementById('gran-total-caja');
        tabla.innerHTML = "";
        historial.forEach(v => {
            tabla.innerHTML += `<tr><td>${v.hora}</td><td>${v.detalle}</td><td>$${v.total.toLocaleString()}</td></tr>`;
        });
        totalCaja.innerText = totalVendidoHoy.toLocaleString();
    }

    function actualizarResumen() {
        document.getElementById('resumen-ventas').innerText = "$" + totalVendidoHoy.toLocaleString();
    }

    // Iniciar
    irA('inicio');
</script>

</body>
</html>
