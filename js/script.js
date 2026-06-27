// Inisialisasi Database Keranjang Belanja & Sesi Anggota Berbasis Web Storage[cite: 2]
let cart = [];
try {
  cart = JSON.parse(localStorage.getItem("bitzz_cart")) || [];
} catch (e) {
  cart = [];
}

let currentUser = null;
try {
  currentUser = JSON.parse(localStorage.getItem("bitzz_user")) || null;
} catch (e) {
  currentUser = null;
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("BITZZ SYSTEM OPERASIONAL: Infrastruktur siap.");
  updateCartCountBadge();
  
  const greetingElem = document.getElementById("userGreeting");
  if (currentUser && greetingElem) {
    greetingElem.innerText = `Halo, ${currentUser.nama} ✨`;
  }
});

function addToCart(nama, harga, idQty) {
  const qtyInput = document.getElementById(idQty);
  const qty = qtyInput ? (parseInt(qtyInput.value) || 1) : 1;

  if (qty < 1) {
    alert("Batas minimum pembelian perangkat adalah 1 unit.");
    return;
  }

  const existingItemIndex = cart.findIndex(item => item.nama === nama);
  if (existingItemIndex > -1) {
    cart[existingItemIndex].qty += qty;
  } else {
    cart.push({ nama, harga, qty });
  }

  localStorage.setItem("bitzz_cart", JSON.stringify(cart));
  if (qtyInput) qtyInput.value = 1; 
  
  updateCartCountBadge();
  alert(`Sukses: ${nama} (${qty} Unit) telah ditambahkan ke Tas Belanja.`);
}
window.addToCart = addToCart;

function updateCartCountBadge() {
  const badge = document.getElementById("cartCount");
  if (badge) {
    const totalItems = cart.reduce((sum, item) => sum + (item.qty || 0), 0);
    badge.innerText = totalItems;
  }
}
window.updateCartCountBadge = updateCartCountBadge;

function triggerCheckoutFlow() {
  if (!currentUser) {
    closeModal();
    const authModal = document.getElementById("authModal");
    const wrapper = document.getElementById("mainContentWrapper");
    if (authModal) authModal.style.display = "flex";
    if (wrapper) wrapper.classList.add("blurred");
  } else {
    renderActualCheckoutForm();
  }
}
window.triggerCheckoutFlow = triggerCheckoutFlow;

function handleRegistration(event) {
  event.preventDefault();
  
  const nama = document.getElementById("regName").value.trim();
  const phone = document.getElementById("regPhone").value.trim();
  const alamat = document.getElementById("regAddress").value.trim();
  const noRekening = document.getElementById("regBankNo").value.trim();
  const namaBank = document.getElementById("regBankName").value;

  currentUser = { nama, phone, alamat, noRekening, namaBank };
  localStorage.setItem("bitzz_user", JSON.stringify(currentUser));

  closeAuthModal();
  
  const greetingElem = document.getElementById("userGreeting");
  if (greetingElem) greetingElem.innerText = `Halo, ${currentUser.nama} ✨`;

  openCartModal();
  renderActualCheckoutForm();
}
window.handleRegistration = handleRegistration;

function closeAuthModal() {
  const authModal = document.getElementById("authModal");
  const wrapper = document.getElementById("mainContentWrapper");
  if (authModal) authModal.style.display = "none";
  if (wrapper) wrapper.classList.remove("blurred");
}
window.closeAuthModal = closeAuthModal;

function searchApp() {
  const input = document.getElementById("mainSearch").value.toLowerCase().trim();
  const sectionKatalog = document.getElementById("katalogSection");
  const cards = document.querySelectorAll(".product-card");

  if (input !== "") {
    // Jika mengetik sesuatu, otomatis buka section katalog
    if (sectionKatalog) sectionKatalog.style.display = "block";
    
    cards.forEach((card) => {
      const title = card.getAttribute("data-title") ? card.getAttribute("data-title").toLowerCase() : "";
      card.style.display = title.includes(input) ? "block" : "none";
    });
  } else {
    // Jika pencarian kosong dan tidak ada filter aktif, sembunyikan kembali
    const hasActiveFilter = document.querySelector('.category-card.active');
    if (!hasActiveFilter && sectionKatalog) {
      sectionKatalog.style.display = "none";
    }
  }
}
window.searchApp = searchApp;

// FUNGSIONALITAS BARU: Mengaktifkan Katalog & Mengarahkan Halaman secara Instan
function filterCategory(category, element) {
  // Atur status tombol aktif
  const buttons = document.querySelectorAll('.category-card');
  buttons.forEach(btn => btn.classList.remove('active'));
  if (element) element.classList.add('active');

  // Tampilkan Section Katalog yang sebelumnya tersembunyi
  const sectionKatalog = document.getElementById("katalogSection");
  if (sectionKatalog) {
    sectionKatalog.style.display = "block";
  }

  // Ubah judul judul katalog sesuai dengan pilihan produk
  const judulKatalog = document.getElementById("katalogTitle");
  if (judulKatalog) {
    judulKatalog.innerText = "Katalog Produk " + category.toUpperCase();
  }

  // Filter kartu produk berdasarkan kategori data attribute
  const cards = document.querySelectorAll(".product-card");
  cards.forEach((card) => {
    const cardCategory = card.getAttribute("data-category");
    card.style.display = (cardCategory === category) ? "block" : "none";
  });

  // Gulir halaman secara halus (smooth scroll) langsung menuju ke section katalog produk
  if (sectionKatalog) {
    sectionKatalog.scrollIntoView({ behavior: 'smooth' });
  }
}
window.filterCategory = filterCategory;

function openCartModal() {
  renderCartOrCheckoutUI();
  const modal = document.getElementById("modal");
  if (modal) modal.style.display = "flex";
}
window.openCartModal = openCartModal;

function closeModal() {
  const modal = document.getElementById("modal");
  if (modal) modal.style.display = "none";
}
window.closeModal = closeModal;

window.onclick = function (e) {
  const modal = document.getElementById("modal");
  if (e.target == modal) closeModal();
};

function removeFromCart(index) {
  cart.splice(index, 1);
  localStorage.setItem("bitzz_cart", JSON.stringify(cart));
  updateCartCountBadge();
  renderCartOrCheckoutUI();
}
window.removeFromCart = removeFromCart;

function renderCartOrCheckoutUI() {
  const modalContent = document.getElementById("modalContent");
  if (!modalContent) return;

  if (cart.length === 0) {
    modalContent.innerHTML = `
      <h2 style="text-align:center; font-weight:600;">Tas Belanja Anda</h2>
      <hr style="margin: 15px 0; opacity: 0.1" />
      <p style='text-align:center; padding: 20px 0; font-size:0.9rem; opacity:0.7;'>Tas Belanja Anda masih kosong.</p>
      <button onclick="closeModal()" class="btn btn-primary" style="margin: 0 auto; display:block; max-width:200px;">Menjelajah</button>
    `;
    return;
  }

  let itemsHtml = "";
  let grandTotal = 0;

  cart.forEach((item, index) => {
    const itemTotal = (item.harga || 0) * (item.qty || 1);
    grandTotal += itemTotal;
    const fmtHarga = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(item.harga || 0);
    const fmtTotal = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(itemTotal);

    itemsHtml += `
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(128,128,128,0.15); padding: 10px 0;">
        <div>
          <strong style="font-size:0.9rem;">${item.nama}</strong><br>
          <small style="opacity: 0.7;">${fmtHarga} &times; ${item.qty}</small>
        </div>
        <div style="text-align:right">
          <span style="font-size:0.9rem; font-weight:600;">${fmtTotal}</span><br>
          <button onclick="removeFromCart(${index})" style="background:none; border:none; color:#dc3545; cursor:pointer; font-size:0.75rem; text-decoration:underline;">Hapus</button>
        </div>
      </div>
    `;
  });

  const fmtGrandTotal = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(grandTotal);

  modalContent.innerHTML = `
    <h2 style="text-align:center;">Ringkasan Belanja</h2>
    <hr style="margin: 15px 0; opacity: 0.1;" />
    <div style="max-height: 180px; overflow-y: auto; margin-bottom: 15px;">
      ${itemsHtml}
    </div>
    <div style="display:flex; justify-content:space-between; font-weight:700; margin-bottom: 20px; font-size:1rem; border-top:1px solid rgba(128,128,128,0.15); padding-top:10px;">
      <span>Subtotal:</span>
      <span>${fmtGrandTotal}</span>
    </div>
    <button onclick="triggerCheckoutFlow()" class="btn btn-primary w-100">PROSES CHECKOUT</button>
  `;
}

function renderActualCheckoutForm() {
  const modalContent = document.getElementById("modalContent");
  if (!modalContent) return;

  let grandTotal = cart.reduce((sum, item) => sum + ((item.harga || 0) * (item.qty || 1)), 0);
  const fmtGrandTotal = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(grandTotal);

  modalContent.innerHTML = `
    <h2 style="text-align:center;">Metode Pembayaran</h2>
    <hr style="margin: 10px 0; opacity: 0.1" />
    <div style="display:flex; justify-content:space-between; font-weight:700; margin-bottom: 10px; font-size:1rem;">
      <span>Total Tagihan:</span>
      <span>${fmtGrandTotal}</span>
    </div>
    <form class="form-checkout" id="orderForm" onsubmit="processPaymentGateway(event, '${fmtGrandTotal}')">
      <label>Nama Penerima</label>
      <input type="text" value="${currentUser ? currentUser.nama : ''}" readonly />
      <label>Alamat Kirim</label>
      <input type="text" value="${currentUser ? currentUser.alamat : ''}" readonly />
      <label>Metode Safe-Gate *</label>
      <select id="paymentMethod" required>
        <option value="QRIS">QRIS Standar Finansial Dinamis</option>
        <option value="SeaBank">Transfer Rekening SeaBank Corporate</option>
        <option value="DANA">Giro Kilat Saldo DANA Enterprise</option>
      </select>
      <div class="motto-box"><strong>MOTO: Gadget Premium, Pelayanan Bintang Lima!</strong></div>
      <button type="submit" class="btn btn-primary w-100">PROSES INVOICE RESMI</button>
    </form>
  `;
}

function processPaymentGateway(event, totalFormatted) {
  event.preventDefault();
  const method = document.getElementById("paymentMethod").value;
  const invoiceNo = "INV-" + Math.floor(100000 + Math.random() * 900000);
  const dateNow = new Date().toLocaleString("id-ID");

  let itemsSummaryHtml = "";
  cart.forEach(item => {
    const totalItemHarga = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format((item.harga || 0) * (item.qty || 1));
    itemsSummaryHtml += `<li>${item.nama} (${item.qty}x) - <strong>${totalItemHarga}</strong></li>`;
  });

  let paymentInstruction = "";
  if (method === "QRIS") {
    paymentInstruction = `
      <p style="font-size:0.8rem; text-align:center; margin-bottom:5px;">Pindai QRIS Resmi <strong>Bitzz Store</strong>:</p>
      <img src="image/qris.jpeg" alt="QRIS payment code for Bitzz Store with NMID 1026531348849" class="qris-image" onerror="this.src='https://placehold.co/120x120/ffffff/000000?text=QRIS+CODE'" />
      <span style="font-size:0.7rem; opacity:0.7; display:block; text-align:center;">NMID: ID1026531348849</span>
    `;
  } else if (method === "SeaBank") {
    paymentInstruction = `
      <p>Transfer Manual Bank: <strong>SeaBank</strong></p>
      <p>No Rekening: <strong style="color:#dc3545;">9016 8120 0790</strong></p>
      <p>A/N Pemilik: <strong>ILHAM HIDAYAT</strong></p>
    `;
  } else if (method === "DANA") {
    paymentInstruction = `
      <p>Kirim Saldo Dompet Digital <strong>DANA</strong></p>
      <p>No Akun DANA: <strong style="color:#dc3545;">0856 0086 5191</strong></p>
      <p>A/N Pemilik: <strong>ILHAM HIDAYAT</strong></p>
    `;
  }

  cart = [];
  localStorage.removeItem("bitzz_cart");
  updateCartCountBadge();

  const modalContent = document.getElementById("modalContent");
  if (modalContent) {
    modalContent.innerHTML = `
      <div class="invoice-container">
        <div class="invoice-header">
          <h2>FAKTUR PEMESANAN</h2>
          <span class="invoice-status">Pending</span>
        </div>
        <div class="invoice-body-info">
          <p><strong>No Faktur:</strong> ${invoiceNo}</p>
          <p><strong>Waktu:</strong> ${dateNow}</p>
          <p><strong>Penerima:</strong> ${currentUser ? currentUser.nama : '-'}</p>
          <p><strong>WhatsApp:</strong> ${currentUser ? currentUser.phone : '-'}</p>
          <p><strong>Alamat:</strong> ${currentUser ? currentUser.alamat : '-'}</p>
        </div>
        <div style="font-size:0.8rem; margin-bottom:10px;">
          <p style="font-weight:700; margin-bottom:4px;">Rincian Item:</p>
          <ul style="padding-left:15px; opacity:0.9; line-height:1.4;">${itemsSummaryHtml}</ul>
        </div>
        <div style="text-align:right; font-weight:700; font-size:1rem; margin-bottom:14px; border-top:1px solid rgba(128,128,128,0.15); padding-top:8px;">
          Total Tagihan: <span style="color:#dc3545;">${totalFormatted}</span>
        </div>
        <div class="payment-details">${paymentInstruction}</div>
        <button onclick="closeModal()" class="btn btn-primary w-100" style="margin-top:15px; padding:10px; font-size:0.85rem;">Selesai & Tutup</button>
      </div>
    `;
  }
}