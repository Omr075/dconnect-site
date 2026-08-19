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
 * As credenciais podem ser definidas
 * pelas variáveis de ambiente ou pelo Gateway.
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

const admins = [
    {
        username:
        process.env.ADMIN_USERNAME ||
        "root",

        password:
        process.env.ADMIN_PASSWORD ||
        "123456"
    },
    {
        username:
        process.env.ADMIN_USERNAME_2 ||
        "daudo",

        password:
        process.env.ADMIN_PASSWORD_2 ||
        "Embarace1234"
    }
];


const admin =
    admins.find(
        a =>
        a.username === username &&
        a.password === password
    );


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

admin: {
    username:
    admin.username
}
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
