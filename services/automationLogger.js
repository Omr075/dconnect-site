const fs = require("fs");
const path = require("path");


const file =
path.join(
    __dirname,
    "../database/automation.json"
);



function logAutomation(data){


    const automation =
    JSON.parse(
        fs.readFileSync(file,"utf-8")
    );


    automation.executions++;


    if(data.status === "success"){

        automation.success++;

    }else{

        automation.failed++;

    }


    automation.lastExecution =
    new Date().toISOString();


    automation.lastEvent =
    data.message;


    automation.responseTime =
    data.responseTime || 0;



    automation.events.unshift({

        title:
        data.title || "Automação",

        message:
        data.message,

        status:
        data.status,

        createdAt:
        new Date().toISOString()

    });



    // manter apenas últimos 50 eventos

    automation.events =
    automation.events.slice(0,50);



    fs.writeFileSync(
        file,
        JSON.stringify(
            automation,
            null,
            2
        )
    );


}



module.exports =
logAutomation;
