export default async function handler(req, res) {
    // Configurar os cabeçalhos CORS para permitir requisições de qualquer origem
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Se for uma requisição OPTIONS (preflight), responde rapidamente
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    const { codigo } = req.query;
    const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${codigo}/dados?formato=json`;


    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 9000); // espera até 9 segundos para o timeout

        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar dados do BACEN", details: error.message });
    }
}