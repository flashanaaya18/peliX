document.addEventListener('DOMContentLoaded', () => {
    // --- Protección de Ruta ---
    const user = auth.getUser();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    const personalDataForm = document.getElementById('personal-data-form');
    const changePasswordForm = document.getElementById('change-password-form');
    const deleteAccountBtn = document.getElementById('delete-account-btn');
    const verificationStatusContainer = document.getElementById('verification-status');
    const adminModeSection = document.getElementById('admin-mode-section');
    const adminModeToggle = document.getElementById('admin-mode-toggle');
    const themeSelector = document.getElementById('theme-selector');
    const privacySelector = document.getElementById('privacy-selector');

    // --- Lógica para el Tema ---
    const setTheme = (theme) => {
        if (theme === 'light') {
            document.body.classList.add('light-theme');
        } else {
            document.body.classList.remove('light-theme');
        }
    };

    const handleThemeChange = (e) => {
        const newTheme = e.target.value;
        setTheme(newTheme);
        localStorage.setItem('app_theme', newTheme);
    };

    // Inicializar el estado del selector de tema
    const currentTheme = localStorage.getItem('app_theme') || 'dark';
    document.querySelector(`input[name="theme"][value="${currentTheme}"]`).checked = true;
    themeSelector.addEventListener('change', handleThemeChange);

    // --- Lógica de Privacidad ---
    const savedPrivacy = user.profile_visibility || 'public';
    document.querySelector(`input[name="privacy"][value="${savedPrivacy}"]`).checked = true;

    privacySelector.addEventListener('change', async (e) => {
        const newVisibility = e.target.value;
        try {
            await updateUserPrivacy(user.id, newVisibility);
            auth.updateUser({ ...user, profile_visibility: newVisibility });
            alert('Tu configuración de privacidad ha sido actualizada.');
        } catch (error) {
            alert('Error al actualizar la privacidad.');
        }
    });

    // --- Lógica para Datos Personales (Fecha de Nacimiento) ---
    if (user.birth_date) {
        document.getElementById('birth-date').value = user.birth_date;
    }

    personalDataForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const birthDate = document.getElementById('birth-date').value;
        if (birthDate) {
            try {
                await updateUserBirthDate(user.id, birthDate);
                auth.updateUser({ ...user, birth_date: birthDate });
                alert('Tu fecha de nacimiento ha sido guardada.');
            } catch (error) {
                alert('Error al guardar la fecha de nacimiento.');
            }
        }
    });

    // --- Lógica para Ajustes de Cuenta ---
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', (e) => {
        changePasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            // En una app real, aquí llamarías a un endpoint del backend para cambiar la contraseña.
            alert('Funcionalidad de cambio de contraseña no implementada en el backend aún.');
            changePasswordForm.reset();
            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;

            try {
                const response = await updateUserPassword(user.id, currentPassword, newPassword);
                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || 'Error desconocido');
                }

                alert('¡Contraseña actualizada con éxito!');
                changePasswordForm.reset();
            } catch (error) {
                alert(`Error: ${error.message}`);
            }
        });
    }

    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', () => {
        deleteAccountBtn.addEventListener('click', async () => {
            if (confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción es irreversible.')) {
                // En una app real, se llamaría a un endpoint para eliminar al usuario de la DB.
                auth.logout(); // Por ahora, solo cerramos sesión.
                try {
                    await deleteUserAccount(user.id);
                    alert('Tu cuenta ha sido eliminada.');
                    auth.logout();
                } catch (error) {
                    alert('Error al intentar eliminar la cuenta.');
                }
            }
        });
    }

    // --- Lógica para Solicitud de Verificación ---
    const renderVerificationStatus = () => {
        const currentUser = auth.getUser(); // Obtener la info más reciente
        const currentUser = auth.getUser(); // Obtener la info más reciente del localStorage

        if (currentUser.is_verified) {
            verificationStatusContainer.innerHTML = '<p style="font-family: sans-serif; color: #28a745;">¡Felicidades! Tu cuenta está verificada.</p>';
        } else if (currentUser.verification_pending) {
            verificationStatusContainer.innerHTML = '<p style="font-family: sans-serif; color: #ffc107;">Tu solicitud de verificación está pendiente de revisión por un administrador.</p>';
        } else {
            verificationStatusContainer.innerHTML = `
                <p style="font-family: sans-serif; color: #aaa; margin-bottom: 20px;">Obtén la insignia azul para confirmar tu identidad. Un administrador revisará tu solicitud.</p>
                <form id="verification-form">
                    <div class="form-group">
                        <label for="verification-message">¿Por qué deberías ser verificado? (Opcional)</label>
                        <textarea id="verification-message" placeholder="Ej: Soy una figura pública, represento una marca, etc."></textarea>
                    </div>
                    <button type="submit" class="auth-button">Enviar Solicitud</button>
                </form>
            `;
            document.getElementById('verification-form').addEventListener('submit', (e) => {
            document.getElementById('verification-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                const message = document.getElementById('verification-message').value;
                auth.updateUser({ ...currentUser, verification_pending: true, verification_message: message });
                renderVerificationStatus(); // Actualizar la UI
                try {
                    await requestVerification(currentUser.id, message);
                    // Actualizar el estado local para reflejar el cambio inmediatamente
                    auth.updateUser({ ...currentUser, verification_pending: true, verification_message: message });
                    renderVerificationStatus(); // Actualizar la UI
                } catch (error) {
                    alert('Error al enviar la solicitud de verificación.');
                }
            });
        }
    };

    // --- Lógica para el Modo Administrador ---
    if (user.role === 'admin') {
        adminModeSection.style.display = 'block';

        // Leer el estado guardado y establecer el interruptor
        const isAdminModeEnabled = localStorage.getItem('admin_mode') !== 'false';
        adminModeToggle.checked = isAdminModeEnabled;

        adminModeToggle.addEventListener('change', (e) => {
            const isEnabled = e.target.checked;
            localStorage.setItem('admin_mode', isEnabled);
            
            // Forzar una recarga de la página para que los cambios en el menú se apliquen
            alert('El modo de administrador ha cambiado. La página se recargará para aplicar los cambios.');
            window.location.reload();
        });
    }

    // Iniciar la renderización del estado de verificación
    renderVerificationStatus();
});