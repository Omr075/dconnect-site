const express = require("express");

const router = express.Router();

const logAutomation =
require("../services/automationLogger");


router.post(
"/event",
(req,res)=>{


try{


const {
title,
message,
status,
responseTime
} = req.body;



if(!message){

return res.json({

status:false,

message:
"Mensagem obrigatória"

});

}



logAutomation({

title:
title || "Automação",

message,

status:
status || "success",

responseTime:
responseTime || 0

});



res.json({

status:true,

message:
"Evento registado"

});


}catch(err){


console.error(err);


res.status(500).json({

status:false,

message:
"Erro ao registar evento"

});


}


});


module.exports = router;
