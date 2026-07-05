document.addEventListener("DOMContentLoaded", () => {
  const qrImage = document.getElementById("qrCode");

  if (qrImage) {
    const targetPath = qrImage.dataset.qrTarget || "contact.html";
    const targetUrl = new URL(targetPath, window.location.href).href;
    qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=420x420&data=${encodeURIComponent(targetUrl)}`;
  }
});
async function fetchMainProducts() {
    const grid = document.getElementById("mainProductsGrid");
    try {
        const response = await fetch("http://localhost:3000/api/products");
        const products = await response.json();

        if (!products || products.length === 0) {
            grid.innerHTML = `<p style="text-align:center; color:var(--muted); width:100%;">لا توجد منتجات معروضة حالياً.</p>`;
            return;
        }

        // 1. تجميع كل البطاقات في متغير نصي واحد
        let productsHTML = ""; 
        products.forEach((product) => {
            productsHTML += `
              <article class="product-card">
                <div class="product-img-wrapper">
                  <img src="${product.imageUrl}" alt="${product.title}" loading="lazy" />
                </div>
                <div class="product-info">
                  <h3 class="product-title">${product.title}</h3>
                </div>
              </article>
            `;
        });

        // 2. تحديث الـ Grid مرة واحدة فقط
        grid.innerHTML = productsHTML; 

    } catch (error) {
        console.error("Erreur:", error);
        grid.innerHTML = `<p style="text-align:center; color:#ef4444; width:100%;">فشل الاتصال بالسيرفر.</p>`;
    }
}
         document.addEventListener("DOMContentLoaded", fetchMainProducts);

         