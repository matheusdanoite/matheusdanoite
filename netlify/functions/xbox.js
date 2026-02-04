exports.handler = async function (event, context) {
    try {
        const apiKey = process.env.XBL_API_KEY;

        console.log("Iniciando requisição Xbox...");

        if (!apiKey) {
            console.error("XBL_API_KEY não configurada.");
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'CONFIG_ERROR: API Key not configured in Netlify' })
            };
        }

        // Fazer chamadas separadas para facilitar debug
        // Baseado na documentação fornecida: "curl --header 'X-Authorization: API_KEY' https://xbl.io/api/v2/account"
        const headers = {
            'X-Authorization': apiKey,
            'Accept': 'application/json'
        };

        // 1. Fetch Account
        console.log("Fetching Account data...");
        const accountResponse = await fetch('https://xbl.io/api/v2/account', { headers });

        if (!accountResponse.ok) {
            const errText = await accountResponse.text();
            console.error(`Account API Error: ${accountResponse.status} - ${errText}`);

            if (accountResponse.status === 401) {
                return { statusCode: 401, body: JSON.stringify({ error: 'API_KEY_INVALID: Chave da xbl.io inválida ou expirada.' }) };
            }
            if (accountResponse.status === 429) {
                return { statusCode: 429, body: JSON.stringify({ error: 'RATE_LIMIT: Limite de requisições da xbl.io atingido.' }) };
            }

            return {
                statusCode: accountResponse.status,
                body: JSON.stringify({ error: `Xbox Account API Error (${accountResponse.status}): ${errText}` })
            };
        }

        const accountData = await accountResponse.json();
        console.log("Account data received.");

        // 2. Fetch History (Opcional, falha silenciosa permitida)
        console.log("Fetching History data...");
        let historyData = {};
        try {
            const historyResponse = await fetch('https://xbl.io/api/v2/player/title/history', { headers });
            if (historyResponse.ok) {
                historyData = await historyResponse.json();
                console.log("History data received.");
            } else {
                console.warn(`History API falhou (mas prosseguindo): ${historyResponse.status}`);
            }
        } catch (histErr) {
            console.warn("History fetch network error:", histErr);
        }

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                account: accountData,
                history: historyData
            })
        };

    } catch (error) {
        console.error("Critical Function Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: `INTERNAL_ERROR: ${error.message}` })
        };
    }
};
