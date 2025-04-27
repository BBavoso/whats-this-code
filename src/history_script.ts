document.getElementById('logout')!.addEventListener('click', function () {
    // Clear the local storage
    localStorage.clear();
    alert("hai");
    // Redirect to the popup.html page
    window.close();
});