document.addEventListener("DOMContentLoaded", () => {

    const logsContainer =
        document.getElementById("logsContainer");

    const logs =
        JSON.parse(
            localStorage.getItem("mozapi_logs")
        ) || [];

    if (logs.length === 0) {

        logsContainer.innerHTML = `

            <div class="card">

                <h3>Nenhum log encontrado</h3>

                <p class="slogan">
                    Os seus requests aparecerão aqui.
                </p>

            </div>

        `;

        return;

    }

    let html = "";

    [...logs].reverse().forEach(log => {

        html += `

            <div class="card">

                <h3>${log.endpoint || "Endpoint"}</h3>

                <div class="info-row">
                    <span class="label">Método</span>
                    <span class="value">
                        ${log.method || "GET"}
                    </span>
                </div>

                <div class="info-row">
                    <span class="label">Pesquisa</span>
                    <span class="value">
                        ${log.query || "-"}
                    </span>
                </div>

                <div class="info-row">
                    <span class="label">Status</span>
                    <span class="value">
                        ${log.status || "200"}
                    </span>
                </div>

                <div class="info-row">
                    <span class="label">Data</span>
                    <span class="value">
                        ${log.date}
                    </span>
                </div>

            </div>

        `;

    });

    logsContainer.innerHTML = html;

});
