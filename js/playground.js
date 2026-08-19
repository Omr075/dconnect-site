document.addEventListener("DOMContentLoaded", () => {


const button = document.getElementById("testApi");

const clearButton = document.getElementById("clearTerminal");

const result = document.getElementById("result");

const input = document.getElementById("query");



const user =
JSON.parse(
    localStorage.getItem("mozapi_user")
);



if (!user) {

    result.innerText =
    "Faça login primeiro.";

    result.className = "error";

    return;

}



const apikey = user.apikey;





const placeholders = [

"Procure por informações...",

"Procure por uma letra...",

"Digite o que precisa aqui",

"Como posso ajudar hoje?",

"Busque por uma música...",

"Pesquise por um vídeo..."

];


let index = 0;


setInterval(()=>{

    input.placeholder =
    placeholders[index];

    index =
    (index + 1) %
    placeholders.length;


},3000);







function terminal(text,type=""){

    result.className = type;

    result.innerText = text;

    result.scrollTop =
    result.scrollHeight;


}







clearButton.addEventListener("click",()=>{


terminal(
`Terminal v1.0

> Aguardando requisição...`
);


});









button.addEventListener("click", async()=>{


const endpoint =
document.getElementById("endpoint").value;


const query =
input.value.trim();



if(!query){


terminal(
"Erro: Digite alguma coisa.",
"error"
);


return;


}



terminal(
`Executando...

Endpoint:
${endpoint}

Parâmetro:
${query}`,
"loading"
);




try{


let url = "";



if(endpoint === "/api/music/search"){


url =
`/api/music/search?q=${encodeURIComponent(query)}&apikey=${encodeURIComponent(apikey)}`;


}



else if(endpoint === "/api/music/song"){


url =
`/api/music/song?q=${encodeURIComponent(query)}&apikey=${encodeURIComponent(apikey)}`;


}



else{


terminal(
"Endpoint ainda não implementado.",
"warning"
);


return;


}




const start =
performance.now();



const response =
await fetch(url);



const data =
await response.json();



const time =
Math.round(
performance.now()-start
);





if(endpoint === "/api/music/search"){


let html = "";

data.results.forEach(song=>{


html += `

<div class="music-card"
style="
background-image:
linear-gradient(
rgba(0,0,0,.35),
rgba(0,0,0,.85)
),
url('${song.cover}');
">


<div class="music-info">

<h2>${song.title}</h2>

<p>${song.artist}</p>

<small>${song.album}</small>

</div>


</div>

`;


});


result.className="success";


result.innerHTML =

`Status: 200 OK

Tempo: ${time}ms

Resultados encontrados:

${html}`;


}





/*
SONG
*/




else if (endpoint === "/api/music/song") {


result.className = "success";


result.innerHTML = `

<div 
class="music-card"

style="

background-image:

linear-gradient(
rgba(0,0,0,.35),
rgba(0,0,0,.85)
),

url('${data.cover}');

"

>


<div class="music-info">


<h2>
${data.title}
</h2>


<p>
${data.artist}
</p>


<small>
${data.album}
</small>


<audio controls>

<source
src="${data.preview}"
type="audio/mpeg">

</audio>


</div>


</div>

`;

}


result.classList.add("active");


setTimeout(()=>{

result.classList.remove("active");

},400);




}



catch(error){



console.error(error);



terminal(

`Erro na requisição.

${error.message}`,

"error"

);


}



});


});
