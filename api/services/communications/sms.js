const queue =
require("./queue");


function sendSMS(to, message){

/*
    console.log(
        "[SMS]"
    );


    console.log(
        "Para:",
        to
    );


    console.log(
        "Mensagem:",
        message
    );

*/
    queue.addNotification({

        type: "sms",

        target: to,

        message

    });


}


module.exports = {

    sendSMS

};
