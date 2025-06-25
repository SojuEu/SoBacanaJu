let lastScrollTop = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > lastScrollTop) {
        // rolando para baixo
        navbar.style.top = '-80px'; // Esconde
    } else {
        // rolando para cima
        navbar.style.top = '0'; // Mostra
    }

    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // evita valor negativo
});