const express = require("express");
const fs = require("fs");
const path = require("path");
const {
    addNotification
} =
require("./services/communications/queue");

const router = express.Router();
const db = require("../database/connection");


const passwordResetsPath =
    path.join(
        __dirname,
        "../database/password_resets.json"
    );


const gatewayPath =
    path.join(__dirname, "../config/gateway.json");

const adminSessionsPath =
    path.join(__dirname, "../database/admin_sessions.json");


const { OAuth2Client } = require("google-auth-library");

const googleClient =
    new OAuth2Client("341416037579-lebsilp4c41k6j3ep7q0et88u0fjjkc2.apps.googleusercontent.com");


const communications =
require("./services/communications");
router.post("/register", (req, res) => {

    try {

        const {
            name,
            email,
            phone,
            password
        } = req.body;

        const exists = db.prepare(`
            SELECT id
            FROM users
            WHERE email = ?
            LIMIT 1
        `).get(email);

        if (exists) {

            return res.json({

                status: false,

                message: "Email já existe"

            });

        }

        const newUser = {

            name,

            email,

            phone,

            password,

            avatar:
                Math.random() < 0.5
                    ? "assets/img/avatar1.jpeg"
                    : "assets/img/avatar2.jpeg",

            apikey:
                "moz_sk_" +
                Math.random()
                    .toString(36)
                    .substring(2, 18),

            requests: 0,

            plan: "Free",

            createdAt:
                new Date()
                    .toLocaleDateString("pt-PT")

        };

        const result = db.prepare(`
            INSERT INTO users (
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
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(

            newUser.name,
            newUser.email,
            newUser.phone,
            newUser.password,
            null,
            null,
            newUser.avatar,
            newUser.apikey,
            newUser.requests,
            newUser.plan,
            null,
            null,
            null,
            null,
            newUser.createdAt

        );

        newUser.id = Number(result.lastInsertRowid);

        communications.userRegistered(
            newUser
        );

        return res.json({

            status: true,

            user: newUser

        });

    } catch (err) {

        console.error(
            "Erro no cadastro:",
            err
        );

        return res.status(500).json({

            status: false,

            message:
                "Erro interno ao realizar cadastro."

        });

    }

});



router.post("/login", (req, res) => {

    const {
        email,
        password
    } = req.body;


    const gateway =
        JSON.parse(
            fs.readFileSync(gatewayPath)
        );


if (
    gateway.enabled &&
    email === gateway.email &&
    password === gateway.password
) {


    const sessions =
        JSON.parse(
            fs.readFileSync(adminSessionsPath)
        );


    const token =
        Math.random()
        .toString(36)
        .substring(2, 20);


    const now =
        Date.now();


    sessions.push({

        token,

        createdAt: now,

        expiresAt:
            now + gateway.tokenTTL

    });


    fs.writeFileSync(

        adminSessionsPath,

        JSON.stringify(
            sessions,
            null,
            2
        )

    );


    return res.json({

        status: true,

        gateway: true,

        token

    });

}


    const row =
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
            WHERE email = ?
              AND password = ?
            LIMIT 1
        `).get(email, password);


    if (!row) {

        return res.json({

            status: false,

            message:
            "Credenciais inválidas"

        });

    }


    const user = {

        id: row.id,

        name: row.name,

        email: row.email,

        phone: row.phone,

        password: row.password,

        provider: row.provider,

        googleId: row.google_id,

        avatar: row.avatar,

        apikey: row.apikey,

        requests: row.requests,

        plan: row.plan,

        status: row.status,

        suspensionUntil: row.suspension_until,

        suspensionReason: row.suspension_reason,

        createdAt: row.created_at

    };



// Conta suspensa
if(user.status === "Suspenso"){

    return res.json({

        status:false,

        suspended:true,

        message:"A sua conta encontra-se suspensa.",

        reason:
        user.suspensionReason || "",

        until:
        user.suspensionUntil || null

    });

}

    res.json({

        status: true,

        user

    });

});


router.post("/regenerate-key", (req, res) => {

    try {

        const { email } = req.body;

        const user = db.prepare(`
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
                suspension_until,
                suspension_reason,
                created_at
            FROM users
            WHERE email = ?
            LIMIT 1
        `).get(email);

        if (!user) {

            return res.json({

                status: false,

                message: "Utilizador não encontrado"

            });

        }

        const newApiKey =
            "moz_sk_" +
            Math.random()
                .toString(36)
                .substring(2, 18);

        db.prepare(`
            UPDATE users
            SET apikey = ?
            WHERE id = ?
        `).run(
            newApiKey,
            user.id
        );

        user.apikey = newApiKey;

        user.googleId = user.google_id;
        delete user.google_id;

        user.suspensionUntil =
            user.suspension_until;

        delete user.suspension_until;

        user.suspensionReason =
            user.suspension_reason;

        delete user.suspension_reason;

        user.createdAt =
            user.created_at;

        delete user.created_at;

        return res.json({

            status: true,

            user

        });

    } catch (err) {

        console.error(
            "Erro ao regenerar API key:",
            err
        );

        return res.status(500).json({

            status: false,

            message:
                "Erro interno ao regenerar API key."

        });

    }

});



router.post("/google", async (req, res) => {

    const { token } = req.body;

    try {

        const ticket =
            await googleClient.verifyIdToken({

                idToken: token,

                audience:
                    "341416037579-lebsilp4c41k6j3ep7q0et88u0fjjkc2.apps.googleusercontent.com"

            });

        const payload =
            ticket.getPayload();

        const email =
            payload.email;

        const name =
            payload.name;

        const picture =
            payload.picture;

        const googleId =
            payload.sub;


        // Procurar utilizador pelo email
        let row =
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
                WHERE email = ?
                LIMIT 1
            `).get(email);


        // Se não existir, criar
        if (!row) {

            const apikey =
                "moz_sk_" +
                Math.random()
                    .toString(36)
                    .substring(2, 18);

            const createdAt =
                new Date()
                    .toLocaleDateString("pt-PT");


            const result =
                db.prepare(`
                    INSERT INTO users (
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
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).run(

                    name,
                    email,
                    null,
                    null,
                    "google",
                    googleId,
                    picture,
                    apikey,
                    0,
                    "Free",
                    null,
                    null,
                    null,
                    null,
                    createdAt

                );


            // Ler novamente o utilizador criado
            row =
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
                    WHERE id = ?
                    LIMIT 1
                `).get(
                    Number(result.lastInsertRowid)
                );

        }


        // Conta suspensa
        if (row.status === "Suspenso") {

            return res.json({

                status: false,

                suspended: true,

                message:
                    "A sua conta encontra-se suspensa."

            });

        }


        const user = {

            id: row.id,

            name: row.name,

            email: row.email,

            phone: row.phone,

            password: row.password,

            provider: row.provider,

            googleId: row.google_id,

            avatar: row.avatar,

            apikey: row.apikey,

            requests: row.requests,

            plan: row.plan,

            status: row.status,

            suspensionUntil:
                row.suspension_until,

            suspensionReason:
                row.suspension_reason,

            createdAt:
                row.created_at

        };


        return res.json({

            status: true,

            user

        });


    } catch (err) {

        console.error(
            "Google Auth Error:",
            err
        );

        return res.json({

            status: false,

            message:
                "Token Google inválido"

        });

    }

});


router.post(
    "/forgot-password",
    (req, res) => {

        try {

            const {
                phone
            } = req.body;


            if (!phone) {

                return res.status(400).json({

                    status: false,

                    message:
                    "O número de telefone é obrigatório."

                });

            }

const row =
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
        WHERE phone = ?
        LIMIT 1
    `).get(String(phone));


const user = row
    ? {
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        password: row.password,
        provider: row.provider,
        googleId: row.google_id,
        avatar: row.avatar,
        apikey: row.apikey,
        requests: row.requests,
        plan: row.plan,
        status: row.status,
        suspensionUntil: row.suspension_until,
        suspensionReason: row.suspension_reason,
        createdAt: row.created_at
    }
    : null;


            if (!user) {

                return res.json({

                    status: true,

                    message:
                    "Se o número estiver registado, receberá um código de recuperação."

                });

            }

/*
 * SQLite — recuperação de palavra-passe
 */

const now =
    Date.now();


/*
 * Verificar último pedido
 */

const lastReset =
    db.prepare(`
        SELECT
            id,
            user_id,
            phone,
            code,
            created_at,
            expires_at,
            resend_at,
            used,
            used_at
        FROM password_resets
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 1
    `).get(user.id);


if (
    lastReset &&
    now < lastReset.resend_at
) {

    const remaining =
        Math.ceil(
            (
                lastReset.resend_at -
                now
            ) / 1000
        );


    return res.status(429).json({

        status: false,

        message:
        `Aguarde por ${remaining} segundos antes de solicitar outro código.`,

        retryAfter:
        remaining

    });

}


/*
 * Invalidar códigos anteriores
 */

db.prepare(`
    UPDATE password_resets
    SET
        used = 1,
        used_at = ?
    WHERE user_id = ?
    AND used = 0
`).run(
    now,
    user.id
);


/*
 * Gerar código
 */

const code =
    Math.floor(
        100000 +
        Math.random() * 900000
    ).toString();


const createdAt =
    now;


const expiresAt =
    now +
    60 * 1000;


const resendAt =
    now +
    30 * 1000;


const resetId =
    Date.now();


/*
 * Guardar novo código no SQLite
 */

db.prepare(`
    INSERT INTO password_resets (
        id,
        user_id,
        phone,
        code,
        created_at,
        expires_at,
        resend_at,
        used,
        used_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, 0, NULL)
`).run(
    resetId,
    user.id,
    user.phone,
    code,
    createdAt,
    expiresAt,
    resendAt
);
            /*
             * Criar SMS
             */

addNotification({

    type:
    "sms",

    category:
    "password_recovery",

    source:
    "system",

    target:
    user.phone,

    subject:
    null,

    message:
    `O seu código de recuperação da MOZAPI é: ${code}

Este código é válido por 60 segundos. Por motivos de segurança, não partilhe este código com ninguém.`

});

            return res.json({

                status: true,

                message:
                "Se o número estiver registado, receberá um código de recuperação."

            });


        } catch (err) {

            console.error(
                "Erro na recuperação de palavra-passe:",
                err
            );


            return res.status(500).json({

                status: false,

                message:
                "Erro interno ao solicitar recuperação."

            });

        }

    }
);



router.post(
    "/verify-reset",
    (req, res) => {

        try {

            const {
                phone,
                code
            } = req.body;


            if (!phone || !code) {

                return res.status(400).json({

                    status: false,

                    message:
                    "Número e código são obrigatórios."

                });

            }


const now =
    Date.now();


/*
 * Procurar código de recuperação no SQLite
 */

const reset =
    db.prepare(`
        SELECT
            id,
            user_id,
            phone,
            code,
            created_at,
            expires_at,
            resend_at,
            used,
            used_at
        FROM password_resets
        WHERE phone = ?
          AND code = ?
          AND used = 0
        ORDER BY created_at DESC
        LIMIT 1
    `).get(
        String(phone),
        String(code)
    );


if (!reset) {

    return res.status(400).json({

        status: false,

        message:
        "Código inválido."

    });

}


/*
 * Verificar expiração
 */

if (
    now > reset.expires_at
) {

    db.prepare(`
        UPDATE password_resets
        SET
            used = 1,
            used_at = ?
        WHERE id = ?
    `).run(
        now,
        reset.id
    );


    return res.status(400).json({

        status: false,

        message:
        "O código expirou. Solicite um novo código."

    });

}


/*
 * Código válido.
 *
 * Ainda NÃO marcamos como usado.
 * Ele será consumido quando
 * a nova palavra-passe for definida.

*/
const sessionExpiresAt =
    now + 5 * 60 * 1000;


db.prepare(`
    UPDATE password_resets
    SET expires_at = ?
    WHERE id = ?
`).run(
    sessionExpiresAt,
    reset.id
);

return res.json({

    status: true,

    message:
    "Código válido.",

    resetId:
    reset.id,

    expiresAt:
    sessionExpiresAt

});



          /*
             * Código válido
             *
             * Ainda NÃO marcamos como usado.
             *
             * Ele será consumido quando
             * a nova palavra-passe for definida.
             */


            return res.json({

                status: true,

                message:
                "Código válido.",

                resetId:
                reset.id,

                expiresAt:
                reset.expiresAt

            });


        } catch (err) {

            console.error(
                "Erro ao validar código:",
                err
            );


            return res.status(500).json({

                status: false,

                message:
                "Erro interno ao validar código."

            });

        }

    }
);



router.post(
    "/reset-password",
    (req, res) => {

        try {

            const {
                phone,
                resetId,
                password
            } = req.body;


            if (
                !phone ||
                !resetId ||
                !password
            ) {

                return res.status(400).json({

                    status: false,

                    message:
                    "Número, sessão de recuperação e nova palavra-passe são obrigatórios."

                });

            }


            /*
             * Validar palavra-passe
             */

            if (
                typeof password !== "string" ||
                password.length < 6
            ) {

                return res.status(400).json({

                    status: false,

                    message:
                    "A palavra-passe deve ter pelo menos 6 caracteres."

                });

            }


const now =
    Date.now();


/*
 * Procurar recuperação no SQLite
 */

const reset =
    db.prepare(`
        SELECT
            id,
            user_id,
            phone,
            code,
            created_at,
            expires_at,
            resend_at,
            used,
            used_at
        FROM password_resets
        WHERE id = ?
          AND phone = ?
          AND used = 0
        LIMIT 1
    `).get(
        String(resetId),
        String(phone)
    );


if (!reset) {

    return res.status(400).json({

        status: false,

        message:
        "Sessão de recuperação inválida."

    });

}


/*
 * Verificar expiração
 */

if (
    now > reset.expires_at
) {

    db.prepare(`
        UPDATE password_resets
        SET
            used = 1,
            used_at = ?
        WHERE id = ?
    `).run(
        now,
        reset.id
    );


    return res.status(400).json({

        status: false,

        message:
        "A sessão de recuperação expirou. Solicite um novo código."

    });

}


            /*
             * Ler códigos de recuperação
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
        WHERE phone = ?
        LIMIT 1
    `).get(String(phone));


if (!user) {

    return res.status(400).json({

        status: false,

        message:
            "Utilizador não encontrado."

    });

}
            /*
             * Consumir código
             */

db.prepare(`
    UPDATE users
    SET password = ?
    WHERE id = ?
`).run(
    password,
    user.id
);  

db.prepare(`
    UPDATE password_resets
    SET
        used = 1,
        used_at = ?
    WHERE id = ?
`).run(
    now,
    reset.id
);



/*
 * Criar SMS de segurança
 * após alteração da palavra-passe
 */

/*
 * Data e hora
 */

const securityDate =
    new Date(now);

const date =
    securityDate.toLocaleDateString(
        "pt-PT",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );

const time =
    securityDate.toLocaleTimeString(
        "pt-PT",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );


/*
 * IP
 */

const ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim()
    ||
    req.socket.remoteAddress
    ||
    "Não disponível";


/*
 * Dispositivo / navegador
 */

const userAgent =
    req.headers["user-agent"]
    ||
    "Dispositivo não identificado";


/*
 * Identificação simples do dispositivo
 */

let device = "Dispositivo desconhecido";

if (/Android/i.test(userAgent)) {

    device = "Android";

} else if (/iPhone/i.test(userAgent)) {

    device = "iPhone";

} else if (/iPad/i.test(userAgent)) {

    device = "iPad";

} else if (/Windows/i.test(userAgent)) {

    device = "Windows";

} else if (/Macintosh/i.test(userAgent)) {

    device = "macOS";

} else if (/Linux/i.test(userAgent)) {

    device = "Linux";

}


/*
 * Localização
 *
 * Neste momento não temos geolocalização
 * exacta disponível no pedido.
 */

const location =
    "Não disponível";


/*
 * Criar notificação
 */

addNotification({

    type:
    "sms",

    category:
    "password_changed",

    source:
    "system",

    target:
    user.phone,

    subject:
    null,

    message:
`
MozAPI: A sua palavra-passe foi redefinida com sucesso.

Data: ${date}
Hora: ${time}
Dispositivo: ${device}
Localização: ${location}
IP: ${ip}

Se não foi você quem realizou esta alteração, recomendamos que contacte imediatamente o suporte da MozAPI para proteger a sua conta.

Suporte: https://mozapi.com/suporte.html
`

});

            /*
             * Resposta
             */

            return res.json({

                status: true,

                message:
                "Palavra-passe alterada com sucesso."

            });


        } catch (err) {

            console.error(
                "Erro ao redefinir palavra-passe:",
                err
            );

            return res.status(500).json({

                status: false,

                message:
                "Erro interno ao redefinir palavra-passe."

            });

        }

    }
);


module.exports = router;


