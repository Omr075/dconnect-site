/*
const fs = require("fs");
const path = require("path");

module.exports = (req, res, next) => {

    let apikey =

        req.query.apikey ||

        req.body?.apikey;

    if (!apikey) {

        const auth =

            req.headers.authorization;

        if (
            auth &&
            auth.startsWith("Bearer ")
        ) {

            apikey =
                auth.replace(
                    "Bearer ",
                    ""
                );

        }

    }

    if (!apikey) {

        return res.status(401).json({

            status: false,

            message: "Chave API obrigatória"

        });

    }

    const users = JSON.parse(

        fs.readFileSync(

            path.join(
                __dirname,
                "../database/users.json"
            )

        )

    );

    const user = users.find(

        u => u.apikey === apikey

    );

    if (!user) {

        return res.status(401).json({

            status: false,

            message: "Chave inválida"

        });

    }

    req.user = user;
    req.users = users;

    next();

};
*/

const db = require("../database/connection");

module.exports = (req, res, next) => {

    let apikey =
        req.query.apikey ||
        req.body?.apikey;

    if (!apikey) {

        const auth =
            req.headers.authorization;

        if (
            auth &&
            auth.startsWith("Bearer ")
        ) {

            apikey =
                auth.replace(
                    "Bearer ",
                    ""
                );

        }

    }

    if (!apikey) {

        return res.status(401).json({

            status: false,

            message:
                "Chave API obrigatória"

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
            WHERE apikey = ?
            LIMIT 1
        `).get(apikey);

    if (!row) {

        return res.status(401).json({

            status: false,

            message:
                "Chave inválida"

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

        suspendedAt: row.suspended_at,

        suspensionUntil:
            row.suspension_until,

        suspensionReason:
            row.suspension_reason,

        createdAt:
            row.created_at

    };

    req.user = user;

    req.users = null;

    next();

};
