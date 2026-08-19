/* =========================================================
   MOZAPI — RECUPERAÇÃO DE PALAVRA-PASSE
========================================================= */


/* =========================================================
   ELEMENTOS
========================================================= */

const stepPhone =
    document.getElementById("stepPhone");

const stepCode =
    document.getElementById("stepCode");

const stepPassword =
    document.getElementById("stepPassword");


const phoneForm =
    document.getElementById("phoneForm");

const codeForm =
    document.getElementById("codeForm");

const passwordForm =
    document.getElementById("passwordForm");


const phone =
    document.getElementById("phone");

const code =
    document.getElementById("code");

const newPassword =
    document.getElementById("newPassword");

const confirmPassword =
    document.getElementById("confirmPassword");


const phoneMessage =
    document.getElementById("phoneMessage");

const codeMessage =
    document.getElementById("codeMessage");

const passwordMessage =
    document.getElementById("passwordMessage");


const phoneDisplay =
    document.getElementById("phoneDisplay");

const codeTimer =
    document.getElementById("codeTimer");


const requestCode =
    document.getElementById("requestCode");

const verifyCode =
    document.getElementById("verifyCode");

const resendCode =
    document.getElementById("resendCode");

const resetPassword =
    document.getElementById("resetPassword");


/* =========================================================
   ESTADO
========================================================= */

let currentPhone = "";

let currentResetId = null;

let codeCountdown = null;

let resendCountdown = null;


/* =========================================================
   MOSTRAR PASSO
========================================================= */

function showStep(step){

    stepPhone.classList.remove("active");

    stepCode.classList.remove("active");

    stepPassword.classList.remove("active");


    step.classList.add("active");

}


/* =========================================================
   MENSAGENS
========================================================= */

function showMessage(element, message){

    element.textContent = message;

}


function clearMessages(){

    phoneMessage.textContent = "";

    codeMessage.textContent = "";

    passwordMessage.textContent = "";

}


/* =========================================================
   CONTADOR DO CÓDIGO
   60 SEGUNDOS
========================================================= */

function startCodeTimer(){

    clearInterval(codeCountdown);

    let seconds = 60;


    codeTimer.textContent =
        `${seconds}s`;


    codeCountdown =
        setInterval(() => {

            seconds--;


            codeTimer.textContent =
                `${seconds}s`;


            if(seconds <= 0){

                clearInterval(codeCountdown);

                codeTimer.textContent =
                    "Expirado";

            }

        }, 1000);

}


/* =========================================================
   CONTADOR PARA NOVO PEDIDO
   30 SEGUNDOS
========================================================= */

function startResendTimer(){

    clearInterval(resendCountdown);

    let seconds = 30;


    resendCode.disabled = true;

    resendCode.textContent =
        `Pedir novo código (${seconds}s)`;


    resendCountdown =
        setInterval(() => {

            seconds--;


            if(seconds <= 0){

                clearInterval(resendCountdown);

                resendCode.disabled = false;

                resendCode.textContent =
                    "Pedir novo código";

                return;

            }


            resendCode.textContent =
                `Pedir novo código (${seconds}s)`;


        }, 1000);

}


/* =========================================================
   PEDIR CÓDIGO
========================================================= */

phoneForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        clearMessages();


        const phoneValue =
            phone.value.trim();


        if(!phoneValue){

            showMessage(
                phoneMessage,
                "Introduza o seu número de telefone."
            );

            return;

        }


        requestCode.disabled = true;

        requestCode.textContent =
            "A enviar...";


        try{

            const response =
                await fetch(
                    "/api/auth/forgot-password",
                    {

                        method:"POST",

                        headers:{
                            "Content-Type":
                                "application/json"
                        },

                        body:JSON.stringify({

                            phone:
                                phoneValue

                        })

                    }
                );


            const data =
                await response.json();


            /*
             * Mesmo que o número não exista,
             * o backend não revela essa informação.
             */

            if(response.status === 429){

                showMessage(
                    phoneMessage,
                    data.message ||
                    "Aguarde antes de pedir outro código."
                );

                return;

            }


            if(!response.ok){

                showMessage(
                    phoneMessage,
                    data.message ||
                    "Não foi possível solicitar o código."
                );

                return;

            }


            currentPhone =
                phoneValue;


            phoneDisplay.textContent =
                phoneValue;


            showStep(stepCode);


            startCodeTimer();

            startResendTimer();


        }catch(error){

            console.error(
                "Erro ao solicitar código:",
                error
            );


            showMessage(
                phoneMessage,
                "Não foi possível contactar o servidor."
            );


        }finally{

            requestCode.disabled = false;

            requestCode.textContent =
                "Enviar código";

        }

    }
);


/* =========================================================
   VERIFICAR CÓDIGO
========================================================= */

codeForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        clearMessages();


        const codeValue =
            code.value.trim();


        if(!codeValue){

            showMessage(
                codeMessage,
                "Introduza o código recebido."
            );

            return;

        }


        if(!/^\d{6}$/.test(codeValue)){

            showMessage(
                codeMessage,
                "O código deve ter 6 dígitos."
            );

            return;

        }


        verifyCode.disabled = true;

        verifyCode.textContent =
            "A verificar...";


        try{

            const response =
                await fetch(
                    "/api/auth/verify-reset",
                    {

                        method:"POST",

                        headers:{
                            "Content-Type":
                                "application/json"
                        },

                        body:JSON.stringify({

                            phone:
                                currentPhone,

                            code:
                                codeValue

                        })

                    }
                );


            const data =
                await response.json();


            if(!response.ok || !data.status){

                showMessage(
                    codeMessage,
                    data.message ||
                    "Código inválido."
                );

                return;

            }


            /*
             * Guardar o resetId.
             *
             * O código ainda não foi consumido
             * pelo backend neste momento.
             */

            currentResetId =
                data.resetId;


            clearInterval(codeCountdown);

            clearInterval(resendCountdown);


            showStep(stepPassword);


        }catch(error){

            console.error(
                "Erro ao verificar código:",
                error
            );


            showMessage(
                codeMessage,
                "Não foi possível verificar o código."
            );


        }finally{

            verifyCode.disabled = false;

            verifyCode.textContent =
                "Verificar código";

        }

    }
);


/* =========================================================
   PEDIR NOVO CÓDIGO
========================================================= */

resendCode.addEventListener(
    "click",
    async () => {

        if(resendCode.disabled){

            return;

        }


        if(!currentPhone){

            return;

        }


        resendCode.disabled = true;

        resendCode.textContent =
            "A enviar...";


        clearMessages();


        try{

            const response =
                await fetch(
                    "/api/auth/forgot-password",
                    {

                        method:"POST",

                        headers:{
                            "Content-Type":
                                "application/json"
                        },

                        body:JSON.stringify({

                            phone:
                                currentPhone

                        })

                    }
                );


            const data =
                await response.json();


            if(response.status === 429){

                showMessage(
                    codeMessage,
                    data.message ||
                    "Aguarde antes de pedir outro código."
                );


                startResendTimer();

                return;

            }


            if(!response.ok){

                showMessage(
                    codeMessage,
                    data.message ||
                    "Não foi possível enviar um novo código."
                );


                startResendTimer();

                return;

            }


            code.value = "";


            showMessage(
                codeMessage,
                "Um novo código foi enviado."
            );


            startCodeTimer();

            startResendTimer();


        }catch(error){

            console.error(
                "Erro ao pedir novo código:",
                error
            );


            showMessage(
                codeMessage,
                "Não foi possível contactar o servidor."
            );


            startResendTimer();


        }

    }
);


/* =========================================================
   ALTERAR PALAVRA-PASSE
========================================================= */

passwordForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        clearMessages();


        const password =
            newPassword.value;

        const confirmation =
            confirmPassword.value;


        if(password.length < 6){

            showMessage(
                passwordMessage,
                "A palavra-passe deve ter pelo menos 6 caracteres."
            );

            return;

        }


        if(password !== confirmation){

            showMessage(
                passwordMessage,
                "As palavras-passe não coincidem."
            );

            return;

        }


        if(!currentPhone || !currentResetId){

            showMessage(
                passwordMessage,
                "A sessão de recuperação é inválida. Comece novamente."
            );

            return;

        }


        resetPassword.disabled = true;

        resetPassword.textContent =
            "A alterar...";


        try{

            /*
             * ESTE ENDPOINT SERÁ CRIADO NO AUTH.JS
             *
             * Não enviamos o código novamente.
             * O resetId identifica a recuperação
             * que foi validada.
             */

            const response =
                await fetch(
                    "/api/auth/reset-password",
                    {

                        method:"POST",

                        headers:{
                            "Content-Type":
                                "application/json"
                        },

                        body:JSON.stringify({

                            phone:
                                currentPhone,

                            resetId:
                                currentResetId,

                            password:
                                password

                        })

                    }
                );


            const data =
                await response.json();


            if(!response.ok || !data.status){

                showMessage(
                    passwordMessage,
                    data.message ||
                    "Não foi possível alterar a palavra-passe."
                );

                return;

            }


            showMessage(
                passwordMessage,
                "Palavra-passe alterada com sucesso."
            );


            /*
             * Pequeno atraso para o utilizador
             * conseguir ler a mensagem.
             */

            setTimeout(() => {

                window.location.href =
                    "login.html";

            }, 1200);


        }catch(error){

            console.error(
                "Erro ao alterar palavra-passe:",
                error
            );


            showMessage(
                passwordMessage,
                "Não foi possível contactar o servidor."
            );


        }finally{

            resetPassword.disabled = false;

            resetPassword.textContent =
                "Alterar palavra-passe";

        }

    }
);
