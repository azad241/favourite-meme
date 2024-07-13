import './style.css'

const loadTheme = () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
};
loadTheme();
//other scripts are on script.js


