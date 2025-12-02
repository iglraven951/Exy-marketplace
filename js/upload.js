// Funciones para el sistema de subida de archivos mejorado

document.addEventListener("DOMContentLoaded", () => {
  initializeFileUpload()
})

function initializeFileUpload() {
  // Configurar áreas de subida de archivos
  setupFileUploadArea("previewUploadArea", "preview-upload", handlePreviewFiles)
  setupFileUploadArea("mainUploadArea", "main-upload", handleMainFiles)
  setupFileUploadArea("extraUploadArea", "extra-upload", handleExtraFiles)

  // Configurar formulario
  const form = document.getElementById("artworkForm")
  if (form) {
    form.addEventListener("submit", handleFormSubmit)
  }
}

function setupFileUploadArea(areaId, inputId, handler) {
  const area = document.getElementById(areaId)
  const input = document.getElementById(inputId)

  if (!area || !input) return

  // Click para seleccionar archivos
  area.addEventListener("click", () => input.click())

  // Drag and drop
  area.addEventListener("dragover", (e) => {
    e.preventDefault()
    area.classList.add("dragover")
  })

  area.addEventListener("dragleave", (e) => {
    e.preventDefault()
    area.classList.remove("dragover")
  })

  area.addEventListener("drop", (e) => {
    e.preventDefault()
    area.classList.remove("dragover")
    const files = e.dataTransfer.files
    handleFiles(files, handler, inputId)
  })

  // Cambio en input
  input.addEventListener("change", (e) => {
    handleFiles(e.target.files, handler, inputId)
  })
}

function handleFiles(files, handler, inputId) {
  if (files.length > 0) {
    handler(files, inputId)
  }
}

function handlePreviewFiles(files, inputId) {
  const file = files[0]
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"]
  const maxSize = 5 * 1024 * 1024 // 5MB

  if (!allowedTypes.includes(file.type)) {
    showNotification("Solo se permiten archivos PNG, JPG o JPEG", "error")
    return
  }

  if (file.size > maxSize) {
    showNotification("La imagen no puede superar los 5MB", "error")
    return
  }

  displayFilePreview([file], "previewFilePreview", true)
  showNotification("Imagen de vista previa cargada correctamente")
}

function handleMainFiles(files, inputId) {
  const allowedTypes = [
    "application/zip",
    "application/x-zip-compressed",
    "application/x-rar-compressed",
    "application/vnd.rar",
    "image/vnd.adobe.photoshop", // PSD
    "application/postscript", // AI
    "application/octet-stream", // Para archivos como .sketch, .fig, etc.
  ]
  const maxSize = 100 * 1024 * 1024 // 100MB

  const validFiles = []

  for (const file of files) {
    // Verificar por extensión también
    const extension = file.name.toLowerCase().split(".").pop()
    const validExtensions = ["zip", "rar", "psd", "ai", "sketch", "fig", "xd"]

    if (!allowedTypes.includes(file.type) && !validExtensions.includes(extension)) {
      showNotification(
        `Archivo ${file.name} no es válido. Solo se permiten ZIP, RAR, PSD, AI, SKETCH, FIG, XD`,
        "error",
      )
      continue
    }

    if (file.size > maxSize) {
      showNotification(`Archivo ${file.name} supera el límite de 100MB`, "error")
      continue
    }

    validFiles.push(file)
  }

  if (validFiles.length > 0) {
    displayFilePreview(validFiles, "mainFilePreview")
    showNotification(`${validFiles.length} archivo(s) principal(es) cargado(s) correctamente`)
  }
}

function handleExtraFiles(files, inputId) {
  const allowedTypes = [
    "application/pdf",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/zip",
    "application/x-zip-compressed",
    "application/x-rar-compressed",
    "application/vnd.rar",
  ]
  const maxSize = 50 * 1024 * 1024 // 50MB

  const validFiles = []

  for (const file of files) {
    const extension = file.name.toLowerCase().split(".").pop()
    const validExtensions = ["pdf", "txt", "doc", "docx", "zip", "rar"]

    if (!allowedTypes.includes(file.type) && !validExtensions.includes(extension)) {
      showNotification(`Archivo ${file.name} no es válido. Solo se permiten PDF, TXT, DOC, DOCX, ZIP, RAR`, "error")
      continue
    }

    if (file.size > maxSize) {
      showNotification(`Archivo ${file.name} supera el límite de 50MB`, "error")
      continue
    }

    validFiles.push(file)
  }

  if (validFiles.length > 0) {
    displayFilePreview(validFiles, "extraFilePreview")
    showNotification(`${validFiles.length} archivo(s) adicional(es) cargado(s) correctamente`)
  }
}

function displayFilePreview(files, containerId, isImage = false) {
  const container = document.getElementById(containerId)
  if (!container) return

  container.style.display = "block"
  container.innerHTML = ""

  files.forEach((file, index) => {
    const fileItem = document.createElement("div")
    fileItem.className = "file-item"

    const fileInfo = document.createElement("div")
    fileInfo.className = "file-info"

    const fileIcon = document.createElement("div")
    fileIcon.className = "file-icon"

    // Determinar icono según tipo de archivo
    const extension = file.name.toLowerCase().split(".").pop()
    let iconText = extension.toUpperCase().substring(0, 3)

    if (isImage) {
      iconText = "IMG"
    } else if (["zip", "rar"].includes(extension)) {
      iconText = "ZIP"
    } else if (["psd"].includes(extension)) {
      iconText = "PSD"
    } else if (["ai"].includes(extension)) {
      iconText = "AI"
    }

    fileIcon.textContent = iconText

    const fileDetails = document.createElement("div")
    fileDetails.className = "file-details"

    const fileName = document.createElement("h5")
    fileName.textContent = file.name

    const fileSize = document.createElement("span")
    fileSize.textContent = formatFileSize(file.size)

    fileDetails.appendChild(fileName)
    fileDetails.appendChild(fileSize)

    fileInfo.appendChild(fileIcon)
    fileInfo.appendChild(fileDetails)

    const removeBtn = document.createElement("button")
    removeBtn.className = "file-remove"
    removeBtn.innerHTML = "×"
    removeBtn.onclick = () => removeFile(fileItem, containerId)

    fileItem.appendChild(fileInfo)
    fileItem.appendChild(removeBtn)

    container.appendChild(fileItem)

    // Si es imagen, mostrar vista previa
    if (isImage && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        fileIcon.style.backgroundImage = `url(${e.target.result})`
        fileIcon.style.backgroundSize = "cover"
        fileIcon.style.backgroundPosition = "center"
        fileIcon.textContent = ""
      }
      reader.readAsDataURL(file)
    }
  })
}

function removeFile(fileItem, containerId) {
  fileItem.remove()

  const container = document.getElementById(containerId)
  if (container && container.children.length === 0) {
    container.style.display = "none"
  }

  showNotification("Archivo eliminado")
}

function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

function handleFormSubmit(e) {
  e.preventDefault()

  // Validar formulario
  if (!validateForm()) {
    return
  }

  // Simular subida
  const submitBtn = e.target.querySelector('button[type="submit"]')
  const originalText = submitBtn.innerHTML

  submitBtn.disabled = true
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subiendo...'

  // Simular proceso de subida
  setTimeout(() => {
    showNotification("¡Obra subida exitosamente! Será revisada por nuestro equipo.")

    // Cerrar formulario
    // Declare toggleUploadForm function or import it before using
    const toggleUploadForm = () => {
      // Implementation of toggleUploadForm
    }
    if (typeof toggleUploadForm === "function") {
      toggleUploadForm()
    }

    resetForm()

    submitBtn.disabled = false
    submitBtn.innerHTML = originalText
  }, 3000)
}

function validateForm() {
  const requiredFields = ["title", "price", "description", "category"]

  let isValid = true

  requiredFields.forEach((fieldName) => {
    const field = document.querySelector(`[name="${fieldName}"]`)
    if (!field || !field.value.trim()) {
      showFieldError(field?.id || fieldName, "Este campo es obligatorio")
      isValid = false
    }
  })

  // Validar archivos
  const previewFiles = document.getElementById("previewFilePreview")
  const mainFiles = document.getElementById("mainFilePreview")

  if (!previewFiles || previewFiles.style.display === "none" || previewFiles.children.length === 0) {
    showNotification("Debes subir una imagen de vista previa", "error")
    isValid = false
  }

  if (!mainFiles || mainFiles.style.display === "none" || mainFiles.children.length === 0) {
    showNotification("Debes subir al menos un archivo principal", "error")
    isValid = false
  }

  // Validar términos
  const termsCheckbox = document.querySelector('[name="terms"]')
  if (!termsCheckbox || !termsCheckbox.checked) {
    showNotification("Debes aceptar los términos y condiciones", "error")
    isValid = false
  }

  return isValid
}

function resetForm() {
  const form = document.getElementById("artworkForm")
  if (form) {
    form.reset()
  }
  // Limpiar vistas previas
  ;["previewFilePreview", "mainFilePreview", "extraFilePreview"].forEach((id) => {
    const container = document.getElementById(id)
    if (container) {
      container.style.display = "none"
      container.innerHTML = ""
    }
  })
}

// Función para mostrar errores en campos específicos
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

// Función para mostrar notificaciones (usar la del script principal si existe)
function showNotification(message, type = "success") {
  // Si existe la función global, usarla
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

