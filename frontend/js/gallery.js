// Gallery page — Salon-hang masonry layout with gilded frames

(function () {
  var galleryEl = document.getElementById("gallery");
  var loadingEl = document.getElementById("loading");

  function formatPrice(pence) {
    return "\u00A3" + (pence / 100).toFixed(2);
  }

  function createCard(artwork, index) {
    var article = document.createElement("article");
    article.className = "artwork";
    article.style.transitionDelay = (index * 0.1) + "s";

    // Frame
    var frame = document.createElement("div");
    frame.className = "artwork__frame";

    if (artwork.imageUrl) {
      var img = document.createElement("img");
      img.className = "artwork__image";
      img.src = artwork.imageUrl;
      img.alt = artwork.name;
      img.loading = index < 3 ? "eager" : "lazy";
      frame.appendChild(img);
    }

    article.appendChild(frame);

    // Plaque (museum-style label)
    var plaque = document.createElement("div");
    plaque.className = "artwork__plaque";

    var title = document.createElement("h2");
    title.className = "artwork__title";
    title.textContent = artwork.name;
    plaque.appendChild(title);

    var price = document.createElement("span");
    price.className = "artwork__price";
    price.textContent = formatPrice(artwork.price);
    plaque.appendChild(price);

    var buyBtn = document.createElement("button");
    buyBtn.className = "artwork__buy";
    buyBtn.textContent = "Purchase";
    buyBtn.addEventListener("click", function () {
      buyBtn.disabled = true;
      buyBtn.textContent = "Opening\u2026";

      fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: artwork.priceId })
      })
        .then(function (res) {
          if (!res.ok) {
            return res.json().catch(function () {
              throw new Error("Checkout request failed");
            }).then(function (data) {
              throw new Error(data.error || "Checkout request failed");
            });
          }
          return res.json();
        })
        .then(function (data) {
          if (data.url) {
            window.location.href = data.url;
            buyBtn.disabled = false;
            buyBtn.textContent = "Purchase";
          } else {
            throw new Error(data.error || "Checkout failed");
          }
        })
        .catch(function (err) {
          alert("Could not start checkout: " + err.message);
          buyBtn.disabled = false;
          buyBtn.textContent = "Purchase";
        });
    });

    plaque.appendChild(buyBtn);
    article.appendChild(plaque);

    return article;
  }

  function setupScrollReveal() {
    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll(".artwork").forEach(function (el) {
        el.classList.add("artwork--visible");
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("artwork--visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: "0px 0px -40px 0px" });

    document.querySelectorAll(".artwork").forEach(function (el) {
      observer.observe(el);
    });
  }

  fetch("/api/artworks")
    .then(function (res) { return res.json(); })
    .then(function (artworks) {
      loadingEl.remove();

      if (artworks.length === 0) {
        var empty = document.createElement("p");
        empty.className = "salon-gallery__empty";
        empty.textContent = "The collection is being curated. Please return soon.";
        galleryEl.appendChild(empty);
        return;
      }

      artworks.forEach(function (artwork, i) {
        galleryEl.appendChild(createCard(artwork, i));
      });

      setupScrollReveal();
    })
    .catch(function () {
      loadingEl.textContent = "Unable to load the collection. Please try again later.";
    });
})();
