// Password gate for the WD Red Pro Campaign project link.
(function () {
  var TARGET = 'wd-red-pro-campaign.html';
  var PASSWORD = 'hidden2026';
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href$="' + TARGET + '"]');
    if (!a) return;
    e.preventDefault();
    var entry = window.prompt('This project is password protected. Enter the password to continue:');
    if (entry === null) return;
    if (entry === PASSWORD) window.location.href = a.getAttribute('href');
    else window.alert('Incorrect Password');
  });
})();
