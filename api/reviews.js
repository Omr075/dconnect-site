const express = require("express");

const db =
require("../database/connection");

const router =
express.Router();


router.post(
    "/review",
    (req,res) => {

        try {

            const {
                email,
                message
            } = req.body;


            if(!email || !message){

                return res.json({

                    status:false,

                    message:
                    "Dados incompletos."

                });

            }


            /*
             * VERIFICAR REVISÃO PENDENTE
             */

            const existingReview =
                db.prepare(`
                    SELECT
                        id,
                        email,
                        message,
                        status,
                        created_at
                    FROM reviews
                    WHERE email = ?
                    AND status = 'Pendente'
                    LIMIT 1
                `).get(email);


            if(existingReview){

                return res.json({

                    status:false,

                    pending:true,

                    message:
                    "Já existe um pedido de revisão pendente.",

                    review: {

                        id:
                        existingReview.id,

                        email:
                        existingReview.email,

                        message:
                        existingReview.message,

                        status:
                        existingReview.status,

                        createdAt:
                        existingReview.created_at

                    }

                });

            }


            /*
             * CRIAR NOVA REVISÃO
             */

            const id =
                Date.now();


            const createdAt =
                new Date()
                .toLocaleDateString();


            db.prepare(`
                INSERT INTO reviews (
                    id,
                    email,
                    message,
                    status,
                    created_at
                )
                VALUES (?, ?, ?, ?, ?)
            `).run(
                id,
                email,
                message,
                "Pendente",
                createdAt
            );


            /*
             * RESPOSTA
             */

            return res.json({

                status:true,

                message:
                "Pedido enviado com sucesso."

            });


        } catch(err){

            console.error(
                "Erro ao criar pedido de revisão:",
                err
            );


            return res.status(500).json({

                status:false,

                message:
                "Erro interno ao enviar pedido de revisão."

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


const reviewsPath =
path.join(
    __dirname,
    "../database/reviews.json"
);


router.post("/review", (req,res)=>{


const {
    email,
    message
} = req.body;



if(!email || !message){

    return res.json({

        status:false,

        message:"Dados incompletos."

    });

}



const reviews =
JSON.parse(
    fs.readFileSync(
        reviewsPath,
        "utf8"
    )
);


// VERIFICAR REVISÃO PENDENTE

const existingReview =
reviews.find(
    r =>
    r.email === email &&
    r.status === "Pendente"
);


if(existingReview){

    return res.json({

        status:false,

        pending:true,

        message:
        "Já existe um pedido de revisão pendente.",

        review: existingReview

    });

}



const newReview = {


id:Date.now(),


email,


message,


status:"Pendente",


createdAt:
new Date()
.toLocaleDateString()


};


reviews.push(newReview);



fs.writeFileSync(

reviewsPath,

JSON.stringify(
reviews,
null,
2
)

);



res.json({

status:true,

message:"Pedido enviado com sucesso."

});


});


module.exports = router;
*/
