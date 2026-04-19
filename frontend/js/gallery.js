// Gallery page — Salon-hang masonry layout with gilded frames

(() => {
  var galleryEl = document.getElementById("gallery");
  var loadingEl = document.getElementById("loading");

  function formatPrice(pence) {
    return `£${(pence / 100).toFixed(2)}`;
  }

  function createCard(artwork, index) {
    var article = document.createElement("article");
    article.className = "artwork";
    article.style.transitionDelay = `${index * 0.1}s`;

    // Frame
    var frame = document.createElement("div");
    frame.className = "artwork__frame";

    if (artwork.imageUrl) {
      const img = document.createElement("img");
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
    buyBtn.addEventListener("click", () => {
      buyBtn.disabled = true;
      buyBtn.textContent = "Opening\u2026";

      fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: artwork.priceId }),
      })
        .then((res) => {
          if (!res.ok) {
            return res
              .json()
              .catch(() => {
                throw new Error("Checkout request failed");
              })
              .then((data) => {
                throw new Error(data.error || "Checkout request failed");
              });
          }
          return res.json();
        })
        .then((data) => {
          if (data.url) {
            window.location.href = data.url;
            buyBtn.disabled = false;
            buyBtn.textContent = "Purchase";
          } else {
            throw new Error(data.error || "Checkout failed");
          }
        })
        .catch((err) => {
          alert(`Could not start checkout: ${err.message}`);
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
      document.querySelectorAll(".artwork").forEach((el) => {
        el.classList.add("artwork--visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("artwork--visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -40px 0px" },
    );

    document.querySelectorAll(".artwork").forEach((el) => {
      observer.observe(el);
    });
  }

  var CACHE_KEY = "braveart_artworks";
  var CACHE_TTL = 5 * 60 * 1000;

  function getCached() {
    try {
      var entry = JSON.parse(sessionStorage.getItem(CACHE_KEY));
      if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data;
    } catch (_) {}
    return null;
  }

  function setCached(data) {
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: data }));
    } catch (_) {}
  }

  var cached = getCached();
  var artworkPromise = cached
    ? Promise.resolve(cached)
    : fetch("/api/artworks").then((res) => res.json()).then((data) => { setCached(data); return data; });

  artworkPromise
    .then((artworks) => {
      var empty;
      loadingEl.remove();

      if (artworks.length === 0) {
        empty = document.createElement("p");
        empty.className = "salon-gallery__empty";
        empty.textContent =
          "The collection is being curated. Please return soon.";
        galleryEl.appendChild(empty);
        return;
      }

      artworks.forEach((artwork, i) => {
        galleryEl.appendChild(createCard(artwork, i));
      });

      setupScrollReveal();
    })
    .catch(() => {
      loadingEl.textContent =
        "Unable to load the collection. Please try again later.";
    });
})();
