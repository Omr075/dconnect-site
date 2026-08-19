const alertModal =
document.getElementById(
    "alertModal"
);


const alertTitle =
document.getElementById(
    "alertTitle"
);


const alertMessage =
document.getElementById(
    "alertMessage"
);


const closeAlertModal =
document.getElementById(
    "closeAlertModal"
);


function showModal(
    message,
    title = "Aviso"
){

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
        () => {

            alertModal.classList.remove(
                "active"
            );

        }
    );

}

document
.getElementById("cadastro")
.addEventListener("submit", async function(e){

    e.preventDefault();

    const name =
        document.getElementById("nome").value.trim();

    const email =
        document.getElementById("emails").value.trim();

    const phone =
    document.getElementById("phone").value.trim();

     const phoneCode =
        document
        .getElementById("phoneCode")
        .value;


    const password =
        document.getElementById("password").value;

    const confirmPassword =
        document.getElementById("confirmPassword").value;


if(!terms.checked){

showModal(
    "Você precisa ler e concordar com os Termos de Utilização.",
    "Termos de Utilização"
);
            return;

        }


    if(password !== confirmPassword){
showModal(
    "As senhas não coincidem.",
    "Senhas diferentes"
);
return;
    }
let fullPhone = "";


        if(phone){

            const cleanPhone =
            phone.replace(
                /\D/g,
                ""
            );


            if(!cleanPhone){
showModal(
    "Digite um número de telefone válido.",
    "Número invalido!"
);

                return;

            }


            fullPhone =
            phoneCode +
            cleanPhone;

        }


    try {

        const response =
            await fetch("/api/auth/register", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    name,
                    email,
		    phone,
                    password

                })

            });

        const data =
            await response.json();

        if (!data.status) {

            alert(data.message);
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

showModal(
    "Conta criada com sucesso!",
    "Conta criada"
);
        window.location.href =
            "dashboard.html";

    } catch (err) {

showModal(
    "Erro ao criar conta! Tente novamente mais tarde.",
    "Erro"
);
        console.error(err);

    }

});



window.addEventListener("load", () => {

    if (!document.getElementById("googleSignUp")) {
        return;
    }

    google.accounts.id.initialize({

        client_id: "341416037579-lebsilp4c41k6j3ep7q0et88u0fjjkc2.apps.googleusercontent.com",

        callback: handleGoogleSignup

    });

google.accounts.id.renderButton(

    document.getElementById("googleSignUp"),

    {

        theme: "outline",
        size: "large",
        shape: "rectangular",
        width: "100%",
        text: "signup_with"

    }

);

});


async function handleGoogleSignup(response){

    try{

        const result =
        await fetch("/api/auth/google",{

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({

                token:response.credential

            })

        });


        const data =
        await result.json();


        if(!data.status){

            alert(data.message);

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
        "dashboard.html";


    }catch(err){

        console.error(err);

showModal(
    "Erro ao criar conta com Google. Tente novamente mais tarde.",
    "Erro"
);

    }

}
