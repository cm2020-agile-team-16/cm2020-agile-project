// JavaScript function to handle all 3 user profile modes
document.addEventListener("DOMContentLoaded", function () {
    // create variables for the profile sections
    const profileView = document.getElementById('profile-view-mode');
    const profileEdit = document.getElementById('profile-edit-mode');
    const resetPassword = document.getElementById('reset-password-mode');
    const message = document.getElementById('profile-message');

    // create variables for buttons
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const resetPasswordBtn = document.getElementById('reset-password-btn');
    const cancelResetBtn = document.getElementById('cancel-reset-btn');

    // view profile -> edit profile 
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', function () {
            profileView.style.display = 'none';
            profileEdit.style.display = 'block';
            // clear any messages
            if (message) {
                message.innerHTML = '';
            }
        });
    }

    // edit profile -> view profile
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', function () {
            profileEdit.style.display = 'none';
            profileView.style.display = 'block';
        });
    }

    // edit profile -> reset password
    if (resetPasswordBtn) {
        resetPasswordBtn.addEventListener('click', function () {
            profileEdit.style.display = 'none';
            resetPassword.style.display = 'block';
        });
    }

    // reset password -> view profile
    if (cancelResetBtn) {
        cancelResetBtn.addEventListener('click', function () {
            resetPassword.style.display = 'none';
            profileView.style.display = 'block';
        });
    }
});
