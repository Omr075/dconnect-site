const express = require("express");
const db =
require("../database/connection");
const router = express.Router();

const logAutomation =
require("../services/automationLogger");


const notificationsAuth =
require("../middlewares/notifications");


router.get(
"/pending",
notificationsAuth,
(req,res)=>{

let pending;

const type =
    req.query.type;


if (type) {

    pending =
        db.prepare(`
            SELECT
                id,
                type,
                category,
                source,
                target,
                subject,
                message,
                status,
                attempts,
                created_at AS createdAt,
                sent_at AS sentAt,
                failed_at AS failedAt
            FROM notifications
            WHERE status = 'pending'
            AND type = ?
            ORDER BY id ASC
        `).all(type);

} else {

    pending =
        db.prepare(`
            SELECT
                id,
                type,
                category,
                source,
                target,
                subject,
                message,
                status,
                attempts,
                created_at AS createdAt,
                sent_at AS sentAt,
                failed_at AS failedAt
            FROM notifications
            WHERE status = 'pending'
            ORDER BY id ASC
        `).all();

}

    res.json({

        status:true,

        total:
        pending.length,

        notifications:
        pending

    });


});


router.get(
"/next",
notificationsAuth,
(req,res)=>{


let notification;

const type =
    req.query.type;

const category =
    req.query.category;


if (type && category) {

    notification =
        db.prepare(`
            SELECT
                id,
                type,
                category,
                source,
                target,
                subject,
                message,
                status,
                attempts,
                created_at AS createdAt,
                sent_at AS sentAt,
                failed_at AS failedAt
            FROM notifications
            WHERE status = 'pending'
            AND type = ?
            AND category = ?
            ORDER BY id ASC
            LIMIT 1
        `).get(
            type,
            category
        );

} else if (type) {

    notification =
        db.prepare(`
            SELECT
                id,
                type,
                category,
                source,
                target,
                subject,
                message,
                status,
                attempts,
                created_at AS createdAt,
                sent_at AS sentAt,
                failed_at AS failedAt
            FROM notifications
            WHERE status = 'pending'
            AND type = ?
            ORDER BY id ASC
            LIMIT 1
        `).get(type);

} else if (category) {

    notification =
        db.prepare(`
            SELECT
                id,
                type,
                category,
                source,
                target,
                subject,
                message,
                status,
                attempts,
                created_at AS createdAt,
                sent_at AS sentAt,
                failed_at AS failedAt
            FROM notifications
            WHERE status = 'pending'
            AND category = ?
            ORDER BY id ASC
            LIMIT 1
        `).get(category);

} else {

    notification =
        db.prepare(`
            SELECT
                id,
                type,
                category,
                source,
                target,
                subject,
                message,
                status,
                attempts,
                created_at AS createdAt,
                sent_at AS sentAt,
                failed_at AS failedAt
            FROM notifications
            WHERE status = 'pending'
            ORDER BY id ASC
            LIMIT 1
        `).get();

}


    if(!notification){

        return res.json({

            status:false,

            message:
            "Nenhuma notificação pendente"

        });

    }



    res.json({

        status:true,

        notification

    });


});


router.post(
"/sent/:id",
notificationsAuth,
(req,res)=>{
const id =
    Number(req.params.id);


const item =
    db.prepare(`
        SELECT
            id,
            type,
            category,
            source,
            target,
            subject,
            message,
            status,
            attempts,
            created_at AS createdAt,
            sent_at AS sentAt,
            failed_at AS failedAt
        FROM notifications
        WHERE id = ?
        LIMIT 1
    `).get(id);


if(!item){

    return res.json({

        status:false,

        message:
        "Notificação não encontrada"

    });

}


if(item.status === "sent"){

    return res.json({

        status:false,

        message:
        "Notificação já foi enviada"

    });

}


const sentAt =
    new Date().toISOString();


db.prepare(`
    UPDATE notifications
    SET
        attempts = COALESCE(attempts, 0) + 1,
        status = 'sent',
        sent_at = ?,
        failed_at = NULL
    WHERE id = ?
`).run(
    sentAt,
    id
);


logAutomation({

    title:
        item.type === "sms"
        ?
        "SMS enviado"
        :
        "E-mail enviado",

    message:
        item.message,

    status:
        "success"

});


res.json({

    status:true,

    message:
    "Marcada como enviada"

});
});



router.post(
"/failed/:id",
notificationsAuth,
(req,res)=>{

const id =
    Number(req.params.id);


const item =
    db.prepare(`
        SELECT
            id,
            type,
            category,
            source,
            target,
            subject,
            message,
            status,
            attempts,
            created_at AS createdAt,
            sent_at AS sentAt,
            failed_at AS failedAt
        FROM notifications
        WHERE id = ?
        LIMIT 1
    `).get(id);


if(!item){

    return res.json({

        status:false,

        message:
        "Notificação não encontrada"

    });

}


if(item.status === "sent"){

    return res.json({

        status:false,

        message:
        "Notificação já foi enviada"

    });

}


const failedAt =
    new Date().toISOString();


db.prepare(`
    UPDATE notifications
    SET
        attempts = COALESCE(attempts, 0) + 1,
        status = 'failed',
        failed_at = ?
    WHERE id = ?
`).run(
    failedAt,
    id
);


logAutomation({

    title:
        item.type === "sms"
        ?
        "Falha no envio de SMS"
        :
        "Falha no envio de e-mail",

    message:
        item.message,

    status:
        "failed"

});


res.json({

    status:true,

    message:
    "Marcada como falhada"

});

});


router.get(
"/failed",
notificationsAuth,
(req,res)=>{

    const failed =
        db.prepare(`
            SELECT
                id,
                type,
                category,
                source,
                target,
                subject,
                message,
                status,
                attempts,
                created_at AS createdAt,
                sent_at AS sentAt,
                failed_at AS failedAt
            FROM notifications
            WHERE status = 'failed'
            ORDER BY id ASC
        `).all();


    res.json({

        status:true,

        total:
        failed.length,

        notifications:
        failed

    });

});

router.post(
"/retry/:id",
notificationsAuth,
(req,res)=>{

    const id =
        Number(req.params.id);


    const item =
        db.prepare(`
            SELECT
                id,
                status,
                attempts
            FROM notifications
            WHERE id = ?
            LIMIT 1
        `).get(id);


    if(!item){

        return res.json({

            status:false,

            message:
            "Notificação não encontrada"

        });

    }


    if(item.status !== "failed"){

        return res.json({

            status:false,

            message:
            "Apenas notificações falhadas podem ser repetidas"

        });

    }


    if(item.attempts >= 3){

        return res.json({

            status:false,

            message:
            "Limite de tentativas atingido"

        });

    }


    db.prepare(`
        UPDATE notifications
        SET
            status = 'pending',
            attempts = attempts + 1,
            failed_at = NULL
        WHERE id = ?
    `).run(id);


    res.json({

        status:true,

        message:
        "Notificação colocada novamente na fila"

    });


});


router.get(
"/stats",
notificationsAuth,
(req,res)=>{

    const stats =
        db.prepare(`
            SELECT
                COUNT(*) AS total,

                SUM(
                    CASE
                        WHEN status = 'pending'
                        THEN 1
                        ELSE 0
                    END
                ) AS pending,

                SUM(
                    CASE
                        WHEN status = 'sent'
                        THEN 1
                        ELSE 0
                    END
                ) AS sent,

                SUM(
                    CASE
                        WHEN status = 'failed'
                        THEN 1
                        ELSE 0
                    END
                ) AS failed,

                SUM(
                    CASE
                        WHEN type = 'sms'
                        THEN 1
                        ELSE 0
                    END
                ) AS sms,

                SUM(
                    CASE
                        WHEN type = 'email'
                        THEN 1
                        ELSE 0
                    END
                ) AS email

            FROM notifications
        `).get();


    res.json({

        status:true,

        stats: {

            total:
                stats.total || 0,

            pending:
                stats.pending || 0,

            sent:
                stats.sent || 0,

            failed:
                stats.failed || 0,

            sms:
                stats.sms || 0,

            email:
                stats.email || 0

        }

    });

});

module.exports = router;
