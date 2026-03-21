// MENU
function toggleMenu(){
document.getElementById("sidebar").classList.toggle("active");
}

// TROCAR SEÇÕES
function showSection(id){
document.querySelectorAll(".section").forEach(sec=>{
sec.classList.remove("active");
});
document.getElementById(id).classList.add("active");

toggleMenu();
}

// GERAR PLANOS
const container = document.getElementById("plans");

for(let i=1;i<=10;i++){
let price = i * 27;

let div = document.createElement("div");
div.className = "plan";

div.innerHTML = `💎 ${i}GB (${i*1024}MB) <span class="price">${price} MT</span>`;

div.onclick = ()=>{
div.style.transform="scale(1.1)";
setTimeout(()=>div.style.transform="scale(1)",150);

let msg = `Olá, quero comprar ${i}GB de internet.`;
let url = "https://wa.me/message/T3Q4JV4SXVZRO1?text=" + encodeURIComponent(msg);

window.open(url);
};

container.appendChild(div);
}

// WHATSAPP
function whatsapp(){
window.open("https://wa.me/message/T3Q4JV4SXVZRO1");
}

// COPIAR NÚMERO
function copiar(){
navigator.clipboard.writeText("858123028");
alert("Número copiado!");
}