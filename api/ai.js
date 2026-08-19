const express = require("express");

const auth =
    require("../middlewares/auth");

const engine =
    require("./services/aiEngine");

const db =
    require("../database/connection");

const router =
    express.Router();


router.post("/chat", auth, async (req, res) => {

    try {

        const prompt =
            req.body.prompt;

        if (!prompt) {

            return res.status(400).json({

                status: false,

                message:
                    "Prompt obrigatório."

            });

        }


        const user =
            req.user;


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
        prompt,
        provider,
        date
    )
    VALUES (?, ?, ?, ?, ?)
`).run(
    user.apikey,
    "/api/ai/chat",
    prompt,
    "auto",
    new Date().toISOString()
);

        // ==================================================
        // AI Engine
        // ==================================================

        const response =
            await engine.chat(prompt);


        return res.json(
            response
        );


    } catch (err) {

        console.error(
            "AI Chat Error:",
            err
        );

        return res.status(500).json({

            status: false,

            error:
                err.message

        });

    }

});


module.exports =
    router;
