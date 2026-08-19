const express = require("express");
const gerarPing = require("../canvas/ping");

const router = express.Router();

router.get("/ping", (req, res) => {
//console.log("PING RECEBIDO", req.query);
    try {

        const imagem = gerarPing({

            usuario: req.query.usuario || "Desconhecido",

            saudacao: req.query.saudacao || "Olá",

            bot: req.query.bot || "Bot",

            prefixo: req.query.prefixo || "!",

            hora: req.query.hora || "--:--",

            ping: req.query.ping || 0,

            uptime: req.query.uptime || "0s",

            ram: req.query.ram || 0,

            cpu: req.query.cpu || "CPU"

        });


        res.writeHead(200, {
            "Content-Type": "image/png",
            "Content-Length": imagem.length
        });


        res.end(imagem);


    } catch (err) {

        console.log(err);

        res.status(500).send("Erro ao gerar imagem");

    }

});


module.exports = router;
