document.addEventListener("DOMContentLoaded", async () => {

    const container =
        document.getElementById("modalContainer");

    if (!container) return;

    try {

        const response =
            await fetch("modal-planos.html")

        container.innerHTML =
            await response.text();

        initPlanModal();

    } catch (err) {

        console.error(
            "Erro ao carregar o modal:",
            err
        );

    }

});

function initPlanModal() {

    const modal =
        document.getElementById("planModal");

    const openBtn =
        document.getElementById("openPlanModal");

    const closeBtn =
        document.getElementById("closePlanModal");

    const cancelBtn =
        document.getElementById("cancelPlan");

    if (!modal || !openBtn) return;

    openBtn.addEventListener("click", () => {

        modal.classList.add("show");

    });

    if (closeBtn) {

        closeBtn.addEventListener("click", () => {

            modal.classList.remove("show");

        });

    }

    if (cancelBtn) {

        cancelBtn.addEventListener("click", () => {

            modal.classList.remove("show");

        });

    }

    modal.addEventListener("click", e => {

        if (e.target === modal) {

            modal.classList.remove("show");

        }

    });

}
