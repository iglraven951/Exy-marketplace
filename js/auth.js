// Funciones para el sistema de autenticación - VERSIÓN MEJORADA
let currentUser = null
const USERS_KEY = "marketplace_users"
const CURRENT_USER_KEY = "marketplace_current_user"
const ORDERS_KEY = "marketplace_orders"
const CSRF_TOKEN = generateCSRFToken()

// Función para mostrar notificaciones
function showNotification(message, type = "success") {
  console.log(`📢 Notification (${type}): ${message}`)

  // Usar la función global si existe
  if (typeof window.showNotification === "function") {
    window.showNotification(message, type)
    return
  }

  // Fallback local
  const notification = document.createElement("div")
  notification.className = `notification ${type}`
  notification.textContent = message
  notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    background: ${type === "error" ? "#ef4444" : "#10b981"};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    z-index: 3000;
    animation: slideIn 0.3s ease;
  `

  document.body.appendChild(notification)

  setTimeout(() => {
    notification.remove()
  }, 3000)
}

// Solo inicializar auth si NO estamos en admin
document.addEventListener("DOMContentLoaded", () => {
  if (!window.location.pathname.includes("admin.html")) {
    initAuth()
  }
})

// Cargar usuarios del localStorage
function loadUsers() {
  const users = localStorage.getItem(USERS_KEY)
  return users ? JSON.parse(users) : []
}

// Guardar usuarios en localStorage
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))

  // Notificar al admin sobre cambios en usuarios
  broadcastUserUpdate()
}

// Cargar pedidos del localStorage
function loadOrders() {
  const orders = localStorage.getItem(ORDERS_KEY)
  return orders ? JSON.parse(orders) : []
}

// Guardar pedidos en localStorage
function saveOrders(orders) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders))

  // Notificar al admin sobre cambios en pedidos
  broadcastOrderUpdate()
}

// Crear un nuevo pedido
function createOrder(cart, user, paymentMethod) {
  const orders = loadOrders()

  const newOrder = {
    id: Date.now(),
    userId: user.id,
    userInfo: {
      name: user.name,
      email: user.email,
    },
    items: cart.map((item) => ({
      id: item.id,
      title: item.title,
      artist: item.artist,
      price: item.price,
      quantity: item.quantity,
      category: item.category,
    })),
    total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    paymentMethod: paymentMethod,
    status: "completed",
    orderDate: new Date().toISOString(),
    orderNumber: `ORD-${Date.now()}`,
  }

  orders.push(newOrder)
  saveOrders(orders)

  console.log("📦 Nuevo pedido creado:", newOrder)
  return newOrder
}

// Generar token CSRF
function generateCSRFToken() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Inicializar sistema de autenticación
function initAuth() {
  console.log("🔐 Inicializando sistema de autenticación...")

  // Cargar usuario actual si existe
  const savedUser = localStorage.getItem(CURRENT_USER_KEY)
  if (savedUser) {
    currentUser = JSON.parse(savedUser)
    updateAuthUI()
    console.log("👤 Usuario cargado:", currentUser.name)
  }

  // Configurar eventos para los formularios
  const loginForm = document.getElementById("loginForm")
  const registerForm = document.getElementById("registerForm")

  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin)
  }

  if (registerForm) {
    registerForm.addEventListener("submit", handleRegister)
  }

  // Configurar eventos para las pestañas
  document.querySelectorAll(".auth-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".auth-tab").forEach((t) => t.classList.remove("active"))
      tab.classList.add("active")

      document.querySelectorAll(".auth-form").forEach((form) => form.classList.remove("active"))
      const targetForm = document.getElementById(tab.getAttribute("data-form"))
      if (targetForm) {
        targetForm.classList.add("active")
      }
    })
  })

  // Configurar botones de cierre
  document.querySelectorAll(".close-auth").forEach((btn) => {
    btn.addEventListener("click", closeAuthModal)
  })

  // Cerrar modal al hacer clic fuera
  const authModal = document.getElementById("authModal")
  if (authModal) {
    authModal.addEventListener("click", function (e) {
      if (e.target === this) closeAuthModal()
    })
  }

  // Configurar botones de inicio de sesión social
  const googleLoginBtn = document.getElementById("googleLoginBtn")
  const facebookLoginBtn = document.getElementById("facebookLoginBtn")

  if (googleLoginBtn) {
    googleLoginBtn.addEventListener("click", () => {
      signInWithGoogle()
    })
  }

  if (facebookLoginBtn) {
    facebookLoginBtn.addEventListener("click", () => {
      showNotification("Inicio de sesión con Facebook no implementado en esta demo")
    })
  }

  // Configurar botón de cierre de sesión
  const logoutBtn = document.getElementById("logoutBtn")
  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout)
  }

  console.log("✅ Sistema de autenticación inicializado")
}

// Mostrar modal de autenticación
function showAuthModal() {
  const authModal = document.getElementById("authModal")
  if (authModal) {
    authModal.style.display = "block"
  }
}

// Cerrar modal de autenticación
function closeAuthModal() {
  const authModal = document.getElementById("authModal")
  if (authModal) {
    authModal.style.display = "none"
  }
}

// Manejar inicio de sesión
function handleLogin(e) {
  e.preventDefault()
  console.log("🔐 Procesando login...")

  // Verificar token CSRF
  const formToken = document.getElementById("loginCsrfToken")?.value
  if (formToken !== CSRF_TOKEN) {
    showNotification("Error de seguridad. Por favor, recarga la página.", "error")
    return
  }

  const email = document.getElementById("loginEmail")?.value
  const password = document.getElementById("loginPassword")?.value

  // Validar campos
  if (!validateEmail(email)) {
    showFieldError("loginEmail", "Por favor, introduce un email válido")
    return
  }

  if (!password) {
    showFieldError("loginPassword", "La contraseña es obligatoria")
    return
  }

  // Buscar usuario
  const users = loadUsers()
  const user = users.find((u) => u.email === email)

  if (!user || !verifyPassword(password, user.password)) {
    showNotification("Email o contraseña incorrectos", "error")
    return
  }

  // Actualizar última conexión
  user.lastLogin = new Date().toISOString()
  const userIndex = users.findIndex((u) => u.id === user.id)
  if (userIndex !== -1) {
    users[userIndex] = user
    saveUsers(users)
  }

  // Iniciar sesión
  loginUser(user)
  closeAuthModal()
  showNotification(`¡Bienvenido de vuelta, ${user.name}!`)
}

// Manejar registro
function handleRegister(e) {
  e.preventDefault()
  console.log("📝 Procesando registro...")

  // Verificar token CSRF
  const formToken = document.getElementById("registerCsrfToken")?.value
  if (formToken !== CSRF_TOKEN) {
    showNotification("Error de seguridad. Por favor, recarga la página.", "error")
    return
  }

  const name = document.getElementById("registerName")?.value?.trim()
  const email = document.getElementById("registerEmail")?.value?.trim().toLowerCase()
  const password = document.getElementById("registerPassword")?.value
  const confirmPassword = document.getElementById("registerConfirmPassword")?.value

  // Validar campos
  let isValid = true

  if (!name || name.length < 2) {
    showFieldError("registerName", "El nombre debe tener al menos 2 caracteres")
    isValid = false
  }

  if (!validateEmail(email)) {
    showFieldError("registerEmail", "Por favor, introduce un email válido")
    isValid = false
  }

  if (password.length < 6) {
    showFieldError("registerPassword", "La contraseña debe tener al menos 6 caracteres")
    isValid = false
  }

  if (password !== confirmPassword) {
    showFieldError("registerConfirmPassword", "Las contraseñas no coinciden")
    isValid = false
  }

  if (!isValid) return

  // Verificar duplicados más estrictamente
  const users = loadUsers()

  // Verificar email duplicado
  const existingEmailUser = users.find((u) => u.email.toLowerCase() === email)
  if (existingEmailUser) {
    showFieldError("registerEmail", "Este email ya está registrado")
    showNotification("Ya existe una cuenta con este email. ¿Quieres iniciar sesión?", "error")
    return
  }

  // Verificar nombre duplicado (opcional, pero recomendado)
  const existingNameUser = users.find((u) => u.name.toLowerCase() === name.toLowerCase())
  if (existingNameUser) {
    showFieldError("registerName", "Este nombre de usuario ya está en uso")
    showNotification("Por favor, elige un nombre de usuario diferente", "error")
    return
  }

  // Validaciones adicionales de seguridad
  if (
    password.toLowerCase().includes(name.toLowerCase()) ||
    password.toLowerCase().includes(email.split("@")[0].toLowerCase())
  ) {
    showFieldError("registerPassword", "La contraseña no debe contener tu nombre o email")
    isValid = false
    return
  }

  // Crear nuevo usuario
  const newUser = {
    id: Date.now(),
    name: name,
    email: email,
    password: hashPassword(password),
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    isActive: true,
    orders: [],
    preferences: {
      theme: "dark",
      notifications: true,
    },
    profile: {
      avatar: null,
      bio: "",
      location: "",
      website: "",
    },
  }

  users.push(newUser)
  saveUsers(users)

  console.log("👤 Nuevo usuario registrado:", newUser.name)

  // Limpiar formulario
  document.getElementById("registerForm").reset()

  // Iniciar sesión con el nuevo usuario
  loginUser(newUser)
  closeAuthModal()
  showNotification(`¡Cuenta creada correctamente! Bienvenido, ${newUser.name}! 🎉`)
}

// Iniciar sesión con un usuario
function loginUser(user) {
  // No guardar la contraseña en el objeto de usuario actual
  const { password, ...userWithoutPassword } = user
  currentUser = userWithoutPassword
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser))
  updateAuthUI()

  console.log("✅ Usuario logueado:", currentUser.name)
}

// Cerrar sesión
function handleLogout() {
  console.log("👋 Cerrando sesión de:", currentUser?.name)
  currentUser = null
  localStorage.removeItem(CURRENT_USER_KEY)
  updateAuthUI()
  showNotification("Has cerrado sesión")
}

// Actualizar la interfaz según el estado de autenticación
function updateAuthUI() {
  const authBtn = document.getElementById("authButton")
  const logoutBtn = document.getElementById("logoutBtn")
  const userMenu = document.getElementById("userMenu")
  const userName = document.getElementById("userName")

  if (currentUser) {
    if (authBtn) authBtn.style.display = "none"
    if (userMenu) userMenu.style.display = "flex"
    if (userName) userName.textContent = currentUser.name
  } else {
    if (authBtn) authBtn.style.display = "flex"
    if (userMenu) userMenu.style.display = "none"
  }
}

// Validar email
function validateEmail(email) {
  // Expresión regular más estricta para emails
  const re =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

  // Validaciones adicionales
  if (!email || email.length < 5 || email.length > 254) {
    return false
  }

  // No debe empezar o terminar con punto
  if (email.startsWith(".") || email.endsWith(".")) {
    return false
  }

  // No debe tener puntos consecutivos
  if (email.includes("..")) {
    return false
  }

  // Verificar que tenga exactamente un @
  const atCount = (email.match(/@/g) || []).length
  if (atCount !== 1) {
    return false
  }

  return re.test(email.toLowerCase())
}

// Mostrar error en un campo
function showFieldError(fieldId, message) {
  const field = document.getElementById(fieldId)
  if (!field) return

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
  errorDiv.style.cssText = `
    color: #ef4444;
    font-size: 0.8rem;
    margin-top: 5px;
    display: flex;
    align-items: center;
    gap: 5px;
  `
  errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`

  field.parentNode.appendChild(errorDiv)

  // Enfocar el campo con error
  field.focus()

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

// Simular hash de contraseña (en una app real usaríamos bcrypt)
function hashPassword(password) {
  return btoa(password + "globex_salt_2024")
}

// Verificar contraseña
function verifyPassword(password, hashedPassword) {
  return btoa(password + "globex_salt_2024") === hashedPassword
}

// Iniciar sesión con Google (simulado)
function signInWithGoogle() {
  const googleUser = {
    id: "google_" + Date.now(),
    name: "Usuario de Google",
    email: "usuario@gmail.com",
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    isActive: true,
    orders: [],
    preferences: {
      theme: "dark",
      notifications: true,
    },
  }

  // Guardar usuario si no existe
  const users = loadUsers()
  let existingUser = users.find((u) => u.email === googleUser.email)

  if (!existingUser) {
    users.push({
      ...googleUser,
      password: hashPassword(Math.random().toString(36).substring(2)),
    })
    saveUsers(users)
    existingUser = googleUser
  } else {
    // Actualizar última conexión
    existingUser.lastLogin = new Date().toISOString()
    const userIndex = users.findIndex((u) => u.id === existingUser.id)
    if (userIndex !== -1) {
      users[userIndex] = existingUser
      saveUsers(users)
    }
  }

  loginUser(existingUser)
  closeAuthModal()
  showNotification("¡Has iniciado sesión con Google!")
}

// Función para obtener el usuario actual
function getCurrentUser() {
  return currentUser
}

// Función para verificar si el usuario está logueado
function isUserLoggedIn() {
  return currentUser !== null
}

// Función para obtener estadísticas de usuarios para el admin
function getUserStats() {
  const users = loadUsers()
  const orders = loadOrders()

  return {
    totalUsers: users.length,
    activeUsers: users.filter((u) => u.isActive).length,
    newUsersThisMonth: users.filter((u) => {
      const userDate = new Date(u.createdAt)
      const now = new Date()
      return userDate.getMonth() === now.getMonth() && userDate.getFullYear() === now.getFullYear()
    }).length,
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
  }
}

// Función para obtener todos los usuarios (solo para admin)
function getAllUsers() {
  return loadUsers().map((user) => {
    const { password, ...userWithoutPassword } = user
    return userWithoutPassword
  })
}

// Función para obtener todos los pedidos (solo para admin)
function getAllOrders() {
  return loadOrders()
}

// Función para procesar un pago y crear pedido
function processPayment(cart, paymentMethod) {
  if (!isUserLoggedIn()) {
    showNotification("Debes iniciar sesión para realizar una compra", "error")
    showAuthModal()
    return false
  }

  if (!cart || cart.length === 0) {
    showNotification("Tu carrito está vacío", "error")
    return false
  }

  try {
    // Crear el pedido
    const order = createOrder(cart, currentUser, paymentMethod)

    // Actualizar el historial de pedidos del usuario
    const users = loadUsers()
    const userIndex = users.findIndex((u) => u.id === currentUser.id)
    if (userIndex !== -1) {
      if (!users[userIndex].orders) {
        users[userIndex].orders = []
      }
      users[userIndex].orders.push(order.id)
      saveUsers(users)
    }

    console.log("💳 Pago procesado exitosamente:", order.orderNumber)
    return order
  } catch (error) {
    console.error("❌ Error procesando pago:", error)
    showNotification("Error al procesar el pago. Inténtalo de nuevo.", "error")
    return false
  }
}

// Funciones para notificar cambios al admin
function broadcastUserUpdate() {
  const event = {
    type: "USER_UPDATE",
    timestamp: Date.now(),
    stats: getUserStats(),
  }

  // Múltiples métodos de notificación
  localStorage.setItem(`user_update_${Date.now()}`, JSON.stringify(event))

  window.dispatchEvent(new CustomEvent("userUpdate", { detail: event }))

  const channel = new BroadcastChannel("globex_updates")
  channel.postMessage(event)

  // Limpiar evento después de un momento
  setTimeout(() => {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("user_update_")) {
        localStorage.removeItem(key)
      }
    })
  }, 5000)
}

function broadcastOrderUpdate() {
  const event = {
    type: "ORDER_UPDATE",
    timestamp: Date.now(),
    stats: getUserStats(),
  }

  // Múltiples métodos de notificación
  localStorage.setItem(`order_update_${Date.now()}`, JSON.stringify(event))

  window.dispatchEvent(new CustomEvent("orderUpdate", { detail: event }))

  const channel = new BroadcastChannel("globex_updates")
  channel.postMessage(event)

  // Limpiar evento después de un momento
  setTimeout(() => {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("order_update_")) {
        localStorage.removeItem(key)
      }
    })
  }, 5000)
}

// Hacer funciones globales solo si NO estamos en admin
if (!window.location.pathname.includes("admin.html")) {
  window.showAuthModal = showAuthModal
  window.closeAuthModal = closeAuthModal
  window.CSRF_TOKEN = CSRF_TOKEN
  window.showNotification = showNotification
  window.getCurrentUser = getCurrentUser
  window.isUserLoggedIn = isUserLoggedIn
  window.processPayment = processPayment
  window.getUserStats = getUserStats
  window.getAllUsers = getAllUsers
  window.getAllOrders = getAllOrders
}





