document.addEventListener("DOMContentLoaded",()=>{


const logged =
localStorage.getItem("mozapi_session");


const guest =
document.getElementById("guestSteps");


const progress =
document.getElementById("userProgress");



if(logged){


    if(guest){

        guest.style.display="none";

    }


    if(progress){

        progress.style.display="block";

    }



    const user =
    JSON.parse(
        localStorage.getItem("mozapi_user")
    );



    if(user && user.requests > 0){


        const apiStep =
        document.getElementById("apiUsedStep");


        if(apiStep){

            apiStep.classList.add("done");

            apiStep.querySelector(".progress-circle")
            .innerHTML="✓";

        }


    }



}



});
