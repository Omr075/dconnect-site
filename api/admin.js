const express = require("express");

const db =
require("../database/connection");
const fs = require("fs");
const path = require("path");
const router =
express.Router();



router.post(
    "/login",
    (req,res) => {

        try {

            const {
                username,
                password,
                token
            } = req.body;


            /*
             * Verificar token do Gateway
             */

            const validSession =
                db.prepare(`
                    SELECT
                        token,
                        created_at,
                        expires_at
                    FROM admin_sessions
                    WHERE token = ?
                    AND expires_at > ?
                    LIMIT 1
                `).get(
                    token,
                    Date.now()
                );


            if(!validSession){

                return res.json({

                    status:false,

                    message:
                    "Acesso expirado."

                });

            }


            /*
             * Verificar administrador
             */

/*
 * Verificar administrador
 * As credenciais são obtidas
 * através das variáveis de ambiente
 * ou do Gateway.
 */

const gatewayPath =
    path.join(
        __dirname,
        "../config/gateway.json"
    );

const gateway =
    JSON.parse(
        fs.readFileSync(
            gatewayPath,
            "utf8"
        )
    );

const adminEmail =
    process.env.GATEWAY_EMAIL ||
    gateway.email;

const adminPassword =
    process.env.GATEWAY_PASSWORD ||
    gateway.password;


const admin =
    username === adminEmail &&
    password === adminPassword;


if(!admin){

    return res.json({

        status:false,

        message:
        "Credenciais administrativas inválidas."

    });

}

            /*
             * Criar sessão administrativa
             */

            const adminToken =
                Math.random()
                .toString(36)
                .substring(2,18);


            const createdAt =
                Date.now();


            const expiresAt =
                createdAt +
                24 * 60 * 60 * 1000;


            db.prepare(`
                INSERT INTO admin_sessions (
                    token,
                    created_at,
                    expires_at
                )
                VALUES (?, ?, ?)
            `).run(
                adminToken,
                createdAt,
                expiresAt
            );


            /*
             * Resposta
             */

            return res.json({

                status:true,

                token:
                adminToken,

                admin

            });


        } catch(err){

            console.error(
                "Erro no login administrativo:",
                err
            );


            return res.status(500).json({

                status:false,

                message:
                "Erro interno na autenticação administrativa."

            });

        }

    }
);


module.exports = router;


/*
const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();


const adminsPath =
    path.join(
        __dirname,
        "../database/admins.json"
    );


const sessionsPath =
    path.join(
        __dirname,
        "../database/admin_sessions.json"
    );



router.post("/login", (req, res) => {


    const {
        username,
        password,
        token
    } = req.body;



    // Verificar token do Gateway

    const sessions =
        JSON.parse(
            fs.readFileSync(
                sessionsPath
            )
        );


    const validSession =
        sessions.find(
            s =>
            s.token === token &&
            Date.now() < s.expiresAt
        );



    if (!validSession) {

        return res.json({

            status: false,

            message:
            "Acesso expirado."

        });

    }



    // Verificar administrador

    const admins =
        JSON.parse(
            fs.readFileSync(
                adminsPath
            )
        );



    const admin =
        admins.find(
            a =>
            a.username === username &&
            a.password === password &&
            a.enabled
        );




if (!admin) {

    return res.json({

        status: false,

        message:
        "Credenciais administrativas inválidas."

    });

}

const adminToken =
    Math.random()
    .toString(36)
    .substring(2, 18);

sessions.push({

    token: adminToken,

    createdAt: Date.now(),

    expiresAt: Date.now() + 24 * 60 * 60 * 1000

});

fs.writeFileSync(

    sessionsPath,

    JSON.stringify(sessions, null, 2)

);

res.json({

    status: true,

    token: adminToken,

    admin

});
});
module.exports = router;
*/
