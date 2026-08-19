const db =
require("../database/connection");


module.exports = (
    req,
    res,
    next
) => {

    try {

        /*
         * Receber token administrativo
         */

        const token =

            req.headers["x-admin-token"] ||

            req.body?.token ||

            req.query?.token;


        /*
         * Sem token
         */

        if(!token){

            return res.status(403).json({

                status:false,

                message:
                "Token administrativo obrigatório."

            });

        }


        /*
         * Procurar sessão válida
         */

        const session =
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


        /*
         * Token inválido ou expirado
         */

        if(!session){

            return res.status(403).json({

                status:false,

                message:
                "Sessão administrativa inválida ou expirada."

            });

        }


        /*
         * Guardar dados da sessão
         */

        req.admin = {

            token:
            session.token,

            createdAt:
            session.created_at,

            expiresAt:
            session.expires_at

        };


        next();


    } catch(err){

        console.error(
            "Erro no middleware admin:",
            err
        );


        return res.status(500).json({

            status:false,

            message:
            "Erro interno na autenticação administrativa."

        });

    }

};


/*
const fs = require("fs");
const path = require("path");


const sessionsPath =
    path.join(
        __dirname,
        "../database/admin_sessions.json"
    );



module.exports = (req, res, next) => {


    try {


        // Recebe o token administrativo

        const token =

            req.headers["x-admin-token"] ||

            req.body?.token ||

            req.query?.token;



        // Sem token

        if (!token) {

            return res.status(403).json({

                status: false,

                message:
                "Token administrativo obrigatório."

            });

        }



        // Ler sessões activas

        const sessions =

            JSON.parse(

                fs.readFileSync(

                    sessionsPath,

                    "utf-8"

                )

            );



        // Procurar sessão válida

        const session =

            sessions.find(

                s =>

                s.token === token &&

                Date.now() < s.expiresAt

            );



        // Token inválido ou expirado

        if (!session) {


            return res.status(403).json({

                status: false,

                message:
                "Sessão administrativa inválida ou expirada."

            });


        }



        // Guardar dados da sessão

        req.admin = {

            token:
            session.token,

            createdAt:
            session.createdAt,

            expiresAt:
            session.expiresAt

        };



        // Continuar

        next();



    } catch (err) {


        console.error(
            "Erro no middleware admin:",
            err
        );


        return res.status(500).json({

            status:false,

            message:
            "Erro interno na autenticação administrativa."

        });


    }


};
*/
