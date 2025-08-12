document.addEventListener('DOMContentLoaded', () => {
    const feedback = document.querySelector('.feedback');

    document.querySelectorAll('.icon').forEach(icon => {
        icon.addEventListener('click', () => {
            const app = icon.classList[1];
            feedback.textContent = `You opened the ${app} app.`;
        });
    });
});
