const productos = [
  {
    nombre:"Banano",
    precio:2500,
    emoji:"🍌"
  },
  {
    nombre:"Manzana",
    precio:3000,
    emoji:"🍎"
  },
  {
    nombre:"Papa",
    precio:1800,
    emoji:"🥔"
  },
  {
    nombre:"Tomate",
    precio:2200,
    emoji:"🍅"
  },
  {
    nombre:"Zanahoria",
    precio:1500,
    emoji:"🥕"
  },
  {
    nombre:"Uvas",
    precio:5000,
    emoji:"🍇"
  }
];

const contenedor = document.getElementById("productos");
const listaCarrito = document.getElementById("listaCarrito");
const totalHTML = document.getElementById("total");

let carrito = [];
let total = 0;

function mostrarProductos(){

  contenedor.innerHTML = "";

  productos.forEach((producto,index)=>{

    contenedor.innerHTML += `
      <div class="card">
        <div class="emoji">${producto.emoji}</div>

        <h3>${producto.nombre}</h3>

        <div class="precio">
          $${producto.precio}
        </div>

        <button onclick="agregar(${index})">
          Agregar
        </button>
      </div>
    `;
  });
}

function agregar(index){

  const producto = productos[index];

  carrito.push(producto);

  total += producto.precio;

  renderCarrito();
}

function renderCarrito(){

  listaCarrito.innerHTML = "";

  carrito.forEach((producto)=>{

    listaCarrito.innerHTML += `
      <div class="item">
        <span>${producto.nombre}</span>
        <span>$${producto.precio}</span>
      </div>
    `;
  });

  totalHTML.textContent = "$" + total;
}

function pagar(){

  if(carrito.length === 0){
    alert("No hay productos");
    return;
  }

  alert("Venta realizada ✅");

  carrito = [];
  total = 0;

  renderCarrito();
}

mostrarProductos();
