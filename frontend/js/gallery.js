// Gallery page — fetch artworks and render cards with Stripe checkout

(function () {
  var galleryEl = document.getElementById("gallery");
  var loadingEl = document.getElementById("loading");

  function formatPrice(pence) {
    return "\u00A3" + (pence / 100).toFixed(2);
  }

  function createCard(artwork) {
    var card = document.createElement("div");
    card.className = "card";

    if (artwork.imageUrl) {
      var img = document.createElement("img");
      img.className = "card__image";
      img.src = artwork.imageUrl;
      img.alt = artwork.name;
      img.loading = "lazy";
      card.appendChild(img);
    }

    var body = document.createElement("div");
    body.className = "card__body";

    var name = document.createElement("h2");
    name.className = "card__name";
    name.textContent = artwork.name;
    body.appendChild(name);

    var price = document.createElement("p");
    price.className = "card__price";
    price.textContent = formatPrice(artwork.price);
    body.appendChild(price);

    var actions = document.createElement("div");
    actions.className = "card__actions";

    var buyBtn = document.createElement("button");
    buyBtn.className = "btn btn--filled btn--small";
    buyBtn.textContent = "Purchase";
    buyBtn.addEventListener("click", function () {
      buyBtn.disabled = true;
      buyBtn.textContent = "Redirecting\u2026";

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

    actions.appendChild(buyBtn);
    body.appendChild(actions);
    card.appendChild(body);

    return card;
  }

  fetch("/api/artworks")
    .then(function (res) { return res.json(); })
    .then(function (artworks) {
      loadingEl.remove();

      if (artworks.length === 0) {
        var empty = document.createElement("p");
        empty.className = "gallery__empty";
        empty.textContent = "No artwork available yet. Check back soon.";
        galleryEl.appendChild(empty);
        return;
      }

      artworks.forEach(function (artwork) {
        galleryEl.appendChild(createCard(artwork));
      });
    })
    .catch(function () {
      loadingEl.textContent = "Unable to load artwork. Please try again later.";
    });
})();
