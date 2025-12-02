// Sistema de contacto mejorado
const CSRF_TOKEN = "your_csrf_token_here" // Declare CSRF_TOKEN variable

document.addEventListener("DOMContentLoaded", () => {
  console.log("📧 Inicializando sistema de contacto...")

  const contactForm = document.getElementById("contactForm")
  if (contactForm) {
    contactForm.addEventListener("submit", handleContactSubmit)
    console.log("✅ Formulario de contacto configurado")
  }
})

function handleContactSubmit(e) {
  e.preventDefault()
  console.log("📧 Procesando formulario de contacto...")

  // Verificar token CSRF
  const formToken = document.getElementById("contactCsrfToken")?.value
  if (formToken !== CSRF_TOKEN) {
    showNotification("Error de seguridad. Por favor, recarga la página.", "error")
    return
  }

  const formData = {
    name: document.getElementById("contactName")?.value?.trim(),
    email: document.getElementById("contactEmail")?.value?.trim(),
    subject: document.getElementById("contactSubject")?.value?.trim(),
    message: document.getElementById("contactMessage")?.value?.trim(),
  }

  // Validar campos
  let isValid = true

  if (!formData.name || formData.name.length < 2) {
    showContactFieldError("contactName", "El nombre debe tener al menos 2 caracteres")
    isValid = false
  }

  if (!validateEmail(formData.email)) {
    showContactFieldError("contactEmail", "Por favor, introduce un email válido")
    isValid = false
  }

  if (!formData.subject || formData.subject.length < 5) {
    showContactFieldError("contactSubject", "El asunto debe tener al menos 5 caracteres")
    isValid = false
  }

  if (!formData.message || formData.message.length < 10) {
    showContactFieldError("contactMessage", "El mensaje debe tener al menos 10 caracteres")
    isValid = false
  }

  if (!isValid) return

  // Simular envío del formulario
  const submitBtn = e.target.querySelector('button[type="submit"]')
  const originalText = submitBtn.innerHTML

  submitBtn.disabled = true
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...'

  // Simular delay de envío
  setTimeout(() => {
    // Guardar mensaje en localStorage (simulación)
    const messages = JSON.parse(localStorage.getItem("contact_messages") || "[]")
    const newMessage = {
      id: Date.now(),
      ...formData,
      timestamp: new Date().toISOString(),
      status: "received",
    }

    messages.push(newMessage)
    localStorage.setItem("contact_messages", JSON.stringify(messages))

    // Limpiar formulario
    document.getElementById("contactForm").reset()

    // Restaurar botón
    submitBtn.disabled = false
    submitBtn.innerHTML = originalText

    // Mostrar mensaje de éxito
    showNotification("¡Mensaje enviado correctamente! Te contactaremos pronto. 📧", "success")

    console.log("✅ Mensaje de contacto enviado:", newMessage)
  }, 2000)
}

function showContactFieldError(fieldId, message) {
  const field = document.getElementById(fieldId)
  const errorElement = document.getElementById(fieldId + "Error")

  if (!field) return

  // Mostrar error visual en el campo
  field.classList.add("error")

  // Mostrar mensaje de error si existe el elemento
  if (errorElement) {
    errorElement.textContent = message
    errorElement.style.display = "block"
  } else {
    // Crear elemento de error si no existe
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
  }

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
      const errorMsg = document.getElementById(fieldId + "Error")
      if (errorMsg) {
        errorMsg.style.display = "none"
      }
    },
    { once: true },
  )
}

function validateEmail(email) {
  const re =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

  if (!email || email.length < 5 || email.length > 254) {
    return false
  }

  if (email.startsWith(".") || email.endsWith(".")) {
    return false
  }

  if (email.includes("..")) {
    return false
  }

  const atCount = (email.match(/@/g) || []).length
  if (atCount !== 1) {
    return false
  }

  return re.test(email.toLowerCase())
}

// Función para obtener mensajes de contacto (para admin)
function getContactMessages() {
  return JSON.parse(localStorage.getItem("contact_messages") || "[]")
}

// Función para mostrar notificaciones
function showNotification(message, type) {
  const notificationDiv = document.createElement("div")
  notificationDiv.className = `notification ${type}`
  notificationDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: ${type === "success" ? "#4ade80" : "#ef4444"};
        color: white;
        padding: 10px;
        border-radius: 5px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        z-index: 1000;
    `
  notificationDiv.textContent = message
  document.body.appendChild(notificationDiv)

  // Ocultar notificación después de 3 segundos
  setTimeout(() => {
    notificationDiv.remove()
  }, 3000)
}

// Hacer función global
if (!window.location.pathname.includes("admin.html")) {
  window.getContactMessages = getContactMessages
  window.showNotification = showNotification // Declare showNotification function globally
}

