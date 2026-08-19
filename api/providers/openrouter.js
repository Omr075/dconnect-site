const axios = require("axios");
const fs = require("fs");
const path = require("path");

const knowledge =
    require("../services/knowledge");

const config = JSON.parse(

    fs.readFileSync(

        path.join(
            __dirname,
            "../../config/providers.json"
        ),

        "utf8"

    )

);

async function chat(prompt){

    const provider =

        config.providers.find(

            p =>

                p.name === "openrouter" &&
                p.enabled

        );

    if(!provider){

        throw new Error(
            "Provider desativado."
        );

    }

    if(!provider.apikey){

        throw new Error(
            "Provider não configurado."
        );

    }

    const systemPrompt = `

Tu és a a inteligência artificial do site mozapi.com.

És a inteligência artificial oficial da MOZAPI.

Nunca inventes informações sobre a MOZAPI.

Responde sempre utilizando primeiro o conhecimento fornecido.

Caso a resposta não exista no conhecimento, utiliza o teu conhecimento geral.

Seja criativo ao responder.

====================

${knowledge.loadKnowledge()}

====================

`;

    try{

        const response =

            await axios.post(

                "https://openrouter.ai/api/v1/chat/completions",

                {

                    model: provider.model,

                    messages:[

                        {

                            role:"system",

                            content:systemPrompt

                        },

                        {

                            role:"user",

                            content:prompt

                        }

                    ]

                },

                {

                    headers:{

                        Authorization:
                            `Bearer ${provider.apikey}`,

                        "Content-Type":
                            "application/json"

                    }

                }

            );

        return response.data.choices[0]
            .message.content;

    }catch(err){

        throw new Error(

            err.response?.data?.error?.message ||

            err.message

        );

    }

}

module.exports={

    chat

};
