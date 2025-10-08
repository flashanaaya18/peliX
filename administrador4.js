document.addEventListener('DOMContentLoaded', function() {
    const ticketsTbody = document.getElementById('tickets-tbody');
    const noTicketsMessage = document.getElementById('no-tickets-message');
    const solveTicketModalEl = document.getElementById('solveTicketModal');
    const solveTicketModal = new bootstrap.Modal(solveTicketModalEl);
    const solveTicketForm = document.getElementById('solve-ticket-form');
    const generateSolutionBtn = document.getElementById('generate-solution-btn');

    function loadTickets() {
        const allTickets = JSON.parse(localStorage.getItem('supportTickets')) || [];
        const pendingTickets = allTickets.filter(ticket => ticket.status === 'pending');

        // Cargar tickets pendientes
        if (pendingTickets.length === 0) {
            noTicketsMessage.classList.remove('d-none');
            ticketsTbody.innerHTML = '';
        } else {
            noTicketsMessage.classList.add('d-none');
            ticketsTbody.innerHTML = pendingTickets.map(ticket => `
                <tr>
                    <td>${ticket.email_usuario || 'N/A'}</td>
                    <td>
                        <strong>${ticket.producto || 'Producto no especificado'}</strong><br>
                        <small class="text-white-50">${ticket.correo_cuenta}</small>
                    </td>
                    <td>${ticket.descripcion}</td>
                    <td><button class="btn btn-success btn-sm" data-ticket-id="${ticket.id}" data-bs-toggle="modal" data-bs-target="#solveTicketModal">Solucionar</button></td>
                </tr>
            `).join('');
        }
    }

    function generateSolutionCredentials() {
        const randomUser = Math.random().toString(36).substring(2, 10);
        const randomPass = Math.random().toString(36).substring(2, 12);
        document.getElementById('new-account-email').value = `${randomUser}@tiendapelix.com`;
        document.getElementById('new-account-password').value = randomPass;
    }

    // Abrir modal y rellenar ID
    solveTicketModalEl.addEventListener('show.bs.modal', function (event) {
        const button = event.relatedTarget;
        const ticketId = button.dataset.ticketId;
        document.getElementById('solve-ticket-id').value = ticketId;
        // Generar credenciales automáticamente al abrir
        generateSolutionCredentials();
    });

    generateSolutionBtn.addEventListener('click', generateSolutionCredentials);

    solveTicketForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const ticketId = parseInt(document.getElementById('solve-ticket-id').value);
        const newEmail = document.getElementById('new-account-email').value;
        const newPassword = document.getElementById('new-account-password').value;

        if (!ticketId || !newEmail || !newPassword) {
            alert('Por favor, completa todos los campos.');
            return;
        }

        let allTickets = JSON.parse(localStorage.getItem('supportTickets')) || [];
        const ticketIndex = allTickets.findIndex(t => t.id === ticketId);

        if (ticketIndex > -1) {
            const ticketToSolve = allTickets[ticketIndex];
            ticketToSolve.status = 'solved';
            const userEmail = ticketToSolve.email_usuario;

            // Guardar la solución para el usuario
            let solvedTickets = JSON.parse(localStorage.getItem('solvedTickets')) || {};
            if (!solvedTickets[userEmail]) {
                solvedTickets[userEmail] = [];
            }
            solvedTickets[userEmail].push({ ...ticketToSolve, newEmail, newPassword, solvedDate: new Date().toISOString() });

            // Crear una notificación para el usuario
            let allNotifications = JSON.parse(localStorage.getItem('allNotifications')) || {};
            if (!allNotifications[userEmail]) allNotifications[userEmail] = [];
            allNotifications[userEmail].unshift({
                id: Date.now(),
                type: 'support',
                title: 'Tu reporte ha sido solucionado',
                body: `Se ha proporcionado una nueva cuenta para tu producto: ${ticketToSolve.producto}.`,
                date: new Date().toISOString(),
                read: false
            });
            localStorage.setItem('allNotifications', JSON.stringify(allNotifications));

            localStorage.setItem('supportTickets', JSON.stringify(allTickets));
            localStorage.setItem('solvedTickets', JSON.stringify(solvedTickets));

            loadTickets();
            solveTicketModal.hide();
            solveTicketForm.reset();
            alert('¡Ticket solucionado con éxito!');
        }
    });

    loadTickets();
});