const fs = require("fs");
const path = require("path");


const configPath =
path.join(
    __dirname,
    "../config/notifications.json"
);



module.exports = function(req,res,next){


    const config =
    JSON.parse(
        fs.readFileSync(
            configPath,
            "utf8"
        )
    );


    if(!config.macrodroid.enabled){

        return res.status(403).json({

            status:false,

            message:
            "MacroDroid desativado"

        });

    }


const key =
req.headers["x-notify-key"];

const expectedKey =
process.env.MACRODROID_NOTIFY_KEY ||
config.macrodroid.key;

if(key !== expectedKey){
        return res.status(401).json({

            status:false,

            message:
            "Chave inválida"

        });

    }


    next();


};
