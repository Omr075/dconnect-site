const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const db =
require("../database/connection");
const adminAuth =
require("../middlewares/admin");

const {
    addNotification
} =
require("./services/communications/queue");
const automationPath =
path.join(
    __dirname,
    "../database/automation.json"
);



router.get(
"/automation/status",
adminAuth,
(req,res)=>{


    try {


        const automation =
        JSON.parse(
            fs.readFileSync(
                automationPath,
                "utf-8"
            )
        );


        res.json({

            status:true,

            automation

        });



    } catch(err){


        console.error(
            err
        );


        res.status(500).json({

            status:false,

            message:
            "Erro ao carregar automação."

        });


    }


});

router.get(
"/automation/notifications",
adminAuth,
(req,res)=>{

    try {

        const status =
            req.query.status;

        const type =
            req.query.type;

        let query = `
            SELECT
                id,
                type,
                category,
                source,
                target,
                subject,
                message,
                status,
                attempts,
                created_at AS createdAt,
                sent_at AS sentAt,
                failed_at AS failedAt
            FROM notifications
        `;

        const conditions = [];
        const params = [];

        if (status) {

            conditions.push(
                "status = ?"
            );

            params.push(status);

        }

        if (type) {

            conditions.push(
                "type = ?"
            );

            params.push(type);

        }

        if (conditions.length) {

            query +=
                " WHERE " +
                conditions.join(" AND ");

        }

        query +=
            " ORDER BY id ASC";

        const result =
            db.prepare(query).all(...params);


        res.json({

            status: true,

            total:
                result.length,

            notifications:
                result

        });


    } catch(err){

        console.error(
            "Erro ao carregar notificações:",
            err
        );


        res.status(500).json({

            status: false,

            message:
                "Erro ao carregar notificações."

        });

    }

});

router.get(
"/automation/notifications/sent",
adminAuth,
(req,res)=>{

    try {

        const type =
            req.query.type;

        let query = `
            SELECT
                id,
                type,
                category,
                source,
                target,
                subject,
                message,
                status,
                attempts,
                created_at AS createdAt,
                sent_at AS sentAt,
                failed_at AS failedAt
            FROM notifications
            WHERE status = 'sent'
        `;

        const params = [];

        if (type) {

            query +=
                " AND type = ?";

            params.push(type);

        }

        query +=
            " ORDER BY id ASC";

        const sent =
            db.prepare(query).all(...params);


        res.json({

            status: true,

            total:
                sent.length,

            notifications:
                sent

        });


    } catch(err){

        console.error(
            "Erro ao carregar notificações enviadas:",
            err
        );


        res.status(500).json({

            status: false,

            message:
                "Erro ao carregar notificações enviadas."

        });

    }

});

router.post(
"/automation/sms/prepare",
adminAuth,
(req,res)=>{

    try {

        const {
            target,
            message,
            category = "manual"
        } = req.body;


        if(!target || !message){

            return res.status(400).json({

                status:false,

                message:
                "Número e mensagem são obrigatórios."

            });

        }


const notification =
    addNotification({

        type:
            "sms",

        category,

        source:
            "admin",

        target,

        subject:
            null,

        message

    });

        res.json({

            status:true,

            message:
            "SMS preparado e colocado na fila.",

            notification

        });


    } catch(err){

        console.error(
            "Erro ao preparar SMS:",
            err
        );


        res.status(500).json({

            status:false,

            message:
            "Erro ao preparar SMS."

        });

    }

});




router.post(
"/automation/broadcast",
adminAuth,
(req,res)=>{

    try {

        const {
            type,
            message,
            users
        } = req.body;


        /*
         * VALIDAR TIPO
         */

        if(type !== "sms" && type !== "email"){

            return res.status(400).json({

                status:false,

                message:
                "Tipo de envio inválido."

            });

        }


        /*
         * VALIDAR MENSAGEM
         */

        if(
            !message ||
            typeof message !== "string" ||
            !message.trim()
        ){

            return res.status(400).json({

                status:false,

                message:
                "A mensagem é obrigatória."

            });

        }


        /*
         * LIMITE DA MENSAGEM
         */

        if(message.length > 500){

            return res.status(400).json({

                status:false,

                message:
                "A mensagem não pode ultrapassar 500 caracteres."

            });

        }


        /*
         * VALIDAR UTILIZADORES
         */

        if(
            !Array.isArray(users) ||
            users.length === 0
        ){

            return res.status(400).json({

                status:false,

                message:
                "Seleccione pelo menos um utilizador."

            });

        }


const allUsers =
db.prepare(`
    SELECT
        id,
        name,
        email,
        phone,
        apikey,
        requests,
        plan,
        created_at
    FROM users
`).all();




        let created = 0;
        let skipped = 0;


        /*
         * PROCESSAR CADA UTILIZADOR
         */

        users.forEach(identifier => {


            const user =
            allUsers.find(
                u =>
                u.email === identifier ||
                String(u.id) === String(identifier)
            );


            if(!user){

                skipped++;

                return;

            }


            /*
             * DESTINO
             */

            const target =
            type === "sms"
            ?
            user.phone
            :
            user.email;


            if(!target){

                skipped++;

                return;

            }





/*
 * SUBSTITUIR VARIÁVEIS
 */

const personalizedMessage =
message

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
    String(user.requests || 0)
)
.replace(
    /{{\s*data\s*}}/gi,
    user.created_at || ""
);



addNotification({

    type,

    category:
        "broadcast",

    source:
        "admin",

    target,

    subject:
        type === "email"
        ?
        "Mensagem da MOZAPI"
        :
        null,

    message:
        personalizedMessage

});

            created++;

        });



        /*
         * RESPOSTA
         */

        res.json({

            status:true,

            message:
            "Envio em massa colocado na fila.",

            created,

            skipped

        });


    } catch(err){

        console.error(
            "Erro no envio em massa:",
            err
        );


        res.status(500).json({

            status:false,

            message:
            "Erro interno ao criar envio em massa."

        });

    }

});


/*router.post(
"/automation/broadcast",
adminAuth,
(req, res) => {

    try {

        const {
            message,
            type = "sms",
            category = "broadcast"
        } = req.body;


        if (!message || !message.trim()) {

            return res.status(400).json({

                status: false,

                message:
                "A mensagem é obrigatória."

            });

        }


        if (type !== "sms") {

            return res.status(400).json({

                status: false,

                message:
                "Por enquanto o envio em massa está disponível apenas para SMS."

            });

        }

const users =
db.prepare(`
    SELECT
        id,
        name,
        email,
        phone,
        apikey,
        requests,
        plan,
        created_at
    FROM users
`).all();


        const notifications =
        JSON.parse(
            fs.readFileSync(
                notificationsPath,
                "utf-8"
            )
        );


        let created = 0;


        users.forEach(user => {

            if (!user.phone) {
                return;
            }



            const personalizedMessage =
            message
            .replace(
                /\{nome\}/gi,
                user.name || ""
            )
            .replace(
                /\{email\}/gi,
                user.email || ""
            )
            .replace(
                /\{telefone\}/gi,
                user.phone || ""
            )
            .replace(
                /\{plano\}/gi,
                user.plan || "Free"
            )
            .replace(
                /\{pedidos\}/gi,
                String(user.requests || 0)
            )


.replace(
    /\{data\}/gi,
    user.created_at || ""
);

            notifications.push({

                id:
                Date.now() +
                created,

                type:
                "sms",

                category:
                category,

                source:
                "admin",

                target:
                user.phone,

                subject:
                null,

                message:
                personalizedMessage,

                status:
                "pending",

                attempts:
                0,

                createdAt:
                new Date().toISOString(),

                sentAt:
                null

            });


            created++;

        });


        fs.writeFileSync(

            notificationsPath,

            JSON.stringify(
                notifications,
                null,
                2
            )

        );


        return res.json({

            status: true,

            message:
            "Envio em massa colocado na fila.",

            total:
            created

        });


    } catch (err) {

        console.error(
            "Erro no envio em massa:",
            err
        );


        return res.status(500).json({

            status: false,

            message:
            "Erro interno ao criar o envio em massa."

        });

    }

});
*/

module.exports = router;

