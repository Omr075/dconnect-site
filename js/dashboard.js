const user = JSON.parse(
    localStorage.getItem("mozapi_user")
);

const session = localStorage.getItem(
    "mozapi_session"
);

if (!session || !user) {

    window.location.href =
        "login.html";

}

// Dados

document.getElementById("name")
.innerText =
`Nome: ${user.name}`;

document.getElementById("email")
.innerText =
`Email: ${user.email}`;

if(document.getElementById("plan")){

    document.getElementById("plan")
    .innerText =
    `Plano: ${user.plan}`;

}

if(document.getElementById("apikey")){

    document.getElementById("apikey")
    .innerText =
    `API Key: ${user.apiKey}`;

}

if(document.getElementById("requests")){

    document.getElementById("requests")
    .innerText =
    `Requests: ${user.requests}`;

}

if(document.getElementById("created")){

    document.getElementById("created")
    .innerText =
    `Criado em: ${user.createdAt}`;

}

// Logout

document
.getElementById("logout")
.addEventListener("click", () => {

    localStorage.removeItem(
        "mozapi_session"
    );

    window.location.href =
        "login.html";

});
