// Admin page — upload new artwork and manage existing pieces

(function () {
  var form = document.getElementById("uploadForm");
  var statusEl = document.getElementById("status");
  var galleryEl = document.getElementById("adminGallery");
  var loadingEl = document.getElementById("loading");

  function showStatus(message, type) {
    statusEl.innerHTML = "";
    var div = document.createElement("div");
    div.className = "status status--" + type;
    div.textContent = message;
    statusEl.appendChild(div);
  }

  function loadArtworks() {
    fetch("/api/artworks")
      .then(function (res) { return res.json(); })
      .then(function (artworks) {
        galleryEl.innerHTML = "";

        if (artworks.length === 0) {
          var empty = document.createElement("p");
          empty.className = "gallery__empty";
          empty.textContent = "No artwork uploaded yet.";
          galleryEl.appendChild(empty);
          return;
        }

        artworks.forEach(function (artwork) {
          var card = document.createElement("div");
          card.className = "card";

          var img = document.createElement("img");
          img.className = "card__image";
          img.src = artwork.imageUrl;
          img.alt = artwork.name;
          card.appendChild(img);

          var body = document.createElement("div");
          body.className = "card__body";

          var name = document.createElement("h2");
          name.className = "card__name";
          name.textContent = artwork.name;
          body.appendChild(name);

          var price = document.createElement("p");
          price.className = "card__price";
          price.textContent = "\u00A3" + (artwork.price / 100).toFixed(2);
          body.appendChild(price);

          var actions = document.createElement("div");
          actions.className = "card__actions";

          var deleteBtn = document.createElement("button");
          deleteBtn.className = "btn btn--danger btn--small";
          deleteBtn.textContent = "Delete";
          deleteBtn.addEventListener("click", function () {
            if (!confirm("Are you sure you want to delete \"" + artwork.name + "\"?")) {
              return;
            }
            fetch("/api/artworks/" + artwork.rowKey, { method: "DELETE" })
              .then(function (res) {
                if (res.ok) {
                  showStatus("\"" + artwork.name + "\" deleted.", "success");
                  loadArtworks();
                } else {
                  throw new Error("Delete failed");
                }
              })
              .catch(function () {
                showStatus("Failed to delete artwork.", "error");
              });
          });

          actions.appendChild(deleteBtn);
          body.appendChild(actions);
          card.appendChild(body);
          galleryEl.appendChild(card);
        });
      })
      .catch(function () {
        galleryEl.innerHTML = "";
        var err = document.createElement("p");
        err.className = "gallery__empty";
        err.textContent = "Failed to load artwork.";
        galleryEl.appendChild(err);
      });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var nameInput = document.getElementById("artName");
    var priceInput = document.getElementById("artPrice");
    var imageInput = document.getElementById("artImage");

    var file = imageInput.files[0];
    if (!file) {
      showStatus("Please select an image.", "error");
      return;
    }

    var submitBtn = form.querySelector("button[type=submit]");
    submitBtn.disabled = true;
    submitBtn.textContent = "Uploading\u2026";

    // Step 1: Get a SAS upload URL from the API
    fetch("/api/upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type
      })
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        // Step 2: Upload the image directly to Blob Storage
        return fetch(data.uploadUrl, {
          method: "PUT",
          headers: {
            "x-ms-blob-type": "BlockBlob",
            "Content-Type": file.type
          },
          body: file
        }).then(function () { return data.imageUrl; });
      })
      .then(function (imageUrl) {
        // Step 3: Create the artwork record
        return fetch("/api/artworks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: nameInput.value.trim(),
            price: Math.round(parseFloat(priceInput.value) * 100),
            imageUrl: imageUrl
          })
        });
      })
      .then(function (res) {
        if (!res.ok) throw new Error("Failed to save artwork");
        return res.json();
      })
      .then(function () {
        showStatus("\"" + nameInput.value.trim() + "\" uploaded successfully!", "success");
        form.reset();
        loadArtworks();
      })
      .catch(function (err) {
        showStatus("Upload failed: " + err.message, "error");
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = "Upload Artwork";
      });
  });

  loadArtworks();
})();
