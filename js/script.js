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
        name,
        email,
        password
    };

    localStorage.setItem(
        "mozapi_user",
        JSON.stringify(user)
    );

    window.location.href =
        "dashboard.html";

});
      
