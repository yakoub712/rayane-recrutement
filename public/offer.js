const imageModal = document.getElementById('imageModal');
const imgFull = document.getElementById('imgFull');
const applyModal = document.getElementById('applyModal');
const applyJobTitle = document.getElementById('applyJobTitle');
const jobIdentifier = document.getElementById('jobIdentifier');

// جلب وعرض الوظائف من السيرفر
async function fetchAndDisplayOffers() {
    const container = document.getElementById('offersContainer');
    try {
        const response = await fetch('/api/offers');
        const offers = await response.json();
        
        if (!offers || offers.length === 0) {
            container.innerHTML = `<p style="text-align:center; grid-column: 1/-1;">Aucune offre disponible.</p>`;
            return;
        }

        container.innerHTML = offers.map(offer => `
            <div class="offer-card">
                <img class="offer-image" src="${offer.imageUrl}" alt="${offer.title}" onclick="openImage('${offer.imageUrl}')">
                <div class="offer-details">
                    <div>
                        <h2 class="offer-title">${offer.title}</h2>
                        <p class="offer-description">${offer.description}</p>
                    </div>
                    <button class="btn-apply" onclick="openApplyForm('${offer.title}')">Postuler</button>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error("Erreur lors de la récupération des offres:", error);
    }
}

// فتح وتكبير الصورة
function openImage(url) {
    imageModal.style.display = "flex";
    imgFull.src = url;
}

// فتح نموذج التتقديم وتخصيصه باسم الوظيفة المحددة
function openApplyForm(title) {
    applyModal.style.display = "flex";
    applyJobTitle.textContent = `Postuler: ${title}`;
    jobIdentifier.value = title; // حفظ اسم الوظيفة في الحقل المخفي
}

// إغلاق النوافذ عند الضغط على X
document.getElementById('closeImgModal').addEventListener('click', () => { imageModal.style.display = "none"; });
document.getElementById('closeApplyModal').addEventListener('click', () => { applyModal.style.display = "none"; });

// إغلاق النوافذ عند الضغط خارجها
window.addEventListener('click', (e) => {
    if (e.target === imageModal) imageModal.style.display = "none";
    if (e.target === applyModal) applyModal.style.display = "none";
});

// معالجة وإرسال بيانات استمارة التقديم سحابياً
async function submitApplication(event) {
    event.preventDefault();
    
    const name = document.getElementById('applicantName').value;
    const email = document.getElementById('applicantEmail').value;
    const cvFile = document.getElementById('applicantCV').files[0];
    const job = jobIdentifier.value;

    if (!cvFile) {
        alert("Veuillez sélectionner votre CV (Image ou PDF).");
        return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('jobTitle', job);
    formData.append('cvImage', cvFile); // يطابق حقل استقبال الملف السحابي تماماً لقاعدة البيانات

    try {
        const response = await fetch('/api/candidatures', {
            method: 'POST',
            body: formData 
        });

        const result = await response.json();

        if (response.ok) {
            alert("Votre candidature a été envoyée avec succès !");
            document.getElementById('applicationForm').reset();
            applyModal.style.display = "none";
        } else {
            alert("Erreur: " + (result.error || "Impossible d'envoyer la candidature."));
        }
    } catch (error) {
        console.error("Erreur:", error);
        alert("Impossible de contacter le serveur.");
    }
}
 
// تشغيل جلب العروض وربط حدث الإرسال فور تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplayOffers();

    // 👈 هذا السطر الجديد والمهم جداً لربط الاستمارة بالدالة ومنع تحديث الصفحة العشوائي
    const appForm = document.getElementById('applicationForm');
    if (appForm) {
        appForm.addEventListener('submit', submitApplication);
    }
});