document.addEventListener(
"DOMContentLoaded",
()=>{


const container =
document.getElementById(
"navbarContainer"
);


if(!container){

    return;

}



const logged =
localStorage.getItem(
"mozapi_session"
);



const file =
logged
?
"navbar-logado.html"
:
"navbar.html";



fetch(file)

.then(res=>res.text())

.then(html=>{


    container.innerHTML =
    html;




// LOGOUT
    const logout =
    document.getElementById(
        "logout"
    );


    if(logout){


        logout.addEventListener(
        "click",
        ()=>{


            localStorage.removeItem(
                "mozapi_session"
            );


            localStorage.removeItem(
                "mozapi_user"
            );


            window.location.href =
            "index.html";


        });


    }




    if(logged){


        const user =
        JSON.parse(
        localStorage.getItem(
        "mozapi_user"
        )
        );



        const avatar =
        document.getElementById(
        "userAvatar"
        );



        const name =
        document.getElementById(
        "userName"
        );



        if(user){


            if(name){

                name.innerText =
                user.name;

            }



            if(
            avatar &&
            user.avatar
            ){

                avatar.src =
                user.avatar;

            }


        }


    }


});


});
