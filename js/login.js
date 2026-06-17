document
.getElementById("login")
.addEventListener("submit", function(e){

    e.preventDefault();

    const email =
        document.getElementById("email").value;

    const password =
        document.getElementById("password").value;

    const user = JSON.parse(
        localStorage.getItem("mozapi_user")
    );

    if(!user){

        alert(
            "Nenhuma conta encontrada."
        );

        return;
    }

    if(user.email !== email){

        alert(
            "Email incorreto."
        );

        return;
    }

    if(user.password !== password){

        alert(
            "Senha incorreta."
        );

        return;
    }

    localStorage.setItem(
        "mozapi_session",
        "true"
    );

    window.location.href =
        "dashboard.html";

});
