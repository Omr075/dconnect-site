const fs = require("fs");
const path = require("path");

const email =
require("./email");

const sms =
require("./sms");


const notificationsPath =
path.join(
    __dirname,
    "../../../config/notifications.json"
);


function getSettings(){

    return JSON.parse(
        fs.readFileSync(
            notificationsPath,
            "utf8"
        )
    );

}



async function userRegistered(user){


    const settings =
    getSettings();



    if(
        settings.register &&
        settings.register.email
    ){

        email.sendEmail(

            user.email,

            "Bem-vindo à MOZAPI",

            `
Olá, ${user.name}!
É com muito prazer que lhe damos as boas-vindas à MOZAPI.
A sua conta foi criada com sucesso e já está pronta para utilizar os nossos serviços.
Obrigado por confiar na MOZAPI. Esperamos proporcionar-lhe uma experiência simples, segura e agradável.
Bem-vindo à MOZAPI. Estamos consigo em cada passo.
`

        );

    }



    if(
        settings.register &&
        settings.register.sms
    ){

        sms.sendSMS(

            user.phone || "SEM_NUMERO",

            `
Olá, ${user.name}!

Seja muito bem-vindo à MOZAPI.

A sua conta foi criada com sucesso e estamos felizes por tê-lo connosco. A partir de agora, terá acesso aos nossos serviços e funcionalidades.

Se precisar de ajuda, informações adicionais ou suporte, a nossa equipa estará disponível para o ajudar.

Obrigado por escolher a MOZAPI.
Estamos consigo em cada passo.
`

        );

    }


}



module.exports = {

    getSettings,

    userRegistered

};
