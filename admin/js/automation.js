document.addEventListener(
"DOMContentLoaded",
async()=>{


document.body.classList.add(
"admin-loading"
);


const token =
sessionStorage.getItem(
"admin_token"
);



if(!token){

    window.location.href =
    "../login.html";

    return;

}



let data;


try{


const response =
await fetch(
"/api/admin/automation/status",
{

headers:{

"x-admin-token":
token

}

});


data =
await response.json();


if(!data.status){

    console.error(
        "Erro na autenticação administrativa:",
        data.message
    );

    document.body.classList.remove(
        "admin-loading"
    );

    alert(
        data.message ||
        "Sessão administrativa inválida."
    );

    return;

}


document.body.classList.remove(
    "admin-loading"
);


}
catch(err){

    console.error(
        "Erro ao carregar automação:",
        err
    );

    document.body.classList.remove(
        "admin-loading"
    );

    alert(
        "Não foi possível carregar os dados da automação."
    );

    return;

}

const automation =
data.automation;


document.getElementById(
"automationStatus"
).innerText =
automation.enabled
?
"Activo"
:
"Inactivo";


document.getElementById(
"totalExecutions"
).innerText =
automation.executions;


document.getElementById(
"successfulExecutions"
).innerText =
automation.success;


document.getElementById(
"failedExecutions"
).innerText =
automation.failed;



document.getElementById(
"lastExecution"
).innerText =
automation.lastExecution || "Nenhuma";


document.getElementById(
"lastEvent"
).innerText =
automation.lastEvent || "Nenhum evento registado";


document.getElementById(
"responseTime"
).innerText =
automation.responseTime + " ms";

const eventContainer =
document.getElementById(
"automationEvents"
);


if(
automation.events &&
automation.events.length
){

eventContainer.innerHTML = "";


automation.events.forEach(event=>{

eventContainer.innerHTML += `

<div class="automation-event">

<strong>
${event.title}
</strong>

<p>
${event.message}
</p>

</div>

`;

});


}



async function loadNotifications(
    status = "",
    type = ""
) {

    const notificationList =
    document.getElementById(
        "notificationList"
    );


    notificationList.innerHTML = `

        <div class="automation-empty">

            <strong>
                A carregar...
            </strong>

        </div>

    `;


    try {

let url;

if(status === "sent"){

    url =
    type
    ?
    `/api/admin/automation/notifications/sent?type=${type}`
    :
    `/api/admin/automation/notifications/sent`;

}else{

    const params =
    new URLSearchParams();

    if(status){

        params.set(
            "status",
            status
        );

    }

    if(type){

        params.set(
            "type",
            type
        );

    }

    const query =
    params.toString();

    url =
    query
    ?
    `/api/admin/automation/notifications?${query}`
    :
    `/api/admin/automation/notifications`;

}
        const response =
        await fetch(
            url,
            {

                headers: {

                    "x-admin-token":
                    token

                }

            }
        );


        const data =
        await response.json();


        if(!data.status){

            notificationList.innerHTML = `

                <div class="automation-empty">

                    <strong>
                        Não foi possível carregar as notificações.
                    </strong>

                </div>

            `;

            return;

        }


        if(!data.notifications.length){

            notificationList.innerHTML = `

                <div class="automation-empty">

                    <strong>
                        Nenhuma notificação encontrada.
                    </strong>

                    <p>
                        Não existem notificações deste tipo.
                    </p>

                </div>

            `;

            return;

        }


        notificationList.innerHTML = "";


        data.notifications
        .slice()
        .reverse()
        .forEach(notification => {

            const isSms =
            notification.type === "sms";


            const typeLabel =
            isSms
            ?
            "SMS"
            :
            "E-mail";


            const statusClass =
            notification.status === "sent"
            ?
            "notification-sent"
            :
            notification.status === "failed"
            ?
            "notification-failed"
            :
            "notification-pending";


            const statusLabel =
            notification.status === "sent"
            ?
            "Enviada"
            :
            notification.status === "failed"
            ?
            "Falhou"
            :
            "Pendente";


            const item =
            document.createElement("div");


            item.className =
            "notification-item";


            item.innerHTML = `

                <div class="notification-info">

                    <strong>
                        ${escapeHtml(
                            notification.target
                        )}
                    </strong>

                    <span>
                        ${typeLabel}
                        ·
                        ${notification.category || "geral"}
                    </span>

                    <p>
                        ${escapeHtml(
                            notification.message || ""
                        )}
                    </p>

                </div>


                <div class="notification-right">

                    <span
                    class="notification-status ${statusClass}">

                        ${statusLabel}

                    </span>


                    ${
                        isSms
                        ?
                        `
                        <button
                        class="notification-open"
                        data-target="${escapeHtml(
                            notification.target
                        )}">

                            Abrir

                        </button>
                        `
                        :
                        ""
                    }

                </div>

            `;


            notificationList.appendChild(
                item
            );

        });


        document
        .querySelectorAll(
            ".notification-open"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    openSmsModal(
                        button.dataset.target
                    );

                }
            );

        });


    } catch(err) {

        console.error(
            "Erro ao carregar notificações:",
            err
        );

        notificationList.innerHTML = `

            <div class="automation-empty">

                <strong>
                    Erro ao carregar notificações.
                </strong>

            </div>

        `;

    }

}


function escapeHtml(value) {

    return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


const smsModal =
document.getElementById(
    "smsModal"
);

const smsRecipient =
document.getElementById(
    "smsRecipient"
);

const smsMessage =
document.getElementById(
    "smsMessage"
);

const smsCounter =
document.getElementById(
    "smsCounter"
);


function openSmsModal(target) {

    smsRecipient.textContent =
    target;

    smsMessage.value = "";

    smsCounter.textContent =
    "0 / 500";

    smsModal.classList.add(
        "active"
    );

}


function closeSmsModal() {

    smsModal.classList.remove(
        "active"
    );

}


document
.getElementById("closeSmsModal")
.addEventListener(
    "click",
    closeSmsModal
);


document
.getElementById("cancelSms")
.addEventListener(
    "click",
    closeSmsModal
);


smsMessage.addEventListener(
    "input",
    () => {

        smsCounter.textContent =
        `${smsMessage.value.length} / 500`;

    }
);


const prepareSms =
document.getElementById(
    "prepareSms"
);


prepareSms.addEventListener(
    "click",
    async () => {

        const target =
        smsRecipient.textContent.trim();


        const message =
        smsMessage.value.trim();


        if(!target || target === "--"){

            alert(
                "Destinatário inválido."
            );

            return;

        }


        if(!message){

            alert(
                "Escreva uma mensagem."
            );

            return;

        }


        if(message.length > 500){

            alert(
                "A mensagem não pode ultrapassar 500 caracteres."
            );

            return;

        }


        prepareSms.disabled =
        true;


        prepareSms.textContent =
        "A preparar...";


        try {

            const response =
            await fetch(
                "/api/admin/automation/sms/prepare",
                {

                    method:
                    "POST",

                    headers: {

                        "Content-Type":
                        "application/json",

                        "x-admin-token":
                        token

                    },

                    body:
                    JSON.stringify({

                        target,

                        message,

                        category:
                        "manual"

                    })

                }
            );


            const data =
            await response.json();


            if(!response.ok || !data.status){

                throw new Error(
                    data.message ||
                    "Não foi possível preparar o SMS."
                );

            }


            closeSmsModal();


            smsMessage.value =
            "";


            smsCounter.textContent =
            "0 / 500";


            await loadNotifications();


            alert(
                "SMS preparado e colocado na fila."
            );


        } catch(err) {

            console.error(
                "Erro ao preparar SMS:",
                err
            );


            alert(
                err.message ||
                "Erro ao preparar SMS."
            );


        } finally {

            prepareSms.disabled =
            false;


            prepareSms.textContent =
            "Preparar SMS";

        }

    }
);


document
.querySelectorAll(
    ".notification-filter"
)
.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            document
            .querySelectorAll(
                ".notification-filter"
            )
            .forEach(
                b =>
                b.classList.remove("active")
            );


            button.classList.add(
                "active"
            );


loadNotifications(
    button.dataset.status || "",
    button.dataset.type || ""
);
        }
    );

});

let broadcastUsers = [];

async function loadBroadcastUsers(){

    const container =
    document.getElementById(
        "broadcastUsers"
    );

    try{

        const response =
        await fetch(
            "/api/admin/users",
            {
                headers:{
                    "x-admin-token":
                    token
                }
            }
        );


        const data =
        await response.json();


        if(!data.status){

            container.innerHTML = `
                <div class="automation-empty">
                    <strong>
                        Não foi possível carregar os utilizadores.
                    </strong>
                </div>
            `;

            return;

        }


broadcastUsers =
Array.isArray(data.users)
    ? data.users
    : [];


        if(
            !data.users ||
            !data.users.length
        ){

broadcastUsers = data.users;


            container.innerHTML = `
                <div class="automation-empty">
                    <strong>
                        Nenhum utilizador encontrado.
                    </strong>
                </div>
            `;

            return;

        }


        container.innerHTML = "";


        data.users.forEach(user => {

            const item =
            document.createElement("label");

            item.className =
            "broadcast-user";


            item.innerHTML = `

<input
    type="checkbox"
    class="broadcast-user-checkbox"
    value="${escapeHtml(
        String(user.id)
    )}">


                <div class="broadcast-user-info">

                    <strong>
                        ${escapeHtml(
                            user.name || "Sem nome"
                        )}
                    </strong>

                    <span>
                        ${escapeHtml(
                            user.email || ""
                        )}
                    </span>

                    <small>
                        ${escapeHtml(
                            user.phone || "Sem telefone"
                        )}
                    </small>

                </div>

            `;


            container.appendChild(item);

        });


        updateSelectedUsers();


    }catch(err){

        console.error(
            "Erro ao carregar utilizadores:",
            err
        );


        container.innerHTML = `
            <div class="automation-empty">
                <strong>
                    Erro ao carregar utilizadores.
                </strong>
            </div>
        `;

    }

}

function updateSelectedUsers(){

    const selected =
    document.querySelectorAll(
        ".broadcast-user-checkbox:checked"
    );


    const counter =
    document.getElementById(
        "selectedUsersCount"
    );


    counter.textContent =
    `${selected.length} seleccionados`;

}

const selectAllUsers =
document.getElementById(
    "selectAllUsers"
);


if(selectAllUsers){

    selectAllUsers.addEventListener(
        "click",
        () => {

            const checkboxes =
            document.querySelectorAll(
                ".broadcast-user-checkbox"
            );


            const allSelected =
            checkboxes.length > 0 &&
            Array.from(checkboxes)
            .every(
                checkbox =>
                checkbox.checked
            );


            checkboxes.forEach(
                checkbox => {

                    checkbox.checked =
                    !allSelected;

                }
            );


            selectAllUsers.textContent =
            allSelected
            ?
            "Seleccionar todos"
            :
            "Desseleccionar todos";


            updateSelectedUsers();

        }
    );

}


document.addEventListener(
    "change",
    event => {

        if(
            event.target.classList.contains(
                "broadcast-user-checkbox"
            )
        ){

            updateSelectedUsers();

        }

    }
);


const broadcastMessage =
document.getElementById(
    "broadcastMessage"
);


const broadcastCounter =
document.getElementById(
    "broadcastCounter"
);


const broadcastPreview =
document.getElementById(
    "broadcastPreview"
);


function personalizeMessage(
    template,
    user
){

    return template
    .replace(
        /{{\s*nome\s*}}/gi,
        user.name || ""
    )
    .replace(
        /{{\s*email\s*}}/gi,
        user.email || ""
    )
    .replace(
        /{{\s*telefone\s*}}/gi,
        user.phone || ""
    )
    .replace(
        /{{\s*plano\s*}}/gi,
        user.plan || ""
    )
    .replace(
        /{{\s*pedidos\s*}}/gi,
        String(user.requests ?? 0)
    )
    .replace(
        /{{\s*data\s*}}/gi,
        user.createdAt || ""
    );

}

if(broadcastMessage){

    broadcastMessage.addEventListener(
        "input",
        () => {

            broadcastCounter.textContent =
            `${broadcastMessage.value.length} / 500`;


            const firstUser =
            document.querySelector(
                ".broadcast-user-checkbox"
            );


            if(!firstUser){

                broadcastPreview.innerHTML = `
                    <strong>
                        Pré-visualização
                    </strong>

                    <p>
                        Seleccione um utilizador.
                    </p>
                `;

                return;

            }



const userId =
firstUser.value;

const user =
broadcastUsers.find(
    u =>
    String(u.id) === String(userId)
);

if(!user){

    broadcastPreview.innerHTML = `
        <strong>
            Pré-visualização
        </strong>

        <p>
            Não foi possível encontrar os dados do utilizador.
        </p>
    `;

    return;

}


const preview =
personalizeMessage(
    broadcastMessage.value,
    user
);


broadcastPreview.innerHTML = `

    <strong>
        Pré-visualização
    </strong>

    <p>
        ${escapeHtml(
            preview ||
            "Escreva uma mensagem para visualizar."
        )}
    </p>

`;
        }
    );

}


const sendBroadcast =
document.getElementById(
    "sendBroadcast"
);


if(sendBroadcast){

    sendBroadcast.addEventListener(
        "click",
        async()=>{

            const selected =
            document.querySelectorAll(
                ".broadcast-user-checkbox:checked"
            );


            const message =
            broadcastMessage.value.trim();


            const type =
            document.getElementById(
                "broadcastType"
            ).value;


            const result =
            document.getElementById(
                "broadcastResult"
            );


            if(!selected.length){

                result.textContent =
                "Seleccione pelo menos um utilizador.";

                return;

            }


            if(!message){

                result.textContent =
                "Escreva uma mensagem.";

                return;

            }


            sendBroadcast.disabled =
            true;


            sendBroadcast.textContent =
            "A preparar envio...";


            try{

                const users =
                Array.from(selected)
                .map(
                    checkbox =>
                    checkbox.value
                );


                const response =
                await fetch(
                    "/api/admin/automation/broadcast",
                    {

                        method:"POST",

                        headers:{
                            "Content-Type":
                            "application/json",

                            "x-admin-token":
                            token
                        },

                        body:JSON.stringify({

                            type,

                            message,

                            users

                        })

                    }
                );


                const data =
                await response.json();


                if(!data.status){

                    result.textContent =
                    data.message ||
                    "Não foi possível criar o envio.";

                    return;

                }


                result.textContent =
                `${data.created} notificações colocadas na fila.`
                +
                (
                    data.skipped
                    ?
                    ` ${data.skipped} ignoradas.`
                    :
                    ""
                );


                /*
                 * Limpar selecção
                 */

                selected.forEach(
                    checkbox =>
                    checkbox.checked = false
                );


                updateSelectedUsers();


            }catch(err){

                console.error(
                    "Erro no broadcast:",
                    err
                );


                result.textContent =
                "Erro ao comunicar com o servidor.";

            }finally{

                sendBroadcast.disabled =
                false;

                sendBroadcast.textContent =
                "Enviar para seleccionados";

            }

        }
    );

}

loadBroadcastUsers();

loadNotifications();



        const toggle =
            document.getElementById(
                "automationToggle"
            );


        const status =
            document.getElementById(
                "automationStatus"
            );


        const clearEvents =
            document.getElementById(
                "clearEvents"
            );


        const events =
            document.getElementById(
                "automationEvents"
            );


        const eventLogging =
            document.getElementById(
                "eventLogging"
            );


        const automaticExecution =
            document.getElementById(
                "automaticExecution"
            );



        /*
         * ESTADO DA AUTOMAÇÃO
         */

        let automationActive = true;



        /*
         * TOGGLE PRINCIPAL
         */

        toggle.addEventListener(
            "click",
            () => {


                automationActive =
                    !automationActive;


                if (automationActive) {

                    toggle.classList.add(
                        "active"
                    );

                    toggle.querySelector(
                        "strong"
                    ).textContent =
                        "Activa";


                    status.textContent =
                        "Activo";

                    status.classList.add(
                        "status-active"
                    );


                } else {

                    toggle.classList.remove(
                        "active"
                    );

                    toggle.querySelector(
                        "strong"
                    ).textContent =
                        "Desactivada";


                    status.textContent =
                        "Inactivo";

                    status.classList.remove(
                        "status-active"
                    );

                }

            }
        );



        /*
         * LIMPAR EVENTOS
         */

        clearEvents.addEventListener(
            "click",
            () => {


                events.innerHTML = `

                    <div class="automation-empty">

                        <div class="automation-empty-icon">

                            <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.5">

                                <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M12 6v6l4 2"/>

                                <circle
                                cx="12"
                                cy="12"
                                r="9"/>

                            </svg>

                        </div>

                        <strong>
                            Nenhuma actividade
                        </strong>

                        <p>
                            Os eventos da automação aparecerão aqui.
                        </p>

                    </div>

                `;

            }
        );



        /*
         * CONFIGURAÇÕES
         */

        eventLogging.addEventListener(
            "change",
            () => {

                console.log(
                    "Registo de eventos:",
                    eventLogging.checked
                );

            }
        );



        automaticExecution.addEventListener(
            "change",
            () => {

                console.log(
                    "Execução automática:",
                    automaticExecution.checked
                );

            }
        );



        /*
         * LOGOUT
         */

        const logout =
            document.getElementById(
                "logoutAdmin"
            );


        if (logout) {

            logout.addEventListener(
                "click",
                () => {



sessionStorage.removeItem(
"admin_token"
);
                    window.location.href =
                        "../login.html";

                }
            );

        }


    }
);
