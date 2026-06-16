const user = JSON.parse(
    localStorage.getItem("mozapi_user")
);

if(!user){

    window.location.href =
        "index.html";

}

document.getElementById("nome")
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
