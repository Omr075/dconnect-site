document
.getElementById("adminLogin")
.addEventListener("submit", async function(e){

    e.preventDefault();


    const token =
        sessionStorage.getItem(
            "mozapi_admin_token"
        );


    if (!token) {

        alert(
            "Acesso não autorizado."
        );

        window.location.href =
            "login.html";

        return;

    }


    const username =
        document
        .getElementById("username")
        .value
        .trim();


    const password =
        document
        .getElementById("password")
        .value;



    try {


        const response =
            await fetch(
                "/api/admin/login",
                {

                method: "POST",

                headers: {

                    "Content-Type":
                    "application/json"

                },

                body: JSON.stringify({

                    username,

                    password,

                    token

                })

            });


        const data =
            await response.json();



        if (!data.status) {

            alert(
                data.message
            );

            return;

        }



sessionStorage.setItem(
    "admin_token",
    data.token
);
        sessionStorage.setItem(
            "mozapi_admin_session",
            "true"
        );


window.location.href =
"admin/dashboard.html";


    } catch(err) {


        console.error(err);


        alert(
            "Erro ao iniciar sessão administrativa."
        );


    }


});
