// Sistema de administración para Globex - VERSIÓN CORREGIDA CON USUARIOS Y PEDIDOS
let isAdminLoggedIn = false
const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "admin123",
}

// Datos de ejemplo para el admin
let adminArtworks = []
let editingArtworkId = null
const adminStats = {
  totalArtworks: 0,
  totalUsers: 0,
  totalOrders: 0,
  totalRevenue: 0,
}

document.addEventListener("DOMContentLoaded", () => {
  // Solo inicializar admin si estamos en la página de admin
  if (window.location.pathname.includes("admin.html")) {
    console.log("Inicializando panel de administrador...")
    initializeAdmin()
  }
})

function initializeAdmin() {
  console.log("🚀 Iniciando sistema de administración...")

  // SIEMPRE mostrar login al entrar
  showAdminLogin()

  // Configurar eventos
  setupAdminEvents()

  // Cargar datos iniciales
  loadAdminData()

  // Configurar listeners para cambios en usuarios y pedidos
  setupAdminStorageListeners()

  console.log("✅ Sistema de administración inicializado correctamente")
}

function setupAdminEvents() {
  console.log("⚙️ Configurando eventos del admin...")

  // Login de admin
  const adminLoginForm = document.getElementById("adminLoginForm")
  if (adminLoginForm) {
    adminLoginForm.addEventListener("submit", handleAdminLogin)
    console.log("✅ Evento de login configurado")
  }

  // Logout de admin
  const adminLogoutBtn = document.getElementById("adminLogoutBtn")
  if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener("click", handleAdminLogout)
  }

  // Navegación del sidebar
  document.querySelectorAll(".admin-menu-item").forEach((item) => {
    item.addEventListener("click", () => {
      const section = item.getAttribute("data-section")
      showAdminSection(section)

      // Actualizar estado activo
      document.querySelectorAll(".admin-menu-item").forEach((i) => i.classList.remove("active"))
      item.classList.add("active")
    })
  })

  // Formulario de agregar obra - CORREGIDO
  const adminArtworkForm = document.getElementById("adminArtworkForm")
  if (adminArtworkForm) {
    adminArtworkForm.addEventListener("submit", handleAddArtwork)
    console.log("✅ Evento de formulario de obra configurado")
  }

  // Configurar áreas de subida de archivos
  setupAdminFileUpload()

  // Toggle de tema
  const themeToggle = document.getElementById("themeToggle")
  if (themeToggle) {
    themeToggle.addEventListener("click", toggleAdminTheme)
  }

  console.log("✅ Todos los eventos configurados correctamente")
}

function setupAdminStorageListeners() {
  console.log("🔄 Configurando listeners de admin para usuarios y pedidos...")

  // Escuchar cambios en localStorage
  window.addEventListener("storage", (e) => {
    if (e.key && (e.key.startsWith("user_update_") || e.key.startsWith("order_update_"))) {
      console.log("📊 Actualizando estadísticas del admin...")
      updateAdminStats()
      if (e.key.startsWith("user_update_")) {
        renderUsersTable()
      }
      if (e.key.startsWith("order_update_")) {
        renderOrdersTable()
      }
    }
  })

  // Escuchar eventos personalizados
  window.addEventListener("userUpdate", (e) => {
    console.log("👤 Evento userUpdate recibido en admin")
    updateAdminStats()
    renderUsersTable()
  })

  window.addEventListener("orderUpdate", (e) => {
    console.log("📦 Evento orderUpdate recibido en admin")
    updateAdminStats()
    renderOrdersTable()
  })

  // Escuchar BroadcastChannel
  const channel = new BroadcastChannel("globex_updates")
  channel.addEventListener("message", (event) => {
    if (event.data.type === "USER_UPDATE" || event.data.type === "ORDER_UPDATE") {
      console.log("📡 Actualización recibida via BroadcastChannel:", event.data.type)
      updateAdminStats()
      if (event.data.type === "USER_UPDATE") {
        renderUsersTable()
      }
      if (event.data.type === "ORDER_UPDATE") {
        renderOrdersTable()
      }
    }
  })

  console.log("✅ Listeners de admin configurados")
}

function handleAdminLogin(e) {
  e.preventDefault()
  console.log("🔐 Intentando login...")

  const username = document.getElementById("adminUsername").value.trim()
  const password = document.getElementById("adminPassword").value.trim()

  console.log("Credenciales ingresadas:", { username, password: "***" })

  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    console.log("✅ Login exitoso")
    isAdminLoggedIn = true
    showAdminContent()
    showAdminNotification("¡Bienvenido al panel de administrador!")
  } else {
    console.log("❌ Login fallido")
    showAdminNotification("Credenciales incorrectas. Usuario: admin, Contraseña: admin123", "error")

    // Limpiar campos
    document.getElementById("adminUsername").value = ""
    document.getElementById("adminPassword").value = ""
  }
}

function handleAdminLogout() {
  isAdminLoggedIn = false
  localStorage.removeItem("admin_session")
  showAdminLogin()
  showAdminNotification("Sesión cerrada correctamente")
}

function showAdminLogin() {
  console.log("🔐 Mostrando login de admin")
  const loginModal = document.getElementById("adminLoginModal")
  const adminContent = document.getElementById("adminContent")

  if (loginModal) {
    loginModal.style.display = "flex"
  }
  if (adminContent) {
    adminContent.style.display = "none"
  }

  // Limpiar campos para mayor seguridad
  setTimeout(() => {
    const usernameField = document.getElementById("adminUsername")
    const passwordField = document.getElementById("adminPassword")
    if (usernameField) usernameField.value = ""
    if (passwordField) passwordField.value = ""
  }, 100)
}

function showAdminContent() {
  console.log("📊 Mostrando contenido de admin")
  const loginModal = document.getElementById("adminLoginModal")
  const adminContent = document.getElementById("adminContent")

  if (loginModal) {
    loginModal.style.display = "none"
  }
  if (adminContent) {
    adminContent.style.display = "flex"
  }

  updateAdminStats()
  renderArtworksTable()
  renderUsersTable()
  renderOrdersTable()
}

function showAdminSection(sectionId) {
  // Ocultar todas las secciones
  document.querySelectorAll(".admin-section").forEach((section) => {
    section.classList.remove("active")
  })

  // Mostrar la sección seleccionada
  const targetSection = document.getElementById(sectionId)
  if (targetSection) {
    targetSection.classList.add("active")
  }

  // Actualizar datos específicos de la sección
  if (sectionId === "dashboard") {
    updateAdminStats()
  } else if (sectionId === "manage-artworks") {
    renderArtworksTable()
  } else if (sectionId === "users") {
    renderUsersTable()
  } else if (sectionId === "orders") {
    renderOrdersTable()
  }
}

function loadAdminData() {
  console.log("📂 Cargando datos del admin...")

  // Cargar obras existentes desde localStorage
  const savedArtworks = localStorage.getItem("marketplace_artworks")
  if (savedArtworks) {
    try {
      adminArtworks = JSON.parse(savedArtworks)
      console.log(`✅ Cargadas ${adminArtworks.length} obras desde localStorage`)
    } catch (error) {
      console.error("❌ Error al cargar obras desde localStorage:", error)
      initializeDefaultArtworks()
    }
  } else {
    console.log("📝 No hay obras guardadas, inicializando datos por defecto")
    initializeDefaultArtworks()
  }

  // adminArtworks = [...adminArtworksGlobal] // This line seems redundant as adminArtworks is now directly populated.

  // Calcular estadísticas actualizadas
  updateAdminStats()

  console.log("📊 Datos del admin cargados")
}

function updateAdminStats() {
  // Obtener estadísticas actualizadas
  const stats = getUpdatedStats()

  // Actualizar variables globales
  adminStats.totalArtworks = stats.totalArtworks
  adminStats.totalUsers = stats.totalUsers
  adminStats.totalOrders = stats.totalOrders
  adminStats.totalRevenue = stats.totalRevenue

  // Actualizar interfaz
  const totalArtworksEl = document.getElementById("totalArtworks")
  const totalUsersEl = document.getElementById("totalUsers")
  const totalOrdersEl = document.getElementById("totalOrders")
  const totalRevenueEl = document.getElementById("totalRevenue")

  if (totalArtworksEl) totalArtworksEl.textContent = adminStats.totalArtworks
  if (totalUsersEl) totalUsersEl.textContent = adminStats.totalUsers
  if (totalOrdersEl) totalOrdersEl.textContent = adminStats.totalOrders
  if (totalRevenueEl) totalRevenueEl.textContent = `$${adminStats.totalRevenue.toFixed(2)}`

  console.log("📊 Estadísticas actualizadas:", adminStats)
}

function getUpdatedStats() {
  // Cargar datos actuales
  const artworks = JSON.parse(localStorage.getItem("marketplace_artworks") || "[]")
  const users = JSON.parse(localStorage.getItem("marketplace_users") || "[]")
  const orders = JSON.parse(localStorage.getItem("marketplace_orders") || "[]")

  return {
    totalArtworks: artworks.length,
    totalUsers: users.length,
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
  }
}

function renderUsersTable() {
  const tbody = document.getElementById("usersTableBody")
  if (!tbody) return

  const users = JSON.parse(localStorage.getItem("marketplace_users") || "[]")

  tbody.innerHTML = ""

  console.log(`👥 Renderizando tabla de usuarios con ${users.length} usuarios`)

  if (users.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 2rem; color: #666;">
          No hay usuarios registrados aún
        </td>
      </tr>
    `
    return
  }

  users.forEach((user) => {
    const row = document.createElement("tr")
    const lastLogin = user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Nunca"
    const createdAt = new Date(user.createdAt).toLocaleDateString()
    const orderCount = user.orders ? user.orders.length : 0

    row.innerHTML = `
      <td>${user.id}</td>
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td>${createdAt}</td>
      <td>${lastLogin}</td>
      <td>
        <span class="status-badge ${user.isActive ? "active" : "draft"}">${user.isActive ? "Activo" : "Inactivo"}</span>
        <div style="font-size: 0.8rem; color: #ccc; margin-top: 4px;">
          📦 ${orderCount} pedido${orderCount !== 1 ? "s" : ""}
        </div>
      </td>
    `
    tbody.appendChild(row)
  })
}

function renderOrdersTable() {
  const tbody = document.getElementById("ordersTableBody")
  if (!tbody) return

  const orders = JSON.parse(localStorage.getItem("marketplace_orders") || "[]")

  tbody.innerHTML = ""

  console.log(`📦 Renderizando tabla de pedidos con ${orders.length} pedidos`)

  if (orders.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 2rem; color: #666;">
          No hay pedidos registrados aún
        </td>
      </tr>
    `
    return
  }

  // Ordenar pedidos por fecha (más recientes primero)
  orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))

  orders.forEach((order) => {
    const row = document.createElement("tr")
    const orderDate = new Date(order.orderDate).toLocaleDateString()
    const itemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0)

    row.innerHTML = `
      <td>${order.orderNumber}</td>
      <td>${order.userInfo.name}</td>
      <td>${order.userInfo.email}</td>
      <td>${itemsCount} artículo${itemsCount !== 1 ? "s" : ""}</td>
      <td>$${order.total.toFixed(2)}</td>
      <td>
        <span class="status-badge ${order.status}">${order.status === "completed" ? "Completado" : order.status}</span>
        <div style="font-size: 0.8rem; color: #ccc; margin-top: 4px;">
          💳 ${order.paymentMethod}
        </div>
        <div style="font-size: 0.8rem; color: #ccc;">
          📅 ${orderDate}
        </div>
      </td>
    `
    tbody.appendChild(row)
  })
}

function initializeDefaultArtworks() {
  adminArtworks = [
    // Directly assign to adminArtworks
    {
      id: 1,
      title: "Cosmic Dreams",
      artist: "Sarah Johnson",
      description: "A vibrant digital artwork exploring themes of space and consciousness.",
      price: 45.0,
      category: "digital-art",
      rating: 0,
      reviews: 0,
      image: generatePlaceholderImage(),
      dateAdded: "2024-01-15",
      status: "active",
    },
    {
      id: 2,
      title: "Urban Sketches Collection",
      artist: "Mike Chen",
      description: "Hand-drawn illustrations capturing the essence of city life.",
      price: 30.0,
      category: "illustration",
      rating: 0,
      reviews: 0,
      image: generatePlaceholderImage(),
      dateAdded: "2024-01-10",
      status: "active",
    },
    {
      id: 3,
      title: "Nature Photography Bundle",
      artist: "Emma Davis",
      description: "High-resolution nature photographs perfect for any project.",
      price: 60.0,
      category: "photography",
      rating: 0,
      reviews: 0,
      image: generatePlaceholderImage(),
      dateAdded: "2024-01-20",
      status: "featured",
    },
  ]

  // Guardar datos iniciales
  localStorage.setItem("marketplace_artworks", JSON.stringify(adminArtworks))
  console.log("✅ Datos iniciales guardados en localStorage")
}

function setupAdminFileUpload() {
  console.log("📁 Configurando carga de archivos mejorada...")

  // Preview upload area
  const previewArea = document.getElementById("previewUploadArea")
  const previewInput = document.getElementById("previewFileInput")

  if (previewArea && previewInput) {
    previewArea.addEventListener("click", () => previewInput.click())
    previewArea.addEventListener("dragover", (e) => {
      e.preventDefault()
      previewArea.classList.add("drag-over")
    })
    previewArea.addEventListener("dragleave", () => {
      previewArea.classList.remove("drag-over")
    })
    previewArea.addEventListener("drop", (e) => {
      e.preventDefault()
      previewArea.classList.remove("drag-over")
      if (e.dataTransfer.files.length > 0) {
        previewInput.files = e.dataTransfer.files
        handlePreviewUpload(e.dataTransfer.files[0])
      }
    })
    previewInput.addEventListener("change", (e) => {
      if (e.target.files.length > 0) {
        handlePreviewUpload(e.target.files[0])
      }
    })
  }

  // Main files upload area
  const mainArea = document.getElementById("mainUploadArea")
  const mainInput = document.getElementById("mainFileInput")

  if (mainArea && mainInput) {
    mainArea.addEventListener("click", () => mainInput.click())
    mainArea.addEventListener("dragover", (e) => {
      e.preventDefault()
      mainArea.classList.add("drag-over")
    })
    mainArea.addEventListener("dragleave", () => {
      mainArea.classList.remove("drag-over")
    })
    mainArea.addEventListener("drop", (e) => {
      e.preventDefault()
      mainArea.classList.remove("drag-over")
      if (e.dataTransfer.files.length > 0) {
        mainInput.files = e.dataTransfer.files
        handleMainFilesUpload(e.dataTransfer.files)
      }
    })
    mainInput.addEventListener("change", (e) => {
      if (e.target.files.length > 0) {
        handleMainFilesUpload(e.target.files)
      }
    })
  }

  console.log("✅ Carga de archivos configurada correctamente")
}

function handlePreviewUpload(file) {
  if (!file) return

  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    alert("La imagen es muy grande. Máximo 5MB")
    return
  }

  if (!file.type.startsWith("image/")) {
    alert("Por favor, selecciona un archivo de imagen")
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    const preview = document.getElementById("previewFilePreview")
    preview.innerHTML = `
      <div class="preview-item">
        <div class="preview-item-info">
          <img src="${e.target.result}" alt="Preview" class="preview-item-image">
          <div class="preview-item-name">
            <strong>${file.name}</strong>
            <span class="preview-item-size">${formatFileSize(file.size)}</span>
          </div>
        </div>
        <button type="button" class="remove-btn" onclick="removePreviewFile()">Eliminar</button>
      </div>
    `
    preview.classList.add("active")
    document.getElementById("previewFileInput").dataset.fileData = e.target.result
  }
  reader.readAsDataURL(file)
}

function handleMainFilesUpload(files) {
  const maxSize = 100 * 1024 * 1024 // 100MB
  const allowedTypes = ["application/zip", "application/x-rar-compressed", "application/x-zip-compressed"]

  let totalSize = 0
  const validFiles = []

  for (const file of files) {
    totalSize += file.size
    if (totalSize > maxSize) {
      alert("El tamaño total de archivos es muy grande. Máximo 100MB")
      return
    }
    validFiles.push(file)
  }

  if (validFiles.length === 0) return

  const preview = document.getElementById("mainFilePreview")
  let html = ""

  validFiles.forEach((file, index) => {
    html += `
      <div class="preview-item">
        <div class="preview-item-info">
          <div class="preview-item-icon">
            <i class="fas fa-file"></i>
          </div>
          <div class="preview-item-name">
            <strong>${file.name}</strong>
            <span class="preview-item-size">${formatFileSize(file.size)}</span>
          </div>
        </div>
        <button type="button" class="remove-btn" onclick="removeMainFile(${index})">Eliminar</button>
      </div>
    `
  })

  preview.innerHTML = html
  preview.classList.add("active")
  document.getElementById("mainFileInput").dataset.filesCount = validFiles.length
}

function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
}

function removePreviewFile() {
  document.getElementById("previewFilePreview").classList.remove("active")
  document.getElementById("previewFileInput").value = ""
}

function removeMainFile(index) {
  const input = document.getElementById("mainFileInput")
  const dataTransfer = new DataTransfer()
  const files = input.files

  for (let i = 0; i < files.length; i++) {
    if (i !== index) {
      dataTransfer.items.add(files[i])
    }
  }

  input.files = dataTransfer.files
  handleMainFilesUpload(input.files)
}

function handleAddArtwork(e) {
  e.preventDefault()
  console.log("🎨 Iniciando proceso de agregar obra...")

  // Validar formulario MEJORADO
  if (!validateAdminForm()) {
    console.log("❌ Validación fallida")
    return
  }

  console.log("✅ Validación exitosa, procesando obra...")

  const formData = new FormData(e.target)

  // Obtener archivos subidos
  const previewFile = document.getElementById("previewFileInput").files[0]
  const mainFiles = document.getElementById("mainFileInput").files

  console.log("📁 Archivos de vista previa:", previewFile ? previewFile.name : "ninguno")
  console.log("📁 Archivos principales:", mainFiles.length)

  // Crear nueva obra con datos reales
  const newArtwork = {
    id: editingArtworkId || Date.now(),
    title: formData.get("title"),
    artist: formData.get("artist"),
    description: formData.get("description"),
    price: Number.parseFloat(formData.get("price")),
    category: formData.get("category"),
    status: formData.get("status") || "active",
    tags: formData.get("tags") || "",
    rating: editingArtworkId ? adminArtworks.find((a) => a.id === editingArtworkId)?.rating || 0 : 0,
    reviews: editingArtworkId ? adminArtworks.find((a) => a.id === editingArtworkId)?.reviews || 0 : 0,
    image: previewFile
      ? URL.createObjectURL(previewFile)
      : editingArtworkId
        ? getExistingImage(editingArtworkId)
        : generatePlaceholderImage(),
    dateAdded: editingArtworkId ? getExistingDate(editingArtworkId) : new Date().toISOString().split("T")[0],
    files: Array.from(mainFiles).map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
    })),
  }

  console.log("🎨 Nueva obra creada:", newArtwork)

  // Simular proceso de subida con barra de progreso
  const submitBtn = e.target.querySelector('button[type="submit"]')
  const originalText = submitBtn.innerHTML

  submitBtn.disabled = true

  // Crear barra de progreso
  const progressContainer = document.createElement("div")
  progressContainer.className = "upload-progress"
  progressContainer.innerHTML = `
    <div class="progress-bar-container">
      <div class="progress-bar" id="uploadProgressBar"></div>
    </div>
    <div class="progress-text" id="uploadProgressText">Procesando... 0%</div>
  `

  // Insertar después del botón
  submitBtn.parentNode.insertBefore(progressContainer, submitBtn.nextSibling)

  // Simular progreso de subida
  let progress = 0
  const progressInterval = setInterval(() => {
    progress += Math.random() * 15 + 5
    if (progress > 100) progress = 100

    const progressBar = document.getElementById("uploadProgressBar")
    const progressText = document.getElementById("uploadProgressText")

    if (progressBar && progressText) {
      progressBar.style.width = progress + "%"

      if (progress < 30) {
        progressText.textContent = `Validando datos... ${Math.floor(progress)}%`
      } else if (progress < 60) {
        progressText.textContent = `${editingArtworkId ? "Actualizando" : "Subiendo"} obra... ${Math.floor(progress)}%`
      } else if (progress < 90) {
        progressText.textContent = `Procesando archivos... ${Math.floor(progress)}%`
      } else {
        progressText.textContent = `Finalizando... ${Math.floor(progress)}%`
      }
    }

    if (progress >= 100) {
      clearInterval(progressInterval)

      // Completar subida
      setTimeout(() => {
        if (editingArtworkId) {
          // Actualizar obra existente
          const index = adminArtworks.findIndex((a) => a.id === editingArtworkId)
          if (index !== -1) {
            // Preserve existing rating/reviews if not explicitly changed
            newArtwork.rating = adminArtworks[index].rating
            newArtwork.reviews = adminArtworks[index].reviews
            adminArtworks[index] = newArtwork
          }
          showAdminNotification(`¡Obra "${newArtwork.title}" actualizada exitosamente!`)
          editingArtworkId = null
        } else {
          // Agregar nueva obra
          adminArtworks.push(newArtwork)
          showAdminNotification(`¡Obra "${newArtwork.title}" publicada exitosamente!`)
        }

        // Guardar en localStorage para persistencia
        localStorage.setItem("marketplace_artworks", JSON.stringify(adminArtworks))
        console.log("💾 Obra guardada en localStorage:", adminArtworks.length, "obras totales")

        // PUBLICACIÓN EN TIEMPO REAL MEJORADA
        broadcastArtworkUpdate(newArtwork, editingArtworkId ? "updated" : "added")

        // Actualizar interfaz inmediatamente
        updateAdminStats()
        renderArtworksTable()
        addToRecentActivity(`Obra ${editingArtworkId ? "actualizada" : "agregada"}: ${newArtwork.title}`)

        // Limpiar formulario y restablecer botón
        resetAdminForm()
        progressContainer.remove()
        submitBtn.disabled = false
        submitBtn.innerHTML = originalText

        // Auto-cambiar a la sección de gestión para ver la obra
        setTimeout(() => {
          showAdminSection("manage-artworks")
          document.querySelectorAll(".admin-menu-item").forEach((item) => {
            item.classList.remove("active")
            if (item.getAttribute("data-section") === "manage-artworks") {
              item.classList.add("active")
            }
          })
        }, 2000)
      }, 500)
    }
  }, 200)
}

function getExistingImage(artworkId) {
  const artwork = adminArtworks.find((a) => a.id === artworkId)
  return artwork ? artwork.image : generatePlaceholderImage()
}

function getExistingDate(artworkId) {
  const artwork = adminArtworks.find((a) => a.id === artworkId)
  return artwork ? artwork.dateAdded : new Date().toISOString().split("T")[0]
}

// Nueva función para generar imagen placeholder
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
  ctx.fillText("Nueva Obra", 200, 150)

  return canvas.toDataURL()
}

function validateAdminForm() {
  console.log("🔍 Validando formulario...")

  const requiredFields = [
    { name: "title", id: "artworkTitle" },
    { name: "artist", id: "artworkArtist" },
    { name: "price", id: "artworkPrice" },
    { name: "description", id: "artworkDescription" },
    { name: "category", id: "artworkCategory" },
  ]

  let isValid = true

  // Limpiar errores anteriores
  document.querySelectorAll(".field-error").forEach((error) => error.remove())
  document.querySelectorAll(".form-input").forEach((input) => input.classList.remove("error"))

  // Validar campos de texto
  requiredFields.forEach((field) => {
    const element = document.getElementById(field.id) || document.querySelector(`[name="${field.name}"]`)
    if (!element || !element.value.trim()) {
      console.log(`❌ Campo faltante: ${field.name}`)
      showAdminFieldError(field.id, "Este campo es obligatorio")
      isValid = false
    } else {
      console.log(`✅ Campo válido: ${field.name} = "${element.value.trim()}"`)
    }
  })

  // Validar precio
  const priceField = document.getElementById("artworkPrice")
  if (priceField && priceField.value) {
    const price = Number.parseFloat(priceField.value)
    if (price <= 0) {
      showAdminFieldError("artworkPrice", "El precio debe ser mayor a 0")
      isValid = false
    } else {
      console.log(`✅ Precio válido: $${price}`)
    }
  }

  // Validar archivos MEJORADO
  const previewFilesContainer = document.getElementById("previewFilePreview")
  const mainFilesContainer = document.getElementById("mainFilePreview")

  const hasPreviewImage =
    previewFilesContainer && previewFilesContainer.children.length > 0 && previewFilesContainer.style.display !== "none"
  const hasMainFiles =
    mainFilesContainer && mainFilesContainer.children.length > 0 && mainFilesContainer.style.display !== "none"

  // Solo validar archivos si no estamos editando
  if (!editingArtworkId) {
    if (!hasPreviewImage) {
      showAdminNotification("Debes subir una imagen de vista previa", "error")
      isValid = false
    } else {
      console.log("✅ Imagen de vista previa presente")
    }

    if (!hasMainFiles) {
      showAdminNotification("Debes subir al menos un archivo principal", "error")
      isValid = false
    } else {
      console.log("✅ Archivos principales presentes")
    }
  }

  console.log(`🔍 Validación completada: ${isValid ? "✅ EXITOSA" : "❌ FALLIDA"}`)
  return isValid
}

function showAdminFieldError(fieldId, message) {
  const field = document.getElementById(fieldId) || document.querySelector(`[name="${fieldId}"]`)
  if (!field) {
    console.warn(`⚠️ No se encontró el campo: ${fieldId}`)
    return
  }

  // Remover error anterior
  field.classList.remove("error")
  const existingError = field.parentNode.querySelector(".field-error")
  if (existingError) {
    existingError.remove()
  }

  // Añadir nuevo error
  field.classList.add("error")
  const errorDiv = document.createElement("div")
  errorDiv.className = "field-error"
  errorDiv.style.color = "#ef4444"
  errorDiv.style.fontSize = "0.8rem"
  errorDiv.style.marginTop = "5px"
  errorDiv.textContent = message

  field.parentNode.appendChild(errorDiv)

  // Remover error al escribir
  field.addEventListener(
    "input",
    () => {
      field.classList.remove("error")
      const errorElement = field.parentNode.querySelector(".field-error")
      if (errorElement) {
        errorElement.remove()
      }
    },
    { once: true },
  )
}

function resetAdminForm() {
  console.log("🧹 Limpiando formulario...")

  const form = document.getElementById("adminArtworkForm")
  if (form) {
    form.reset()
  }
  // Limpiar vistas previas
  ;["previewFilePreview", "mainFilePreview"].forEach((id) => {
    const container = document.getElementById(id)
    if (container) {
      container.style.display = "none"
      container.innerHTML = ""
    }
  })

  // Resetear modo de edición
  editingArtworkId = null

  // Cambiar título del formulario
  const sectionHeader = document.querySelector("#add-artwork .admin-section-header h1")
  if (sectionHeader) {
    sectionHeader.innerHTML = '<i class="fas fa-plus-circle"></i> Agregar Nueva Obra'
  }

  // Cambiar texto del botón
  const submitBtn = document.querySelector('#adminArtworkForm button[type="submit"]')
  if (submitBtn) {
    submitBtn.innerHTML = '<i class="fas fa-plus"></i> Agregar Obra'
  }

  console.log("✅ Formulario limpiado")
}

function renderArtworksTable() {
  const tbody = document.getElementById("artworksTableBody")
  if (!tbody) return

  tbody.innerHTML = ""

  console.log(`📊 Renderizando tabla con ${adminArtworks.length} obras`)

  if (adminArtworks.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #999;">No hay obras publicadas aún</td></tr>`
    return
  }

  adminArtworks.forEach((artwork) => {
    const row = document.createElement("tr")
    row.innerHTML = `
      <td>${artwork.id}</td>
      <td>${artwork.title}</td>
      <td>${artwork.artist}</td>
      <td>${artwork.category.replace("-", " ").toUpperCase()}</td>
      <td>$${artwork.price.toFixed(2)}</td>
      <td>
        <span class="status-badge ${artwork.status || "active"}">${artwork.status || "active"}</span>
        <div style="font-size: 0.8rem; color: #ccc; margin-top: 4px;">
          ⭐ ${artwork.rating.toFixed(1)} (${artwork.reviews} ${artwork.reviews === 1 ? "reseña" : "reseñas"})
        </div>
      </td>
      <td>
        <button class="action-btn edit" onclick="editArtwork(${artwork.id})">
          <i class="fas fa-edit"></i> Editar
        </button>
        <button class="action-btn delete" onclick="deleteArtwork(${artwork.id})">
          <i class="fas fa-trash"></i> Eliminar
        </button>
      </td>
    `
    tbody.appendChild(row)
  })
}

function editArtwork(id) {
  const artwork = adminArtworks.find((a) => a.id === id)
  if (!artwork) {
    showAdminNotification("Obra no encontrada", "error")
    return
  }

  // Establecer modo de edición
  editingArtworkId = id

  // Cambiar a la sección de agregar obra
  showAdminSection("add-artwork")
  document.querySelectorAll(".admin-menu-item").forEach((item) => {
    item.classList.remove("active")
    if (item.getAttribute("data-section") === "add-artwork") {
      item.classList.add("active")
    }
  })

  // Cambiar título del formulario
  const sectionHeader = document.querySelector("#add-artwork .admin-section-header h1")
  if (sectionHeader) {
    sectionHeader.innerHTML = '<i class="fas fa-edit"></i> Editar Obra'
  }

  // Cambiar texto del botón
  const submitBtn = document.querySelector('#adminArtworkForm button[type="submit"]')
  if (submitBtn) {
    submitBtn.innerHTML = '<i class="fas fa-save"></i> Actualizar Obra'
  }

  // Llenar el formulario con los datos existentes
  document.getElementById("artworkTitle").value = artwork.title
  document.getElementById("artworkArtist").value = artwork.artist
  document.getElementById("artworkDescription").value = artwork.description
  document.getElementById("artworkPrice").value = artwork.price
  document.getElementById("artworkCategory").value = artwork.category
  document.getElementById("artworkStatus").value = artwork.status || "active"
  document.getElementById("artworkTags").value = artwork.tags || ""

  showAdminNotification(`Editando obra: ${artwork.title}`, "info")
}

function deleteArtwork(id) {
  const artwork = adminArtworks.find((a) => a.id === id)
  if (!artwork) return

  if (confirm(`¿Estás seguro de que quieres eliminar la obra "${artwork.title}"?`)) {
    // Eliminar de adminArtworks
    adminArtworks = adminArtworks.filter((artwork) => artwork.id !== id)

    // Actualizar localStorage
    localStorage.setItem("marketplace_artworks", JSON.stringify(adminArtworks))

    // Actualizar interfaz
    renderArtworksTable()
    updateAdminStats()

    addToRecentActivity(`Obra eliminada: ${artwork.title}`)
    showAdminNotification("Obra eliminada correctamente")

    // Notificar eliminación
    broadcastArtworkDeleted(id)
  }
}

function addToRecentActivity(message) {
  const activityList = document.getElementById("activityList")
  if (!activityList) return

  const activityItem = document.createElement("div")
  activityItem.className = "activity-item"
  activityItem.innerHTML = `
    <i class="fas fa-info-circle"></i>
    <span>${message}</span>
    <small>Ahora</small>
  `

  // Insertar al principio
  activityList.insertBefore(activityItem, activityList.firstChild)

  // Limitar a 10 elementos
  while (activityList.children.length > 10) {
    activityList.removeChild(activityList.lastChild)
  }
}

function showAdminNotification(message, type = "success") {
  console.log(`📢 Notificación admin: ${message} (${type})`)

  // Eliminar notificaciones existentes
  const existingNotifications = document.querySelectorAll(".admin-notification")
  existingNotifications.forEach((notification) => {
    notification.remove()
  })

  const notification = document.createElement("div")
  notification.className = "admin-notification"
  notification.textContent = message

  let backgroundColor = "#10b981"
  if (type === "error") {
    backgroundColor = "#ef4444"
  } else if (type === "info") {
    backgroundColor = "#3b82f6"
  }

  notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    background: ${backgroundColor};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    z-index: 3000;
    animation: slideIn 0.3s ease;
    max-width: 400px;
    word-wrap: break-word;
  `

  document.body.appendChild(notification)

  setTimeout(() => {
    notification.style.animation = "slideIn 0.3s ease reverse"
    setTimeout(() => {
      notification.remove()
    }, 300)
  }, 4000)
}

// Función para toggle de tema específica del admin
function toggleAdminTheme() {
  const isDarkTheme = !document.body.classList.contains("light-theme")

  if (isDarkTheme) {
    document.body.classList.add("light-theme")
    localStorage.setItem("theme", "light")
    updateAdminThemeIcon("light")
  } else {
    document.body.classList.remove("light-theme")
    localStorage.setItem("theme", "dark")
    updateAdminThemeIcon("dark")
  }
}

function updateAdminThemeIcon(theme) {
  const themeToggle = document.getElementById("themeToggle")
  if (themeToggle) {
    themeToggle.innerHTML = theme === "light" ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>'
  }
}

// Hacer funciones globales solo para admin
if (window.location.pathname.includes("admin.html")) {
  window.editArtwork = editArtwork
  window.deleteArtwork = deleteArtwork
  window.resetAdminForm = resetAdminForm
  window.deleteUser = () => alert("Función no implementada") // From v0 rewrite
}

// Inicializar tema al cargar (solo en admin)
if (window.location.pathname.includes("admin.html")) {
  document.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme === "light") {
      document.body.classList.add("light-theme")
      updateAdminThemeIcon("light")
    } else {
      updateAdminThemeIcon("dark")
    }
  })
}

// Broadcast functions (kept from original)
function broadcastArtworkUpdate(artwork, action) {
  console.log(`📡 Broadcasting ${action} artwork:`, artwork.title)

  // Method 1: Direct event on localStorage with multiple keys
  const event = {
    type: action === "added" ? "NEW_ARTWORK_ADDED" : "ARTWORK_UPDATED",
    artwork: artwork,
    timestamp: Date.now(),
  }

  // Create multiple events to ensure synchronization
  const eventKeys = [`artwork_${action}_${Date.now()}`, `marketplace_update_${Date.now()}`, `globex_sync_${Date.now()}`]

  eventKeys.forEach((key) => {
    localStorage.setItem(key, JSON.stringify(event))
  })

  // Clear events after a moment
  setTimeout(() => {
    eventKeys.forEach((key) => {
      localStorage.removeItem(key)
    })
  }, 5000)

  // Method 2: Dispatch custom event
  window.dispatchEvent(
    new CustomEvent(`artwork${action.charAt(0).toUpperCase() + action.slice(1)}`, { detail: artwork }),
  )

  // Method 3: Force direct update of the main localStorage
  setTimeout(() => {
    const currentArtworks = JSON.parse(localStorage.getItem("marketplace_artworks") || "[]")
    localStorage.setItem("marketplace_artworks", JSON.stringify(currentArtworks))

    // Dispatch storage event manually
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "marketplace_artworks",
        newValue: JSON.stringify(currentArtworks),
        oldValue: null,
        storageArea: localStorage,
      }),
    )
  }, 100)

  // Method 4: Direct notification to other tabs
  const channel = new BroadcastChannel("globex_updates")
  channel.postMessage({
    type: "ARTWORK_UPDATE",
    action: action,
    artwork: artwork,
  })

  console.log("✅ Eventos de sincronización enviados")
}

function broadcastArtworkDeleted(artworkId) {
  const event = {
    type: "ARTWORK_DELETED",
    artworkId: artworkId,
    timestamp: Date.now(),
  }

  const eventKey = `artwork_delete_${Date.now()}`
  localStorage.setItem(eventKey, JSON.stringify(event))

  setTimeout(() => {
    localStorage.removeItem(eventKey)
  }, 2000)

  window.dispatchEvent(new CustomEvent("artworkDeleted", { detail: artworkId }))
}











