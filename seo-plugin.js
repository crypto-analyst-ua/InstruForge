// public/seo-plugin.js
// Додає SEO-дружні URL /product/:id, оновлює meta/og теги і обробляє прямі переходи.

// Використовуй функції showProductDetail(productId) і products[] з основного script.js.
// Якщо цих функцій немає, потрібно підлаштувати під твою реалізацію.

(function () {
  // Відкриває товар і замінює hash-навігацію на /product/:id
  window.openProductPage = function (productId) {
    const product = (window.products || []).find(p => String(p.id) === String(productId));
    if (!product) {
      console.warn("Product not found for openProductPage:", productId);
      // на всякий випадок — викликаємо showProductDetail як є
      if (typeof window.showProductDetail === "function") window.showProductDetail(productId);
      return;
    }

    // pushState (оновлює URL без перезавантаження)
    try {
      window.history.pushState({ productId }, product.title || "", `/product/${product.id}`);
    } catch (e) {
      // у старих браузерах fallback на location.hash
      window.location.hash = `#product-${product.id}`;
    }

    // Оновити мета-теги/OG
    updateProductMetaTags(product);

    // Показати модал/деталі товару (існуюча функція)
    if (typeof window.showProductDetail === "function") {
      window.showProductDetail(product.id);
    } else {
      console.warn("showProductDetail not found — you need to integrate this plugin with your display function.");
    }
  };

  // Оновлює title, description, og tags
  window.updateProductMetaTags = function (product) {
    if (!product) return;

    const head = document.head;

    // title
    document.title = `${product.title} | InstruForge`;

    // description
    let desc = document.querySelector('meta[name="description"]');
    if (!desc) {
      desc = document.createElement("meta");
      desc.setAttribute("name", "description");
      head.appendChild(desc);
    }
    desc.setAttribute("content", product.description ? product.description.substring(0, 160) : `${product.title} — купити в InstruForge`);

    const ogMap = {
      "og:title": product.title,
      "og:description": product.description || "",
      "og:image": product.image || `${window.location.origin}/images/placeholder-product.jpg`,
      "og:url": `${window.location.origin}/product/${product.id}`,
      "og:type": "product"
    };

    Object.entries(ogMap).forEach(([prop, content]) => {
      let el = document.querySelector(`meta[property="${prop}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("property", prop);
        head.appendChild(el);
      }
      el.setAttribute("content", content);
    });

    // canonical
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${window.location.origin}/product/${product.id}`);
  };

  // При завантаженні сторінки — якщо URL /product/:id — показати товар
  window.addEventListener("DOMContentLoaded", () => {
    try {
      const path = window.location.pathname;
      if (path && path.startsWith("/product/")) {
        const productId = decodeURIComponent(path.split("/product/")[1] || "").split("/")[0];
        if (productId) {
          // Якщо продукти ще не завантажені — зачекаємо до 3s (або покличемо showProductDetail пізніше)
          const attemptToShow = () => {
            if (window.products && window.products.length > 0) {
              const found = window.products.find(p => String(p.id) === String(productId));
              if (found) {
                updateProductMetaTags(found);
                if (typeof window.showProductDetail === "function") window.showProductDetail(productId);
                return true;
              }
            }
            return false;
          };

          if (!attemptToShow()) {
            // якщо ще немає products — пробуємо періодично до 5 раз
            let tries = 0;
            const interval = setInterval(() => {
              tries++;
              if (attemptToShow() || tries >= 10) clearInterval(interval);
            }, 500);
          }
        }
      }
    } catch (e) {
      console.error("SEO plugin initialization error:", e);
    }
  });

  // Обробка Back/Forward
  window.addEventListener("popstate", (event) => {
    if (event.state && event.state.productId) {
      if (typeof window.showProductDetail === "function") {
        window.showProductDetail(event.state.productId);
      }
    } else {
      // якщо немає стану — закрити модал
      if (typeof window.closeModal === "function") window.closeModal();
    }
  });

  // ---- Допоміжна порада для інтеграції в renderProducts() ----
  // Заміни у renderProducts() всі кнопки/елементи:
  // onclick="showProductDetail('${product.id}')"
  // на:
  // onclick="openProductPage('${product.id}')"
  //
  // Або в HTML-шаблоні: <a href="/product/${product.id}" onclick="event.preventDefault(); openProductPage('${product.id}')">...
})();