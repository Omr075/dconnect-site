document
.getElementById("login")
.addEventListener("submit", async function(e){

    e.preventDefault();

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;

    try {

        const response =
            await fetch("/api/auth/login", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    email,
                    password

                })

            });

        const data =
            await response.json();

if (data.gateway) {

    sessionStorage.setItem(
        "mozapi_admin_token",
        data.token
    );

    window.location.href =
        "admin-login.html";

    return;

}




if(data.suspended){

    document
    .getElementById("suspendedMessage")
    .innerText =
    data.message;

    document
    .getElementById("suspendedReason")
    .innerText =
    data.reason || "Não informado";

    document
    .getElementById("suspendedUntil")
    .innerText =
    data.until || "Permanente";

    document
    .getElementById("suspendedModal")
    .classList.add("active");

    return;

}




if(!data.status){

    showModal(
        data.message,
        "Falha no login"
    );

    return;

}

        localStorage.setItem(
            "mozapi_user",
            JSON.stringify(data.user)
        );

        localStorage.setItem(
            "mozapi_session",
            "true"
        );

window.location.href =
    "index.html";
    }

catch (err) {

    showModal(
        "Ocorreu um erro ao iniciar sessão. Tente novamente.",
        "Erro"
    );

    console.error(err);

}

});


const requestReview =
document.getElementById("requestReview");


const reviewForm =
document.getElementById("reviewForm");


const suspendedActions =
document.getElementById("suspendedActions");


if(requestReview){

    requestReview.addEventListener("click",()=>{


        suspendedActions.style.display =
        "none";


        reviewForm.style.display =
        "block";


    });

}

const reviewMessage =
document.getElementById("reviewMessage");


const reviewCount =
document.getElementById("reviewCount");


if(reviewMessage && reviewCount){

    reviewMessage.addEventListener(
    "input",
    ()=>{

        reviewCount.innerText =
        reviewMessage.value.length + "/70";

    });

}

const cancelReview =
document.getElementById("cancelReview");


if(cancelReview){

    cancelReview.addEventListener("click",()=>{


        reviewForm.style.display =
        "none";


        suspendedActions.style.display =
        "flex";


    });

}

const contactSupport =
document.getElementById("contactSupport");

if(contactSupport){

    contactSupport.addEventListener("click",()=>{

        window.location.href =
        "mailto:supporte@mozapi.com";

    });

}


const sendReview =
document.getElementById("sendReview");


if(sendReview){

    sendReview.addEventListener("click", async()=>{


        const message =
        document
        .getElementById("reviewMessage")
        .value.trim();


        const email =
        document
        .getElementById("email")
        .value.trim();


if(!message){

    showModal(
        "Escreva uma mensagem antes de enviar o pedido.",
        "Pedido de revisão"
    );

    return;

}


        try{


            const response =
            await fetch("/api/review",{

                method:"POST",

                headers:{

                    "Content-Type":
                    "application/json"

                },

                body:JSON.stringify({

                    email,

                    message

                })

            });


            const data =
            await response.json();


if(data.status){

    showModal(
        "O seu pedido de revisão foi enviado com sucesso.",
        "Revisão enviada"
    );


    document
    .getElementById("reviewMessage")
    .value="";


    document
    .getElementById("reviewForm")
    .style.display="none";


    document
    .getElementById("suspendedActions")
    .style.display="flex";


}else{

    showModal(
        data.message,
        "Erro na revisão"
    );

}

}
catch(err){

    console.error(err);

    showModal(
        "Ocorreu um erro ao enviar o pedido de revisão.",
        "Erro"
    );

}

    });

}


const closeSuspendedModal =
document.getElementById(
"closeSuspendedModal"
);


if(closeSuspendedModal){

    closeSuspendedModal.addEventListener(
    "click",
    ()=>{

        document
        .getElementById("suspendedModal")
        .classList.remove(
        "active"
        );

    });

}



const alertModal =
document.getElementById("alertModal");


const alertTitle =
document.getElementById("alertTitle");


const alertMessage =
document.getElementById("alertMessage");


const closeAlertModal =
document.getElementById("closeAlertModal");


function showModal(message,title="Aviso"){

    if(!alertModal){

        return;

    }


    alertTitle.innerText =
    title;


    alertMessage.innerText =
    message;


    alertModal.classList.add(
    "active"
    );

}



if(closeAlertModal){

    closeAlertModal.addEventListener(
    "click",
    ()=>{

        alertModal.classList.remove(
        "active"
        );

    });

}




window.onload = function(){

    google.accounts.id.initialize({

        client_id: "341416037579-lebsilp4c41k6j3ep7q0et88u0fjjkc2.apps.googleusercontent.com",

        callback: handleGoogleLogin

    });


    google.accounts.id.renderButton(

        document.getElementById("googleSignIn"),

        {
            theme: "outline",
            size: "large",
            width: "100%"
        }

    );

};



async function handleGoogleLogin(response){


    try{


        const res = await fetch("/api/auth/google",{

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({

                token: response.credential

            })

        });



        const data = await res.json();



        if(!data.status){

            showModal(
                data.message || "Falha no login Google",
                "Login Google"
            );

            return;

        }



        localStorage.setItem(
            "mozapi_user",
            JSON.stringify(data.user)
        );


        localStorage.setItem(
            "mozapi_session",
            "true"
        );


        window.location.href="index.html";


    }catch(err){

        console.error(err);

        showModal(
            "Erro ao iniciar sessão com Google.",
            "Erro"
        );

    }

}
