// Homepage — contact modal

(function () {
  var contactBtn = document.getElementById("contactBtn");
  var contactModal = document.getElementById("contactModal");
  var closeModal = document.getElementById("closeModal");

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

  // Close on Escape key
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && contactModal.classList.contains("active")) {
      contactModal.classList.remove("active");
    }
  });
})();
