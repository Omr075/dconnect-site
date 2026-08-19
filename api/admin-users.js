/*
const express = require("express");
const fs = require("fs");
const path = require("path");

const admin =
require("../middlewares/admin");

const router =
express.Router();

const usersPath =
path.join(
    __dirname,
    "../database/users.json"
);

router.get(
    "/users",
    admin,
    (req,res)=>{

        try{

            const users =
            JSON.parse(
                fs.readFileSync(
                    usersPath,
                    "utf8"
                )
            );

            const recent =
            users
            .sort((a,b)=>b.id-a.id)
            .slice(0,10);

            res.json({

                status:true,

                users:recent

            });

        }

        catch(err){

            res.status(500).json({

                status:false,

                message:"Erro ao carregar utilizadores."

            });

        }

    }

);



// ALTERAR PLANO
router.put(
"/users/:email/plan",
admin,
(req,res)=>{


const users =
JSON.parse(
fs.readFileSync(
usersPath,
"utf8"
)
);


const user =
users.find(
u=>u.email === req.params.email
);


if(!user){

return res.json({

status:false,

message:"Utilizador não encontrado"

});

}


user.plan =
req.body.plan;


fs.writeFileSync(
usersPath,
JSON.stringify(users,null,2)
);


res.json({

status:true,

message:"Plano actualizado"

});


});


// REGENERAR API KEY
router.post(
"/users/:email/key",
admin,
(req,res)=>{


const users =
JSON.parse(
fs.readFileSync(
usersPath,
"utf8"
)
);


const user =
users.find(
u=>u.email === req.params.email
);


if(!user){

return res.json({

status:false,

message:"Utilizador não encontrado"

});

}


const newKey =
"moz_sk_" +
Math.random()
.toString(36)
.substring(2,14);



user.apikey =
newKey;


fs.writeFileSync(
usersPath,
JSON.stringify(users,null,2)
);



res.json({

status:true,

apikey:newKey

});


});

/*

// SUSPENDER CONTA
router.put(
"/users/:email/status",
admin,
(req,res)=>{


const users =
JSON.parse(
fs.readFileSync(
usersPath,
"utf8"
)
);


const user =
users.find(
u=>u.email === req.params.email
);


if(!user){

return res.json({

status:false

});

}


user.status =
req.body.status;


fs.writeFileSync(
usersPath,
JSON.stringify(users,null,2)
);


res.json({

status:true

});


});


router.put(
"/users/:email/status",
admin,
(req,res)=>{

const users =
JSON.parse(
fs.readFileSync(
usersPath,
"utf8"
)
);

const user =
users.find(
u=>u.email===req.params.email
);

if(!user){

return res.json({

status:false,

message:"Utilizador não encontrado"

});

}

const newStatus =
req.body.status;

user.status =
newStatus;

if(newStatus==="Suspenso"){

user.suspendedAt =
Date.now();

user.suspensionUntil =
null;

user.suspensionReason =
"";

}else{

user.suspendedAt =
null;

user.suspensionUntil =
null;

user.suspensionReason =
"";

}

fs.writeFileSync(

usersPath,

JSON.stringify(
users,
null,
2
)

);

res.json({

status:true,

message:
`Conta ${newStatus.toLowerCase()} com sucesso.`

});

});



module.exports = router;
*/




const express = require("express");

const admin =
    require("../middlewares/admin");

const db =
    require("../database/connection");

const router =
    express.Router();


// ======================================================
// LISTAR UTILIZADORES
// ======================================================

router.get(
    "/users",
    admin,
    (req, res) => {

        try {

            const rows =
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
                    ORDER BY id DESC
                    LIMIT 10
                `).all();


            /*
             * Converter SQLite para o formato
             * utilizado pelo frontend
             */

            const recent =
                rows.map(user => ({

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

                }));


            return res.json({

                status: true,

                users:
                    recent

            });

        }

        catch (err) {

            console.error(
                "Admin Users Error:",
                err
            );

            return res.status(500).json({

                status: false,

                message:
                    "Erro ao carregar utilizadores."

            });

        }

    }

);


// ======================================================
// ALTERAR PLANO
// ======================================================

router.put(
    "/users/:email/plan",
    admin,
    (req, res) => {

        try {

            const email =
                req.params.email;

            const plan =
                req.body.plan;


            const user =
                db.prepare(`
                    SELECT id
                    FROM users
                    WHERE email = ?
                    LIMIT 1
                `).get(email);


            if (!user) {

                return res.json({

                    status: false,

                    message:
                        "Utilizador não encontrado"

                });

            }


            db.prepare(`
                UPDATE users
                SET plan = ?
                WHERE id = ?
            `).run(
                plan,
                user.id
            );


            return res.json({

                status: true,

                message:
                    "Plano actualizado"

            });

        }

        catch (err) {

            console.error(
                "Admin Plan Error:",
                err
            );

            return res.status(500).json({

                status: false,

                message:
                    "Erro ao actualizar plano."

            });

        }

    }

);


// ======================================================
// REGENERAR API KEY
// ======================================================

router.post(
    "/users/:email/key",
    admin,
    (req, res) => {

        try {

            const email =
                req.params.email;


            const user =
                db.prepare(`
                    SELECT id
                    FROM users
                    WHERE email = ?
                    LIMIT 1
                `).get(email);


            if (!user) {

                return res.json({

                    status: false,

                    message:
                        "Utilizador não encontrado"

                });

            }


            const newKey =
                "moz_sk_" +
                Math.random()
                    .toString(36)
                    .substring(2, 14);


            db.prepare(`
                UPDATE users
                SET apikey = ?
                WHERE id = ?
            `).run(
                newKey,
                user.id
            );


            return res.json({

                status: true,

                apikey:
                    newKey

            });

        }

        catch (err) {

            console.error(
                "Admin Key Error:",
                err
            );

            return res.status(500).json({

                status: false,

                message:
                    "Erro ao regenerar chave API."

            });

        }

    }

);


/*

// ======================================================
// VERSÃO ANTIGA — SUSPENDER CONTA
// Mantida como fallback
// ======================================================

router.put(
"/users/:email/status",
admin,
(req,res)=>{


const users =
JSON.parse(
fs.readFileSync(
usersPath,
"utf8"
)
);


const user =
users.find(
u=>u.email===req.params.email
);


if(!user){

return res.json({

status:false

});

}


user.status =
req.body.status;


fs.writeFileSync(
usersPath,
JSON.stringify(users,null,2)
);


res.json({

status:true

});


});
*/


// ======================================================
// SUSPENDER / ACTIVAR CONTA
// ======================================================

router.put(
    "/users/:email/status",
    admin,
    (req, res) => {

        try {

            const email =
                req.params.email;


            const newStatus =
                req.body.status;


            const user =
                db.prepare(`
                    SELECT id
                    FROM users
                    WHERE email = ?
                    LIMIT 1
                `).get(email);


            if (!user) {

                return res.json({

                    status: false,

                    message:
                        "Utilizador não encontrado"

                });

            }


            let suspendedAt = null;

            let suspensionUntil = null;

            let suspensionReason = null;


            if (
                newStatus === "Suspenso"
            ) {

                suspendedAt =
                    Date.now();

                suspensionUntil =
                    null;

                suspensionReason =
                    "";

            }


            db.prepare(`
                UPDATE users
                SET
                    status = ?,
                    suspended_at = ?,
                    suspension_until = ?,
                    suspension_reason = ?
                WHERE id = ?
            `).run(

                newStatus,

                suspendedAt,

                suspensionUntil,

                suspensionReason,

                user.id

            );


            return res.json({

                status: true,

                message:
                    `Conta ${newStatus.toLowerCase()} com sucesso.`

            });

        }

        catch (err) {

            console.error(
                "Admin Status Error:",
                err
            );

            return res.status(500).json({

                status: false,

                message:
                    "Erro ao alterar estado da conta."

            });

        }

    }

);


module.exports =
    router;
