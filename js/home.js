document.addEventListener("DOMContentLoaded", () => {

    const logged =
    localStorage.getItem("mozapi_session");

    if(!logged){
        return;
    }

    const user =
    JSON.parse(
        localStorage.getItem("mozapi_user")
    );

    const guestContent =
    document.getElementById("guestContent");

    const userContent =
    document.getElementById("userContent");

    const welcomeUser =
    document.getElementById("welcomeUser");

    if(guestContent){

        guestContent.style.display =
        "none";

    }

    if(userContent){

        userContent.style.display =
        "block";

    }

    if(welcomeUser && user){

        welcomeUser.innerText =
        "Bem-vindo, " + user.name + "!";

    }

});


document.addEventListener("DOMContentLoaded",()=>{


const logged =
localStorage.getItem("mozapi_session");


if(!logged){
    return;
}


const guestCreateAccount =
document.getElementById("guestCreateAccount");


const guestLogin =
document.getElementById("guestLogin");



if(guestCreateAccount){
    guestCreateAccount.remove();
}



if(guestLogin){
    guestLogin.remove();
}


});



document.addEventListener("DOMContentLoaded", async()=>{


const session =
localStorage.getItem("mozapi_session");


const guestSteps =
document.getElementById("guestSteps");


const userProgress =
document.getElementById("userProgress");



if(!session){

    return;

}



const user =
JSON.parse(
    localStorage.getItem("mozapi_user")
);



if(!user || !user.apikey){

    return;

}



try{


const response =
await fetch("/api/user/progress",{

    method:"POST",

    headers:{

        "Content-Type":
        "application/json"

    },

    body:JSON.stringify({

        apikey:user.apikey

    })

});



const data =
await response.json();



if(!data.status){

    return;

}



if(guestSteps){

    guestSteps.style.display =
    "none";

}



if(userProgress){

    userProgress.style.display =
    "block";

}




// Conta criada

const progressAccount =
document.getElementById(
"progressAccount"
);


if(progressAccount){

    progressAccount.innerHTML =
    "✓ Conta criada";

}




// API usada

const progressApi =
document.getElementById(
"progressApi"
);


if(progressApi){


if(data.requests > 0){

progressApi.innerHTML =
"✓ Primeira utilização da API realizada";


}else{


progressApi.innerHTML =
"○ Primeira utilização da API";


}


}



// Plano

const progressPlan =
document.getElementById(
"progressPlan"
);


if(progressPlan){

    progressPlan.innerHTML =
    "✓ Plano " + data.user.plan + " activo";

}



// Requests

const totalRequests =
document.getElementById(
"totalRequests"
);


if(totalRequests){

    totalRequests.innerText =
    data.requests;

}


const createdDate =
document.getElementById(
"createdDate"
);


if(createdDate && data.user.createdAt){

    createdDate.innerText =
    data.user.createdAt;

}



// Última actividade

const lastActivity =
document.getElementById(
"lastActivity"
);


if(lastActivity && data.lastDate){

    lastActivity.innerText =
    new Date(
        data.lastDate
    ).toLocaleString("pt-PT");

}



}catch(err){

console.error(
"Erro progresso:",
err
);


}


});
