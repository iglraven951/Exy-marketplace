// Archivo para conectar tu página web con el backend
// Coloca este archivo en tu carpeta js/ y úsalo en tu página HTML

const API_BASE_URL = "http://localhost:3000/api"

// ==================== OBRAS ====================

// Obtener todas las obras
async function getArtworks() {
  try {
    const response = await fetch(`${API_BASE_URL}/artworks`)
    const result = await response.json()
    if (result.success) {
      console.log("Obras obtenidas:", result.data)
      return result.data
    } else {
      console.error("Error:", result.message)
      return []
    }
  } catch (error) {
    console.error("Error al obtener obras:", error)
    return []
  }
}

// Crear nueva obra
async function createArtwork(artwork) {
  try {
    const response = await fetch(`${API_BASE_URL}/artworks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(artwork),
    })
    const result = await response.json()
    if (result.success) {
      console.log("Obra creada:", result.data)
      return result.data
    } else {
      console.error("Error:", result.message)
      return null
    }
  } catch (error) {
    console.error("Error al crear obra:", error)
    return null
  }
}

// Actualizar obra
async function updateArtwork(id, artwork) {
  try {
    const response = await fetch(`${API_BASE_URL}/artworks/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(artwork),
    })
    const result = await response.json()
    if (result.success) {
      console.log("Obra actualizada:", result.data)
      return result.data
    } else {
      console.error("Error:", result.message)
      return null
    }
  } catch (error) {
    console.error("Error al actualizar obra:", error)
    return null
  }
}

// Eliminar obra
async function deleteArtwork(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/artworks/${id}`, {
      method: "DELETE",
    })
    const result = await response.json()
    if (result.success) {
      console.log("Obra eliminada:", result.data)
      return true
    } else {
      console.error("Error:", result.message)
      return false
    }
  } catch (error) {
    console.error("Error al eliminar obra:", error)
    return false
  }
}

// ==================== PAGOS ====================

// Obtener todos los pagos
async function getPayments() {
  try {
    const response = await fetch(`${API_BASE_URL}/payments`)
    const result = await response.json()
    if (result.success) {
      console.log("Pagos obtenidos:", result.data)
      return result.data
    } else {
      console.error("Error:", result.message)
      return []
    }
  } catch (error) {
    console.error("Error al obtener pagos:", error)
    return []
  }
}

// Registrar nuevo pago
async function createPayment(payment) {
  try {
    const response = await fetch(`${API_BASE_URL}/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payment),
    })
    const result = await response.json()
    if (result.success) {
      console.log("Pago registrado:", result.data)
      return result.data
    } else {
      console.error("Error:", result.message)
      return null
    }
  } catch (error) {
    console.error("Error al registrar pago:", error)
    return null
  }
}

// Obtener pagos por obra
async function getPaymentsByArtwork(artworkId) {
  try {
    const response = await fetch(`${API_BASE_URL}/payments/artwork/${artworkId}`)
    const result = await response.json()
    if (result.success) {
      console.log("Pagos de la obra:", result.data)
      return result.data
    } else {
      console.error("Error:", result.message)
      return []
    }
  } catch (error) {
    console.error("Error al obtener pagos:", error)
    return []
  }
}

// Actualizar estado de pago
async function updatePaymentStatus(id, status) {
  try {
    const response = await fetch(`${API_BASE_URL}/payments/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    })
    const result = await response.json()
    if (result.success) {
      console.log("Pago actualizado:", result.data)
      return result.data
    } else {
      console.error("Error:", result.message)
      return null
    }
  } catch (error) {
    console.error("Error al actualizar pago:", error)
    return null
  }
}
