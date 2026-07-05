// فحص الحماية وتسجيل الدخول
function checkAuth() {
    const token = localStorage.getItem("adminToken");
    if (!token) {
        window.location.href = "login.html";
    }
}

const sidebar = document.getElementById('sidebar');
const menuToggle = document.getElementById('menuToggle');

menuToggle.addEventListener('click', (e) => {
    sidebar.classList.toggle('open');
    e.stopPropagation();
});

document.addEventListener('click', (e) => {
    if (!sidebar.contains(e.target) && e.target !== menuToggle) {
        sidebar.classList.remove('open');
    }
});

function switchSection(sectionName) {
    document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.sidebar ul li a').forEach(a => a.classList.remove('active'));
    sidebar.classList.remove('open');

    if (sectionName === 'dashboard') {
        document.getElementById('dashboardSection').classList.add('active');
        document.getElementById('linkDashboard').classList.add('active');
    } else if (sectionName === 'offers') {
        document.getElementById('offersSection').classList.add('active');
        document.getElementById('linkOffers').classList.add('active');
        loadAdminOffers(); 
    } else if (sectionName === 'products') {
        document.getElementById('productsSection').classList.add('active');
        document.getElementById('linkProducts').classList.add('active');
        loadAdminProducts(); 
    } else if (sectionName === 'candidatures') {
        document.getElementById('candidaturesSection').classList.add('active');
        document.getElementById('linkCandidatures').classList.add('active');
        loadCandidatures(); 
    }
}

// ==================== إدارة طلبات التوظيف ====================
async function loadCandidatures() {
    const container = document.getElementById('candidaturesContainer');
    try {
        const response = await fetch('http://localhost:3000/api/candidatures');
        const list = await response.json();
        
        if(!list || list.length === 0) {
            container.innerHTML = "<tr><td colspan='6' style='text-align:center;'>Aucune candidature reçue.</td></tr>";
            return;
        }

        container.innerHTML = list.map(c => {
            const jobTitle = c.jobTitle || 'Poste non spécifié';
            const currentStatus = c.status || 'En attente';
            const statusClass = currentStatus.toLowerCase().replace(/\s+/g, '-');
            const name = c.candidateName || c.name || 'Inconnu';
            const email = c.candidateEmail || c.email || 'Non spécifié';
            
            // 👈 التعديل هنا: استخدام الرابط مباشرة كما يأتي من قاعدة البيانات (رابط Cloudinary)
            const cvLinkUrl = c.cvUrl; 

            let actionButtons = '';
            if (currentStatus === 'En attente') {
                actionButtons = `
                    <button class="btn-status btn-accept" onclick="updateStatus('${c._id}', 'Accepté')">Accepter</button>
                    <button class="btn-status btn-refuse" onclick="updateStatus('${c._id}', 'Refusé')">Refuser</button>
                `;
            } else {
                actionButtons = `
                    <button class="btn-status btn-annuler" onclick="updateStatus('${c._id}', 'En attente')">Annuler</button>
                    <button class="btn-status" style="background: #ef4444; color: white;" onclick="deleteCandidature('${c._id}')">Supprimer</button>
                `;
            }

            return `
                <tr>
                    <td><b>${name}</b></td>
                    <td>${email}</td>
                    <td><span style="color: #cbd5e1;">${jobTitle}</span></td>
                    <td>
                        <a class="cv-link" href="#" onclick="event.preventDefault(); openImage('${cvLinkUrl}')">Voir le CV</a>
                    </td>
                    <td><span class="status-badge status-${statusClass}">${currentStatus}</span></td>
                    <td>${actionButtons}</td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error("Erreur:", error);
    }
}

async function updateStatus(id, newStatus) {
    try {
        const response = await fetch(`http://localhost:3000/api/candidatures/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        if(response.ok) { loadCandidatures(); }
    } catch (error) { console.error(error); }
}

async function deleteCandidature(id) {
    if (confirm("Voulez-vous vraiment supprimer définitivement cette candidature ?")) {
        try {
            const response = await fetch(`http://localhost:3000/api/candidatures/${id}`, { method: 'DELETE' });
            if (response.ok) { alert("Candidature supprimée !"); loadCandidatures(); }
        } catch (error) { console.error(error); }
    }
}

// ==================== إدارة عروض التوظيف ====================
const imageInput = document.getElementById('image');
const preview = document.getElementById('preview');
imageInput.addEventListener('change', () => {
    const file = imageInput.files[0];
    if (file) { preview.src = URL.createObjectURL(file); preview.style.display = 'block'; }
});

const adminOffersContainer = document.getElementById('adminOffersContainer');
async function loadAdminOffers() {
    try {
        const response = await fetch('http://localhost:3000/api/offers');
        const offers = await response.json();
        if(!offers || offers.length === 0) { adminOffersContainer.innerHTML = "<p>Aucune offre en ligne.</p>"; return; }
        
        adminOffersContainer.innerHTML = offers.map(offer => `
            <div class="admin-offer-item">
                <img src="${offer.imageUrl}" onclick="openImage('${offer.imageUrl}')">
                <div class="admin-offer-info">
                    <h3>${offer.title}</h3>
                    <p style="color: #94a3b8; font-size:14px;">${offer.description.substring(0, 50)}...</p>
                </div>
                <button class="btn-delete" onclick="deleteOffer('${offer._id || offer.id}')">Supprimer</button>
            </div>
        `).join('');
    } catch (error) { console.error(error); }
}

async function deleteOffer(id) {
    if (confirm("Voulez-vous vraiment supprimer cette offre ?")) {
        try {
            const response = await fetch(`http://localhost:3000/api/offers/${id}`, { method: 'DELETE' });
            if (response.ok) { loadAdminOffers(); }
        } catch (error) { console.error(error); }
    }
}

document.getElementById('offerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('offerSubmitBtn');
    btn.disabled = true;
    
    const formData = new FormData();
    formData.append('title', document.getElementById('title').value);
    formData.append('description', document.getElementById('description').value);
    formData.append('image', imageInput.files[0]);
    
    try {
        const response = await fetch('http://localhost:3000/api/offers', { method: 'POST', body: formData });
        if (response.ok) { 
            document.getElementById('offerForm').reset(); 
            preview.style.display = 'none'; 
            switchSection('offers'); 
        } else {
            alert("Erreur lors de la publication.");
        }
    } catch (error) { 
        console.error(error); 
    } finally {
        btn.disabled = false;
    }
});

// ==================== إدارة صور بنرات المنتجات ====================
const productImageInput = document.getElementById('productImage');
const productPreview = document.getElementById('productPreview');
productImageInput.addEventListener('change', () => {
    const file = productImageInput.files[0];
    if (file) { productPreview.src = URL.createObjectURL(file); productPreview.style.display = 'block'; }
});

const adminProductsContainer = document.getElementById('adminProductsContainer');
async function loadAdminProducts() {
    try {
        const response = await fetch('http://localhost:3000/api/products');
        const products = await response.json();
        if(!products || products.length === 0) { adminProductsContainer.innerHTML = "<p>Aucune image de produit en ligne.</p>"; return; }
        
        adminProductsContainer.innerHTML = products.map(product => `
            <div class="admin-product-item">
                <img src="${product.imageUrl}" onclick="openImage('${product.imageUrl}')">
                <div class="admin-product-info">
                    <h3>${product.title}</h3>
                </div>
                <button class="btn-delete" onclick="deleteProduct('${product._id || product.id}')">Supprimer</button>
            </div>
        `).join('');
    } catch (error) { console.error(error); }
}

async function deleteProduct(id) {
    if (confirm("Voulez-vous vraiment supprimer cette image de produit ?")) {
        try {
            const response = await fetch(`http://localhost:3000/api/products/${id}`, { method: 'DELETE' });
            if (response.ok) { loadAdminProducts(); }
        } catch (error) { console.error(error); }
    }
}

document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('productSubmitBtn');
    btn.disabled = true;

    const formData = new FormData();
    formData.append('title', document.getElementById('productTitle').value);
    formData.append('image', productImageInput.files[0]);
    
    try {
        const response = await fetch('http://localhost:3000/api/products', { method: 'POST', body: formData });
        if (response.ok) { 
            document.getElementById('productForm').reset(); 
            productPreview.style.display = 'none'; 
            switchSection('products'); 
        } else {
            alert("Erreur lors de la publication.");
        }
    } catch (error) { 
        console.error(error); 
    } finally {
        btn.disabled = false;
    }
});

// ==================== التحكم بالـ Modal والخروج ====================
const modal = document.getElementById('imageModal');
const imgFull = document.getElementById('imgFull');
const closeModal = document.getElementById('closeModal');

function openImage(url) { modal.style.display = "flex"; imgFull.src = url; }
closeModal.addEventListener('click', () => { modal.style.display = "none"; });
modal.addEventListener('click', (e) => { if(e.target === modal) modal.style.display = "none"; });

function handleLogout() {
    if (confirm("Voulez-vous vraiment vous déconnecter ?")) {
        localStorage.removeItem("adminToken");
        window.location.href = "login.html";
    }
}

document.addEventListener('DOMContentLoaded', () => { 
    checkAuth();
    switchSection('dashboard'); 
});