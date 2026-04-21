/* ═══════════════════════════
   VUSHĀN admin.js
═══════════════════════════ */

/* ── LOGIN ── */
const form = document.getElementById("loginForm");
if (form) {
  form.addEventListener("submit", function(e) {
    e.preventDefault();
    const username = document.getElementById("username").value.trim().toLowerCase();
    const password = document.getElementById("password").value;
    if (username === "wellingtonadmin@admin.com" && password === "2026WEBINDEX123...") {
      localStorage.setItem("isAdmin", "true");
      window.location.href = "dashboard.html";
    } else {
      alert("Invalid email or password.");
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
  "overview":      ["Dashboard", "Overview of your store"],
  "casual-men":    ["Casual Men", "Manage casual menswear"],
  "casual-women":  ["Casual Women", "Manage casual womenswear"],
  "formal-men":    ["Formal Men", "Manage formal menswear"],
  "formal-women":  ["Formal Women", "Manage formal womenswear"],
  "discounts":     ["Discounts", "Apply or remove discounts from products"]
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
   IMAGE UPLOAD HANDLER
════════════════════════ */
function handleImageUpload(id, input) {
  const file = input.files[0];
  if (!file) return;

  const nameEl = document.getElementById("imgFileName-" + id);
  if (nameEl) nameEl.textContent = file.name;

  const reader = new FileReader();
  reader.onload = function(e) {
    const base64 = e.target.result;
    const hiddenEl = document.getElementById("pImgData-" + id);
    if (hiddenEl) hiddenEl.value = base64;
    const prev = document.getElementById("imgPrev-" + id);
    if (prev) { prev.src = base64; prev.style.display = "block"; }
  };
  reader.readAsDataURL(file);
}

/* ════════════════════════
   INVENTORY SECTION
════════════════════════ */
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
          <label class="field-label">Product Image *</label>
          <div
            style="border:2px dashed var(--gray-mid);padding:32px;text-align:center;cursor:pointer;transition:border-color .2s;background:var(--cream);"
            onclick="document.getElementById('pImgFile-${id}').click()"
            ondragover="event.preventDefault();this.style.borderColor='var(--gold)'"
            ondragleave="this.style.borderColor='var(--gray-mid)'"
            ondrop="event.preventDefault();this.style.borderColor='var(--gray-mid)';document.getElementById('pImgFile-${id}').files=event.dataTransfer.files;handleImageUpload('${id}',document.getElementById('pImgFile-${id}'))"
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.3" style="margin-bottom:12px;">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <p style="font-size:13px;color:var(--text-muted);margin-bottom:5px;">Click to upload or drag &amp; drop your image</p>
            <p style="font-size:11px;color:var(--gray-mid);">JPG, PNG, WEBP — recommended 600×800px</p>
            <p id="imgFileName-${id}" style="font-size:12px;color:var(--gold);margin-top:10px;font-weight:500;"></p>
            <input type="file" id="pImgFile-${id}" accept="image/*" style="display:none;" onchange="handleImageUpload('${id}',this)" />
          </div>
          <input type="hidden" id="pImgData-${id}" value="" />
          <img id="imgPrev-${id}" src="" alt="Preview"
            style="width:100px;height:130px;object-fit:cover;border:1px solid var(--gray-mid);margin-top:12px;display:none;" />
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
  const thumb = p.img
    ? `<img src="${p.img}" alt="${p.name}" style="width:44px;height:54px;object-fit:cover;display:block;" />`
    : `<div style="width:44px;height:54px;background:var(--gray-light);display:flex;align-items:center;justify-content:center;font-size:9px;color:var(--text-muted);text-align:center;">No<br>Image</div>`;
  return `
    <tr>
      <td>${thumb}</td>
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

function clearForm(id) {
  ["pName","pSubcat","pPrice","pDiscount","pTags","pEditIdx"].forEach(f => {
    const el = document.getElementById(f + "-" + id);
    if (el) el.value = "";
  });
  const imgData = document.getElementById("pImgData-" + id);
  if (imgData) imgData.value = "";
  const imgFile = document.getElementById("pImgFile-" + id);
  if (imgFile) imgFile.value = "";
  const fileName = document.getElementById("imgFileName-" + id);
  if (fileName) fileName.textContent = "";
  const prev = document.getElementById("imgPrev-" + id);
  if (prev) { prev.src = ""; prev.style.display = "none"; }
  const title = document.getElementById("formTitle-" + id);
  const cat = Object.keys(CAT_IDS).find(k => CAT_IDS[k] === id);
  if (title && cat) title.textContent = "Add Product — " + cat;
}

function saveProduct(cat, id) {
  const name     = (document.getElementById("pName-"+id)?.value || "").trim();
  const price    = parseInt(document.getElementById("pPrice-"+id)?.value || "0");
  const imgData  = (document.getElementById("pImgData-"+id)?.value || "").trim();
  const subcat   = document.getElementById("pSubcat-"+id)?.value || "";
  const discount = parseInt(document.getElementById("pDiscount-"+id)?.value || "0") || 0;
  const tags     = (document.getElementById("pTags-"+id)?.value || "").split(",").map(t => t.trim()).filter(Boolean);
  const editIdx  = document.getElementById("pEditIdx-"+id)?.value;

  if (!name || !price) { showAdminToast("Please fill in Name and Price"); return; }

  /* on edit keep old image if no new one uploaded */
  let finalImg = imgData;
  if (!finalImg && editIdx !== "") {
    const existing = getData()[cat][parseInt(editIdx)];
    if (existing) finalImg = existing.img;
  }
  if (!finalImg) { showAdminToast("Please upload a product image"); return; }

  const product = { name, subcat, price, discount, tags, img: finalImg };
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
  document.getElementById("pTags-"+id).value     = (p.tags || []).join(", ");
  document.getElementById("pEditIdx-"+id).value  = idx;

  if (p.img) {
    const prev = document.getElementById("imgPrev-"+id);
    if (prev) { prev.src = p.img; prev.style.display = "block"; }
    const nameEl = document.getElementById("imgFileName-"+id);
    if (nameEl) nameEl.textContent = "✦ Current image loaded — upload a new one to replace it";
  }

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
      const thumb = p.img
        ? `<img src="${p.img}" alt="${p.name}" style="width:44px;height:54px;object-fit:cover;display:block;" />`
        : `<div style="width:44px;height:54px;background:var(--gray-light);"></div>`;
      rows += `
        <tr>
          <td>${thumb}</td>
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