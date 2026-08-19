document.addEventListener("click", (e)=>{


    if(e.target && e.target.id === "logout"){


        localStorage.removeItem(
            "mozapi_session"
        );


        localStorage.removeItem(
            "mozapi_user"
        );


        window.location.href =
        "index.html";


    }


});
