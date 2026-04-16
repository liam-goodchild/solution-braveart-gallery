// Gallery page — fetch artworks and render editorial layout

(function () {
  var galleryEl = document.getElementById("gallery");
  var loadingEl = document.getElementById("loading");

  function formatPrice(pence) {
    return "\u00A3" + (pence / 100).toFixed(2);
  }

  function createCard(artwork, index) {
    var article = document.createElement("article");
    article.className = "artwork" + (index === 0 ? " artwork--featured" : "");
    article.style.transitionDelay = (index * 0.12) + "s";

    var frame = document.createElement("div");
    frame.className = "artwork__frame";

    if (artwork.imageUrl) {
      var img = document.createElement("img");
      img.className = "artwork__image";
      img.src = artwork.imageUrl;
      img.alt = artwork.name;
      img.loading = index === 0 ? "eager" : "lazy";
      frame.appendChild(img);
    }

    var overlay = document.createElement("div");
    overlay.className = "artwork__overlay";
    frame.appendChild(overlay);
    article.appendChild(frame);

    var details = document.createElement("div");
    details.className = "artwork__details";

    var title = document.createElement("h2");
    title.className = "artwork__title";
    title.textContent = artwork.name;
    details.appendChild(title);

    var meta = document.createElement("div");
    meta.className = "artwork__meta";

    var price = document.createElement("span");
    price.className = "artwork__price";
    price.textContent = formatPrice(artwork.price);
    meta.appendChild(price);

    var buyBtn = document.createElement("button");
    buyBtn.className = "artwork__buy";
    buyBtn.textContent = "Acquire";
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
            window.open(data.url, "_blank");
            buyBtn.disabled = false;
            buyBtn.textContent = "Acquire";
          } else {
            throw new Error(data.error || "Checkout failed");
          }
        })
        .catch(function (err) {
          alert("Could not start checkout: " + err.message);
          buyBtn.disabled = false;
          buyBtn.textContent = "Acquire";
        });
    });

    meta.appendChild(buyBtn);
    details.appendChild(meta);
    article.appendChild(details);

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
        empty.className = "editorial-gallery__empty";
        empty.textContent = "No artwork available yet. Check back soon.";
        galleryEl.appendChild(empty);
        return;
      }

      artworks.forEach(function (artwork, i) {
        galleryEl.appendChild(createCard(artwork, i));
      });

      setupScrollReveal();
    })
    .catch(function () {
      loadingEl.textContent = "Unable to load artwork. Please try again later.";
    });
})();
