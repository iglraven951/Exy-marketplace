const express = require("express")
const cors = require("cors")
const fs = require("fs")
const path = require("path")
const bodyParser = require("body-parser")

const app = express()
const PORT = 3000

// Middleware
app.use(cors())
app.use(bodyParser.json({ limit: "50mb" }))
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }))

// Rutas para guardar archivos JSON
const artworksFile = path.join(__dirname, "data", "artworks.json")
const paymentsFile = path.join(__dirname, "data", "payments.json")

// Crear carpeta data si no existe
if (!fs.existsSync(path.join(__dirname, "data"))) {
  fs.mkdirSync(path.join(__dirname, "data"))
}

// Inicializar archivos JSON si no existen
if (!fs.existsSync(artworksFile)) {
  fs.writeFileSync(artworksFile, JSON.stringify([], null, 2))
}
if (!fs.existsSync(paymentsFile)) {
  fs.writeFileSync(paymentsFile, JSON.stringify([], null, 2))
}

// ==================== OBRAS (ARTWORKS) ====================

// GET - Obtener todas las obras
app.get("/api/artworks", (req, res) => {
  try {
    const data = fs.readFileSync(artworksFile, "utf-8")
    const artworks = JSON.parse(data)
    res.status(200).json({ success: true, data: artworks })
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al obtener obras", error: error.message })
  }
})

// POST - Crear nueva obra
app.post("/api/artworks", (req, res) => {
  try {
    const { title, description, price, artist, image, category } = req.body

    // Validar datos requeridos
    if (!title || !price || !artist) {
      return res.status(400).json({ success: false, message: "Faltan campos requeridos" })
    }

    const data = fs.readFileSync(artworksFile, "utf-8")
    const artworks = JSON.parse(data)

    // Crear nueva obra con ID único
    const newArtwork = {
      id: Date.now(),
      title,
      description: description || "",
      price: Number.parseFloat(price),
      artist,
      image: image || null,
      category: category || "general",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    artworks.push(newArtwork)
    fs.writeFileSync(artworksFile, JSON.stringify(artworks, null, 2))

    res.status(201).json({ success: true, message: "Obra creada exitosamente", data: newArtwork })
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al crear obra", error: error.message })
  }
})

// PUT - Actualizar obra
app.put("/api/artworks/:id", (req, res) => {
  try {
    const { id } = req.params
    const { title, description, price, artist, image, category } = req.body

    const data = fs.readFileSync(artworksFile, "utf-8")
    const artworks = JSON.parse(data)

    const index = artworks.findIndex((a) => a.id === Number.parseInt(id))
    if (index === -1) {
      return res.status(404).json({ success: false, message: "Obra no encontrada" })
    }

    // Actualizar solo los campos proporcionados
    if (title) artworks[index].title = title
    if (description !== undefined) artworks[index].description = description
    if (price) artworks[index].price = Number.parseFloat(price)
    if (artist) artworks[index].artist = artist
    if (image) artworks[index].image = image
    if (category) artworks[index].category = category
    artworks[index].updatedAt = new Date().toISOString()

    fs.writeFileSync(artworksFile, JSON.stringify(artworks, null, 2))

    res.status(200).json({ success: true, message: "Obra actualizada exitosamente", data: artworks[index] })
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al actualizar obra", error: error.message })
  }
})

// DELETE - Eliminar obra
app.delete("/api/artworks/:id", (req, res) => {
  try {
    const { id } = req.params

    const data = fs.readFileSync(artworksFile, "utf-8")
    const artworks = JSON.parse(data)

    const index = artworks.findIndex((a) => a.id === Number.parseInt(id))
    if (index === -1) {
      return res.status(404).json({ success: false, message: "Obra no encontrada" })
    }

    const deletedArtwork = artworks.splice(index, 1)
    fs.writeFileSync(artworksFile, JSON.stringify(artworks, null, 2))

    res.status(200).json({ success: true, message: "Obra eliminada exitosamente", data: deletedArtwork[0] })
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al eliminar obra", error: error.message })
  }
})

// ==================== PAGOS (PAYMENTS) ====================

// GET - Obtener todos los pagos
app.get("/api/payments", (req, res) => {
  try {
    const data = fs.readFileSync(paymentsFile, "utf-8")
    const payments = JSON.parse(data)
    res.status(200).json({ success: true, data: payments })
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al obtener pagos", error: error.message })
  }
})

// POST - Registrar nuevo pago
app.post("/api/payments", (req, res) => {
  try {
    const { artworkId, buyerName, buyerEmail, amount, paymentMethod, transactionId } = req.body

    // Validar datos requeridos
    if (!artworkId || !buyerName || !buyerEmail || !amount || !paymentMethod) {
      return res.status(400).json({ success: false, message: "Faltan campos requeridos" })
    }

    const data = fs.readFileSync(paymentsFile, "utf-8")
    const payments = JSON.parse(data)

    // Crear nuevo pago
    const newPayment = {
      id: Date.now(),
      artworkId: Number.parseInt(artworkId),
      buyerName,
      buyerEmail,
      amount: Number.parseFloat(amount),
      paymentMethod,
      transactionId: transactionId || `TXN-${Date.now()}`,
      status: "completed",
      createdAt: new Date().toISOString(),
    }

    payments.push(newPayment)
    fs.writeFileSync(paymentsFile, JSON.stringify(payments, null, 2))

    res.status(201).json({ success: true, message: "Pago registrado exitosamente", data: newPayment })
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al registrar pago", error: error.message })
  }
})

// GET - Obtener pagos por obra
app.get("/api/payments/artwork/:artworkId", (req, res) => {
  try {
    const { artworkId } = req.params
    const data = fs.readFileSync(paymentsFile, "utf-8")
    const payments = JSON.parse(data)

    const artworkPayments = payments.filter((p) => p.artworkId === Number.parseInt(artworkId))
    res.status(200).json({ success: true, data: artworkPayments })
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al obtener pagos", error: error.message })
  }
})

// PUT - Actualizar estado de pago
app.put("/api/payments/:id", (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const data = fs.readFileSync(paymentsFile, "utf-8")
    const payments = JSON.parse(data)

    const index = payments.findIndex((p) => p.id === Number.parseInt(id))
    if (index === -1) {
      return res.status(404).json({ success: false, message: "Pago no encontrado" })
    }

    payments[index].status = status || payments[index].status
    fs.writeFileSync(paymentsFile, JSON.stringify(payments, null, 2))

    res.status(200).json({ success: true, message: "Pago actualizado exitosamente", data: payments[index] })
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al actualizar pago", error: error.message })
  }
})

// ==================== HEALTH CHECK ====================

app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "Servidor activo" })
})

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
  console.log(`API disponible en http://localhost:${PORT}/api`)
})
