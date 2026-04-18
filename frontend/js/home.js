// Homepage — contact modal

(() => {
  var contactBtn = document.getElementById("contactBtn");
  var contactModal = document.getElementById("contactModal");
  var closeModal = document.getElementById("closeModal");

  contactBtn.addEventListener("click", () => {
    contactModal.classList.add("active");
  });

  closeModal.addEventListener("click", () => {
    contactModal.classList.remove("active");
  });

  contactModal.addEventListener("click", (e) => {
    if (e.target === contactModal) {
      contactModal.classList.remove("active");
    }
  });

  // Close on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && contactModal.classList.contains("active")) {
      contactModal.classList.remove("active");
    }
  });
})();
