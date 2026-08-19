const db =
require("../../../database/connection");


// ======================================================
// ADICIONAR NOTIFICAÇÃO
// ======================================================

function addNotification(data) {

    /*
     * Verificar se já existe uma notificação
     * pendente igual.
     */

    const exists =
        db.prepare(`
            SELECT *
            FROM notifications
            WHERE status = 'pending'
            AND type = ?
            AND target = ?
            AND message = ?
            LIMIT 1
        `).get(
            data.type,
            data.target,
            data.message
        );


    if (exists) {

        return exists;

    }


    /*
     * Criar nova notificação
     */

    const notification = {

        id:
            Date.now(),

        type:
            data.type,

        category:
            data.category || "register",

        source:
            data.source || "system",

        target:
            data.target,

        subject:
            data.subject || null,

        message:
            data.message,

        status:
            "pending",

        attempts:
            0,

        createdAt:
            new Date().toISOString(),

        sentAt:
            null

    };


    /*
     * Guardar no SQLite
     */

    db.prepare(`
        INSERT INTO notifications (
            id,
            type,
            category,
            source,
            target,
            subject,
            message,
            status,
            attempts,
            created_at,
            sent_at,
            failed_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(

        notification.id,
        notification.type,
        notification.category,
        notification.source,
        notification.target,
        notification.subject,
        notification.message,
        notification.status,
        notification.attempts,
        notification.createdAt,
        notification.sentAt,
        null

    );


    return notification;

}


module.exports = {

    addNotification

};
