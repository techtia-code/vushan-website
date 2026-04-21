/* ═══════════════════════════
   VUSHĀN admin.js
═══════════════════════════ */

/* ── LOGIN (your original logic, credentials updated) ── */
const form = document.getElementById("loginForm");
if (form) {
  form.addEventListener("submit", function(e) {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    if (username === "vushan_admin" && password === "Vushan@2026") {
      localStorage.setItem("isAdmin", "true");
      window.location.href = "dashboard.html";
    } else {
      alert("Invalid username or password.");
    }
  });
}

/* ── DASHBOARD GUARD ── */
if (window.location.pathname.includes("dashboard.html")) {
  if (localStorage.getItem("isAdmin") !== "true") {
    window.location.href = "login.html";
  }
}

/* ── LOGOUT ── */
function adminLogout() {
  localStorage.removeItem("isAdmin");
  window.location.href = "login.html";
}

/* ════════════════════════
   DATA
════════════════════════ */
const CATS = ["Casual Men", "Casual Women", "Formal Men", "Formal Women"];
const CAT_IDS = {
  "Casual Men":    "casual-men",
  "Casual Women":  "casual-women",
  "Formal Men":    "formal-men",
  "Formal Women":  "formal-women"
};

function getData() {
  const raw = localStorage.getItem("vushan_inventory");
  if (!raw) return { "Casual Men": [], "Casual Women": [], "Formal Men": [], "Formal Women": [] };
  return JSON.parse(raw);
}

function saveData(data) {
  localStorage.setItem("vushan_inventory", JSON.stringify(data));
}

/* ════════════════════════
   SECTION SWITCH
════════════════════════ */
const TITLES = {
  "overview":       ["Dashboard", "Overview of your store"],
  "casual-men":     ["Casual Men", "Manage casual menswear"],
  "casual-women":   ["Casual Women", "Manage casual womenswear"],
  "formal-men":     ["Formal Men", "Manage formal menswear"],
  "formal-women":   ["Formal Women", "Manage formal womenswear"],
  "discounts":      ["Discounts", "Apply or remove discounts from products"]
};

function showSection(id, linkEl) {
  document.querySelectorAll(".dash-section").forEach(s => s.classList.remove("active"));
  document.querySelectorAll(".sidebar-nav a").forEach(a => a.classList.remove("active"));

  const sec = document.getElementById("sec-" + id);
  if (sec) sec.classList.add("active");
  if (linkEl) linkEl.classList.add("active");

  const t = TITLES[id] || ["—", ""];
  const titleEl = document.getElementById("pageTitle");
  const subEl   = document.getElementById("pageSub");
  if (titleEl) titleEl.textContent = t[0];
  if (subEl)   subEl.textContent   = t[1];

  if (id !== "overview" && id !== "discounts") {
    const cat = Object.keys(CAT_IDS).find(k => CAT_IDS[k] === id);
    if (cat) buildInventorySection(cat);
  }
  if (id === "discounts") buildDiscountTable();
  if (id === "overview")  updateStats();
  return false;
}

/* ════════════════════════
   INVENTORY SECTION
════════════════════════ */
let editingIdx = null;
let editingCat = null;

function buildInventorySection(cat) {
  const id  = CAT_IDS[cat];
  const sec = document.getElementById("sec-" + id);
  if (!sec) return;

  const data  = getData();
  const items = data[cat] || [];

  sec.innerHTML = `
    <div class="content-card" style="margin-bottom:24px;">
      <div class="card-head">
        <div>
          <h3 id="formTitle-${id}">Add Product — ${cat}</h3>
          <p class="card-sub">Fill in the details below and click Save.</p>
        </div>
      </div>
      <div class="prod-form">
        <div>
          <label class="field-label">Product Name *</label>
          <input type="text" id="pName-${id}" placeholder="e.g. Slim Fit Oxford Shirt" />
        </div>
        <div>
          <label class="field-label">Sub-Category</label>
          <select id="pSubcat-${id}">
            <option value="">Select…</option>
            <option>Tops</option><option>Shirts</option><option>Blazers</option>
            <option>Jackets</option><option>Trench Coats</option><option>Cardigans</option>
            <option>Trousers</option><option>Dresses</option><option>Skirts</option>
            <option>Women Skirt Suits</option><option>Formal Wear</option>
            <option>Ties</option><option>Accessories</option>
          </select>
        </div>
        <div>
          <label class="field-label">Price (IDR) *</label>
          <input type="number" id="pPrice-${id}" placeholder="300000" min="0" />
        </div>
        <div>
          <label class="field-label">Discount % <span style="font-style:italic;font-size:10px;text-transform:none;letter-spacing:0;">(leave blank for none)</span></label>
          <input type="number" id="pDiscount-${id}" placeholder="e.g. 20" min="0" max="90" />
        </div>
        <div class="full">
          <label class="field-label">Image URL *</label>
          <input type="url" id="pImg-${id}" placeholder="https://images.unsplash.com/…" oninput="previewImg('${id}', this.value)" />
          <img class="img-preview" id="imgPrev-${id}" src="" alt="Preview" />
        </div>
        <div class="full">
          <label class="field-label">Tags <span style="font-style:italic;font-size:10px;text-transform:none;letter-spacing:0;">(comma separated — used in search)</span></label>
          <input type="text" id="pTags-${id}" placeholder="shirt, formal, men, slim" />
        </div>
        <input type="hidden" id="pEditIdx-${id}" value="" />
      </div>
      <div class="form-foot">
        <button class="btn-clear" onclick="clearForm('${id}')">Clear</button>
        <button class="btn-save" onclick="saveProduct('${cat}', '${id}')">Save Product</button>
      </div>
    </div>

    <div class="content-card">
      <div class="card-head">
        <div>
          <h3>${cat} — Products (${items.length})</h3>
          <p class="card-sub">Click Edit to update a product.</p>
        </div>
      </div>
      <div class="prod-table-wrap">
        <table class="prod-table">
          <thead>
            <tr>
              <th>Image</th><th>Name</th><th>Sub-Cat</th>
              <th>Price</th><th>Discount</th><th>Actions</th>
            </tr>
          </thead>
          <tbody id="tbody-${id}">
            ${items.length === 0
              ? `<tr class="empty-row"><td colspan="6">No products yet. Add one above.</td></tr>`
              : items.map((p, i) => productRow(p, i, cat, id)).join("")
            }
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function productRow(p, i, cat, id) {
  const disc = p.discount > 0
    ? `<span class="badge-discount">${p.discount}% OFF</span>`
    : `<span style="color:var(--gray-mid);font-size:12px;">—</span>`;
  const discPrice = p.discount > 0
    ? `<br><span style="color:var(--gold-dark);font-size:11px;">IDR ${Math.round(p.price*(1-p.discount/100)).toLocaleString()}</span>`
    : "";
  return `
    <tr>
      <td><img class="prod-thumb" src="${p.img}" alt="${p.name}" onerror="this.src='https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&q=60'" /></td>
      <td><div class="prod-name">${p.name}</div></td>
      <td><div class="prod-cat">${p.subcat || "—"}</div></td>
      <td>IDR ${p.price.toLocaleString()}${discPrice}</td>
      <td>${disc}</td>
      <td>
        <button class="tbl-btn" onclick="editProduct('${cat}','${id}',${i})">Edit</button>
        <button class="tbl-btn del" onclick="deleteProduct('${cat}','${id}',${i})">Delete</button>
      </td>
    </tr>
  `;
}

function previewImg(id, url) {
  const el = document.getElementById("imgPrev-" + id);
  if (!el) return;
  if (url) { el.src = url; el.style.display = "block"; }
  else { el.style.display = "none"; }
}

function clearForm(id) {
  ["pName","pSubcat","pPrice","pDiscount","pImg","pTags","pEditIdx"].forEach(f => {
    const el = document.getElementById(f + "-" + id);
    if (el) el.value = "";
  });
  const prev = document.getElementById("imgPrev-" + id);
  if (prev) prev.style.display = "none";
  const title = document.getElementById("formTitle-" + id);
  const cat = Object.keys(CAT_IDS).find(k => CAT_IDS[k] === id);
  if (title && cat) title.textContent = "Add Product — " + cat;
}

function saveProduct(cat, id) {
  const name     = (document.getElementById("pName-"+id)?.value || "").trim();
  const price    = parseInt(document.getElementById("pPrice-"+id)?.value || "0");
  const img      = (document.getElementById("pImg-"+id)?.value || "").trim();
  const subcat   = document.getElementById("pSubcat-"+id)?.value || "";
  const discount = parseInt(document.getElementById("pDiscount-"+id)?.value || "0") || 0;
  const tags     = (document.getElementById("pTags-"+id)?.value || "").split(",").map(t => t.trim()).filter(Boolean);
  const editIdx  = document.getElementById("pEditIdx-"+id)?.value;

  if (!name || !price || !img) { showAdminToast("Please fill in Name, Price and Image URL"); return; }

  const product = { name, subcat, price, discount, tags, img };
  const data = getData();
  if (!data[cat]) data[cat] = [];

  if (editIdx !== "") {
    data[cat][parseInt(editIdx)] = product;
    showAdminToast("Product updated ✦");
  } else {
    data[cat].push(product);
    showAdminToast("Product added ✦");
  }

  saveData(data);
  clearForm(id);
  buildInventorySection(cat);
  updateStats();
}

function editProduct(cat, id, idx) {
  const data = getData();
  const p = data[cat][idx];
  if (!p) return;
  document.getElementById("pName-"+id).value     = p.name;
  document.getElementById("pSubcat-"+id).value   = p.subcat || "";
  document.getElementById("pPrice-"+id).value    = p.price;
  document.getElementById("pDiscount-"+id).value = p.discount || "";
  document.getElementById("pImg-"+id).value      = p.img;
  document.getElementById("pTags-"+id).value     = (p.tags || []).join(", ");
  document.getElementById("pEditIdx-"+id).value  = idx;
  previewImg(id, p.img);
  const title = document.getElementById("formTitle-"+id);
  if (title) title.textContent = "Edit Product — " + cat;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function deleteProduct(cat, id, idx) {
  if (!confirm("Delete this product? This cannot be undone.")) return;
  const data = getData();
  data[cat].splice(idx, 1);
  saveData(data);
  buildInventorySection(cat);
  updateStats();
  showAdminToast("Product deleted");
}

/* ════════════════════════
   DISCOUNT TABLE
════════════════════════ */
function buildDiscountTable() {
  const tbody = document.getElementById("discountTbody");
  if (!tbody) return;
  const data = getData();
  let rows = "";
  CATS.forEach(cat => {
    (data[cat] || []).forEach((p, i) => {
      const discLabel = p.discount > 0
        ? `<span class="badge-discount">${p.discount}% OFF</span>`
        : `<span style="color:var(--gray-mid);font-size:12px;">None</span>`;
      rows += `
        <tr>
          <td><img class="prod-thumb" src="${p.img}" alt="${p.name}" onerror="this.src='https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&q=60'"/></td>
          <td><div class="prod-name">${p.name}</div></td>
          <td><div class="prod-cat">${cat}</div></td>
          <td>IDR ${p.price.toLocaleString()}</td>
          <td>${discLabel}</td>
          <td><input class="disc-input" type="number" min="0" max="90" placeholder="%" value="${p.discount||""}" id="disc-${cat.replace(/ /g,"-")}-${i}" /></td>
          <td>
            <button class="btn-apply" onclick="applyDiscount('${cat}',${i})">Apply</button>
            ${p.discount > 0 ? `<button class="btn-remove" onclick="removeDiscount('${cat}',${i})">Remove</button>` : ""}
          </td>
        </tr>
      `;
    });
  });
  tbody.innerHTML = rows || `<tr class="empty-row"><td colspan="7">No products added yet.</td></tr>`;
  updateStats();
}

function applyDiscount(cat, idx) {
  const key = "disc-" + cat.replace(/ /g,"-") + "-" + idx;
  const val = parseInt(document.getElementById(key)?.value || "0") || 0;
  if (val < 0 || val > 90) { showAdminToast("Discount must be 0–90%"); return; }
  const data = getData();
  data[cat][idx].discount = val;
  saveData(data);
  buildDiscountTable();
  showAdminToast(val > 0 ? val + "% discount applied ✦" : "Discount removed");
}

function removeDiscount(cat, idx) {
  const data = getData();
  data[cat][idx].discount = 0;
  saveData(data);
  buildDiscountTable();
  showAdminToast("Discount removed");
}

/* ════════════════════════
   STATS
════════════════════════ */
function updateStats() {
  const data = getData();
  let total = 0, disc = 0;
  CATS.forEach(c => {
    (data[c] || []).forEach(p => { total++; if (p.discount > 0) disc++; });
  });
  const t = document.getElementById("statTotal");
  const d = document.getElementById("statDisc");
  if (t) t.textContent = total;
  if (d) d.textContent = disc;
}

/* ════════════════════════
   TOAST
════════════════════════ */
function showAdminToast(msg) {
  const t = document.getElementById("adminToast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 3000);
}

/* ── INIT ── */
document.addEventListener("DOMContentLoaded", function() {
  if (document.getElementById("sec-overview")) updateStats();
});

/* ── your original functions kept below ── */
function sendMessage() {
  const msg = document.getElementById("msg") ? document.getElementById("msg").value : "";
  let messages = JSON.parse(localStorage.getItem("messages")) || [];
  messages.push(msg);
  localStorage.setItem("messages", JSON.stringify(messages));
  alert("Message sent");
}

function addProduct() {
  const name  = document.getElementById("name") ? document.getElementById("name").value : "";
  const price = document.getElementById("price") ? document.getElementById("price").value : "";
  const image = document.getElementById("image") ? document.getElementById("image").files[0] : null;
  const reader = new FileReader();
  reader.onload = function() {
    const product = { name, price, image: reader.result };
    let products = JSON.parse(localStorage.getItem("products")) || [];
    products.push(product);
    localStorage.setItem("products", JSON.stringify(products));
    alert("Product Added!");
    loadProducts();
  };
  if (image) reader.readAsDataURL(image);
}

function loadProducts() {
  const container = document.getElementById("products");
  if (!container) return;
  const products = JSON.parse(localStorage.getItem("products")) || [];
  container.innerHTML = products.map((p, i) => `
    <div>
      <img src="${p.image}" width="100"/>
      <h3>${p.name}</h3>
      <p>$${p.price}</p>
      <button onclick="deleteOldProduct(${i})">Delete</button>
    </div>
  `).join("");
}

function deleteOldProduct(index) {
  let products = JSON.parse(localStorage.getItem("products")) || [];
  products.splice(index, 1);
  localStorage.setItem("products", JSON.stringify(products));
  loadProducts();
}

loadProducts();