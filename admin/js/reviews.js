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



const table =
document.getElementById(
    "reviewsTable"
);



async function loadReviews(){


try{


const response =
await fetch(
"/api/admin/reviews",
{

headers:{

"x-admin-token":
token

}

});


const data =
await response.json();



if(!data.status){

    return;

}



table.innerHTML = "";



data.reviews.forEach(review=>{


table.innerHTML += `


<tr>


<td>

${review.email}

</td>


<td>

${review.message}

</td>



<td>

<span class="${
review.status === "Pendente"
?
"status-suspended"
:
"status-online"
}">

${review.status}

</span>

</td>



<td>

${review.createdAt}

</td>



<td>


<button
class="action-btn delete-review"
data-id="${review.id}">

Eliminar

</button>


</td>



</tr>


`;


});



bindDelete();


}catch(err){

console.error(err);

}


}




function bindDelete(){


document
.querySelectorAll(
".delete-review"
)
.forEach(btn=>{


btn.addEventListener(
"click",
()=>{


const id =
btn.dataset.id;



modalTitle.innerText =
"Eliminar pedido";


modalMessage.innerText =
"Este pedido de revisão será removido permanentemente.";


confirmModalBtn.innerText =
"Eliminar";



modal.classList.add(
"active"
);



confirmAction =
async()=>{


await fetch(

`/api/admin/reviews/${id}`,

{

method:"DELETE",

headers:{

"x-admin-token":
token

}

}

);



loadReviews();


};



});


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


const confirmModalBtn =
document.getElementById(
"confirmModalBtn"
);


const cancelModal =
document.getElementById(
"cancelModal"
);



let confirmAction = null;



if(cancelModal){

cancelModal.addEventListener(
"click",
()=>{


modal.classList.remove(
"active"
);


confirmAction = null;


});

}



if(confirmModalBtn){

confirmModalBtn.addEventListener(
"click",
()=>{


if(confirmAction){

confirmAction();

}


modal.classList.remove(
"active"
);



});


}




loadReviews();


});
