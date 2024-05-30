// JavaScript function to handle toggle to login form
function toggleLogin() {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-toggle').classList.add('active');
    document.getElementById('register-toggle').classList.remove('active');
}

// JavaScript function to handle toggle to register form
function toggleRegister() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
    document.getElementById('register-toggle').classList.add('active');
    document.getElementById('login-toggle').classList.remove('active');
}

// sets default to login form
document.addEventListener('DOMContentLoaded', function() {
    toggleLogin(); 
});