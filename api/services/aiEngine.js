const fs = require("fs");
const path = require("path");

const providersConfig = JSON.parse(

    fs.readFileSync(

        path.join(
            __dirname,
            "../../config/providers.json"
        )

    )

);

const providers = {

    openrouter:
        require("../providers/openrouter")

    // gemini:
    // require("../providers/gemini"),

    // grok:
    // require("../providers/grok"),

    // openai:
    // require("../providers/openai")

};

async function chat(prompt) {

    const enabledProviders =

        providersConfig.providers

            .filter(provider =>

                provider.enabled

            )

            .sort((a, b) =>

                a.priority - b.priority

            );

    const errors = [];

    for (const provider of enabledProviders) {

        try {

            if (!providers[provider.name]) {

                errors.push(

                    `${provider.name}: modelo inexistente.`

                );

                continue;

            }

            const response =

                await providers[
                    provider.name
                ].chat(prompt);

            return {

                status: true,

                provider: provider.name,

                model: provider.model,

                response

            };

        } catch (err) {

            errors.push(

                `${provider.name}: ${err.message}`

            );

        }

    }

    return {

        status: false,

        message:
            "Todos os modelos falharam.",

        errors

    };

}

module.exports = {

    chat

};
