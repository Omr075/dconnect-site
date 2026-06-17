document
.getElementById("cadastro")
.addEventListener("submit", function(e){

    e.preventDefault();

    const name =
        document.getElementById("nome").value;

    const email =
        document.getElementById("email").value;

    const password =
        document.getElementById("password").value;

    const confirmPassword =
        document.getElementById("confirmPassword").value;

    if(password !== confirmPassword){

        alert("Senhas diferentes.");
        return;

    }

    const user = {

        id: "usr_" + Date.now(),

        name,

        email,

        password,

        apiKey:
        "moz_sk_" +
        Math.random()
        .toString(36)
        .slice(2,18),

        plan: "Free",

        requests: 0,

        createdAt:
        new Date()
        .toLocaleString()

    };

    localStorage.setItem(
        "mozapi_user",
        JSON.stringify(user)
    );

    localStorage.setItem(
        "mozapi_session",
        "true"
    );

    window.location.href =
        "dashboard.html";

});
