document.addEventListener("DOMContentLoaded", async()=>{

const token =
sessionStorage.getItem(
    "admin_token"
);
let allUsers = [];

if(!token){

    window.location.href =
    "../login.html";

    return;

}

try {


const response =
await fetch("/api/admin/stats", {

    headers: {

        "x-admin-token": token

    }

});


const usersResponse =
await fetch("/api/admin/users",{

    headers:{

        "x-admin-token":token

    }

});

const usersData =
await usersResponse.json();

if(usersData.status){

    const tbody =
    document.getElementById("recentUsers");

   allUsers = usersData.users;

    tbody.innerHTML = "";

    usersData.users.forEach(user=>{

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

}

const data =
await response.json();


document.getElementById("users")
.innerText =
data.stats.users || 0

document.getElementById("requests")
.innerText =
data.stats.totalRequests || 0

document.getElementById("free")
.innerText =
data.stats.free || 0

document.getElementById("pro")
.innerText =
data.stats.pro || 0

document.getElementById("enterprise")
.innerText =
data.stats.enterprise || 0


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





/*&+((+&_"';-*/



const drawer =
document.getElementById("userDrawer");


const closeDrawer =
document.getElementById("closeDrawer");



document.querySelectorAll(".action-btn")
.forEach(btn=>{




btn.addEventListener("click",()=>{


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
document.getElementById("drawerStatus");


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
document.getElementById("drawerApiKey");


apiField.dataset.key =
user.apikey;


apiField.innerText =
"****************";


drawer.classList.add("active");


});


});


if(closeDrawer){

    closeDrawer.addEventListener("click",()=>{

	        drawer.classList.remove("active");

    });

}



const regenerateKey =
document.getElementById("regenerateKey");



const modal =
document.getElementById("confirmModal");

const modalTitle =
document.getElementById("modalTitle");

const modalMessage =
document.getElementById("modalMessage");

const confirmModalBtn =
document.getElementById("confirmModalBtn");

const cancelModal =
document.getElementById("cancelModal");


let confirmAction = null;


if(cancelModal){

cancelModal.addEventListener("click",()=>{

    modal.classList.remove("active");

});

}


if(confirmModalBtn){

confirmModalBtn.addEventListener("click",()=>{


if(confirmAction){

    confirmAction();

}


modal.classList.remove("active");


});

}

if(regenerateKey){

regenerateKey.addEventListener(
"click",
()=>{


const email =
document
.getElementById("drawerEmail")
.innerText;


modalTitle.innerText =
"Regenerar chave API";


modalMessage.innerText =
"A chave actual deixará de funcionar imediatamente. Deseja continuar?";


confirmModalBtn.innerText =
"Regenerar";


modal.classList.add(
"active"
);



confirmAction =
async()=>{


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
"API Key regenerada";


modalMessage.innerText =
"A nova chave foi criada com sucesso.";


confirmModalBtn.innerText =
"Fechar";


}


};


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

modal.classList.add("active");

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
document.getElementById("drawerStatus");

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
            "Alterar plano manualmente, escolha o plano:"
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


    });

}
}



catch(err){

console.error(err);

}


});
