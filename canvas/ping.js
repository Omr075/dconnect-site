const { createCanvas } = require("@napi-rs/canvas");

function gerarPing(dados = {}) {
    const canvas = createCanvas(520, 840);
    const ctx = canvas.getContext("2d");

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    ctx.fillStyle = "#111317"; 
    ctx.fillRect(0, 0, 520, 840);

    ctx.beginPath();
    ctx.fillStyle = "#1a1c23"; // Cinza médio fechado
    ctx.roundRect(40, 40, 440, 760, 20); 
    ctx.fill();

    // Borda do Card (Cinza Platina Suave)
    ctx.beginPath();
    ctx.roundRect(40, 40, 440, 760, 20);
    ctx.strokeStyle = "#2e3340";
    ctx.lineWidth = 3;
    ctx.stroke();

    // 4. Lógica de Cores do Ping (Azul Suave ou Vermelho para Alertas)
    const pingValor = dados.ping ? Number(dados.ping) : 0;
    let corStatus = "#60a5fa"; // Azul Suave/Fosco por padrão para bom estado
    if (pingValor > 100) {
        corStatus = "#f87171"; // Vermelho Alerta se o ping estiver alto
    }

    // 5. Desenho do Setor Arqueado (Centralizado horizontalmente no topo do card)
    const centroX = 260; // Centro perfeito (520 / 2)
    
    ctx.beginPath();
    ctx.arc(centroX, 110, 24, 0, 2 * Math.PI);
    ctx.lineWidth = 6;
    ctx.strokeStyle = "#252932"; // Fundo do anel desativado em cinza escuro
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centroX, 110, 24, -Math.PI * 0.5, Math.PI * 1.2); 
    ctx.strokeStyle = corStatus;
    ctx.lineCap = "round";
    ctx.lineWidth = 6;
    ctx.stroke();

    // 6. Título Principal (Azul Suave, não carregado, Centralizado e GRANDE)
    ctx.fillStyle = "#7dd3fc"; // Lindo azul claro fosco (estilo Tailwind/Sky)
    ctx.font = "bold 38px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    const nomeBot = String(dados.bot || "HCK").toUpperCase();
    ctx.fillText(nomeBot, centroX, 180);

    // Linha Separadora Horizontal
    ctx.beginPath();
    ctx.strokeStyle = "#2e3340";
    ctx.lineWidth = 2;
    ctx.moveTo(70, 230);
    ctx.lineTo(450, 230);
    ctx.stroke();

    // 7. Lista de Informações Completas (Esquerda + Direita)
    const campos = [
        { label: "Usuário", valor: dados.usuario },
        { label: "Ping", valor: `${pingValor} ms`, corEspecifica: corStatus }, // Aplica o azul suave ou vermelho aqui
        { label: "Hora", valor: dados.hora },
        { label: "Online", valor: dados.uptime },
        { label: "RAM", valor: `${dados.ram || 0}%`, corEspecifica: (dados.ram > 80 ? "#f87171" : undefined) },
        { label: "CPU", valor: dados.cpu },
    ];

    // Ponto de início vertical para o primeiro campo dentro do layout verticalizado
    let y = 290;

    for (const campo of campos) {
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // OBRIGATÓRIO: Texto antes dos dois pontos (Tamanho GRANDE, BOLD e em tom Cinza)
        ctx.fillStyle = "#9ca3af"; // Cinza claro de excelente contraste
        ctx.font = "bold 26px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        
        const textoLabel = String(campo.label) + " :";
        ctx.fillText(textoLabel, 70, y);

        // VALOR DO CAMPO (Grande, Bold e alinhado uniformemente à direita)
        ctx.fillStyle = campo.corEspecifica || "#e2e8f0"; // Cinza esbranquiçado muito suave
        ctx.font = "bold 26px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        ctx.textAlign = "right";

        // Exibe o conteúdo completo exatamente como enviado, sem cortes
        const textoValor = String(campo.valor || "-");
        ctx.fillText(textoValor, 450, y);

        // Espaçamento vertical ampliado (76px) para dar folga visual às fontes grandes
        y += 76;
    }

    return canvas.toBuffer("image/png");
}

module.exports = gerarPing;
