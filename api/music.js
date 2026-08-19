const express = require("express");

const auth =
    require("../middlewares/auth");

const engine =
    require("./services/searchEngine");

const db =
    require("../database/connection");

const router =
    express.Router();


// ======================================================
// SEARCH
// ======================================================

router.get("/search", auth, async (req, res) => {

    try {

        const q =
            req.query.q;

        const user =
            req.user;

        if (!q) {

            return res.status(400).json({

                status: false,

                message:
                    "Forneça ?q="

            });

        }


        // ==================================================
        // Contador de requisições — SQLite
        // ==================================================

        db.prepare(`
            UPDATE users
            SET requests = COALESCE(requests, 0) + 1
            WHERE id = ?
        `).run(user.id);


        // Actualizar valor em memória
        user.requests =
            (user.requests || 0) + 1;


// ==================================================
// Logs — SQLite
// ==================================================

db.prepare(`
    INSERT INTO logs (
        apikey,
        endpoint,
        query,
        date
    )
    VALUES (?, ?, ?, ?)
`).run(
    user.apikey,
    req.originalUrl,
    q,
    new Date().toISOString()
);
        // ==================================================
        // Search Engine
        // ==================================================

        const results =
            await engine.search(q);


        return res.json({

            status: true,

            query: q,

            total:
                results.length,

            results:
                results.slice(0, 2)

        });

    } catch (err) {

        console.error(
            "Search Error:",
            err
        );

        return res.status(500).json({

            status: false,

            error:
                err.message

        });

    }

});


// ======================================================
// SONG
// ======================================================

router.get("/song", auth, async (req, res) => {

    try {

        const q =
            req.query.q;

        const user =
            req.user;

        if (!q) {

            return res.status(400).json({

                status: false,

                message:
                    "Forneça ?q="

            });

        }


        // ==================================================
        // Contador de requisições — SQLite
        // ==================================================

        db.prepare(`
            UPDATE users
            SET requests = COALESCE(requests, 0) + 1
            WHERE id = ?
        `).run(user.id);


        // Actualizar valor em memória
        user.requests =
            (user.requests || 0) + 1;



// ==================================================
// Logs — SQLite
// ==================================================

db.prepare(`
    INSERT INTO logs (
        apikey,
        endpoint,
        query,
        date
    )
    VALUES (?, ?, ?, ?)
`).run(
    user.apikey,
    req.originalUrl,
    q,
    new Date().toISOString()
);

        // ==================================================
        // Search Engine
        // ==================================================

        const song =
            await engine.song(q);


        if (!song) {

            return res.status(404).json({

                status: false,

                message:
                    "Música não encontrada"

            });

        }


        return res.json({

            status: true,

            ...song

        });

    } catch (err) {

        console.error(
            "Song Error:",
            err
        );

        return res.status(500).json({

            status: false,

            error:
                err.message

        });

    }

});


module.exports = router;
