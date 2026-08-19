document.addEventListener("DOMContentLoaded", async()=>{

const token =
sessionStorage.getItem(
    "admin_token"
);


if(!token){

    window.location.href =
    "../admin-login.html";

    return;

}


let allUsers = [];



async function loadUsers(){


try{


const response =
await fetch(
"/api/admin/users",{

headers:{

"x-admin-token":token

}

});


const data =
await response.json();


if(!data.status){

alert(data.message);

return;

}


allUsers =
data.users;


renderUsers(
allUsers
);


}

catch(err){

console.error(err);

}


}



function renderUsers(users){


const tbody =
document.getElementById(
"usersTable"
);


tbody.innerHTML="";


users.forEach(user=>{


tbody.innerHTML += `

<tr>

<td>${user.name}</td>

<td>${user.email}</td>

<td>${user.plan}</td>

<td>${user.requests}</td>

<td>

<span class="${user.status === 'Suspenso' ? 'status-suspended' : 'status-online'}">

${user.status || "Activo"}

</span>
</td>

<td>

<button
class="action-btn"
data-email="${user.email}">

Ver

</button>

</td>

</tr>

`;

});


bindButtons();


}



function bindButtons(){


document
.querySelectorAll(
".action-btn"
)
.forEach(btn=>{


btn.addEventListener(
"click",()=>{


const email =
btn.dataset.email;

const user =
allUsers.find(
    u => u.email === email
);

if(!user){

    return;

}

document.getElementById("drawerName")
.innerText =
user.name;

document.getElementById("drawerEmail")
.innerText =
user.email;

document.getElementById("drawerPlan")
.innerText =
user.plan;

document.getElementById("drawerRequests")
.innerText =
user.requests;

document.getElementById("drawerCreated")
.innerText =
user.createdAt;

const statusField =
document.getElementById(
"drawerStatus"
);


statusField.innerText =
user.status || "Activo";


statusField.className =
user.status === "Suspenso"

?
"status-suspended"

:
"status-online";

const suspendButton =
document.getElementById("suspendUser");


if(user.status === "Suspenso"){

    suspendButton.innerText =
    "Restaurar Conta";

}else{

    suspendButton.innerText =
    "Suspender Conta";

}




const apiField =
document.getElementById(
"drawerApiKey"
);

apiField.dataset.key =
user.apikey;

apiField.innerText =
"****************";

document
.getElementById("userDrawer")
.classList.add(
"active"
);


});


});


}



document
.getElementById(
"searchUser"
)
.addEventListener(
"input",
function(){


const text =
this.value
.toLowerCase();


renderUsers(

allUsers.filter(

u=>

u.name
.toLowerCase()
.includes(text)

||

u.email
.toLowerCase()
.includes(text)

)

);


});





document
.getElementById(
"filterPlan"
)
.addEventListener(
"change",
function(){


const plan =
this.value;


if(plan===""){

renderUsers(
allUsers
);

return;

}


renderUsers(

allUsers.filter(

u=>

u.plan===plan

)

);


});

const closeDrawer =
document.getElementById(
"closeDrawer"
);

const drawer =
document.getElementById(
"userDrawer"
);

if(closeDrawer){

    closeDrawer.addEventListener(
    "click",()=>{

        drawer.classList.remove(
        "active"
        );

    });

}


const toggleApiKey =
document.getElementById("toggleApiKey");


if(toggleApiKey){

    toggleApiKey.addEventListener("click",()=>{

        const field =
        document.getElementById("drawerApiKey");


        if(field.innerText.includes("*")){


            field.innerText =
            field.dataset.key;


        }else{


            field.innerText =
            "****************";


        }

    });

}



const copyApiKey =
document.getElementById("copyApiKey");


if(copyApiKey){

    copyApiKey.addEventListener("click",()=>{


        const key =
        document
        .getElementById("drawerApiKey")
        .dataset.key;


        navigator.clipboard.writeText(key);


    });

}


const modal =
document.getElementById(
"confirmModal"
);

const modalTitle =
document.getElementById(
"modalTitle"
);

const modalMessage =
document.getElementById(
"modalMessage"
);

const cancelModal =
document.getElementById(
"cancelModal"
);

const confirmModalBtn =
document.getElementById(
"confirmModalBtn"
);

let confirmAction = null;


cancelModal.addEventListener(
"click",()=>{

modal.classList.remove(
"active"
);

confirmAction = null;

});


confirmModalBtn.addEventListener(
"click",()=>{

if(confirmAction){

confirmAction();

}

modal.classList.remove(
"active"
);

});


if(regenerateKey){

regenerateKey.addEventListener(
"click",()=>{


modalTitle.innerText =
"Regenerar chave API";


modalMessage.innerText =

"A chave actual deixará de funcionar imediatamente. Pretende continuar?";

confirmModalBtn.innerText =
"Regenerar";

modal.classList.add(
"active"
);


confirmAction =
async()=>{


const email =
document
.getElementById("drawerEmail")
.innerText;


const response =
await fetch(

`/api/admin/users/${email}/key`,

{

method:"POST",

headers:{

"x-admin-token":
token

}

}


);


const data =
await response.json();


if(data.status){

const field =
document.getElementById(
"drawerApiKey"
);


field.dataset.key =
data.apikey;


field.innerText =
"****************";

modalTitle.innerText =
"Chave API regenerada";

modalMessage.innerText =
"A nova chave API foi gerada com sucesso.";

confirmModalBtn.innerText =
"Fechar";

cancelModal.style.display =
"none";

modal.classList.add(
"active"
);

confirmAction = ()=>{

confirmModalBtn.innerText =
"Confirmar";

cancelModal.style.display =
"";

};


}


};


});

}



const changePlan =
document.getElementById("changePlan");


if(changePlan){

    changePlan.addEventListener("click", async()=>{


        const email =
        document
        .getElementById("drawerEmail")
        .innerText;


        const novoPlano =
        prompt(
            "Novo plano (Free, Pro ou Enterprise):"
        );


        if(!novoPlano){

            return;

        }


        const response =
        await fetch(
        `/api/admin/users/${email}/plan`,
        {

            method:"PUT",

            headers:{

                "Content-Type":
                "application/json",

                "x-admin-token":
                token

            },

            body:JSON.stringify({

                plan:novoPlano

            })

        });


        const data =
        await response.json();


        alert(
            data.message
        );


        if(data.status){

            document
            .getElementById("drawerPlan")
            .innerText =
            novoPlano;


            loadUsers();

        }


    });

}


const suspendUser =
document.getElementById("suspendUser");


if(suspendUser){

suspendUser.addEventListener(
"click",
()=>{


const email =
document
.getElementById("drawerEmail")
.innerText;


const statusAtual =
document
.getElementById("drawerStatus")
.innerText;



if(statusAtual === "Suspenso"){


modalTitle.innerText =
"Restaurar Conta";


modalMessage.innerText =
"Esta conta voltará a ter acesso à plataforma.";


confirmModalBtn.innerText =
"Restaurar";


}else{


modalTitle.innerText =
"Suspender Conta";

modalMessage.innerText =
"Esta ação irá bloquear o acesso deste utilizador.";


confirmModalBtn.innerText =
"Suspender";


}



modal.classList.add(
"active"
);



confirmAction =
async()=>{


const novoStatus =
statusAtual === "Suspenso"
?
"Activo"
:
"Suspenso";



const response =
await fetch(

`/api/admin/users/${email}/status`,

{

method:"PUT",

headers:{

"Content-Type":
"application/json",

"x-admin-token":
token

},

body:JSON.stringify({

status:novoStatus

})

}

);



const data =
await response.json();



if(data.status){


const statusField =
document.getElementById(
"drawerStatus"
);


statusField.innerText =
novoStatus;


statusField.className =
novoStatus === "Suspenso"
?
"status-suspended"
:
"status-online";


loadUsers();


}



};


});


}

loadUsers();

});
