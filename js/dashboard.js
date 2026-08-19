
document.addEventListener("DOMContentLoaded", () => {

    let user = JSON.parse(localStorage.getItem("mozapi_user"));
    const session = localStorage.getItem("mozapi_session");

    if (!session || !user) {
        window.location.href = "login.html";
        return;
    }

    const apikeyEl = document.getElementById("apikey");
    const copyBtn = document.getElementById("copyKey");
    const newKeyBtn = document.getElementById("newKey");
    const nameEl = document.getElementById("name");
    const emailEl = document.getElementById("email");
    const planEl = document.getElementById("plan");
    const createdEl = document.getElementById("created");
    const requestsEl = document.getElementById("requests");

// Dados da conta
    if (nameEl) nameEl.innerText = user.name;
    if (emailEl) emailEl.innerText = user.email;
    if (planEl) planEl.innerText = user.plan;
    if (createdEl) createdEl.innerText = user.createdAt;
    if (requestsEl) requestsEl.innerText = user.requests;

// Estatísticas
const planStatsEl =
    document.getElementById("planStats");
    
const statusApiEl =
    document.getElementById("statusApi");

if (planStatsEl) {
    planStatsEl.innerText = user.plan;
}

if (statusApiEl) {
    statusApiEl.innerText = "Ativa";
}




const botaoSvg = document.querySelector('svg.svg');

let timeoutId = null; 
const TEMPO_EXIBICAO = 5000; 

function ocultarKey() {
    if (apikeyEl) {
        apikeyEl.innerText = "moz_sk_************";
    }
}

if (botaoSvg) {
    botaoSvg.addEventListener('click', function() {
        if (!apikeyEl) return;

        if (apikeyEl.innerText === user.apikey) {
            ocultarKey();
            if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
            }
        } 
        else {
            apikeyEl.innerText = user.apikey;

            if (timeoutId) clearTimeout(timeoutId);

            timeoutId = setTimeout(function() {
                ocultarKey();
                timeoutId = null; 
            }, TEMPO_EXIBICAO);
        }
    });
}

ocultarKey();



function saudacao() {
    const hora = new Date().getHours();
    let textoSaudacao; 

    if (hora >= 0 && hora < 12) {
        textoSaudacao = "Bom dia";
    } else if (hora >= 12 && hora < 18) {
        textoSaudacao = "Boa tarde";
    } else {
        textoSaudacao = "Boa noite";
    }

    const elSaudacao = document.getElementById("sa");
    if (elSaudacao) {
        elSaudacao.innerText = `${textoSaudacao}, `;
    }

    const elNomeOriginal = document.getElementById("name");
    
    const elSaudacaoNome = document.getElementById("sa2");

    if (elNomeOriginal && elSaudacaoNome) {
        const nomeUsuario = elNomeOriginal.innerText || elNomeOriginal.textContent;
        elSaudacaoNome.innerText = `${nomeUsuario}!`;
    }
}

saudacao();


if (copyBtn) {
    copyBtn.addEventListener("click", async () => {

        const texto = apikeyEl.innerText;

        try {

            await navigator.clipboard.writeText(texto);

            copyBtn.innerText = "Copiada!";

            setTimeout(() => {
                copyBtn.innerText = "Copiar chave";
            }, 1500);

        } catch (err) {

            alert("Não foi possível copiar.");

            console.error(err);

        }

    });
}
    // GERAR NOVA CHAVE
if (newKeyBtn) {

    newKeyBtn.addEventListener("click", async () => {

        try {

            const response =
                await fetch("/api/auth/regenerate-key", {

                    method: "POST",

                    headers: {

                        "Content-Type":
                        "application/json"

                    },

                    body: JSON.stringify({

                        email: user.email

                    })

                });

            const data =
                await response.json();

            if (!data.status) {

                alert(data.message);

                return;

            }

            user = data.user;

            localStorage.setItem(

                "mozapi_user",

                JSON.stringify(user)

            );

            renderKey();

            newKeyBtn.innerText =
                "Nova chave criada!";

            setTimeout(() => {

                newKeyBtn.innerText =
                    "Gerar Nova chave API";

            }, 1500);

        } catch (err) {

            console.error(err);

        }

    });

}
    // LOGOUT
    const logoutBtn = document.getElementById("logout");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {

            localStorage.removeItem("mozapi_session");

            window.location.href = "login.html";

        });
    }

});
