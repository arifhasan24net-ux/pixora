const images = [
 {id:1,title:"Misty Mountain Lake",category:"Nature",tags:"mountain lake landscape scenic wallpaper outdoors nature travel",description:"A peaceful landscape for wallpapers and creative projects.",url:"https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1400&q=90",ratio:"tall"},
 {id:2,title:"Color Flow",category:"Abstract",tags:"abstract gradient colorful background texture modern art",description:"A vibrant abstract texture for backgrounds and design mockups.",url:"https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1200&q=90"},
 {id:3,title:"Modern Creative Office",category:"Business",tags:"business office workspace desk computer interior work",description:"A bright workspace image for business and productivity content.",url:"https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=90"},
 {id:4,title:"Quiet Coastal Escape",category:"Nature",tags:"ocean sea coast beach travel water landscape nature",description:"Coastal inspiration for travel pages and digital backgrounds.",url:"https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=90"},
 {id:5,title:"Minimal Architecture",category:"Architecture",tags:"architecture building minimal modern concrete geometric",description:"Clean architectural lines for design and editorial projects.",url:"https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1200&q=90"},
 {id:6,title:"Warm Home Interior",category:"Lifestyle",tags:"home interior living room lifestyle cozy furniture",description:"A calm interior scene for lifestyle and home inspiration.",url:"https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=90"},
 {id:7,title:"Soft Botanical Detail",category:"Lifestyle",tags:"flower plant botanical nature soft aesthetic floral green leaves",description:"A soft botanical image for invitations, moodboards and posts.",url:"https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=1200&q=90"},
 {id:8,title:"Sunlit City Lines",category:"Architecture",tags:"city architecture urban building modern travel",description:"Urban architecture with strong shapes and natural light.",url:"https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=1200&q=90"},
 {id:9,title:"Creative Color Study",category:"Abstract",tags:"abstract art colorful texture background design",description:"Colorful visual inspiration for digital creative work.",url:"https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1200&q=90"},
 {id:10,title:"Focused Workday",category:"Business",tags:"business work laptop notebook desk productivity office",description:"A workspace scene for business articles and creator content.",url:"https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=90"},
 {id:11,title:"Forest Morning",category:"Nature",tags:"forest trees green woodland nature peaceful plants",description:"Green forest scenery for nature lovers and background art.",url:"https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=90"},
 {id:12,title:"Minimal Desk Setup",category:"Lifestyle",tags:"minimal desk setup laptop workspace home lifestyle technology",description:"A clean desk setup for productivity and technology content.",url:"https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=90"}
];

const grid = document.getElementById("imageGrid");
const searchInput = document.getElementById("searchInput");
const resultCount = document.getElementById("resultCount");
const emptyState = document.getElementById("emptyState");
const dialog = document.getElementById("imageDialog");
let activeCategory = "All";
let searchTerm = "";

function safeText(value) {
  return String(value).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
}
function normalize(value) {
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}
function visibleImages() {
  const terms = normalize(searchTerm).split(/\s+/).filter(Boolean);
  return images.filter(image => {
    const categoryMatch = activeCategory === "All" || image.category === activeCategory;
    const haystack = normalize(`${image.title} ${image.category} ${image.tags} ${image.description}`);
    const searchMatch = terms.every(term => haystack.includes(term));
    return categoryMatch && searchMatch;
  });
}
function render() {
  const filtered = visibleImages();
  resultCount.textContent = `${filtered.length} ${filtered.length === 1 ? "image" : "images"}`;
  emptyState.hidden = filtered.length !== 0;
  grid.hidden = filtered.length === 0;
  grid.innerHTML = filtered.map(image => `
    <article class="image-card" tabindex="0" role="button" aria-label="View ${safeText(image.title)}" data-id="${image.id}">
      <img src="${image.url}" alt="${safeText(image.title)}" loading="lazy">
      <div class="card-overlay"><span><strong>${safeText(image.title)}</strong><small>${safeText(image.category)}</small></span><button class="quick-download" data-download="${image.id}" aria-label="Download ${safeText(image.title)}" title="Download image">↓</button></div>
    </article>`).join("");
}
function selectCategory(category) {
  activeCategory = category;
  document.querySelectorAll(".category-chip").forEach(button => {
    const selected = button.dataset.category === category;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  render();
}
function fileNameFor(image) {
  return `pixora-${image.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "image"}.jpg`;
}
function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return "Unavailable";
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) { value /= 1024; unit++; }
  return `${value.toFixed(value >= 10 ? 1 : 2)} ${units[unit]}`;
}
async function loadImageMetadata(image, imgElement) {
  const dimensions = document.getElementById("dialogDimensions");
  const fileSize = document.getElementById("dialogFileSize");
  const format = document.getElementById("dialogFormat");
  dimensions.textContent = "Loading…";
  fileSize.textContent = "Loading…";
  format.textContent = "Loading…";
  const updateDimensions = () => {
    if (imgElement.naturalWidth && imgElement.naturalHeight) {
      dimensions.textContent = `${imgElement.naturalWidth} × ${imgElement.naturalHeight} px`;
    } else {
      dimensions.textContent = "Unavailable";
    }
  };
  if (imgElement.complete) updateDimensions();
  else imgElement.addEventListener("load", updateDimensions, { once: true });
  try {
    const response = await fetch(image.url, { mode: "cors", cache: "force-cache" });
    if (!response.ok) throw new Error("Could not read image metadata");
    const blob = await response.blob();
    fileSize.textContent = formatBytes(blob.size);
    const mime = (blob.type || response.headers.get("content-type") || "").split(";")[0];
    format.textContent = mime.startsWith("image/") ? mime.replace("image/", "").toUpperCase() : "Image";
    updateDimensions();
  } catch (error) {
    fileSize.textContent = "Unavailable";
    format.textContent = "Image";
    updateDimensions();
  }
}
function showImage(id) {
  const image = images.find(item => item.id === Number(id));
  if (!image) return;
  const dialogImage = document.getElementById("dialogImage");
  dialogImage.src = image.url;
  loadImageMetadata(image, dialogImage);
  document.getElementById("dialogImage").alt = image.title;
  document.getElementById("dialogTitle").textContent = image.title;
  document.getElementById("dialogCategory").textContent = image.category;
  document.getElementById("dialogDescription").textContent = image.description;
  const link = document.getElementById("dialogDownload");
  link.href = image.url;
  link.removeAttribute("target");
  link.removeAttribute("rel");
  link.dataset.download = String(image.id);
  link.setAttribute("aria-label", `Download ${image.title}`);
  dialog.showModal();
}
async function downloadImage(id, button) {
  const image = images.find(item => item.id === Number(id));
  if (!image) return;
  const originalText = button ? button.textContent : "";
  if (button) {
    button.dataset.originalText = originalText;
    button.textContent = "Preparing…";
    button.setAttribute("aria-busy", "true");
    button.style.pointerEvents = "none";
  }
  try {
    // Fetch as a Blob so the browser downloads the file instead of opening the image URL.
    const response = await fetch(image.url, {mode: "cors", cache: "no-store"});
    if (!response.ok) throw new Error(`Image request failed (${response.status})`);
    const blob = await response.blob();
    if (!blob.type.startsWith("image/")) throw new Error("The source did not return an image");
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = fileNameFor(image);
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 15000);
    if (button) button.textContent = "Downloaded ✓";
  } catch (error) {
    // A few browsers or image hosts may block cross-origin downloads. Keep a clear fallback.
    const fallback = document.createElement("a");
    fallback.href = image.url;
    fallback.target = "_blank";
    fallback.rel = "noopener";
    fallback.textContent = "Open image";
    fallback.style.display = "none";
    document.body.appendChild(fallback);
    fallback.click();
    fallback.remove();
    if (button) button.textContent = "Image opened";
    console.warn("Direct download unavailable; opened image as a fallback.", error);
  } finally {
    if (button) {
      button.removeAttribute("aria-busy");
      button.style.pointerEvents = "";
      window.setTimeout(() => {
        if (button.isConnected) button.textContent = button.dataset.originalText || "↓";
      }, 1800);
    }
  }
}
function runSearch({scroll = true} = {}) {
  searchTerm = searchInput.value.trim();

  // If the search contains a category name (for example "nature" or
  // "nature wallpaper"), activate that category chip as well as filtering.
  // General searches such as "forest" still search across every category.
  const normalizedQuery = normalize(searchTerm);
  const queryTerms = normalizedQuery.split(/\\s+/).filter(Boolean);
  const categories = [...document.querySelectorAll(".category-chip")]
    .map(button => button.dataset.category)
    .filter(category => category !== "All");
  const matchedCategory = categories.find(category => {
    const normalizedCategory = normalize(category);
    return normalizedQuery === normalizedCategory || queryTerms.includes(normalizedCategory);
  });

  activeCategory = matchedCategory || "All";
  document.querySelectorAll(".category-chip").forEach(button => {
    const selected = button.dataset.category === activeCategory;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });

  render();
  if (scroll) document.getElementById("explore").scrollIntoView({behavior: "smooth", block: "start"});
}
document.getElementById("searchForm").addEventListener("submit", event => {
  event.preventDefault();
  runSearch();
});
searchInput.addEventListener("input", () => {
  searchTerm = searchInput.value.trim();
  render();
});
document.querySelectorAll(".category-chip").forEach(button => button.addEventListener("click", () => selectCategory(button.dataset.category)));
document.querySelectorAll("[data-search]").forEach(button => button.addEventListener("click", () => {
  searchInput.value = button.dataset.search;
  runSearch();
}));
grid.addEventListener("click", event => {
  const downloadButton = event.target.closest("[data-download]");
  if (downloadButton) { event.preventDefault(); event.stopPropagation(); downloadImage(downloadButton.dataset.download, downloadButton); return; }
  const card = event.target.closest(".image-card");
  if (card) showImage(card.dataset.id);
});
grid.addEventListener("keydown", event => {
  if ((event.key === "Enter" || event.key === " ") && event.target.matches(".image-card")) {
    event.preventDefault(); showImage(event.target.dataset.id);
  }
});
document.getElementById("dialogDownload").addEventListener("click", event => {
  event.preventDefault();
  downloadImage(event.currentTarget.dataset.download, event.currentTarget);
});
document.getElementById("dialogClose").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });
document.getElementById("clearFilters").addEventListener("click", () => {
  searchInput.value = ""; searchTerm = ""; selectCategory("All");
});
document.getElementById("year").textContent = new Date().getFullYear();
document.querySelectorAll(".category-chip").forEach(button => {
  button.setAttribute("aria-pressed", String(button.dataset.category === "All"));
});
render();
