const queue =
require("./queue");


function sendEmail(to, subject, message){
/*

    console.log(
        "[EMAIL]"
    );


    console.log(
        "Para:",
        to
    );


    console.log(
        "Assunto:",
        subject
    );


    console.log(
        "Mensagem:",
        message
    );
*/

    queue.addNotification({

        type: "email",

        target: to,

        subject,

        message

    });


}


module.exports = {

    sendEmail

};



