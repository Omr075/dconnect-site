const fs = require("fs");
const path = require("path");

const knowledgePath = path.join(
    __dirname,
    "../../knowledge"
);

function loadKnowledge() {

    try {

        const files = fs.readdirSync(
            knowledgePath
        );

        let knowledge = "";

        files.forEach(file => {

            if (!file.endsWith(".md")) return;

            const content = fs.readFileSync(

                path.join(
                    knowledgePath,
                    file
                ),

                "utf8"

            );

            knowledge += `

========================
${file}
========================

${content}

`;

        });

        return knowledge.trim();

    } catch (err) {

        console.error(
            "Desculpe, problemas tecnicos, tente mais tarde.",
            err.message
        );

        return "";

    }

}

module.exports = {

    loadKnowledge

};
