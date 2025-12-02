// Datos de ejemplo - En una aplicación real, vendrían de una API del backend
let artworks = []
let cart = []
let filteredArtworks = []
let wishlist = []
let viewedArtworks = []
const comparisonList = []
let currentView = "grid" // grid o list
let savedFilters = []
const notifications = [
  {
    id: 1,
    title: "¡Bienvenido a Globex!",
    message: "Explora nuestra colección de obras digitales.",
    time: "Ahora",
    read: false,
  },
  {
    id: 2,
    title: "Nuevas obras disponibles",
    message: "Se han añadido obras a nuestra galería.",
    time: "Hace 2 horas",
    read: false,
  },
]

// Sistema de calificaciones dinámico
let artworkRatings = {}

let isAdmin = false

// Declare variables before using them
function isUserLoggedIn() {
  // Verificar si hay un usuario actual
  const currentUser = localStorage.getItem("marketplace_current_user")
  return currentUser !== null
}

function showAuthModal() {
  const authModal = document.getElementById("authModal")
  if (authModal) {
    authModal.style.display = "block"
  }
}

function getCurrentUser() {
  const userData = localStorage.getItem("marketplace_current_user")
  return userData ? JSON.parse(userData) : null
}

document.addEventListener("DOMContentLoaded", () => {
  // Solo inicializar si NO estamos en la página de admin
  if (!window.location.pathname.includes("admin.html")) {
    console.log("🚀 Inicializando aplicación principal...")
    initializeMainApp()
  }
})

function initializeMainApp() {
  console.log("📱 Inicializando aplicación principal...")
  loadArtworksFromStorage()
  loadRatingsFromStorage()
  renderArtworks()
  setupEventListeners()
  updateCartCount()
  loadUserPreferences()
  initializeTheme()
  setupMenuToggle()
  setupCategoryEvents()
  updateCategoryCounts()
  setupStorageListener()
  updateNavigation()
  loadCartFromStorage()
  updatePricingPlans() // Actualizar planes según el usuario
  console.log("✅ Aplicación principal inicializada")
}

function loadCartFromStorage() {
  const savedCart = localStorage.getItem("marketplace_cart")
  if (savedCart) {
    try {
      cart = JSON.parse(savedCart)
      updateCartCount()
      console.log(`🛒 Carrito cargado: ${cart.length} items`)
    } catch (error) {
      console.error("Error al cargar carrito:", error)
      cart = []
    }
  }
}

function saveCartToStorage() {
  localStorage.setItem("marketplace_cart", JSON.stringify(cart))
}

function loadArtworksFromStorage() {
  console.log("📂 Cargando obras desde localStorage...")
  // Cargar obras desde localStorage
  const savedArtworks = localStorage.getItem("marketplace_artworks")
  if (savedArtworks) {
    try {
      const parsedArtworks = JSON.parse(savedArtworks)
      artworks = parsedArtworks
      console.log(`✅ Cargadas ${artworks.length} obras desde localStorage`)
    } catch (error) {
      console.error("❌ Error al cargar obras desde localStorage:", error)
      // Usar datos de ejemplo si hay error
      initializeDefaultArtworks()
    }
  } else {
    // Datos de ejemplo si no existen obras
    console.log("📝 No hay obras guardadas, inicializando datos por defecto")
    initializeDefaultArtworks()
  }

  filteredArtworks = [...artworks]
}

function loadRatingsFromStorage() {
  // Cargar calificaciones desde localStorage
  const savedRatings = localStorage.getItem("artwork_ratings")
  if (savedRatings) {
    try {
      artworkRatings = JSON.parse(savedRatings)
    } catch (error) {
      console.error("Error al cargar calificaciones:", error)
      artworkRatings = {}
    }
  }
}

function saveRatingsToStorage() {
  localStorage.setItem("artwork_ratings", JSON.stringify(artworkRatings))
}

function initializeDefaultArtworks() {
  artworks = [
    {
      id: 1,
      title: "Cosmic Dreams",
      artist: "Sarah Johnson",
      description: "A vibrant digital artwork exploring themes of space and consciousness.",
      price: 45.0,
      category: "digital-art",
      rating: 4.8,
      reviews: 24,
      image: generatePlaceholderImage(),
      dateAdded: "2024-01-15",
    },
    {
      id: 2,
      title: "Urban Sketches Collection",
      artist: "Mike Chen",
      description: "Hand-drawn illustrations capturing the essence of city life.",
      price: 30.0,
      category: "illustration",
      rating: 4.6,
      reviews: 18,
      image: generatePlaceholderImage(),
      dateAdded: "2024-01-10",
    },
    {
      id: 3,
      title: "Nature Photography Bundle",
      artist: "Emma Davis",
      description: "High-resolution nature photographs perfect for any project.",
      price: 60.0,
      category: "photography",
      rating: 4.9,
      reviews: 32,
      image: generatePlaceholderImage(),
      dateAdded: "2024-01-20",
    },
    {
      id: 4,
      title: "Modern Web Template",
      artist: "Alex Rodriguez",
      description: "Responsive web template with modern design and clean code.",
      price: 25.0,
      category: "web-design",
      rating: 5.0,
      reviews: 1,
      image: generatePlaceholderImage(),
      dateAdded: "2024-01-25",
    },
  ]
  // Guardar datos iniciales
  localStorage.setItem("marketplace_artworks", JSON.stringify(artworks))
  console.log("✅ Inicializadas obras por defecto:", artworks)
}

function generatePlaceholderImage() {
  const canvas = document.createElement("canvas")
  canvas.width = 400
  canvas.height = 300
  const ctx = canvas.getContext("2d")

  // Crear gradiente aleatorio
  const gradient = ctx.createLinearGradient(0, 0, 400, 300)
  const color1 = `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`
  const color2 = `hsl(${Math.floor(Math.random() * 360)}, 70%, 40%)`

  gradient.addColorStop(0, color1)
  gradient.addColorStop(1, color2)

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 400, 300)

  // Agregar texto
  ctx.fillStyle = "white"
  ctx.font = "bold 24px Arial"
  ctx.textAlign = "center"
  ctx.fillText("Obra de Arte", 200, 150)

  return canvas.toDataURL()
}

function setupStorageListener() {
  console.log("🔄 Configurando listeners de sincronización...")

  // Escuchar cambios en localStorage para actualizaciones en tiempo real
  window.addEventListener("storage", (e) => {
    console.log("📡 Evento de storage detectado:", e.key)

    // Detectar eventos de obras nuevas/actualizadas
    if (
      e.key &&
      (e.key.startsWith("artwork_added_") ||
        e.key.startsWith("artwork_updated_") ||
        e.key.startsWith("marketplace_update_") ||
        e.key.startsWith("globex_sync_"))
    ) {
      try {
        const event = JSON.parse(e.newValue)
        console.log("🎨 Evento de obra procesado:", event.type, event.artwork?.title)

        if (event.type === "NEW_ARTWORK_ADDED") {
          loadArtworksFromStorage()
          renderArtworks()
          updateCategoryCounts()
          showNotification(`¡Nueva obra agregada: ${event.artwork.title}!`, "info")
        } else if (event.type === "ARTWORK_UPDATED") {
          loadArtworksFromStorage()
          renderArtworks()
          updateCategoryCounts()
          showNotification(`¡Obra actualizada: ${event.artwork.title}!`, "info")
        }
      } catch (error) {
        console.error("❌ Error procesando evento de obra:", error)
      }
    }

    // Detectar eventos de obras eliminadas
    if (e.key && e.key.startsWith("artwork_delete_")) {
      try {
        const event = JSON.parse(e.newValue)
        if (event.type === "ARTWORK_DELETED") {
          loadArtworksFromStorage()
          renderArtworks()
          updateCategoryCounts()
          showNotification("Una obra ha sido eliminada", "info")
        }
      } catch (error) {
        console.error("❌ Error procesando evento de obra eliminada:", error)
      }
    }

    // Detectar cambios directos en marketplace_artworks
    if (e.key === "marketplace_artworks") {
      console.log("🔄 Cambio directo en marketplace_artworks detectado")
      loadArtworksFromStorage()
      renderArtworks()
      updateCategoryCounts()
    }

    // Detectar cambios en el usuario actual
    if (e.key === "marketplace_current_user") {
      updateNavigation()
      updatePricingPlans()
    }
  })

  // Escuchar eventos personalizados en la misma pestaña
  window.addEventListener("artworkAdded", (e) => {
    console.log("🎨 Evento artworkAdded recibido:", e.detail.title)
    loadArtworksFromStorage()
    renderArtworks()
    updateCategoryCounts()
    showNotification(`¡Nueva obra agregada: ${e.detail.title}!`, "info")
  })

  window.addEventListener("artworkUpdated", (e) => {
    console.log("🎨 Evento artworkUpdated recibido:", e.detail.title)
    loadArtworksFromStorage()
    renderArtworks()
    updateCategoryCounts()
    showNotification(`¡Obra actualizada: ${e.detail.title}!`, "info")
  })

  window.addEventListener("artworkDeleted", (e) => {
    console.log("🗑️ Evento artworkDeleted recibido:", e.detail)
    loadArtworksFromStorage()
    renderArtworks()
    updateCategoryCounts()
    showNotification("Una obra ha sido eliminada", "info")
  })

  // Escuchar BroadcastChannel para comunicación entre pestañas
  const channel = new BroadcastChannel("globex_updates")
  channel.addEventListener("message", (event) => {
    console.log("📡 Mensaje recibido via BroadcastChannel:", event.data)

    if (event.data.type === "ARTWORK_UPDATE") {
      loadArtworksFromStorage()
      renderArtworks()
      updateCategoryCounts()

      const action = event.data.action === "added" ? "agregada" : "actualizada"
      showNotification(`¡Obra ${action}: ${event.data.artwork.title}!`, "info")
    }
  })

  // Verificar cambios periódicamente como respaldo
  let lastArtworksCount = artworks.length
  let lastArtworksString = JSON.stringify(artworks)

  setInterval(() => {
    const savedArtworks = localStorage.getItem("marketplace_artworks")
    if (savedArtworks && savedArtworks !== lastArtworksString) {
      console.log("🔄 Cambio detectado en verificación periódica")
      const currentArtworks = JSON.parse(savedArtworks)
      if (currentArtworks.length !== lastArtworksCount || JSON.stringify(currentArtworks) !== lastArtworksString) {
        loadArtworksFromStorage()
        renderArtworks()
        updateCategoryCounts()
        lastArtworksCount = artworks.length
        lastArtworksString = JSON.stringify(artworks)
      }
    }
  }, 2000) // Verificar cada 2 segundos

  console.log("✅ Listeners de sincronización configurados")
}

// SISTEMA DE CALIFICACIÓN DINÁMICO
function rateArtwork(artworkId, rating) {
  if (rating < 1 || rating > 5) {
    showNotification("La calificación debe estar entre 1 y 5 estrellas", "error")
    return
  }

  // Obtener calificaciones existentes para esta obra
  if (!artworkRatings[artworkId]) {
    artworkRatings[artworkId] = []
  }

  // Agregar nueva calificación
  artworkRatings[artworkId].push({
    rating: rating,
    timestamp: Date.now(),
    userId: getCurrentUserId(), // Función para obtener ID del usuario actual
  })

  // Calcular nuevo promedio
  const ratings = artworkRatings[artworkId]
  const average = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
  const reviewCount = ratings.length

  // Actualizar la obra en el array
  const artworkIndex = artworks.findIndex((a) => a.id === artworkId)
  if (artworkIndex !== -1) {
    artworks[artworkIndex].rating = Math.round(average * 10) / 10 // Redondear a 1 decimal
    artworks[artworkIndex].reviews = reviewCount

    // Actualizar también en localStorage
    localStorage.setItem("marketplace_artworks", JSON.stringify(artworks))
  }

  // Guardar calificaciones
  saveRatingsToStorage()

  // Actualizar interfaz
  renderArtworks()

  showNotification(`¡Gracias por calificar con ${rating} estrella${rating !== 1 ? "s" : ""}!`)
}

function getCurrentUserId() {
  // Simular ID de usuario - en una app real vendría del sistema de auth
  let userId = localStorage.getItem("user_id")
  if (!userId) {
    userId = "user_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)
    localStorage.setItem("user_id", userId)
  }
  return userId
}

function createRatingStars(artworkId, currentRating = 0, interactive = true) {
  const starsContainer = document.createElement("div")
  starsContainer.className = "rating-stars"
  starsContainer.style.cssText = `
    display: flex;
    align-items: center;
    gap: 2px;
    margin: 5px 0;
  `

  for (let i = 1; i <= 5; i++) {
    const star = document.createElement("span")
    star.className = "star"
    star.innerHTML = "★"
    star.style.cssText = `
      font-size: 1.2rem;
      color: ${i <= currentRating ? "#ffd700" : "#ddd"};
      cursor: ${interactive ? "pointer" : "default"};
      transition: all 0.2s ease;
    `

    if (interactive) {
      star.addEventListener("mouseenter", () => {
        // Highlight stars on hover
        const stars = starsContainer.querySelectorAll(".star")
        stars.forEach((s, index) => {
          s.style.color = index < i ? "#ffd700" : "#ddd"
        })
      })

      star.addEventListener("mouseleave", () => {
        // Reset to current rating
        const stars = starsContainer.querySelectorAll(".star")
        stars.forEach((s, index) => {
          s.style.color = index < currentRating ? "#ffd700" : "#ddd"
        })
      })

      star.addEventListener("click", () => {
        rateArtwork(artworkId, i)
      })
    }

    starsContainer.appendChild(star)
  }

  if (interactive) {
    const ratingText = document.createElement("span")
    ratingText.style.cssText = `
      margin-left: 8px;
      font-size: 0.9rem;
      color: #666;
    `
    ratingText.textContent = "Haz clic para calificar"
    starsContainer.appendChild(ratingText)
  }

  return starsContainer
}

function setupMenuToggle() {
  const menuToggle = document.querySelector(".menu-toggle")
  const navLinks = document.querySelector(".nav-links")

  if (menuToggle) {
    menuToggle.addEventListener("click", function () {
      navLinks.classList.toggle("active")

      // Animar las barras del menú hamburguesa
      const bars = this.querySelectorAll("span")
      if (navLinks.classList.contains("active")) {
        bars[0].style.transform = "rotate(45deg) translate(5px, 5px)"
        bars[1].style.opacity = "0"
        bars[2].style.transform = "rotate(-45deg) translate(5px, -5px)"
      } else {
        bars[0].style.transform = "none"
        bars[1].style.opacity = "1"
        bars[2].style.transform = "none"
      }
    })
  }

  // Cerrar menú al hacer clic en un enlace
  document.querySelectorAll(".nav-links .nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      if (navLinks && navLinks.classList.contains("active")) {
        navLinks.classList.remove("active")

        // Restaurar barras del menú
        if (menuToggle) {
          const bars = menuToggle.querySelectorAll("span")
          bars[0].style.transform = "none"
          bars[1].style.opacity = "1"
          bars[2].style.transform = "none"
        }
      }
    })
  })
}

function setupEventListeners() {
  const searchInput = document.getElementById("searchInput")
  const sortFilter = document.getElementById("sortFilter")

  if (searchInput) {
    searchInput.addEventListener("input", filterArtworks)
  }

  if (sortFilter) {
    sortFilter.addEventListener("change", filterArtworks)
  }

  // Configurar eventos de modales
  const artworkModal = document.getElementById("artworkModal")
  const cartModal = document.getElementById("cartModal")

  if (artworkModal) {
    artworkModal.addEventListener("click", function (e) {
      if (e.target === this) closeModal()
    })
  }

  if (cartModal) {
    cartModal.addEventListener("click", function (e) {
      if (e.target === this) closeCart()
    })
  }

  // Configurar toggle de tema
  const themeToggle = document.getElementById("themeToggle")
  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme)
  }

  // Configurar toggle de vista
  const gridViewBtn = document.getElementById("gridViewBtn")
  const listViewBtn = document.getElementById("listViewBtn")

  if (gridViewBtn && listViewBtn) {
    gridViewBtn.addEventListener("click", () => {
      setView("grid")
    })

    listViewBtn.addEventListener("click", () => {
      setView("list")
    })
  }

  // Configurar botón de notificaciones
  const notificationToggle = document.getElementById("notificationToggle")
  if (notificationToggle) {
    notificationToggle.addEventListener("click", toggleNotifications)
  }

  // Configurar cierre de modales
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", function (e) {
      if (e.target === this) {
        this.style.display = "none"
      }
    })
  })

  // Check for admin access
  document.addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.shiftKey && event.key === "A") {
      isAdmin = !isAdmin
      updateNavigation()
      showNotification(isAdmin ? "¡Modo administrador activado!" : "Modo administrador desactivado!", "info")
    }
  })
}

// Inicializar tema
function initializeTheme() {
  const savedTheme = localStorage.getItem("theme")
  if (savedTheme === "light") {
    document.body.classList.add("light-theme")
    updateThemeIcon("light")
  } else {
    updateThemeIcon("dark")
  }
}

// Cambiar tema
function toggleTheme() {
  const isDarkTheme = !document.body.classList.contains("light-theme")

  if (isDarkTheme) {
    document.body.classList.add("light-theme")
    localStorage.setItem("theme", "light")
    updateThemeIcon("light")
  } else {
    document.body.classList.remove("light-theme")
    localStorage.setItem("theme", "dark")
    updateThemeIcon("dark")
  }
}

// Actualizar icono del toggle de tema
function updateThemeIcon(theme) {
  const themeToggle = document.getElementById("themeToggle")
  if (themeToggle) {
    themeToggle.innerHTML = theme === "light" ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>'
  }
}

// Cambiar vista (grid o list)
function setView(view) {
  currentView = view
  localStorage.setItem("view", view)

  const gridViewBtn = document.getElementById("gridViewBtn")
  const listViewBtn = document.getElementById("listViewBtn")

  if (gridViewBtn && listViewBtn) {
    if (view === "grid") {
      gridViewBtn.classList.add("active")
      listViewBtn.classList.remove("active")
    } else {
      gridViewBtn.classList.remove("active")
      listViewBtn.classList.add("active")
    }
  }

  renderArtworks()
}

// Cargar preferencias del usuario
function loadUserPreferences() {
  // Cargar vista preferida
  const savedView = localStorage.getItem("view")
  if (savedView) {
    setView(savedView)
  }

  // Cargar lista de deseos
  const savedWishlist = localStorage.getItem("wishlist")
  if (savedWishlist) {
    wishlist = JSON.parse(savedWishlist)
  }

  // Cargar obras vistas recientemente
  const savedViewedArtworks = localStorage.getItem("viewedArtworks")
  if (savedViewedArtworks) {
    viewedArtworks = JSON.parse(savedViewedArtworks)
  }

  // Cargar filtros guardados
  const savedFiltersList = localStorage.getItem("savedFilters")
  if (savedFiltersList) {
    savedFilters = JSON.parse(savedFiltersList)
    renderSavedFilters()
  }
}

// Modificar la función filterArtworks
function filterArtworks() {
  const searchInput = document.getElementById("searchInput")
  const sortFilter = document.getElementById("sortFilter")

  if (!searchInput || !sortFilter) return

  const searchTerm = searchInput.value.toLowerCase()
  const sortBy = sortFilter.value

  // Filtrar por término de búsqueda
  filteredArtworks = artworks.filter((artwork) => {
    return (
      artwork.title.toLowerCase().includes(searchTerm) ||
      artwork.artist.toLowerCase().includes(searchTerm) ||
      artwork.description.toLowerCase().includes(searchTerm)
    )
  })

  // Aplicar ordenamiento
  sortArtworks(sortBy)

  // Renderizar obras
  renderArtworks()
}

// Función para ordenar las obras
function sortArtworks(sortBy) {
  switch (sortBy) {
    case "newest":
      filteredArtworks.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
      break
    case "price-low":
      filteredArtworks.sort((a, b) => a.price - b.price)
      break
    case "price-high":
      filteredArtworks.sort((a, b) => b.price - a.price)
      break
    case "rating":
      filteredArtworks.sort((a, b) => b.rating - a.rating)
      break
    default: // popularidad
      filteredArtworks.sort((a, b) => b.reviews - a.reviews)
  }
}

function renderArtworks() {
  console.log("🎨 Renderizando obras:", artworks.length)
  const grid = document.getElementById("galleryGrid")
  if (!grid) return

  grid.innerHTML = ""

  // Cambiar la clase del contenedor según la vista
  if (currentView === "grid") {
    grid.className = "gallery-grid"
  } else {
    grid.className = "gallery-list"
  }

  // Renderizar obras recientes si existen
  if (viewedArtworks.length > 0) {
    renderRecentlyViewed()
  }

  // Renderizar obras filtradas
  if (filteredArtworks.length === 0) {
    grid.innerHTML = `
      <div style="text-align: center; padding: 3rem 0; grid-column: 1 / -1;">
        <i class="fas fa-search" style="font-size: 3rem; color: #666; margin-bottom: 1rem;"></i>
        <h3>No se encontraron resultados</h3>
        <p>Intenta con otros términos de búsqueda o filtros.</p>
      </div>
    `
    return
  }

  filteredArtworks.forEach((artwork) => {
    const card = currentView === "grid" ? createArtworkCard(artwork) : createArtworkListItem(artwork)
    grid.appendChild(card)
  })
}

function createArtworkCard(artwork) {
  const isInWishlist = wishlist.some((item) => item.id === artwork.id)
  const card = document.createElement("div")
  card.className = "artwork-card"

  // Usar imagen real si existe, sino usar placeholder
  const imageContent =
    artwork.image && (artwork.image.startsWith("data:") || artwork.image.startsWith("blob:"))
      ? `<img src="${artwork.image}" alt="${artwork.title}" style="width: 100%; height: 100%; object-fit: cover;">`
      : `<div style="display: flex; align-items: center; justify-content: center; height: 100%; background: linear-gradient(135deg, #${Math.floor(Math.random() * 16777215).toString(16)}, #${Math.floor(Math.random() * 16777215).toString(16)}); color: white; font-weight: 600; text-align: center; padding: 20px;">${artwork.title}</div>`

  card.innerHTML = `
    <button class="wishlist-btn ${isInWishlist ? "active" : ""}" onclick="toggleWishlist(${artwork.id}, event)">
      <i class="fas ${isInWishlist ? "fa-heart" : "fa-heart"}"></i>
    </button>
    <div class="artwork-image" style="height: 220px; overflow: hidden; border-radius: 15px 15px 0 0;">
      ${imageContent}
    </div>
    <div class="artwork-info">
      <h3 class="artwork-title">${artwork.title}</h3>
      <p class="artwork-artist">por ${artwork.artist}</p>
      <p class="artwork-description">${artwork.description}</p>
      
      <!-- Sistema de calificación interactivo -->
      <div class="artwork-rating" id="rating-${artwork.id}" style="margin: 10px 0;">
        <div style="display: flex; align-items: center; gap: 5px; margin-bottom: 5px;">
          ${createStarRating(artwork.id, 0)}
        </div>
        <small style="color: #ccc; font-size: 0.8rem;">Haz clic para calificar</small>
      </div>
      
      <div class="artwork-footer">
        <span class="artwork-price">$${artwork.price.toFixed(2)}</span>
        <div class="rating-display" style="display: flex; align-items: center; gap: 5px;">
          ${artwork.rating > 0 ? `<span style="color: #ffd700;">⭐</span> <span style="color: #26c6da; font-weight: 600;">${artwork.rating.toFixed(1)}</span> <span style="color: #ccc; font-size: 0.8rem;">(${artwork.reviews})</span>` : '<span style="color: #ccc; font-size: 0.8rem;">Sin calificaciones</span>'}
        </div>
      </div>
      <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
        <button class="btn btn-primary" style="flex: 1;" onclick="addToCart(${artwork.id})">
          <i class="fas fa-cart-plus"></i> Agregar al Carrito
        </button>
        <button class="btn btn-secondary" onclick="viewArtwork(${artwork.id})">
          <i class="fas fa-eye"></i> Ver
        </button>
      </div>
    </div>
  `

  return card
}

// Función auxiliar para crear estrellas de calificación
function createStarRating(artworkId, currentRating) {
  let starsHTML = ""
  for (let i = 1; i <= 5; i++) {
    starsHTML += `<span class="star" data-rating="${i}" data-artwork="${artworkId}" 
      style="font-size: 1.2rem; color: ${i <= currentRating ? "#ffd700" : "#ddd"}; cursor: pointer; transition: all 0.2s ease;"
      onmouseover="highlightStars(${artworkId}, ${i})" 
      onmouseout="resetStars(${artworkId}, ${currentRating})"
      onclick="rateArtwork(${artworkId}, ${i})">★</span>`
  }
  return starsHTML
}

// Funciones para manejar las estrellas
function highlightStars(artworkId, rating) {
  const stars = document.querySelectorAll(`[data-artwork="${artworkId}"]`)
  stars.forEach((star, index) => {
    star.style.color = index < rating ? "#ffd700" : "#ddd"
  })
}

function resetStars(artworkId, currentRating) {
  const stars = document.querySelectorAll(`[data-artwork="${artworkId}"]`)
  stars.forEach((star, index) => {
    star.style.color = index < currentRating ? "#ffd700" : "#ddd"
  })
}

function createArtworkListItem(artwork) {
  const isInWishlist = wishlist.some((item) => item.id === artwork.id)
  const listItem = document.createElement("div")
  listItem.className = "artwork-list-item"

  const imageContent =
    artwork.image && (artwork.image.startsWith("data:") || artwork.image.startsWith("blob:"))
      ? `<img src="${artwork.image}" alt="${artwork.title}" style="width: 100%; height: 100%; object-fit: cover;">`
      : `<div style="display: flex; align-items: center; justify-content: center; height: 100%; background: linear-gradient(135deg, #${Math.floor(Math.random() * 16777215).toString(16)}, #${Math.floor(Math.random() * 16777215).toString(16)}); color: white; font-weight: 600; text-align: center; padding: 20px;">${artwork.title}</div>`

  listItem.innerHTML = `
    <button class="wishlist-btn ${isInWishlist ? "active" : ""}" onclick="toggleWishlist(${artwork.id}, event)">
      <i class="fas ${isInWishlist ? "fa-heart" : "fa-heart"}"></i>
    </button>
    <div class="artwork-list-image" style="width: 150px; height: 100px; overflow: hidden; border-radius: 8px;">
      ${imageContent}
    </div>
    <div class="artwork-list-info">
      <h3 class="artwork-title">${artwork.title}</h3>
      <p class="artwork-artist">por ${artwork.artist}</p>
      <p class="artwork-description">${artwork.description}</p>
      <div class="artwork-rating-list" id="rating-list-${artwork.id}">
        <!-- Rating stars will be inserted here -->
      </div>
      <div class="artwork-list-footer">
        <div>
          <span class="artwork-price">$${artwork.price.toFixed(2)}</span>
          <div class="rating-display">
            ${artwork.rating > 0 ? `⭐ ${artwork.rating.toFixed(1)} (${artwork.reviews})` : "Sin calificaciones"}
          </div>
        </div>
        <div class="artwork-list-actions">
          <button class="btn btn-primary" onclick="addToCart(${artwork.id})">
            <i class="fas fa-cart-plus"></i> Agregar al Carrito
          </button>
          <button class="btn btn-secondary" onclick="viewArtwork(${artwork.id})">
            <i class="fas fa-eye"></i> Ver
          </button>
          <button class="btn btn-secondary" onclick="addToComparison(${artwork.id})">
            <i class="fas fa-exchange-alt"></i> Comparar
          </button>
        </div>
      </div>
    </div>
  `

  // Agregar sistema de calificación interactivo
  setTimeout(() => {
    const ratingContainer = document.getElementById(`rating-list-${artwork.id}`)
    if (ratingContainer) {
      const ratingStars = createRatingStars(artwork.id, 0, true)
      ratingContainer.appendChild(ratingStars)
    }
  }, 0)

  return listItem
}

function renderRecentlyViewed() {
  // Verificar si ya existe la sección
  let recentSection = document.querySelector(".recently-viewed")

  if (!recentSection) {
    // Crear la sección si no existe
    recentSection = document.createElement("div")
    recentSection.className = "recently-viewed"
    recentSection.innerHTML = `
      <h3>Visto recientemente</h3>
      <div class="recent-items-scroll">
        <div class="recent-items" id="recentItems"></div>
      </div>
    `

    // Insertar antes de la galería
    const galleryGrid = document.getElementById("galleryGrid")
    if (galleryGrid && galleryGrid.parentNode) {
      galleryGrid.parentNode.insertBefore(recentSection, galleryGrid)
    }
  }

  // Llenar con las obras vistas recientemente (máximo 5)
  const recentItems = document.getElementById("recentItems")

  if (recentItems) {
    recentItems.innerHTML = ""

    // Mostrar solo las últimas 5 obras vistas
    const recentArtworks = viewedArtworks.slice(0, 5)

    recentArtworks.forEach((artworkId) => {
      const artwork = artworks.find((a) => a.id === artworkId)
      if (artwork) {
        const item = document.createElement("div")
        item.className = "recent-item"
        item.onclick = () => viewArtwork(artwork.id)

        const imageContent =
          artwork.image && (artwork.image.startsWith("data:") || artwork.image.startsWith("blob:"))
            ? `<img src="${artwork.image}" alt="${artwork.title}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">`
            : `<div style="display: flex; align-items: center; justify-content: center; height: 100%; background: linear-gradient(135deg, #${Math.floor(Math.random() * 16777215).toString(16)}, #${Math.floor(Math.random() * 16777215).toString(16)}); color: white; font-weight: 600; text-align: center; padding: 10px; border-radius: 8px; font-size: 0.8rem;">${artwork.title}</div>`

        item.innerHTML = `
          <div class="recent-item-image" style="width: 120px; height: 80px; overflow: hidden;">
            ${imageContent}
          </div>
          <div class="recent-item-title" style="margin-top: 5px; font-size: 0.8rem; text-align: center;">${artwork.title}</div>
        `
        recentItems.appendChild(item)
      }
    })
  }
}

function viewArtwork(id) {
  const artwork = artworks.find((a) => a.id === id)
  if (!artwork) return

  // Añadir a obras vistas recientemente
  addToRecentlyViewed(id)

  const modal = document.getElementById("artworkModal")
  const content = document.getElementById("modalContent")

  if (!modal || !content) return

  const imageContent =
    artwork.image && (artwork.image.startsWith("data:") || artwork.image.startsWith("blob:"))
      ? `<img src="${artwork.image}" alt="${artwork.title}" style="width: 100%; height: 100%; object-fit: cover;">`
      : `<div style="display: flex; align-items: center; justify-content: center; height: 100%; background: linear-gradient(135deg, #${Math.floor(Math.random() * 16777215).toString(16)}, #${Math.floor(Math.random() * 16777215).toString(16)}); color: white; font-weight: 600; text-align: center; padding: 20px;">${artwork.title}</div>`

  content.innerHTML = `
    <div class="artwork-image" style="height: 300px; margin-bottom: 1.5rem; overflow: hidden; border-radius: 12px;">
      ${imageContent}
    </div>
    <h2>${artwork.title}</h2>
    <p style="color: #26c6da; font-weight: 600; margin: 0.5rem 0;">por ${artwork.artist}</p>
    <div class="modal-rating" id="modal-rating-${artwork.id}" style="margin-bottom: 1rem;">
      <!-- Rating stars will be inserted here -->
    </div>
    <div style="margin-bottom: 1rem;">
      ${artwork.rating > 0 ? `⭐ ${artwork.rating.toFixed(1)} (${artwork.reviews} ${artwork.reviews === 1 ? "reseña" : "reseñas"})` : "Sin calificaciones aún - ¡Sé el primero en calificar!"}
    </div>
    <p style="margin-bottom: 1.5rem; line-height: 1.6;">${artwork.description}</p>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
      <span style="font-size: 1.5rem; font-weight: 800; color: #26c6da;">$${artwork.price.toFixed(2)}</span>
      <span style="color: #666;">Categoría: ${artwork.category.replace("-", " ").toUpperCase()}</span>
    </div>
    <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem;">
      <button class="btn btn-primary" style="flex: 1;" onclick="addToCart(${artwork.id}); closeModal();">
        <i class="fas fa-cart-plus"></i> Agregar al Carrito
      </button>
      <button class="btn btn-secondary" onclick="toggleWishlist(${artwork.id}); closeModal();">
        <i class="fas ${wishlist.some((item) => item.id === artwork.id) ? "fa-heart" : "fa-heart"}"></i> 
        ${wishlist.some((item) => item.id === artwork.id) ? "Quitar de Favoritos" : "Añadir a Favoritos"}
      </button>
      <button class="btn btn-secondary" onclick="addToComparison(${artwork.id})">
        <i class="fas fa-exchange-alt"></i> Comparar
      </button>
    </div>
  `

  // Agregar sistema de calificación en el modal
  setTimeout(() => {
    const modalRatingContainer = document.getElementById(`modal-rating-${artwork.id}`)
    if (modalRatingContainer) {
      const ratingTitle = document.createElement("h4")
      ratingTitle.textContent = "Califica esta obra:"
      ratingTitle.style.marginBottom = "10px"
      modalRatingContainer.appendChild(ratingTitle)

      const ratingStars = createRatingStars(artwork.id, 0, true)
      modalRatingContainer.appendChild(ratingStars)
    }
  }, 0)

  modal.style.display = "block"
}

function addToRecentlyViewed(id) {
  // Eliminar si ya existe
  viewedArtworks = viewedArtworks.filter((artworkId) => artworkId !== id)

  // Añadir al principio
  viewedArtworks.unshift(id)

  // Limitar a 10 elementos
  if (viewedArtworks.length > 10) {
    viewedArtworks = viewedArtworks.slice(0, 10)
  }

  // Guardar en localStorage
  localStorage.setItem("viewedArtworks", JSON.stringify(viewedArtworks))
}

function toggleWishlist(id, event) {
  // Evitar que el evento se propague si viene de un evento
  if (event) {
    event.stopPropagation()
  }

  const artwork = artworks.find((a) => a.id === id)
  if (!artwork) return

  const index = wishlist.findIndex((item) => item.id === id)

  if (index !== -1) {
    // Eliminar de la lista de deseos
    wishlist.splice(index, 1)
    showNotification(`${artwork.title} eliminado de favoritos`)
  } else {
    // Añadir a la lista de deseos
    wishlist.push(artwork)
    showNotification(`${artwork.title} añadido a favoritos`)
  }

  // Guardar en localStorage
  localStorage.setItem("wishlist", JSON.stringify(wishlist))

  // Actualizar la interfaz
  renderArtworks()
}

function addToComparison(id) {
  const artwork = artworks.find((a) => a.id === id)
  if (!artwork) return

  // Verificar si ya está en la lista de comparación
  if (comparisonList.some((item) => item.id === id)) {
    showNotification(`${artwork.title} ya está en la lista de comparación`)
    return
  }

  // Limitar a 3 elementos
  if (comparisonList.length >= 3) {
    showNotification("Solo puedes comparar hasta 3 obras a la vez", "error")
    return
  }

  // Añadir a la lista de comparación
  comparisonList.push(artwork)
  showNotification(`${artwork.title} añadido a la comparación`)

  // Actualizar contador de comparación
  updateComparisonCount()
}

function updateComparisonCount() {
  const compareBtn = document.getElementById("compareBtn")
  if (compareBtn) {
    compareBtn.innerHTML = `<i class="fas fa-exchange-alt"></i> Comparar (${comparisonList.length})`

    // Mostrar u ocultar el botón según si hay elementos para comparar
    if (comparisonList.length > 0) {
      compareBtn.style.display = "flex"
    } else {
      compareBtn.style.display = "none"
    }
  }
}

function toggleNotifications() {
  const notificationCenter = document.getElementById("notificationCenter")
  if (notificationCenter) {
    notificationCenter.classList.toggle("active")

    // Marcar todas como leídas cuando se abre
    if (notificationCenter.classList.contains("active")) {
      markAllNotificationsAsRead()
    }
  }
}

function markAllNotificationsAsRead() {
  notifications.forEach((notification) => {
    notification.read = true
  })

  // Actualizar contador
  updateNotificationCount()
}

function updateNotificationCount() {
  const unreadCount = notifications.filter((notification) => !notification.read).length
  const badge = document.getElementById("notificationBadge")

  if (badge) {
    if (unreadCount > 0) {
      badge.textContent = unreadCount
      badge.style.display = "flex"
    } else {
      badge.style.display = "none"
    }
  }
}

function renderSavedFilters() {
  const savedFiltersList = document.getElementById("savedFiltersList")
  if (!savedFiltersList) return

  savedFiltersList.innerHTML = ""

  savedFilters.forEach((filter, index) => {
    const filterElement = document.createElement("div")
    filterElement.className = "saved-filter"
    filterElement.innerHTML = `
      <span>${filter.name}</span>
      <i class="fas fa-times" onclick="deleteSavedFilter(${index}, event)"></i>
    `
    filterElement.addEventListener("click", (e) => {
      if (e.target.tagName !== "I") {
        applySavedFilter(filter)
      }
    })

    savedFiltersList.appendChild(filterElement)
  })
}

function closeModal() {
  const modal = document.getElementById("artworkModal")
  if (modal) {
    modal.style.display = "none"
  }
}

function addToCart(id) {
  const artwork = artworks.find((a) => a.id === id)
  if (!artwork) return

  const existingItem = cart.find((item) => item.id === id)
  if (existingItem) {
    existingItem.quantity += 1
  } else {
    cart.push({ ...artwork, quantity: 1 })
  }

  saveCartToStorage()
  updateCartCount()
  showNotification(`${artwork.title} agregado al carrito!`)
}

function updateCartCount() {
  const cartCountElement = document.getElementById("cartCount")
  if (cartCountElement) {
    const count = cart.reduce((total, item) => total + item.quantity, 0)
    cartCountElement.textContent = count
  }
}

function toggleCart() {
  const modal = document.getElementById("cartModal")
  const content = document.getElementById("cartContent")

  if (!modal || !content) return

  if (cart.length === 0) {
    content.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">Tu carrito está vacío</p>'
  } else {
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

    let cartHTML = '<div class="cart-modal-content">'

    // Mostrar cada item del carrito
    cartHTML += cart
      .map(
        (item) => `
          <div class="cart-item">
            <div class="cart-item-info">
              <h4>${item.title}</h4>
              <p style="color: #666;">por ${item.artist}</p>
              <p style="color: #26c6da; font-weight: 600;">$${item.price.toFixed(2)}</p>
            </div>
            <div class="cart-item-actions">
              <button class="cart-quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
              <span>${item.quantity}</span>
              <button class="cart-quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
              <button class="cart-remove-btn" onclick="removeFromCart(${item.id})">×</button>
            </div>
          </div>
        `,
      )
      .join("")

    cartHTML += "</div>"

    // Mostrar total y botón de checkout
    cartHTML += `
      <div class="cart-total">
        Total: $${total.toFixed(2)}
      </div>
      <div style="margin-top: 2rem; text-align: center;">
        <button class="btn btn-primary" onclick="proceedToCheckout()">
          <i class="fas fa-credit-card"></i> Proceder al Pago
        </button>
      </div>
    `

    content.innerHTML = cartHTML
  }

  modal.style.display = "block"
}

function closeCart() {
  const modal = document.getElementById("cartModal")
  if (modal) {
    modal.style.display = "none"
  }
}

function updateQuantity(id, newQuantity) {
  if (newQuantity <= 0) {
    removeFromCart(id)
    return
  }

  const item = cart.find((item) => item.id === id)
  if (item) {
    item.quantity = newQuantity
    saveCartToStorage()
    updateCartCount()
    toggleCart() // Refrescar la vista del carrito
  }
}

function removeFromCart(id) {
  cart = cart.filter((item) => item.id !== id)
  saveCartToStorage()
  updateCartCount()
  toggleCart() // Refrescar la vista del carrito
}

function proceedToCheckout() {
  if (cart.length === 0) {
    showNotification("¡Tu carrito está vacío!", "error")
    return
  }

  // Verificar si el usuario está logueado
  if (!isUserLoggedIn()) {
    showNotification("Debes iniciar sesión para realizar una compra", "error")
    closeCart()
    showAuthModal()
    return
  }

  closeCart() // Cierra el modal del carrito
  showCardPaymentModal()
}

function showCardPaymentModal() {
  // Crear modal de pago con tarjeta si no existe
  let paymentModal = document.getElementById("cardPaymentModal")

  if (!paymentModal) {
    paymentModal = document.createElement("div")
    paymentModal.id = "cardPaymentModal"
    paymentModal.className = "modal"
    paymentModal.innerHTML = `
      <div class="modal-content" style="max-width: 500px;">
        <button class="close-btn" onclick="closeCardPaymentModal()">&times;</button>
        <div class="payment-header">
          <h2><i class="fas fa-credit-card"></i> Pago con Tarjeta</h2>
          <p>Completa los datos de tu tarjeta para finalizar la compra</p>
        </div>
        
        <div class="payment-summary">
          <h3>Resumen de compra</h3>
          <div id="paymentSummaryItems"></div>
          <div class="payment-total">
            <strong>Total: $<span id="paymentTotal">0.00</span></strong>
          </div>
        </div>

        <form id="cardPaymentForm" class="card-payment-form">
          <div class="form-group">
            <label class="form-label">
              <i class="fas fa-credit-card"></i> Número de tarjeta
            </label>
            <input type="text" id="cardNumber" class="form-input" placeholder="1234 5678 9012 3456" maxlength="19" required>
            <div class="card-icons">
              <i class="fab fa-cc-visa"></i>
              <i class="fab fa-cc-mastercard"></i>
              <i class="fab fa-cc-amex"></i>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-calendar"></i> Fecha de vencimiento
              </label>
              <input type="text" id="cardExpiry" class="form-input" placeholder="MM/AA" maxlength="5" required>
            </div>
            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-lock"></i> CVV
              </label>
              <input type="text" id="cardCvv" class="form-input" placeholder="123" maxlength="4" required>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">
              <i class="fas fa-user"></i> Nombre del titular
            </label>
            <input type="text" id="cardHolder" class="form-input" placeholder="Nombre como aparece en la tarjeta" required>
          </div>

          <div class="form-group">
            <label class="form-label">
              <i class="fas fa-envelope"></i> Email de confirmación
            </label>
            <input type="email" id="confirmEmail" class="form-input" placeholder="tu@email.com" required>
          </div>

          <div class="security-info">
            <i class="fas fa-shield-alt"></i>
            <span>Tu información está protegida con encriptación SSL de 256 bits</span>
          </div>

          <button type="submit" class="btn btn-primary payment-btn">
            <i class="fas fa-lock"></i> Pagar Ahora - $<span id="paymentBtnTotal">0.00</span>
          </button>
        </form>
      </div>
    `
    document.body.appendChild(paymentModal)

    // Configurar eventos del formulario
    setupCardPaymentForm()
  }

  // Llenar resumen de compra
  fillPaymentSummary()

  // Mostrar modal
  paymentModal.style.display = "block"
}

function fillPaymentSummary() {
  const summaryItems = document.getElementById("paymentSummaryItems")
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  if (summaryItems) {
    summaryItems.innerHTML = cart
      .map(
        (item) => `
      <div class="summary-item">
        <span>${item.title} x${item.quantity}</span>
        <span>$${(item.price * item.quantity).toFixed(2)}</span>
      </div>
    `,
      )
      .join("")
  }

  // Actualizar totales
  document.getElementById("paymentTotal").textContent = total.toFixed(2)
  document.getElementById("paymentBtnTotal").textContent = total.toFixed(2)
}

function setupCardPaymentForm() {
  const form = document.getElementById("cardPaymentForm")
  const cardNumber = document.getElementById("cardNumber")
  const cardExpiry = document.getElementById("cardExpiry")
  const cardCvv = document.getElementById("cardCvv")

  // Formatear número de tarjeta
  cardNumber.addEventListener("input", (e) => {
    const value = e.target.value.replace(/\s/g, "").replace(/[^0-9]/gi, "")
    const formattedValue = value.match(/.{1,4}/g)?.join(" ") || value
    e.target.value = formattedValue
  })

  // Formatear fecha de vencimiento
  cardExpiry.addEventListener("input", (e) => {
    let value = e.target.value.replace(/\D/g, "")
    if (value.length >= 2) {
      value = value.substring(0, 2) + "/" + value.substring(2, 4)
    }
    e.target.value = value
  })

  // Solo números en CVV
  cardCvv.addEventListener("input", (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, "")
  })

  // Manejar envío del formulario
  form.addEventListener("submit", handleCardPayment)
}

function handleCardPayment(e) {
  e.preventDefault()

  const formData = new FormData(e.target)
  const cardNumber = document.getElementById("cardNumber").value
  const cardExpiry = document.getElementById("cardExpiry").value
  const cardCvv = document.getElementById("cardCvv").value
  const cardHolder = document.getElementById("cardHolder").value
  const confirmEmail = document.getElementById("confirmEmail").value

  // Validar formulario
  if (!validateCardForm(cardNumber, cardExpiry, cardCvv, cardHolder, confirmEmail)) {
    return
  }

  // Simular procesamiento de pago
  const submitBtn = e.target.querySelector('button[type="submit"]')
  const originalText = submitBtn.innerHTML

  submitBtn.disabled = true
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando pago...'

  // Simular delay de procesamiento
  setTimeout(() => {
    const order = processCardPayment(cardNumber, cardExpiry, cardCvv, cardHolder, confirmEmail)

    if (order) {
      closeCardPaymentModal()
      showPaymentSuccess(order)
      cart = []
      saveCartToStorage()
      updateCartCount()
    }

    submitBtn.disabled = false
    submitBtn.innerHTML = originalText
  }, 3000)
}

function validateCardForm(cardNumber, cardExpiry, cardCvv, cardHolder, confirmEmail) {
  // Validar número de tarjeta (Luhn algorithm simplificado)
  const cleanCardNumber = cardNumber.replace(/\s/g, "")
  if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
    showNotification("Número de tarjeta inválido", "error")
    return false
  }

  // Validar fecha de vencimiento
  const [month, year] = cardExpiry.split("/")
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear() % 100
  const currentMonth = currentDate.getMonth() + 1

  if (!month || !year || month < 1 || month > 12) {
    showNotification("Fecha de vencimiento inválida", "error")
    return false
  }

  if (
    Number.parseInt(year) < currentYear ||
    (Number.parseInt(year) === currentYear && Number.parseInt(month) < currentMonth)
  ) {
    showNotification("La tarjeta está vencida", "error")
    return false
  }

  // Validar CVV
  if (cardCvv.length < 3 || cardCvv.length > 4) {
    showNotification("CVV inválido", "error")
    return false
  }

  // Validar nombre del titular
  if (cardHolder.trim().length < 2) {
    showNotification("Nombre del titular requerido", "error")
    return false
  }

  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(confirmEmail)) {
    showNotification("Email inválido", "error")
    return false
  }

  return true
}

function processCardPayment(cardNumber, cardExpiry, cardCvv, cardHolder, confirmEmail) {
  const user = getCurrentUser()
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // Verificar si es una suscripción
  const isSubscription = cart.length === 1 && cart[0].planType

  // Crear orden
  const order = {
    id: Date.now(),
    orderNumber: isSubscription ? `SUB-${Date.now()}` : `ORD-${Date.now()}`,
    userId: user?.id || "guest",
    userInfo: {
      name: user?.name || cardHolder,
      email: confirmEmail,
    },
    items: cart.map((item) => ({
      id: item.id,
      title: item.title,
      artist: item.artist,
      price: item.price,
      quantity: item.quantity,
      category: item.category,
      planType: item.planType || undefined,
    })),
    total: total,
    paymentMethod: "Tarjeta de Crédito",
    cardInfo: {
      lastFour: cardNumber.slice(-4),
      cardHolder: cardHolder,
    },
    status: "completed",
    orderDate: new Date().toISOString(),
    orderType: isSubscription ? "subscription" : "purchase",
  }

  if (isSubscription) {
    order.planType = cart[0].planType
  }

  // Guardar orden
  const orders = JSON.parse(localStorage.getItem("marketplace_orders") || "[]")
  orders.push(order)
  localStorage.setItem("marketplace_orders", JSON.stringify(orders))

  // Si es suscripción, activar plan premium
  if (isSubscription) {
    activatePremiumPlan(cart[0].planType, user)
  }

  // Notificar al admin
  broadcastOrderUpdate()

  return order
}

function broadcastOrderUpdate() {
  const event = {
    type: "ORDER_UPDATE",
    timestamp: Date.now(),
  }

  localStorage.setItem(`order_update_${Date.now()}`, JSON.stringify(event))

  window.dispatchEvent(new CustomEvent("orderUpdate", { detail: event }))

  const channel = new BroadcastChannel("globex_updates")
  channel.postMessage(event)

  setTimeout(() => {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("order_update_")) {
        localStorage.removeItem(key)
      }
    })
  }, 5000)
}

function showPaymentSuccess(order) {
  // Crear modal de éxito si no existe
  let successModal = document.getElementById("paymentSuccessModal")

  if (!successModal) {
    successModal = document.createElement("div")
    successModal.id = "paymentSuccessModal"
    successModal.className = "modal"
    successModal.innerHTML = `
      <div class="modal-content" style="max-width: 600px; text-align: center;">
        <div class="success-header">
          <div class="success-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <h2>¡Pago Exitoso!</h2>
          <p>Tu compra ha sido procesada correctamente</p>
        </div>

        <div class="order-details">
          <div class="order-info">
            <h3>Detalles del pedido</h3>
            <p><strong>Número de orden:</strong> <span id="orderNumber"></span></p>
            <p><strong>Total pagado:</strong> $<span id="orderTotal"></span></p>
            <p><strong>Método de pago:</strong> <span id="paymentMethod"></span></p>
            <p><strong>Email de confirmación:</strong> <span id="orderEmail"></span></p>
          </div>
          
          <div class="order-items">
            <h3>Artículos comprados</h3>
            <div id="orderItemsList"></div>
          </div>
        </div>

        <div class="voucher-section">
          <h3>Comprobante de Compra</h3>
          <div class="voucher" id="purchaseVoucher">
            <div class="voucher-header">
              <img src="/icono.png" alt="Globex" style="width: 40px; height: 40px;">
              <h4>GLOBEX MARKETPLACE</h4>
              <p>Comprobante de Compra Digital</p>
            </div>
            <div class="voucher-content">
              <div class="voucher-row">
                <span>Orden #:</span>
                <span id="voucherOrderNumber"></span>
              </div>
              <div class="voucher-row">
                <span>Fecha:</span>
                <span id="voucherDate"></span>
              </div>
              <div class="voucher-row">
                <span>Cliente:</span>
                <span id="voucherCustomer"></span>
              </div>
              <div class="voucher-row">
                <span>Email:</span>
                <span id="voucherEmail"></span>
              </div>
              <div class="voucher-divider"></div>
              <div id="voucherItems"></div>
              <div class="voucher-divider"></div>
              <div class="voucher-row total">
                <span><strong>TOTAL PAGADO:</strong></span>
                <span><strong>$<span id="voucherTotal"></span></strong></span>
              </div>
              <div class="voucher-row">
                <span>Método de pago:</span>
                <span id="voucherPaymentMethod"></span>
              </div>
              <div class="voucher-footer">
                <p>¡Gracias por tu compra!</p>
                <p>Recibirás los archivos digitales en tu email</p>
              </div>
            </div>
          </div>
        </div>

        <div class="success-actions">
          <button class="btn btn-primary" onclick="downloadVoucher()">
            <i class="fas fa-download"></i> Descargar Comprobante
          </button>
          <button class="btn btn-secondary" onclick="closePaymentSuccessModal()">
            <i class="fas fa-home"></i> Continuar Comprando
          </button>
        </div>
      </div>
    `
    document.body.appendChild(successModal)
  }

  // Llenar datos del pedido
  fillOrderDetails(order)

  // Mostrar modal
  successModal.style.display = "block"
}

function fillOrderDetails(order) {
  // Llenar información básica
  document.getElementById("orderNumber").textContent = order.orderNumber
  document.getElementById("orderTotal").textContent = order.total.toFixed(2)
  document.getElementById("paymentMethod").textContent = `${order.paymentMethod} ****${order.cardInfo.lastFour}`
  document.getElementById("orderEmail").textContent = order.userInfo.email

  // Llenar lista de artículos
  const itemsList = document.getElementById("orderItemsList")
  itemsList.innerHTML = order.items
    .map(
      (item) => `
    <div class="order-item">
      <span>${item.title} x${item.quantity}</span>
      <span>$${(item.price * item.quantity).toFixed(2)}</span>
    </div>
  `,
    )
    .join("")

  // Llenar voucher
  document.getElementById("voucherOrderNumber").textContent = order.orderNumber
  document.getElementById("voucherDate").textContent = new Date(order.orderDate).toLocaleDateString("es-ES")
  document.getElementById("voucherCustomer").textContent = order.cardInfo.cardHolder
  document.getElementById("voucherEmail").textContent = order.userInfo.email
  document.getElementById("voucherTotal").textContent = order.total.toFixed(2)
  document.getElementById("voucherPaymentMethod").textContent = `${order.paymentMethod} ****${order.cardInfo.lastFour}`

  // Llenar artículos del voucher
  const voucherItems = document.getElementById("voucherItems")
  voucherItems.innerHTML = order.items
    .map(
      (item) => `
    <div class="voucher-row">
      <span>${item.title} x${item.quantity}</span>
      <span>$${(item.price * item.quantity).toFixed(2)}</span>
    </div>
  `,
    )
    .join("")
}

function downloadVoucher() {
  const voucher = document.getElementById("purchaseVoucher")
  const orderNumber = document.getElementById("voucherOrderNumber").textContent

  // Crear una nueva ventana para imprimir
  const printWindow = window.open("", "_blank")
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Comprobante ${orderNumber}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .voucher { max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; }
        .voucher-header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #26c6da; padding-bottom: 15px; }
        .voucher-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
        .voucher-row.total { font-weight: bold; font-size: 1.2em; border-top: 2px solid #26c6da; margin-top: 10px; }
        .voucher-divider { border-top: 1px solid #ddd; margin: 10px 0; }
        .voucher-footer { text-align: center; margin-top: 20px; color: #666; }
        @media print { body { margin: 0; } }
      </style>
    </head>
    <body>
      ${voucher.outerHTML}
      <script>window.print(); window.close();</script>
    </body>
    </html>
  `)
  printWindow.document.close()
}

function closeCardPaymentModal() {
  const modal = document.getElementById("cardPaymentModal")
  if (modal) {
    modal.style.display = "none"
  }
}

function closePaymentSuccessModal() {
  const modal = document.getElementById("paymentSuccessModal")
  if (modal) {
    modal.style.display = "none"
  }
}

function closePaymentModal() {
  const modal = document.getElementById("paymentModal")
  if (modal) {
    modal.style.display = "none"
  }
}

function payWithCard() {
  showCardPaymentModal()
}

function payWithPayPal() {
  // Simular pago con PayPal
  if (!isUserLoggedIn()) {
    showNotification("Debes iniciar sesión para realizar una compra", "error")
    showAuthModal()
    return
  }

  const user = getCurrentUser()
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const order = {
    id: Date.now(),
    orderNumber: `ORD-${Date.now()}`,
    userId: user?.id || "guest",
    userInfo: {
      name: user?.name || "Usuario PayPal",
      email: user?.email || "usuario@paypal.com",
    },
    items: cart.map((item) => ({
      id: item.id,
      title: item.title,
      artist: item.artist,
      price: item.price,
      quantity: item.quantity,
      category: item.category,
    })),
    total: total,
    paymentMethod: "PayPal",
    cardInfo: {
      lastFour: "PayPal",
      cardHolder: user?.name || "Usuario PayPal",
    },
    status: "completed",
    orderDate: new Date().toISOString(),
  }

  // Guardar orden
  const orders = JSON.parse(localStorage.getItem("marketplace_orders") || "[]")
  orders.push(order)
  localStorage.setItem("marketplace_orders", JSON.stringify(orders))

  closePaymentModal()
  showPaymentSuccess(order)
  cart = []
  saveCartToStorage()
  updateCartCount()

  broadcastOrderUpdate()
  showNotification(`¡Pago con PayPal completado! Número de pedido: ${order.orderNumber} 🎉`)
}

function showNotification(message, type = "success") {
  console.log("📢 Mostrando notificación:", message, type)

  // Eliminar notificaciones existentes
  const existingNotifications = document.querySelectorAll(".notification")
  existingNotifications.forEach((notification) => {
    notification.remove()
  })

  const notification = document.createElement("div")
  notification.className = "notification"
  notification.textContent = message

  if (type === "error") {
    notification.style.background = "#ef4444"
  } else if (type === "info") {
    notification.style.background = "#3b82f6"
  }

  notification.style.cssText += `
    position: fixed;
    top: 100px;
    right: 20px;
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    z-index: 3000;
    animation: slideIn 0.3s ease;
  `

  document.body.appendChild(notification)

  // Añadir animación de entrada
  notification.style.animation = "slideIn 0.3s ease forwards"

  // Configurar animación de salida
  setTimeout(() => {
    notification.style.animation = "slideIn 0.3s ease forwards reverse"
    setTimeout(() => {
      notification.remove()
    }, 300)
  }, 3000)
}

// Funciones para la nueva estructura de categorías
function setupCategoryEvents() {
  // Eventos para las tarjetas de categorías principales
  document.querySelectorAll(".category-card").forEach((card) => {
    card.addEventListener("click", () => {
      const category = card.getAttribute("data-category")
      selectCategory(category)
    })
  })

  // Eventos para la lista de regiones/categorías lateral
  document.querySelectorAll(".region-item").forEach((item) => {
    item.addEventListener("click", () => {
      const category = item.getAttribute("data-category")
      selectCategory(category)
    })
  })
}

function selectCategory(category) {
  // Actualizar estado activo en tarjetas de categorías
  document.querySelectorAll(".category-card").forEach((card) => {
    card.classList.remove("active")
    if (card.getAttribute("data-category") === category) {
      card.classList.add("active")
    }
  })

  // Actualizar estado activo en lista lateral
  document.querySelectorAll(".region-item").forEach((item) => {
    item.classList.remove("active")
    if (item.getAttribute("data-category") === category) {
      item.classList.add("active")
    }
  })

  // Filtrar obras por categoría
  if (category === "all") {
    filteredArtworks = [...artworks]
  } else {
    filteredArtworks = artworks.filter((artwork) => artwork.category === category)
  }

  // Aplicar ordenamiento actual
  const sortFilter = document.getElementById("sortFilter")
  if (sortFilter) {
    const sortBy = sortFilter.value
    sortArtworks(sortBy)
  }

  // Renderizar obras filtradas
  renderArtworks()

  // Mostrar notificación
  const categoryName =
    category === "all" ? "Todas las categorías" : category.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())
  showNotification(`Mostrando obras de: ${categoryName}`)
}

function updateCategoryCounts() {
  console.log("📊 Actualizando contadores de categorías...")
  const categoryCounts = {
    all: artworks.length,
    "digital-art": artworks.filter((a) => a.category === "digital-art").length,
    illustration: artworks.filter((a) => a.category === "illustration").length,
    photography: artworks.filter((a) => a.category === "photography").length,
    "web-design": artworks.filter((a) => a.category === "web-design").length,
    software: artworks.filter((a) => a.category === "software").length,
    "graphic-design": artworks.filter((a) => a.category === "graphic-design").length,
    "3d-modeling": artworks.filter((a) => a.category === "3d-modeling").length,
  }

  console.log("📊 Contadores calculados:", categoryCounts)

  // Actualizar contadores en tarjetas de categorías usando los nuevos IDs
  Object.keys(categoryCounts).forEach((category) => {
    const countElement = document.getElementById(`count-${category}`)
    if (countElement) {
      const count = categoryCounts[category]
      countElement.textContent = `${count} obra${count !== 1 ? "s" : ""}`
    }
  })

  // Actualizar contadores en lista lateral
  document.querySelectorAll(".region-item").forEach((item) => {
    const category = item.getAttribute("data-category")
    const countElement = item.querySelector(".region-count")
    if (countElement && categoryCounts[category] !== undefined) {
      countElement.textContent = categoryCounts[category]
    }
  })
}

function updateNavigation() {
  const navLinks = document.querySelector(".nav-links")
  const userSection = document.getElementById("userSection")
  const userName = document.getElementById("userName")
  const authButton = document.getElementById("authButton")

  if (navLinks) {
    // Remove existing admin links
    const existingAdminLinks = navLinks.querySelectorAll(".admin-link")
    existingAdminLinks.forEach((link) => link.remove())

    if (isAdmin) {
      // Add admin links
      const uploadLink = document.createElement("li")
      uploadLink.className = "nav-item admin-link"
      uploadLink.innerHTML = '<a href="#" class="nav-link">Subir Obra (Admin)</a>'
      navLinks.appendChild(uploadLink)
    }
  }

  // Actualizar información del usuario
  const currentUser = getCurrentUser()
  if (currentUser && userName && authButton) {
    // Usuario logueado
    const userPlan = currentUser.plan || "basic"
    const isPremium = userPlan === "pro" || userPlan === "pro-annual"

    // Mostrar nombre con badge premium si corresponde
    let displayName = currentUser.name
    if (isPremium) {
      displayName +=
        ' <span class="user-premium-badge" style="color: #ffd700; margin-left: 8px;"><i class="fas fa-crown"></i> Pro</span>'
    }

    userName.innerHTML = displayName
    userName.style.display = "inline-block"
    authButton.textContent = "Cerrar Sesión"
    authButton.onclick = () => {
      if (typeof logout === "function") {
        logout()
      }
    }
  } else if (userName && authButton) {
    // Usuario no logueado
    userName.textContent = "Invitado"
    userName.innerHTML = "Invitado"
    userName.style.display = "inline-block"
    authButton.textContent = "Iniciar Sesión"
    authButton.onclick = showAuthModal
  }
}

// Funciones para manejo de planes de suscripción - MODIFICADAS
function selectPlan(planType, price) {
  // Verificar si el usuario está logueado PRIMERO
  if (!isUserLoggedIn()) {
    showNotification("Debes registrarte o iniciar sesión para adquirir un plan", "error")
    showAuthModal()
    return
  }

  const currentUser = getCurrentUser()
  const currentPlan = currentUser?.plan || "basic"

  if (planType === "basic") {
    // Plan básico gratuito
    if (currentPlan === "basic") {
      showNotification("Ya tienes el plan básico activado", "info")
      return
    }
    activateBasicPlan()
    return
  }

  // Verificar si ya tiene el plan
  if (currentPlan === planType) {
    showNotification(`Ya tienes el plan ${planType === "pro" ? "Pro Mensual" : "Pro Anual"} activado`, "info")
    return
  }

  // Crear "producto" del plan para el sistema de pago
  const planProduct = {
    id: `plan_${planType}`,
    title: `Plan ${planType === "pro" ? "Pro Mensual" : "Pro Anual"}`,
    artist: "Globex",
    description: `Suscripción al plan ${planType === "pro" ? "Pro Mensual" : "Pro Anual"} con acceso completo a todas las funciones premium incluyendo IA Glob`,
    price: price,
    category: "subscription",
    quantity: 1,
    planType: planType,
  }

  // NO agregar al carrito, ir directo al pago
  showPlanPaymentModal(planProduct)
}

function activateBasicPlan() {
  const user = getCurrentUser()
  if (!user) return

  // Actualizar plan del usuario
  const users = JSON.parse(localStorage.getItem("marketplace_users") || "[]")
  const userIndex = users.findIndex((u) => u.id === user.id)

  if (userIndex !== -1) {
    users[userIndex].plan = "basic"
    users[userIndex].planActivatedAt = new Date().toISOString()
    localStorage.setItem("marketplace_users", JSON.stringify(users))

    // Actualizar usuario actual
    const updatedUser = users[userIndex]
    const { password, ...userWithoutPassword } = updatedUser
    localStorage.setItem("marketplace_current_user", JSON.stringify(userWithoutPassword))
  }

  updateNavigation()
  updatePricingPlans()
  showNotification("¡Plan Básico activado correctamente! 🎉", "success")
}

function showPlanPaymentModal(planProduct) {
  // Crear modal de pago para planes si no existe
  let planPaymentModal = document.getElementById("planPaymentModal")

  if (!planPaymentModal) {
    planPaymentModal = document.createElement("div")
    planPaymentModal.id = "planPaymentModal"
    planPaymentModal.className = "modal"
    planPaymentModal.innerHTML = `
      <div class="modal-content" style="max-width: 500px;">
        <button class="close-btn" onclick="closePlanPaymentModal()">&times;</button>
        <div class="payment-header">
          <h2><i class="fas fa-crown"></i> Suscripción Premium</h2>
          <p>Selecciona tu método de pago para activar tu plan premium</p>
        </div>
        
        <div class="payment-summary">
          <h3>Resumen de suscripción</h3>
          <div id="planSummaryInfo"></div>
          <div class="payment-total">
            <strong>Total: $<span id="planTotal">0.00</span></strong>
          </div>
        </div>

        <div class="payment-methods">
          <h3>Método de pago</h3>
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <button class="btn btn-primary" onclick="payPlanWithCard()" style="padding: 15px;">
              <i class="fas fa-credit-card"></i> Pagar con Tarjeta
            </button>
            <button class="btn btn-secondary" onclick="payPlanWithPayPal()" style="padding: 15px;">
              <i class="fab fa-paypal"></i> Pagar con PayPal
            </button>
          </div>
        </div>

        <div class="premium-benefits" style="margin-top: 20px; padding: 15px; background: rgba(38, 198, 218, 0.1); border-radius: 8px; border-left: 4px solid #26c6da;">
          <h4 style="color: #26c6da; margin: 0 0 10px 0;">
            <i class="fas fa-robot"></i> Incluye IA Glob Premium
          </h4>
          <ul style="margin: 0; padding-left: 20px; color: #26c6da; font-size: 0.9rem;">
            <li>Asistente inteligente 24/7</li>
            <li>Análisis avanzado con IA</li>
            <li>Recomendaciones personalizadas</li>
            <li>Soporte técnico prioritario</li>
          </ul>
        </div>
      </div>
    `
    document.body.appendChild(planPaymentModal)
  }

  // Guardar el plan seleccionado globalmente para el pago
  window.selectedPlan = planProduct

  // Llenar información del plan
  fillPlanSummary(planProduct)

  // Mostrar modal
  planPaymentModal.style.display = "block"
}

function fillPlanSummary(planProduct) {
  const summaryInfo = document.getElementById("planSummaryInfo")
  const planTotal = document.getElementById("planTotal")

  if (summaryInfo) {
    const planName = planProduct.planType === "pro" ? "Pro Mensual" : "Pro Anual (45% descuento)"
    const billingCycle = planProduct.planType === "pro" ? "Facturación mensual" : "Facturación anual"

    summaryInfo.innerHTML = `
      <div class="summary-item" style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #333;">
        <div>
          <strong>${planName}</strong><br>
          <small style="color: #ccc;">${billingCycle}</small>
        </div>
        <span>$${planProduct.price.toFixed(2)}</span>
      </div>
    `
  }

  if (planTotal) {
    planTotal.textContent = planProduct.price.toFixed(2)
  }
}

function payPlanWithCard() {
  if (!window.selectedPlan) {
    showNotification("Error: Plan no seleccionado", "error")
    return
  }

  // Crear carrito temporal solo con el plan
  const tempCart = [window.selectedPlan]
  const originalCart = [...cart]
  cart = tempCart

  closePlanPaymentModal()
  showCardPaymentModal()

  // Restaurar carrito original después del pago
  setTimeout(() => {
    if (cart.length === 0) {
      // Si el pago fue exitoso
      cart = originalCart
      saveCartToStorage()
      updateCartCount()
    }
  }, 1000)
}

function payPlanWithPayPal() {
  if (!isUserLoggedIn()) {
    showNotification("Debes iniciar sesión para realizar una suscripción", "error")
    showAuthModal()
    return
  }

  if (!window.selectedPlan) {
    showNotification("Error: Plan no seleccionado", "error")
    return
  }

  const planProduct = window.selectedPlan
  const user = getCurrentUser()
  const order = {
    id: Date.now(),
    orderNumber: `SUB-${Date.now()}`,
    userId: user?.id || "guest",
    userInfo: {
      name: user?.name || "Usuario PayPal",
      email: user?.email || "usuario@paypal.com",
    },
    items: [planProduct],
    total: planProduct.price,
    paymentMethod: "PayPal",
    cardInfo: {
      lastFour: "PayPal",
      cardHolder: user?.name || "Usuario PayPal",
    },
    status: "completed",
    orderDate: new Date().toISOString(),
    orderType: "subscription",
    planType: planProduct.planType,
  }

  // Guardar orden
  const orders = JSON.parse(localStorage.getItem("marketplace_orders") || "[]")
  orders.push(order)
  localStorage.setItem("marketplace_orders", JSON.stringify(orders))

  // Activar plan premium
  activatePremiumPlan(planProduct.planType, user)

  closePlanPaymentModal()
  showPaymentSuccess(order)

  broadcastOrderUpdate()
  showNotification(
    `¡Suscripción ${planProduct.planType === "pro" ? "Pro Mensual" : "Pro Anual"} activada con PayPal! 🎉👑`,
  )
}

function activatePremiumPlan(planType, user) {
  // Actualizar plan del usuario
  const users = JSON.parse(localStorage.getItem("marketplace_users") || "[]")
  const userIndex = users.findIndex((u) => u.id === user.id)

  if (userIndex !== -1) {
    users[userIndex].plan = planType
    users[userIndex].planActivatedAt = new Date().toISOString()
    users[userIndex].planExpiresAt = calculatePlanExpiration(planType)
    localStorage.setItem("marketplace_users", JSON.stringify(users))

    // Actualizar usuario actual
    const updatedUser = users[userIndex]
    const { password, ...userWithoutPassword } = updatedUser
    localStorage.setItem("marketplace_current_user", JSON.stringify(userWithoutPassword))

    // Disparar evento para actualizar IA Glob
    window.dispatchEvent(new CustomEvent("userLoggedIn"))
  }

  // Actualizar interfaz
  updateNavigation()
  updatePricingPlans()
}

function calculatePlanExpiration(planType) {
  const now = new Date()
  if (planType === "pro") {
    // Plan mensual: 30 días
    now.setDate(now.getDate() + 30)
  } else if (planType === "pro-annual") {
    // Plan anual: 365 días
    now.setDate(now.getDate() + 365)
  }
  return now.toISOString()
}

function closePlanPaymentModal() {
  const modal = document.getElementById("planPaymentModal")
  if (modal) {
    modal.style.display = "none"
  }
}

function updatePricingPlans() {
  const currentUser = getCurrentUser()
  const userPlan = currentUser?.plan || null

  // Actualizar plan básico
  const basicPlanBtn = document.querySelector('.plan.basic .btn-start, .plan.basic button[onclick*="selectPlan"]')

  if (basicPlanBtn) {
    if (userPlan === "basic") {
      basicPlanBtn.innerHTML = '<i class="fas fa-check"></i> Plan Actual'
      basicPlanBtn.className = "btn-start current-plan"
      basicPlanBtn.style.background = "#10b981"
      basicPlanBtn.onclick = null
    } else if (userPlan === "pro" || userPlan === "pro-annual") {
      basicPlanBtn.innerHTML = '<i class="fas fa-arrow-down"></i> Downgrade'
      basicPlanBtn.className = "btn-start downgrade-btn"
      basicPlanBtn.style.background = "#6b7280"
      basicPlanBtn.onclick = () => showDowngradeConfirmation("basic")
    } else {
      basicPlanBtn.innerHTML = "Empezar ahora"
      basicPlanBtn.className = "btn-start"
      basicPlanBtn.style.background = ""
      basicPlanBtn.onclick = () => selectPlan("basic", 0)
    }
  }

  // Actualizar plan pro mensual
  const proPlanBtn = document.querySelector('.plan.pro .btn-start, .plan.pro button[onclick*="selectPlan"]')

  if (proPlanBtn) {
    if (userPlan === "pro") {
      proPlanBtn.innerHTML = '<i class="fas fa-check"></i> Plan Actual'
      proPlanBtn.className = "btn-start current-plan"
      proPlanBtn.style.background = "#10b981"
      proPlanBtn.onclick = null
    } else if (userPlan === "pro-annual") {
      proPlanBtn.innerHTML = '<i class="fas fa-arrow-down"></i> Cambiar a Mensual'
      proPlanBtn.className = "btn-start downgrade-btn"
      proPlanBtn.style.background = "#6b7280"
      proPlanBtn.onclick = () => showPlanChangeConfirmation("pro")
    } else if (userPlan === "basic") {
      proPlanBtn.innerHTML = '<i class="fas fa-arrow-up"></i> Upgrade'
      proPlanBtn.className = "btn-start upgrade-btn"
      proPlanBtn.style.background = "#f59e0b"
      proPlanBtn.onclick = () => selectPlan("pro", 29)
    } else {
      proPlanBtn.innerHTML = '<i class="fas fa-crown"></i> Suscribirse'
      proPlanBtn.className = "btn-start"
      proPlanBtn.style.background = ""
      proPlanBtn.onclick = () => selectPlan("pro", 29)
    }
  }

  // Actualizar plan pro anual
  const proAnnualPlanBtn = document.querySelector(
    '.plan.pro-annual .btn-start, .plan.pro-annual button[onclick*="selectPlan"]',
  )

  if (proAnnualPlanBtn) {
    if (userPlan === "pro-annual") {
      proAnnualPlanBtn.innerHTML = '<i class="fas fa-check"></i> Plan Actual'
      proAnnualPlanBtn.className = "btn-start current-plan"
      proAnnualPlanBtn.style.background = "#10b981"
      proAnnualPlanBtn.onclick = null
    } else if (userPlan === "pro") {
      proAnnualPlanBtn.innerHTML = '<i class="fas fa-arrow-up"></i> Upgrade Anual'
      proAnnualPlanBtn.className = "btn-start upgrade-btn"
      proAnnualPlanBtn.style.background = "#f59e0b"
      proAnnualPlanBtn.onclick = () => selectPlan("pro-annual", 190)
    } else if (userPlan === "basic") {
      proAnnualPlanBtn.innerHTML = '<i class="fas fa-arrow-up"></i> Upgrade Anual'
      proAnnualPlanBtn.className = "btn-start upgrade-btn"
      proAnnualPlanBtn.style.background = "#f59e0b"
      proAnnualPlanBtn.onclick = () => selectPlan("pro-annual", 190)
    } else {
      proAnnualPlanBtn.innerHTML = '<i class="fas fa-crown"></i> Suscribirse Anual'
      proAnnualPlanBtn.className = "btn-start"
      proAnnualPlanBtn.style.background = ""
      proAnnualPlanBtn.onclick = () => selectPlan("pro-annual", 190)
    }
  }

  // Agregar indicadores de plan actual
  document.querySelectorAll(".plan").forEach((planElement) => {
    const existingIndicator = planElement.querySelector(".current-plan-indicator")
    if (existingIndicator) {
      existingIndicator.remove()
    }

    if (
      (planElement.classList.contains("basic") && userPlan === "basic") ||
      (planElement.classList.contains("pro") && userPlan === "pro") ||
      (planElement.classList.contains("pro-annual") && userPlan === "pro-annual")
    ) {
      const indicator = document.createElement("div")
      indicator.className = "current-plan-indicator"
      indicator.innerHTML = '<i class="fas fa-check-circle"></i> Plan Actual'
      indicator.style.cssText = `
        position: absolute;
        top: 15px;
        right: 15px;
        background: #10b981;
        color: white;
        padding: 5px 10px;
        border-radius: 15px;
        font-size: 0.8rem;
        font-weight: 600;
      `
      planElement.style.position = "relative"
      planElement.appendChild(indicator)
    }
  })
}

function showDowngradeConfirmation(targetPlan) {
  if (confirm("¿Estás seguro de que quieres cambiar a un plan inferior? Perderás las funciones premium.")) {
    selectPlan(targetPlan, 0)
  }
}

function showPlanChangeConfirmation(targetPlan) {
  if (confirm("¿Quieres cambiar tu plan de facturación? Se aplicarán las nuevas tarifas.")) {
    selectPlan(targetPlan, targetPlan === "pro" ? 29 : 190)
  }
}

// Hacer funciones globales solo si NO estamos en admin
if (!window.location.pathname.includes("admin.html")) {
  window.addToCart = addToCart
  window.viewArtwork = viewArtwork
  window.toggleWishlist = toggleWishlist
  window.addToComparison = addToComparison
  window.toggleCart = toggleCart
  window.closeCart = closeCart
  window.closeModal = closeModal
  window.updateQuantity = updateQuantity
  window.removeFromCart = removeFromCart
  window.proceedToCheckout = proceedToCheckout
  window.closePaymentModal = closePaymentModal
  window.closeCardPaymentModal = closeCardPaymentModal
  window.closePaymentSuccessModal = closePaymentSuccessModal
  window.payWithCard = payWithCard
  window.payWithPayPal = payWithPayPal
  window.downloadVoucher = downloadVoucher
  window.toggleNotifications = toggleNotifications
  window.markAllNotificationsAsRead = markAllNotificationsAsRead
  window.renderArtworks = renderArtworks
  window.updateCategoryCounts = updateCategoryCounts
  window.rateArtwork = rateArtwork
  window.highlightStars = highlightStars
  window.resetStars = resetStars
  window.selectPlan = selectPlan
  window.payPlanWithCard = payPlanWithCard
  window.payPlanWithPayPal = payPlanWithPayPal
  window.closePlanPaymentModal = closePlanPaymentModal
  window.showDowngradeConfirmation = showDowngradeConfirmation
  window.showPlanChangeConfirmation = showPlanChangeConfirmation
}

// Función para aplicar un filtro guardado
function applySavedFilter(filter) {
  // Implementación de applySavedFilter aquí
  console.log("Aplicando filtro guardado:", filter)
}

// Función para eliminar un filtro guardado
function deleteSavedFilter(index, event) {
  event.stopPropagation()
  savedFilters.splice(index, 1)
  localStorage.setItem("savedFilters", JSON.stringify(savedFilters))
  renderSavedFilters()
  showNotification("Filtro eliminado")
}

const logout = () => {
  localStorage.removeItem("marketplace_current_user")
  updateNavigation()
  updatePricingPlans()
  showNotification("Sesión cerrada correctamente")
}






















