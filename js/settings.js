document.addEventListener("DOMContentLoaded", () => {

    let user = JSON.parse(
        localStorage.getItem("mozapi_user")
    );

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    const nameInput =
        document.getElementById("name");

    const emailInput =
        document.getElementById("email");

    nameInput.value = user.name;
    emailInput.value = user.email;

    // Guardar alterações

    document
    .getElementById("saveProfile")
    .addEventListener("click", () => {

        user.name = nameInput.value;
        user.email = emailInput.value;

        localStorage.setItem(
            "mozapi_user",
            JSON.stringify(user)
        );

        const btn =
            document.getElementById("saveProfile");

        btn.innerText =
            "Alterações guardadas!";

        setTimeout(() => {

            btn.innerText =
                "Guardar Alterações";

        }, 1500);

    });

    // Alterar senha

    document
    .getElementById("changePassword")
    .addEventListener("click", () => {

        const password =
            document.getElementById(
                "newPassword"
            ).value;

        if (!password) return;

        user.password = password;

        localStorage.setItem(
            "mozapi_user",
            JSON.stringify(user)
        );

        const btn =
            document.getElementById(
                "changePassword"
            );

        btn.innerText =
            "Senha alterada!";

        setTimeout(() => {

            btn.innerText =
                "Alterar Senha";

        }, 1500);

    });

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

});
