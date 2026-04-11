// Homepage — load hero background and contact modal

(function () {
  const heroBg = document.getElementById("heroBg");
  const contactBtn = document.getElementById("contactBtn");
  const contactModal = document.getElementById("contactModal");
  const closeModal = document.getElementById("closeModal");

  // Load a random artwork as the hero background
  fetch("/api/artworks")
    .then(function (res) { return res.json(); })
    .then(function (artworks) {
      if (artworks.length > 0) {
        var random = artworks[Math.floor(Math.random() * artworks.length)];
        heroBg.style.backgroundImage = "url(" + random.imageUrl + ")";
      }
    })
    .catch(function () {
      // If API is unavailable, hero stays dark — that's fine
    });

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
