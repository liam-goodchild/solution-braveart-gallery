// Homepage — contact modal

(function () {
  var contactBtn = document.getElementById("contactBtn");
  var contactModal = document.getElementById("contactModal");
  var closeModal = document.getElementById("closeModal");

  // Contact modal
  contactBtn.addEventListener("click", function () {
    contactModal.classList.add("active");
  });

  closeModal.addEventListener("click", function () {
    contactModal.classList.remove("active");
  });

  contactModal.addEventListener("click", function (e) {
    if (e.target === contactModal) {
      contactModal.classList.remove("active");
    }
  });
})();
