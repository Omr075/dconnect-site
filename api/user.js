const express = require("express");

const db =
    require("../database/connection");


const router =
    express.Router();




router.post(
    "/progress",
    (req, res) => {

        try {

            const {
                apikey
            } = req.body;


            if (!apikey) {

                return res.json({

                    status: false,

                    message:
                        "API Key obrigatória."

                });

            }


            /*
             * Procurar utilizador no SQLite
             */

            const user =
                db.prepare(`
                    SELECT
                        id,
                        name,
                        email,
                        phone,
                        password,
                        provider,
                        google_id,
                        avatar,
                        apikey,
                        requests,
                        plan,
                        status,
                        suspended_at,
                        suspension_until,
                        suspension_reason,
                        created_at
                    FROM users
                    WHERE apikey = ?
                    LIMIT 1
                `).get(apikey);


            if (!user) {

                return res.json({

                    status: false,

                    message:
                        "Utilizador não encontrado."

                });

            }


            /*
             * Converter formato SQLite
             * para o formato usado pelo frontend
             */

            const userData = {

                id:
                    user.id,

                name:
                    user.name,

                email:
                    user.email,

                phone:
                    user.phone,

                password:
                    user.password,

                provider:
                    user.provider,

                googleId:
                    user.google_id,

                avatar:
                    user.avatar,

                apikey:
                    user.apikey,

                requests:
                    user.requests,

                plan:
                    user.plan,

                status:
                    user.status,

                suspendedAt:
                    user.suspended_at,

                suspensionUntil:
                    user.suspension_until,

                suspensionReason:
                    user.suspension_reason,

                createdAt:
                    user.created_at

            };


            /*
             * Ler logs
             *
             * Os logs continuam em JSON
             * nesta fase da migração.
             */

const lastLog =
    db.prepare(`
        SELECT
            endpoint,
            date
        FROM logs
        WHERE apikey = ?
        ORDER BY id DESC
        LIMIT 1
    `).get(apikey);

            /*
             * Resposta
             */

            return res.json({

                status: true,

                account: true,

                requests:
                    user.requests || 0,

                lastEndpoint:
                    lastLog
                        ?
                        lastLog.endpoint
                        :
                        "Nenhum ainda",

                lastDate:
                    lastLog
                        ?
                        lastLog.date
                        :
                        null,

                user:
                    userData

            });


        } catch (err) {

            console.error(
                "Erro em /api/user/progress:",
                err
            );


            return res.status(500).json({

                status: false,

                message:
                    "Erro interno."

            });

        }

    }
);


module.exports =
    router;

/*
const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();


const usersPath =
path.join(
    __dirname,
    "../database/users.json"
);


const logsPath =
path.join(
    __dirname,
    "../database/logs.json"
);



router.post("/progress", (req,res)=>{


    try{


        const {
            apikey
        } = req.body;



        if(!apikey){

            return res.json({

                status:false,

                message:
                "API Key obrigatória."

            });

        }



        const users =
        JSON.parse(
            fs.readFileSync(
                usersPath,
                "utf-8"
            )
        );



        const logs =
        JSON.parse(
            fs.readFileSync(
                logsPath,
                "utf-8"
            )
        );



        const user =
        users.find(
            u =>
            u.apikey === apikey
        );



        if(!user){

            return res.json({

                status:false,

                message:
                "Utilizador não encontrado."

            });

        }



        const userLogs =
        logs.filter(
            log =>
            log.apikey === apikey
        );



        const lastLog =
        userLogs.length
        ?
        userLogs[userLogs.length - 1]
        :
        null;



        res.json({

            status:true,


            account:true,


            requests:
            userLogs.length,


            lastEndpoint:
            lastLog
            ?
            lastLog.endpoint
            :
            "Nenhum ainda",


            lastDate:
            lastLog
            ?
            lastLog.date
            :
            null,


            user:user


        });



    }
    catch(err){


        console.error(err);


        res.status(500).json({

            status:false,

            message:
            "Erro interno."

        });


    }



});



module.exports = router;
*/


