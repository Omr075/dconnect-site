const user = JSON.parse(
    localStorage.getItem("mozapi_user")
);

if(!user){

    window.location.href =
        "index.html";

}

const session =
localStorage.getItem(
    "mozapi_session"
);

if(!session){

    window.location.href =
        "login.html";

}
document
.getElementById("logout")
.addEventListener("click", () => {

    localStorage.removeItem(
        "mozapi_session"
    );

    window.location.href =
        "login.html";

}
document.getElementById("name")
.innerText =
`Nome: ${user.name}`;

document.getElementById("email")
.innerText =
`Email: ${user.email}`;

document
.getElementById("logout")
.addEventListener("click", () => {

    localStorage.removeItem(
        "mozapi_user"
    );

    window.location.href =
        "index.html";


});
