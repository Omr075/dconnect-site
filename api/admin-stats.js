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
    "/stats",
    admin,
    (req, res) => {

        try {

            const users =
                JSON.parse(
                    fs.readFileSync(
                        usersPath,
                        "utf8"
                    )
                );

            const stats = {

                users:
                    users.length,

                free:
                    users.filter(
                        u => u.plan === "Free"
                    ).length,

                pro:
                    users.filter(
                        u => u.plan === "Pro"
                    ).length,

                enterprise:
                    users.filter(
                        u =>
                        u.plan === "Enterprise"
                    ).length,

                totalRequests:
                    users.reduce(
                        (t, u) =>
                        t + (u.requests || 0),
                        0
                    ),

                online: true,

                version: "1.0.0",

                uptime:
                    process.uptime()

            };

            res.json({

                status: true,

                stats

            });

        } catch (err) {

            console.error(err);

            res.status(500).json({

                status: false,

                message:
                "Erro ao obter estatísticas."

            });

        }

    }
);

module.exports = router;
*/

const express = require("express");

const admin =
    require("../middlewares/admin");

const db =
    require("../database/connection");

const router =
    express.Router();


router.get(
    "/stats",
    admin,
    (req, res) => {

        try {

            /*
             * Estatísticas dos utilizadores
             */

            const users =
                db.prepare(`
                    SELECT COUNT(*) AS total
                    FROM users
                `).get();


            const free =
                db.prepare(`
                    SELECT COUNT(*) AS total
                    FROM users
                    WHERE plan = 'Free'
                `).get();


            const pro =
                db.prepare(`
                    SELECT COUNT(*) AS total
                    FROM users
                    WHERE plan = 'Pro'
                `).get();


            const enterprise =
                db.prepare(`
                    SELECT COUNT(*) AS total
                    FROM users
                    WHERE plan = 'Enterprise'
                `).get();


            const totalRequests =
                db.prepare(`
                    SELECT
                        COALESCE(
                            SUM(requests),
                            0
                        ) AS total
                    FROM users
                `).get();


            const stats = {

                users:
                    users.total,

                free:
                    free.total,

                pro:
                    pro.total,

                enterprise:
                    enterprise.total,

                totalRequests:
                    totalRequests.total,

                online: true,

                version:
                    "1.0.0",

                uptime:
                    process.uptime()

            };


            return res.json({

                status: true,

                stats

            });

        } catch (err) {

            console.error(
                "Admin Stats Error:",
                err
            );

            return res.status(500).json({

                status: false,

                message:
                    "Erro ao obter estatísticas."

            });

        }

    }
);


module.exports =
    router;
