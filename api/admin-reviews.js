const express = require("express");

const db =
require("../database/connection");

const adminAuth =
require("../middlewares/admin");


const router =
express.Router();


// Bloquear acesso sem sessão admin

router.use(adminAuth);


// =====================================================
// LISTAR PEDIDOS
// =====================================================

router.get(
    "/reviews",
    (req,res) => {

        try {

            const rows =
                db.prepare(`
                    SELECT
                        id,
                        email,
                        message,
                        status,
                        created_at
                    FROM reviews
                    ORDER BY id DESC
                `).all();


            const reviews =
                rows.map(
                    r => ({

                        id:
                        r.id,

                        email:
                        r.email,

                        message:
                        r.message,

                        status:
                        r.status,

                        createdAt:
                        r.created_at

                    })
                );


            return res.json({

                status:true,

                reviews

            });


        } catch(err){

            console.error(
                "Erro ao listar pedidos de revisão:",
                err
            );


            return res.status(500).json({

                status:false,

                message:
                "Erro ao carregar pedidos de revisão."

            });

        }

    }
);


// =====================================================
// APAGAR PEDIDO
// =====================================================

router.delete(
    "/reviews/:id",
    (req,res) => {

        try {

            const id =
                Number(req.params.id);


            if(!Number.isFinite(id)){

                return res.json({

                    status:false,

                    message:
                    "ID do pedido inválido."

                });

            }


            const exists =
                db.prepare(`
                    SELECT id
                    FROM reviews
                    WHERE id = ?
                    LIMIT 1
                `).get(id);


            if(!exists){

                return res.json({

                    status:false,

                    message:
                    "Pedido não encontrado."

                });

            }


            db.prepare(`
                DELETE FROM reviews
                WHERE id = ?
            `).run(id);


            return res.json({

                status:true,

                message:
                "Pedido removido com sucesso."

            });


        } catch(err){

            console.error(
                "Erro ao apagar pedido de revisão:",
                err
            );


            return res.status(500).json({

                status:false,

                message:
                "Erro interno ao remover pedido."

            });

        }

    }
);


module.exports = router;
