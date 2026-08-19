document.addEventListener("DOMContentLoaded", () => {


/* ===========================
   FRASES DE DESTAQUE
=========================== */


const textos = [

    "Sabias que podes testar endpoints directamente do site?",

    "Consulte a documentação antes de começar",

    "Hey, sabias que podes receber assistência 24h por dia?",

    "O free tier vem pronto para quem pretende começar!"

];


let index = 0;


const destaque =
    document.getElementById("destaque");


if(destaque){

    setInterval(() => {

        destaque.innerText =
            textos[index];

        index =
            (index + 1) % textos.length;

    },3500);

}



/* ===========================
   ELEMENTOS DO CHAT
=========================== */


const form =
    document.getElementById("chatForm");


const input =
    document.getElementById("chat");


const messages =
    document.getElementById("messages");



const user =
    JSON.parse(
        localStorage.getItem("mozapi_user")
    );



if(!form || !input || !messages){

    return;

}



/* ===========================
   ENVIO
=========================== */


form.addEventListener("submit", async (e)=>{


    e.preventDefault();



    const prompt =
        input.value.trim();



    if(!prompt){

        return;

    }



    addMessage(

        prompt,

        "user"

    );



    input.value = "";



    const loading =
        addMessage(

            "A pensar...",

            "ai"

        );



    try{


        const response =
            await fetch(

                "/api/ai/chat",

                {

                    method:"POST",


                    headers:{


                        "Content-Type":
                        "application/json",


                        "Authorization":
                        `Bearer ${user.apikey}`

                    },


                    body:JSON.stringify({

                        prompt

                    })

                }

            );



        const data =
            await response.json();



        loading.remove();



        if(!data.status){


            addMessage(

                data.message ||

                "Erro ao comunicar com a IA.",

                "ai"

            );


            return;

        }



        let text = "";



        if(typeof data.response === "string"){


            text =
                data.response;


        }

        else if(data.response?.text){


            text =
                data.response.text;


        }

        else{


            text =
                JSON.stringify(

                    data.response,

                    null,

                    2

                );

        }



        addMessage(

            marked.parse(text),

            "ai"

        );



    }


    catch(error){


        loading.remove();



        addMessage(

            "Erro de ligação ao servidor.",

            "ai"

        );


        console.error(error);


    }



});




/* ===========================
   CRIAR MENSAGEM
=========================== */


function addMessage(text,type){



    const message =
        document.createElement("div");



    message.className =
        `message ${type}`;



    const icon = type === "user"

    ? `

    <svg xmlns="http://www.w3.org/2000/svg"
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2">

        <circle cx="12" cy="8" r="4"/>

        <path d="M4 21c0-4 3-7 8-7s8 3 8 7"/>

    </svg>

    `


    :

    `

    <svg xmlns="http://www.w3.org/2000/svg"
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2">

        <rect x="4"
        y="8"
        width="16"
        height="12"
        rx="3"/>

        <path d="M12 8V4"/>

        <path d="M8 2h8"/>

    </svg>

    `;




    const hora =
        new Date()
        .toLocaleTimeString(

            "pt-PT",

            {

                hour:"2-digit",

                minute:"2-digit"

            }

        );



    message.innerHTML = `


        <div class="avatar">

            ${icon}

        </div>



        <div class="bubble">


            ${text}


            <small class="message-time">

                ${hora}

            </small>


        </div>


    `;



    messages.appendChild(message);



    messages.scrollTo({

        top:
        messages.scrollHeight,

        behavior:
        "smooth"

    });



    return message;


}



});
