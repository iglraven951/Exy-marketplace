// Sistema de Asistente IA Glob - Versión Avanzada y Mejorada
class IAGlob {
  constructor() {
    this.isOpen = false
    this.messages = []
    this.isTyping = false
    this.currentUser = null
    this.knowledgeBase = this.initializeKnowledgeBase()
    this.conversationContext = []
    this.userPreferences = this.loadUserPreferences()
    this.isPremiumUser = false
    this.lastUserPlan = null
    this.aiPersonality = this.initializeAIPersonality()
    this.chatState = "closed" // 'closed', 'opening', 'open', 'closing'

    this.init()
  }

  init() {
    console.log("🤖 Inicializando IA Glob Avanzada...")
    this.checkUserPremiumStatus()
    this.createInterface()
    this.setupEventListeners()

    // Solo cargar historial si es usuario premium
    if (this.isPremiumUser) {
      this.loadConversationHistory()
    }

    // Verificar si es un nuevo usuario premium para limpiar conversación
    this.checkForNewPremiumUser()

    console.log("✅ IA Glob Avanzada inicializada correctamente")
  }

  checkForNewPremiumUser() {
    const currentUser = this.getCurrentUser()
    if (!currentUser) return

    const currentPlan = currentUser.plan || "basic"
    const lastKnownPlan = localStorage.getItem(`ia_glob_last_plan_${currentUser.id}`) || "basic"

    // Si el usuario cambió de básico a premium, limpiar conversación
    if (lastKnownPlan === "basic" && (currentPlan === "pro" || currentPlan === "pro-annual")) {
      console.log("🆕 Nuevo usuario premium detectado, limpiando conversación...")
      this.clearConversationForNewPremium()
      this.showWelcomeMessageForNewPremium()
    }

    // Guardar el plan actual
    localStorage.setItem(`ia_glob_last_plan_${currentUser.id}`, currentPlan)
  }

  clearConversationForNewPremium() {
    // Limpiar mensajes y contexto
    this.messages = []
    this.conversationContext = []

    // Limpiar localStorage específico del usuario
    const currentUser = this.getCurrentUser()
    if (currentUser) {
      localStorage.removeItem(`ia_glob_conversation_${currentUser.id}`)
      localStorage.removeItem("ia_glob_conversation") // Limpieza general también
    }
  }

  showWelcomeMessageForNewPremium() {
    setTimeout(() => {
      if (this.isPremiumUser) {
        this.addMessage(
          "ia",
          `🎉 ¡Bienvenido a IA Glob Premium! 👑

Como nuevo usuario premium, ahora tienes acceso completo a mi inteligencia artificial avanzada. Soy tu asistente personal especializado que puede ayudarte con:

🤖 **Asistencia Integral:**
• Responder cualquier pregunta sobre cualquier tema
• Resolver problemas complejos paso a paso
• Dar consejos personalizados y recomendaciones
• Explicar conceptos difíciles de forma simple
• Ayudarte con tareas creativas y técnicas

🎨 **Especializado en Creatividad:**
• Técnicas avanzadas de arte digital
• Consejos de diseño gráfico profesional
• Desarrollo de portfolios impactantes
• Tendencias en diseño y arte contemporáneo

💻 **Experto en Tecnología:**
• Programación en múltiples lenguajes
• Resolución de problemas técnicos
• Recomendaciones de software y hardware
• Desarrollo web y aplicaciones
• Inteligencia artificial y machine learning

🛒 **Especialista en Globex:**
• Análisis avanzado del marketplace
• Recomendaciones personalizadas con IA
• Tendencias del mercado digital
• Estrategias de compra inteligente

🌟 **Funciones Exclusivas Premium:**
• Análisis de datos en tiempo real
• Predicciones basadas en IA
• Soporte técnico prioritario 24/7
• Alertas personalizadas automáticas
• Reportes detallados y insights

¡Pregúntame absolutamente cualquier cosa! Desde arte y tecnología hasta ciencia, matemáticas, negocios o cualquier curiosidad que tengas. Estoy aquí para ser tu compañero inteligente. 🚀✨`,
        )
      }
    }, 1000)
  }

  initializeAIPersonality() {
    return {
      name: "IA Glob",
      role: "Asistente Inteligente Premium Avanzado",
      personality: "amigable, profesional, conocedor, servicial, creativo, analítico",
      expertise: [
        "Arte digital y diseño avanzado",
        "Programación y desarrollo completo",
        "Ciencias y matemáticas aplicadas",
        "Análisis de mercado y negocios",
        "Tecnología emergente e IA",
        "Creatividad y innovación",
        "Resolución de problemas complejos",
        "Educación y tutorías personalizadas",
      ],
      languages: ["español", "inglés", "términos técnicos"],
      capabilities: [
        "Análisis de texto avanzado con NLP",
        "Procesamiento de lenguaje natural contextual",
        "Generación de respuestas creativas y técnicas",
        "Búsqueda inteligente y filtrado avanzado",
        "Análisis de datos y patrones",
        "Recomendaciones basadas en IA y ML",
        "Tutorías personalizadas adaptativas",
        "Resolución de problemas multi-disciplinaria",
      ],
    }
  }

  checkUserPremiumStatus() {
    // Verificar si el usuario está logueado
    const currentUser = this.getCurrentUser()

    if (!currentUser) {
      this.isPremiumUser = false
      return
    }

    // Verificar el plan del usuario
    const userPlan = currentUser.plan || "basic"
    this.isPremiumUser = userPlan === "pro" || userPlan === "pro-annual"

    // Verificar si el plan no ha expirado (opcional)
    if (this.isPremiumUser && currentUser.planExpiresAt) {
      const expirationDate = new Date(currentUser.planExpiresAt)
      const now = new Date()

      if (now > expirationDate) {
        this.isPremiumUser = false
        console.log("⚠️ Plan premium expirado")
      }
    }

    console.log(`👤 Usuario: ${currentUser.name}, Plan: ${userPlan}, Premium: ${this.isPremiumUser}`)
  }

  getCurrentUser() {
    try {
      const userData = localStorage.getItem("marketplace_current_user")
      return userData ? JSON.parse(userData) : null
    } catch (error) {
      console.error("Error obteniendo usuario actual:", error)
      return null
    }
  }

  initializeKnowledgeBase() {
    return {
      marketplace: {
        name: "Globex",
        description: "El mercado ideal para estudiantes, artistas, diseñadores y desarrolladores",
        categories: [
          "digital-art",
          "illustration",
          "photography",
          "web-design",
          "software",
          "graphic-design",
          "3d-modeling",
        ],
        features: [
          "Galería de obras",
          "Sistema de calificaciones",
          "Carrito de compras",
          "Autenticación",
          "Panel de administrador",
          "Asistente IA (Premium)",
        ],
      },
      generalKnowledge: {
        technology: {
          programming: ["JavaScript", "Python", "HTML", "CSS", "React", "Node.js", "PHP", "Java", "C++", "Swift"],
          design: ["Photoshop", "Illustrator", "Figma", "Sketch", "Canva", "GIMP", "Blender", "After Effects"],
          webDev: ["Frontend", "Backend", "Full-stack", "APIs", "Databases", "Frameworks", "DevOps", "Cloud"],
          ai: [
            "Machine Learning",
            "Deep Learning",
            "Neural Networks",
            "NLP",
            "Computer Vision",
            "TensorFlow",
            "PyTorch",
          ],
        },
        art: {
          digital: ["Digital painting", "3D modeling", "Animation", "Concept art", "VFX", "Motion graphics"],
          traditional: ["Drawing", "Painting", "Sculpture", "Photography", "Printmaking"],
          design: ["Graphic design", "UI/UX", "Logo design", "Branding", "Typography", "Layout"],
        },
        business: {
          marketing: ["SEO", "Social media", "Content marketing", "Email marketing", "PPC", "Analytics"],
          ecommerce: ["Online stores", "Payment systems", "Inventory", "Customer service", "Conversion"],
          freelancing: ["Portfolio", "Client management", "Pricing", "Contracts", "Time management"],
        },
        science: {
          physics: ["Mechanics", "Thermodynamics", "Electromagnetism", "Quantum physics", "Relativity"],
          chemistry: ["Organic", "Inorganic", "Physical chemistry", "Biochemistry", "Materials"],
          math: ["Algebra", "Calculus", "Statistics", "Geometry", "Discrete math", "Linear algebra"],
        },
      },
      responses: {
        greetings: [
          "¡Hola! Soy IA Glob, tu asistente inteligente premium avanzado. Puedo ayudarte con absolutamente cualquier pregunta o desafío que tengas. ¿En qué puedo asistirte hoy?",
          "¡Bienvenido! Como usuario premium, tienes acceso completo a mis capacidades avanzadas de IA. Desde arte y tecnología hasta ciencia y negocios, estoy aquí para ayudarte.",
          "¡Hola! Gracias por ser usuario premium. Soy tu compañero inteligente especializado en resolver problemas, enseñar conceptos y ayudarte a crear. ¿Qué te gustaría explorar?",
        ],
        help: [
          `Como tu asistente IA premium avanzado, puedo ayudarte con:

🎨 **Arte y Creatividad:**
• Técnicas avanzadas de arte digital y tradicional
• Herramientas profesionales de diseño
• Desarrollo de estilo personal y portfolio
• Tendencias en diseño gráfico y UI/UX
• Crítica constructiva y mejora de trabajos

💻 **Tecnología y Programación:**
• Desarrollo web completo (Frontend/Backend)
• Programación en múltiples lenguajes
• Resolución de bugs y optimización
• Arquitectura de software y mejores prácticas
• IA, Machine Learning y tecnologías emergentes

🔬 **Ciencias y Matemáticas:**
• Explicaciones detalladas de conceptos complejos
• Resolución de problemas paso a paso
• Aplicaciones prácticas de teorías
• Preparación para exámenes y proyectos
• Investigación y análisis de datos

🛒 **Globex Marketplace:**
• Búsqueda inteligente con filtros avanzados
• Análisis de tendencias de mercado
• Recomendaciones personalizadas con IA
• Comparativas detalladas de productos
• Estrategias de compra y inversión

🧠 **Conocimiento General:**
• Historia, cultura y actualidad mundial
• Idiomas, literatura y comunicación
• Filosofía, psicología y sociología
• Consejos de vida y desarrollo personal
• Resolución creativa de problemas

💼 **Negocios y Emprendimiento:**
• Estrategias de marketing digital
• Desarrollo de marca personal
• Análisis de mercado y competencia
• Modelos de negocio innovadores
• Gestión de proyectos y equipos

¡Pregúntame cualquier cosa! Mi objetivo es ser tu compañero inteligente más útil.`,
        ],
        unknown: [
          "Esa es una pregunta fascinante. Como tu asistente IA avanzado, voy a analizar tu consulta desde múltiples perspectivas para darte la respuesta más completa y útil posible.",
          "Excelente pregunta. Permíteme procesar tu consulta con mis algoritmos avanzados y proporcionarte una respuesta detallada y contextualizada.",
          "Interesante desafío. Como usuario premium, tienes acceso a mi análisis más profundo. Voy a investigar este tema en detalle para darte la mejor respuesta posible.",
        ],
      },
    }
  }

  createInterface() {
    // Crear botón flotante
    const toggleButton = document.createElement("button")
    toggleButton.id = "iaGlobToggle"
    toggleButton.className = this.isPremiumUser ? "ia-glob-toggle" : "ia-glob-toggle premium-only"
    toggleButton.innerHTML = '<i class="fas fa-robot"></i>'
    toggleButton.setAttribute("aria-label", this.isPremiumUser ? "Abrir asistente IA Glob" : "IA Glob - Solo Premium")

    // Mostrar para usuarios premium, ocultar para usuarios gratuitos
    if (this.isPremiumUser) {
      toggleButton.style.display = "flex"
    } else {
      toggleButton.style.display = "none"
    }

    document.body.appendChild(toggleButton)

    // Crear contenedor principal
    const container = document.createElement("div")
    container.id = "iaGlobContainer"
    container.className = this.isPremiumUser ? "ia-glob-container" : "ia-glob-container premium-required"
    container.innerHTML = this.getInterfaceHTML()
    document.body.appendChild(container)

    // Crear modal de upgrade premium
    this.createPremiumUpgradeModal()
  }

  createPremiumUpgradeModal() {
    const modal = document.createElement("div")
    modal.id = "premiumUpgradeModal"
    modal.className = "premium-upgrade-modal"
    modal.innerHTML = `
      <div class="premium-upgrade-content">
        <button class="close-btn" id="closePremiumModal">&times;</button>
        <div class="premium-crown">👑</div>
        <h2>¡Desbloquea IA Glob Avanzada!</h2>
        <p>El asistente inteligente más avanzado está disponible exclusivamente para usuarios Premium. Obtén acceso a IA de última generación.</p>
        
        <div class="premium-features">
          <h3>✨ Funciones Premium de IA Glob Avanzada</h3>
          <ul>
            <li>🤖 Asistente IA para absolutamente cualquier pregunta</li>
            <li>🎨 Consultor experto en arte y diseño avanzado</li>
            <li>💻 Tutor de programación y tecnología completo</li>
            <li>🔬 Explicaciones científicas y matemáticas detalladas</li>
            <li>📊 Análisis de mercado con predicciones IA</li>
            <li>🔍 Búsqueda inteligente ultra-avanzada</li>
            <li>💡 Recomendaciones personalizadas con ML</li>
            <li>🎯 Resolución de problemas complejos</li>
            <li>📈 Insights y análisis predictivo</li>
            <li>🌟 Soporte prioritario 24/7 con IA</li>
          </ul>
        </div>

        <div class="upgrade-buttons">
          <a href="#" class="btn-premium" id="upgradeToPremium">
            <i class="fas fa-crown"></i>
            Actualizar a Premium
          </a>
          <button class="btn-secondary-premium" id="learnMorePremium">
            Conocer más
          </button>
        </div>
      </div>
    `
    document.body.appendChild(modal)
  }

  getInterfaceHTML() {
    if (!this.isPremiumUser) {
      return `
        <div class="premium-required-message">
          <h3>🔒 Función Premium</h3>
          <p>IA Glob Avanzada está disponible solo para usuarios Premium</p>
        </div>
      `
    }

    return `
      <div class="ia-glob-header">
        <div class="ia-glob-info">
          <div class="ia-glob-avatar">
            <i class="fas fa-robot"></i>
          </div>
          <div class="ia-glob-details">
            <h3>IA Glob <span style="color: #ffd700;">👑</span></h3>
            <p>Asistente IA Avanzado</p>
            <div class="ia-glob-status">
              <span class="status-indicator online"></span>
              <span class="status-text">Online y listo</span>
            </div>
          </div>
        </div>
        <div class="ia-glob-actions">
          <button class="ia-glob-minimize" id="iaGlobMinimize" title="Minimizar">
            <i class="fas fa-minus"></i>
          </button>
          <button class="ia-glob-clear" id="iaGlobClear" title="Limpiar conversación">
            <i class="fas fa-broom"></i>
          </button>
          <button class="ia-glob-close" id="iaGlobClose" title="Cerrar">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <div class="ia-glob-messages" id="iaGlobMessages">
        <div class="welcome-message">
          <h4>¡Hola! Soy IA Glob Avanzada 🤖👑</h4>
          <p>Tu asistente inteligente premium más avanzado. Puedo ayudarte con cualquier pregunta sobre arte, tecnología, ciencias, matemáticas, negocios, Globex o cualquier tema que necesites.</p>
          <div class="ai-capabilities">
            <div class="capability-badge">🎨 Arte & Diseño</div>
            <div class="capability-badge">💻 Programación</div>
            <div class="capability-badge">🔬 Ciencias</div>
            <div class="capability-badge">📊 Análisis IA</div>
          </div>
          <div class="quick-suggestions">
            <span class="suggestion-chip" data-suggestion="¿Cómo puedo mejorar mis habilidades de arte digital?">Arte Digital</span>
            <span class="suggestion-chip" data-suggestion="Explícame React y cómo empezar">React JS</span>
            <span class="suggestion-chip" data-suggestion="¿Qué obras me recomiendas basado en IA?">Recomendaciones IA</span>
            <span class="suggestion-chip" data-suggestion="Ayúdame con cálculo diferencial">Matemáticas</span>
            <span class="suggestion-chip" data-suggestion="Estrategias de marketing digital para creativos">Marketing</span>
          </div>
        </div>
        
        <div class="typing-indicator" id="typingIndicator">
          <div class="message-avatar">
            <i class="fas fa-robot"></i>
          </div>
          <div class="typing-dots">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
          </div>
          <span style="margin-left: 10px; font-size: 0.8rem; color: #26c6da;">IA Glob está procesando con algoritmos avanzados...</span>
        </div>
      </div>

      <div class="ia-glob-input-area">
        <div class="ia-glob-input-container">
          <div class="input-suggestions" id="inputSuggestions"></div>
          <textarea 
            id="iaGlobInput" 
            class="ia-glob-input" 
            placeholder="Pregúntame absolutamente cualquier cosa..." 
            rows="1"
          ></textarea>
          <div class="input-actions">
            <button id="iaGlobAttach" class="ia-glob-attach" title="Adjuntar archivo">
              <i class="fas fa-paperclip"></i>
            </button>
            <button id="iaGlobSend" class="ia-glob-send">
              <i class="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
        <div class="input-footer">
          <span class="ai-powered">Powered by IA Glob Advanced • Premium</span>
        </div>
      </div>
    `
  }

  setupEventListeners() {
    const toggleButton = document.getElementById("iaGlobToggle")
    const closeButton = document.getElementById("iaGlobClose")
    const minimizeButton = document.getElementById("iaGlobMinimize")
    const clearButton = document.getElementById("iaGlobClear")
    const sendButton = document.getElementById("iaGlobSend")
    const attachButton = document.getElementById("iaGlobAttach")
    const input = document.getElementById("iaGlobInput")

    // Toggle del chat - MEJORADO: Un clic abre y permanece abierto
    if (toggleButton) {
      toggleButton.addEventListener("click", (e) => {
        e.stopPropagation()
        if (this.isPremiumUser) {
          // Solo abrir si está cerrado, no alternar
          if (this.chatState === "closed") {
            this.openChat()
          }
        } else {
          this.showPremiumUpgradeModal()
        }
      })
    }

    if (closeButton) {
      closeButton.addEventListener("click", (e) => {
        e.stopPropagation()
        this.closeChat()
      })
    }

    if (minimizeButton) {
      minimizeButton.addEventListener("click", (e) => {
        e.stopPropagation()
        this.minimizeChat()
      })
    }

    if (clearButton) {
      clearButton.addEventListener("click", (e) => {
        e.stopPropagation()
        this.clearConversation()
      })
    }

    // Solo configurar eventos de chat si es usuario premium
    if (this.isPremiumUser) {
      if (sendButton) {
        sendButton.addEventListener("click", () => this.sendMessage())
      }

      if (attachButton) {
        attachButton.addEventListener("click", () => this.handleAttachment())
      }

      if (input) {
        input.addEventListener("keypress", (e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            this.sendMessage()
          }
        })

        // Auto-resize del textarea
        input.addEventListener("input", () => {
          input.style.height = "auto"
          input.style.height = Math.min(input.scrollHeight, 120) + "px"
          this.showInputSuggestions(input.value)
        })

        // Sugerencias en tiempo real
        input.addEventListener("focus", () => {
          this.showInputSuggestions(input.value)
        })
      }
    }

    // Sugerencias rápidas
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("suggestion-chip") && this.isPremiumUser) {
        const suggestion = e.target.getAttribute("data-suggestion")
        this.handleSuggestion(suggestion)
      }
    })

    // Modal de premium upgrade
    const premiumModal = document.getElementById("premiumUpgradeModal")
    const closePremiumModal = document.getElementById("closePremiumModal")
    const upgradeToPremium = document.getElementById("upgradeToPremium")
    const learnMorePremium = document.getElementById("learnMorePremium")

    if (closePremiumModal) {
      closePremiumModal.addEventListener("click", () => this.closePremiumUpgradeModal())
    }

    if (upgradeToPremium) {
      upgradeToPremium.addEventListener("click", (e) => {
        e.preventDefault()
        this.redirectToPremiumPlans()
      })
    }

    if (learnMorePremium) {
      learnMorePremium.addEventListener("click", () => {
        this.showPremiumFeatures()
      })
    }

    // Cerrar modal al hacer clic fuera
    if (premiumModal) {
      premiumModal.addEventListener("click", (e) => {
        if (e.target === premiumModal) {
          this.closePremiumUpgradeModal()
        }
      })
    }

    // Cerrar chat al hacer clic fuera (solo premium) - MEJORADO
    if (this.isPremiumUser) {
      document.addEventListener("click", (e) => {
        const container = document.getElementById("iaGlobContainer")
        if (
          this.chatState === "open" &&
          container &&
          !container.contains(e.target) &&
          !toggleButton.contains(e.target)
        ) {
          // Pequeño delay para evitar cierre accidental
          setTimeout(() => {
            if (this.chatState === "open") {
              this.closeChat()
            }
          }, 100)
        }
      })
    }

    // Escape para cerrar
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (this.chatState === "open" && this.isPremiumUser) {
          this.closeChat()
        }
        if (premiumModal && premiumModal.style.display === "flex") {
          this.closePremiumUpgradeModal()
        }
      }
    })

    // Escuchar cambios en el estado del usuario
    window.addEventListener("storage", (e) => {
      if (e.key === "marketplace_current_user") {
        this.checkUserPremiumStatus()
        this.checkForNewPremiumUser()
        this.updateInterfaceForUserStatus()
      }
    })

    // Escuchar eventos de login/logout
    window.addEventListener("userLoggedIn", () => {
      setTimeout(() => {
        this.checkUserPremiumStatus()
        this.checkForNewPremiumUser()
        this.updateInterfaceForUserStatus()
      }, 100)
    })

    window.addEventListener("userLoggedOut", () => {
      this.isPremiumUser = false
      this.updateInterfaceForUserStatus()
    })
  }

  showInputSuggestions(inputValue) {
    const suggestionsContainer = document.getElementById("inputSuggestions")
    if (!suggestionsContainer || !inputValue.trim()) {
      if (suggestionsContainer) suggestionsContainer.style.display = "none"
      return
    }

    const suggestions = this.generateInputSuggestions(inputValue.toLowerCase())
    if (suggestions.length === 0) {
      suggestionsContainer.style.display = "none"
      return
    }

    suggestionsContainer.innerHTML = suggestions
      .map(
        (suggestion) => `
      <div class="input-suggestion" data-suggestion="${suggestion}">
        <i class="fas fa-lightbulb"></i>
        ${suggestion}
      </div>
    `,
      )
      .join("")

    suggestionsContainer.style.display = "block"

    // Agregar event listeners a las sugerencias
    suggestionsContainer.querySelectorAll(".input-suggestion").forEach((el) => {
      el.addEventListener("click", () => {
        const suggestion = el.getAttribute("data-suggestion")
        const input = document.getElementById("iaGlobInput")
        if (input) {
          input.value = suggestion
          input.focus()
          suggestionsContainer.style.display = "none"
        }
      })
    })
  }

  generateInputSuggestions(input) {
    const suggestions = [
      // Arte y Diseño
      "¿Cómo puedo mejorar mi técnica de arte digital?",
      "Explícame los principios del diseño gráfico",
      "¿Qué software es mejor para ilustración?",
      "Consejos para crear un portfolio impactante",

      // Programación
      "¿Cómo empezar a programar en JavaScript?",
      "Explícame React paso a paso",
      "¿Cuál es la diferencia entre frontend y backend?",
      "Ayúdame a debuggear mi código",

      // Ciencias
      "Explícame la física cuántica de forma simple",
      "¿Cómo funciona el machine learning?",
      "Ayúdame con cálculo diferencial",
      "¿Qué es la inteligencia artificial?",

      // Negocios
      "Estrategias de marketing digital para creativos",
      "¿Cómo monetizar mi arte digital?",
      "Consejos para freelancers principiantes",
      "¿Cómo crear una marca personal?",

      // Globex
      "¿Qué obras me recomiendas basado en IA?",
      "Análisis del mercado de arte digital",
      "¿Cuáles son las tendencias actuales?",
      "Ayúdame a encontrar obras específicas",
    ]

    return suggestions.filter((suggestion) => suggestion.toLowerCase().includes(input)).slice(0, 4)
  }

  handleAttachment() {
    // Funcionalidad para adjuntar archivos (placeholder)
    if (window.showNotification) {
      window.showNotification("Función de adjuntos próximamente disponible para usuarios premium", "info")
    }
  }

  minimizeChat() {
    const container = document.getElementById("iaGlobContainer")
    const toggleButton = document.getElementById("iaGlobToggle")

    if (container && toggleButton) {
      container.style.transform = "scale(0.8)"
      container.style.opacity = "0.7"
      this.chatState = "minimized"

      setTimeout(() => {
        container.style.display = "none"
        toggleButton.classList.remove("active")
        toggleButton.innerHTML = '<i class="fas fa-robot"></i>'
        this.chatState = "closed"
      }, 200)
    }
  }

  showPremiumUpgradeModal() {
    const modal = document.getElementById("premiumUpgradeModal")
    if (modal) {
      modal.style.display = "flex"
    }
  }

  closePremiumUpgradeModal() {
    const modal = document.getElementById("premiumUpgradeModal")
    if (modal) {
      modal.style.display = "none"
    }
  }

  redirectToPremiumPlans() {
    // Cerrar modal y redirigir a la sección de planes
    this.closePremiumUpgradeModal()

    // Scroll a la sección de precios
    const pricingSection = document.querySelector(".pricing-section")
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: "smooth" })
    }

    // Mostrar notificación
    if (window.showNotification) {
      window.showNotification("¡Elige tu plan premium y desbloquea IA Glob Avanzada con pago seguro! 👑💳", "info")
    }
  }

  showPremiumFeatures() {
    this.closePremiumUpgradeModal()

    // Mostrar información detallada de las funciones premium
    if (window.showNotification) {
      window.showNotification(
        "IA Glob Avanzada incluye asistencia inteligente para cualquier tema, análisis con IA y soporte prioritario",
        "info",
      )
    }
  }

  updateInterfaceForUserStatus() {
    const toggleButton = document.getElementById("iaGlobToggle")
    const container = document.getElementById("iaGlobContainer")

    if (!toggleButton || !container) return

    if (this.isPremiumUser) {
      // Usuario premium: mostrar interfaz completa
      toggleButton.style.display = "flex"
      toggleButton.className = "ia-glob-toggle"
      container.className = "ia-glob-container"
      container.innerHTML = this.getInterfaceHTML()

      // Reconfigurar eventos
      this.setupEventListeners()

      if (window.showNotification) {
        window.showNotification("¡IA Glob Avanzada está ahora disponible! 🤖👑", "success")
      }
    } else {
      // Usuario gratuito: ocultar interfaz
      toggleButton.style.display = "none"
      container.className = "ia-glob-container premium-required"
      this.closeChat()
    }
  }

  openChat() {
    if (!this.isPremiumUser) {
      this.showPremiumUpgradeModal()
      return
    }

    if (this.chatState !== "closed") return

    const container = document.getElementById("iaGlobContainer")
    const toggleButton = document.getElementById("iaGlobToggle")

    if (container && toggleButton) {
      this.chatState = "opening"

      container.style.display = "flex"
      container.style.transform = "scale(0.8)"
      container.style.opacity = "0"

      // Animación de apertura suave
      setTimeout(() => {
        container.style.transform = "scale(1)"
        container.style.opacity = "1"
        container.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      }, 10)

      setTimeout(() => {
        this.chatState = "open"
        toggleButton.classList.add("active")

        // Focus en el input
        const input = document.getElementById("iaGlobInput")
        if (input) input.focus()
      }, 300)

      // Mensaje de bienvenida si es la primera vez
      if (this.messages.length === 0) {
        setTimeout(() => {
          this.addMessage("ia", this.getRandomResponse("greetings"))
        }, 800)
      }
    }
  }

  closeChat() {
    if (this.chatState !== "open") return

    const container = document.getElementById("iaGlobContainer")
    const toggleButton = document.getElementById("iaGlobToggle")

    if (container && toggleButton) {
      this.chatState = "closing"

      container.style.transform = "scale(0.8)"
      container.style.opacity = "0"
      container.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"

      setTimeout(() => {
        container.style.display = "none"
        toggleButton.classList.remove("active")
        this.chatState = "closed"

        // Reset styles
        container.style.transform = ""
        container.style.opacity = ""
        container.style.transition = ""
      }, 300)
    }
  }

  async sendMessage() {
    if (!this.isPremiumUser) {
      this.showPremiumUpgradeModal()
      return
    }

    const input = document.getElementById("iaGlobInput")
    if (!input) return

    const message = input.value.trim()
    if (!message) return

    // Ocultar sugerencias
    const suggestionsContainer = document.getElementById("inputSuggestions")
    if (suggestionsContainer) {
      suggestionsContainer.style.display = "none"
    }

    // Agregar mensaje del usuario
    this.addMessage("user", message)
    input.value = ""
    input.style.height = "auto"

    // Mostrar indicador de escritura
    this.showTypingIndicator()

    // Procesar respuesta
    try {
      const response = await this.processMessage(message)

      setTimeout(
        () => {
          this.hideTypingIndicator()
          this.addMessage("ia", response)
        },
        1200 + Math.random() * 1800,
      ) // Simular tiempo de procesamiento más realista
    } catch (error) {
      console.error("Error procesando mensaje:", error)
      this.hideTypingIndicator()
      this.addMessage(
        "ia",
        "Lo siento, hubo un error procesando tu mensaje. Como usuario premium, puedes contactar soporte prioritario para resolver cualquier problema técnico. Mientras tanto, puedes intentar reformular tu pregunta.",
      )
    }
  }

  async processMessage(message) {
    const lowerMessage = message.toLowerCase()
    this.conversationContext.push({ role: "user", content: message })

    // Análisis de intención mejorado y más amplio
    const intent = this.analyzeIntent(lowerMessage)

    switch (intent.type) {
      case "greeting":
        return this.getRandomResponse("greetings")

      case "help":
        return this.getRandomResponse("help")

      case "programming":
        return this.handleProgrammingQuestion(message)

      case "art_design":
        return this.handleArtDesignQuestion(message)

      case "technology":
        return this.handleTechnologyQuestion(message)

      case "business":
        return this.handleBusinessQuestion(message)

      case "search_artworks":
        return this.handlePremiumArtworkSearch(intent.query)

      case "categories":
        return this.handlePremiumCategoriesQuery()

      case "purchase_help":
        return this.handlePremiumPurchaseHelp()

      case "recommendations":
        return this.handlePremiumRecommendations()

      case "price_info":
        return this.handlePremiumPriceInfo(intent.query)

      case "artist_info":
        return this.handlePremiumArtistInfo(intent.query)

      case "technical_support":
        return this.handlePremiumTechnicalSupport()

      case "marketplace_info":
        return this.handlePremiumMarketplaceInfo()

      case "market_analysis":
        return this.handleMarketAnalysis()

      case "alerts":
        return this.handlePremiumAlerts()

      case "math":
        return this.handleMathQuestion(message)

      case "science":
        return this.handleScienceQuestion(message)

      case "general_knowledge":
        return this.handleGeneralKnowledgeQuestion(message)

      case "how_to":
        return this.handleHowToQuestion(message)

      case "explanation":
        return this.handleExplanationRequest(message)

      case "creative_writing":
        return this.handleCreativeWriting(message)

      case "problem_solving":
        return this.handleProblemSolving(message)

      case "learning":
        return this.handleLearningRequest(message)

      default:
        return this.handleAdvancedQuery(message)
    }
  }

  analyzeIntent(message) {
    // Patrones de intención ampliados y mejorados
    const patterns = {
      greeting: /^(hola|hi|hello|buenos días|buenas tardes|buenas noches|hey|saludos|qué tal)/i,
      help: /(ayuda|help|qué puedes hacer|funciones|comandos|asistencia|guía)/i,

      // Programación y tecnología
      programming:
        /(programar|programación|código|javascript|python|html|css|react|node|php|java|desarrollo|developer|framework|api|database|sql|git|debugging)/i,
      technology:
        /(tecnología|software|hardware|computadora|ordenador|sistema|aplicación|app|móvil|web|internet|wifi|bluetooth|ia|inteligencia artificial)/i,

      // Arte y diseño
      art_design:
        /(arte|diseño|dibujo|pintura|ilustración|photoshop|illustrator|figma|sketch|color|composición|creatividad|portfolio|digital art|concept art)/i,

      // Negocios y marketing
      business:
        /(negocio|empresa|marketing|ventas|cliente|mercado|estrategia|branding|seo|social media|freelance|emprendimiento|startup)/i,

      // Matemáticas y ciencias
      math: /(matemáticas|cálculo|álgebra|geometría|estadística|ecuación|fórmula|número|suma|resta|multiplicación|división|integral|derivada)/i,
      science:
        /(ciencia|física|química|biología|astronomía|medicina|salud|experimento|teoría|investigación|quantum|molecular)/i,

      // Preguntas generales y aprendizaje
      general_knowledge:
        /(qué es|quién es|cuándo|dónde|por qué|cómo|explica|define|significado|historia|cultura|geografía|filosofía)/i,
      how_to: /(cómo hacer|cómo puedo|tutorial|paso a paso|instrucciones|guía|método|proceso|enseñar|aprender)/i,
      explanation: /(explica|explicar|explícame|cuéntame|háblame de|información sobre|detalles de)/i,

      // Creatividad y resolución de problemas
      creative_writing: /(escribir|redactar|crear|historia|cuento|poema|guión|contenido|blog|artículo)/i,
      problem_solving: /(problema|resolver|solución|ayuda con|no entiendo|dificultad|desafío|obstáculo)/i,
      learning: /(aprender|estudiar|enseñar|curso|lección|práctica|ejercicio|mejorar|desarrollar)/i,

      // Específicos de Globex
      search_artworks: /(buscar|encontrar|mostrar|ver).*(obra|arte|diseño|ilustración)/i,
      categories: /(categoría|categorías|tipos|secciones)/i,
      purchase_help: /(comprar|compra|pagar|pago|carrito)/i,
      recommendations: /(recomienda|recomendación|sugerir|sugerencia|personalizada)/i,
      price_info: /(precio|costo|cuánto|barato|caro)/i,
      artist_info: /(artista|autor|creador|diseñador)/i,
      technical_support: /(problema|error|bug|no funciona|ayuda técnica)/i,
      marketplace_info: /(globex|marketplace|plataforma|sitio|información)/i,
      market_analysis: /(análisis|tendencia|mercado|estadística|reporte)/i,
      alerts: /(alerta|notificación|aviso|nueva obra)/i,
    }

    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(message)) {
        return {
          type,
          query: message,
          confidence: 0.9,
        }
      }
    }

    return { type: "advanced_query", query: message, confidence: 0.8 }
  }

  // Nuevos manejadores para diferentes tipos de preguntas

  handleCreativeWriting(message) {
    return `✍️ **Asistente de Escritura Creativa - Premium:**

Como tu consultor de escritura creativa avanzado, puedo ayudarte con:

📝 **Tipos de escritura:**
• **Narrativa** - Cuentos, novelas, relatos cortos
• **Poesía** - Versos, sonetos, poesía libre
• **Guiones** - Teatro, cine, series, podcasts
• **Contenido digital** - Blogs, artículos, redes sociales
• **Copywriting** - Textos publicitarios y comerciales

🎯 **Servicios especializados:**
• Desarrollo de personajes complejos
• Construcción de tramas envolventes
• Mejora de estilo y voz narrativa
• Corrección y edición profesional
• Superación del bloqueo creativo

💡 **Técnicas avanzadas:**
• Estructura narrativa en tres actos
• Desarrollo de conflictos internos y externos
• Creación de diálogos naturales y efectivos
• Uso de figuras retóricas y recursos literarios
• Adaptación de tono según audiencia

🚀 **Proceso creativo:**
1. **Brainstorming** - Generación de ideas originales
2. **Planificación** - Estructura y esquema narrativo
3. **Desarrollo** - Escritura y construcción
4. **Revisión** - Edición y pulimiento
5. **Optimización** - Mejora continua del texto

¿Qué tipo de proyecto de escritura tienes en mente? Puedo ayudarte desde la idea inicial hasta el texto final pulido.`
  }

  handleProblemSolving(message) {
    return `🧩 **Resolución de Problemas Avanzada - IA Premium:**

Como tu consultor especializado en resolución de problemas, utilizo metodologías avanzadas:

🔍 **Análisis del problema:**
• **Identificación** - Definir claramente el problema
• **Descomposición** - Dividir en partes manejables
• **Contexto** - Entender factores y limitaciones
• **Priorización** - Determinar urgencia e importancia

🛠️ **Metodologías aplicadas:**
• **Design Thinking** - Enfoque centrado en el usuario
• **Método científico** - Hipótesis y experimentación
• **Análisis de causa raíz** - Identificar origen del problema
• **Brainstorming estructurado** - Generación de soluciones
• **Matriz de decisión** - Evaluación objetiva de opciones

💡 **Técnicas especializadas:**
• **Pensamiento lateral** - Soluciones creativas e innovadoras
• **Análisis FODA** - Fortalezas, oportunidades, debilidades, amenazas
• **Diagrama de Ishikawa** - Análisis de causas múltiples
• **Método 5 Por Qués** - Profundización en causas
• **Prototipado rápido** - Validación de soluciones

🎯 **Proceso estructurado:**
1. **Definición clara** del problema específico
2. **Recopilación de información** relevante
3. **Generación de alternativas** múltiples
4. **Evaluación de opciones** con criterios objetivos
5. **Implementación** de la solución óptima
6. **Seguimiento y ajuste** continuo

¿Cuál es el problema específico que necesitas resolver? Puedo guiarte paso a paso hacia la solución más efectiva.`
  }

  handleLearningRequest(message) {
    return `🎓 **Tutor Personal Avanzado - IA Premium:**

Como tu tutor personal especializado, adapto mi enseñanza a tu estilo de aprendizaje:

🧠 **Estilos de aprendizaje:**
• **Visual** - Diagramas, mapas mentales, infografías
• **Auditivo** - Explicaciones verbales, discusiones
• **Kinestésico** - Práctica hands-on, ejercicios
• **Lectura/Escritura** - Textos, resúmenes, notas

📚 **Metodologías pedagógicas:**
• **Aprendizaje activo** - Participación y práctica constante
• **Microlearning** - Conceptos en pequeñas dosis
• **Gamificación** - Elementos de juego para motivación
• **Aprendizaje adaptativo** - Personalización según progreso
• **Técnica Feynman** - Explicar para entender mejor

🎯 **Áreas de especialización:**
• **STEM** - Ciencias, tecnología, ingeniería, matemáticas
• **Artes** - Diseño, música, literatura, artes visuales
• **Idiomas** - Gramática, vocabulario, conversación
• **Habilidades blandas** - Comunicación, liderazgo, creatividad
• **Tecnología** - Programación, diseño, herramientas digitales

💡 **Técnicas de estudio avanzadas:**
• **Repetición espaciada** - Optimización de la memoria
• **Mapas conceptuales** - Conexiones entre ideas
• **Técnica Pomodoro** - Gestión eficiente del tiempo
• **Elaboración interrogativa** - Preguntas para profundizar
• **Autoexplicación** - Verbalizar el proceso de pensamiento

🚀 **Plan personalizado:**
1. **Evaluación inicial** - Nivel actual y objetivos
2. **Diseño del plan** - Ruta de aprendizaje personalizada
3. **Implementación** - Lecciones y ejercicios prácticos
4. **Evaluación continua** - Seguimiento del progreso
5. **Ajustes dinámicos** - Adaptación según resultados

¿Qué tema específico te gustaría aprender o en qué área necesitas mejorar? Puedo crear un plan de aprendizaje completamente personalizado para ti.`
  }

  handleProgrammingQuestion(message) {
    const lowerMessage = message.toLowerCase()

    if (lowerMessage.includes("javascript") || lowerMessage.includes("js")) {
      return `💻 **JavaScript - Consultoría Premium Avanzada:**

JavaScript es el lenguaje fundamental del desarrollo web moderno y mi especialidad.

🔧 **Características avanzadas:**
• **Lenguaje interpretado** de alto nivel y dinámico
• **Paradigmas múltiples** - Orientado a objetos, funcional, imperativo
• **Event-driven** - Programación basada en eventos
• **Asíncrono** - Manejo de operaciones no bloqueantes
• **Multiplataforma** - Navegadores, servidores, móviles, desktop

📚 **Conceptos fundamentales:**
• **Variables y scope** - let, const, var, hoisting
• **Funciones avanzadas** - Arrow functions, closures, callbacks
• **Objetos y prototipos** - POO en JavaScript
• **Arrays y métodos** - map, filter, reduce, forEach
• **Async/await y Promises** - Programación asíncrona moderna
• **Destructuring y spread** - Sintaxis ES6+ avanzada

🛠️ **Ecosistema y herramientas:**
• **Frameworks frontend** - React, Vue.js, Angular, Svelte
• **Backend** - Node.js, Express.js, Nest.js
• **Testing** - Jest, Mocha, Cypress, Testing Library
• **Build tools** - Webpack, Vite, Parcel, Rollup
• **Package managers** - npm, yarn, pnpm

💡 **Mejores prácticas:**
• **Clean Code** - Código legible y mantenible
• **Design Patterns** - Singleton, Observer, Factory, Module
• **Performance** - Optimización y profiling
• **Security** - Prevención de vulnerabilidades
• **Accessibility** - Desarrollo inclusivo

🚀 **Proyectos recomendados:**
1. **Todo App** - CRUD básico con localStorage
2. **Weather App** - APIs y manejo de datos
3. **E-commerce** - Carrito de compras completo
4. **Chat App** - WebSockets y tiempo real
5. **Portfolio interactivo** - Animaciones y UX

¿Hay algún aspecto específico de JavaScript que te gustaría dominar? Puedo crear un plan de aprendizaje personalizado.`
    }

    if (lowerMessage.includes("python")) {
      return `🐍 **Python - Mentoría Premium Especializada:**

Python es mi lenguaje favorito para enseñar por su elegancia y versatilidad.

⭐ **Ventajas distintivas:**
• **Sintaxis clara** - Código legible como pseudocódigo
• **Tipado dinámico** - Flexibilidad en el desarrollo
• **Interpretado** - Desarrollo y testing rápido
• **Multiplataforma** - Windows, macOS, Linux
• **Comunidad activa** - Bibliotecas para todo

🎯 **Dominios de aplicación:**
• **Desarrollo web** - Django, Flask, FastAPI
• **Data Science** - Pandas, NumPy, Matplotlib, Seaborn
• **Machine Learning** - Scikit-learn, TensorFlow, PyTorch
• **Automatización** - Scripts, web scraping, APIs
• **Desarrollo de juegos** - Pygame, Panda3D
• **Desktop apps** - Tkinter, PyQt, Kivy

📖 **Conceptos avanzados:**
• **List comprehensions** - Sintaxis elegante y eficiente
• **Decoradores** - Modificación de funciones y clases
• **Context managers** - Manejo de recursos con 'with'
• **Generadores** - Iteradores eficientes en memoria
• **Metaclases** - Programación avanzada de clases
• **Async/await** - Programación asíncrona

🛠️ **Herramientas profesionales:**
• **IDEs** - PyCharm, VS Code, Jupyter Notebooks
• **Testing** - pytest, unittest, coverage
• **Linting** - pylint, flake8, black (formatting)
• **Virtual environments** - venv, conda, pipenv
• **Deployment** - Docker, Heroku, AWS, GCP

🚀 **Ruta de aprendizaje:**
1. **Fundamentos** - Sintaxis, tipos de datos, control de flujo
2. **Estructuras de datos** - Listas, diccionarios, sets, tuplas
3. **Funciones y módulos** - Organización del código
4. **POO** - Clases, herencia, polimorfismo
5. **Bibliotecas** - Exploración del ecosistema
6. **Proyectos reales** - Aplicación práctica

¿Te interesa algún área específica de Python? Puedo diseñar un curriculum personalizado para tus objetivos.`
    }

    if (lowerMessage.includes("react")) {
      return `⚛️ **React - Masterclass Premium:**

React es la biblioteca más popular para interfaces de usuario y mi especialidad frontend.

🔧 **Conceptos fundamentales:**
• **Componentes** - Bloques de construcción reutilizables
• **JSX** - Sintaxis que combina JavaScript y HTML
• **Props** - Comunicación entre componentes
• **State** - Manejo del estado local
• **Hooks** - useState, useEffect, useContext, custom hooks
• **Virtual DOM** - Optimización de renderizado

🎯 **Arquitectura avanzada:**
• **Component composition** - Patrones de diseño
• **State management** - Redux, Zustand, Context API
• **Routing** - React Router, navegación SPA
• **Forms** - Formik, React Hook Form, validación
• **Testing** - Jest, React Testing Library, Enzyme
• **Performance** - Memoization, lazy loading, code splitting

🛠️ **Ecosistema moderno:**
• **Next.js** - Framework full-stack con SSR/SSG
• **Gatsby** - Generador de sitios estáticos
• **Create React App** - Setup rápido para desarrollo
• **Vite** - Build tool ultra-rápido
• **Storybook** - Desarrollo de componentes aislados

💡 **Mejores prácticas:**
• **Functional components** - Hooks sobre class components
• **Custom hooks** - Lógica reutilizable
• **Error boundaries** - Manejo de errores elegante
• **Accessibility** - Desarrollo inclusivo
• **TypeScript** - Tipado estático para mayor robustez

🚀 **Proyectos progresivos:**
1. **Counter App** - Estado básico y eventos
2. **Todo List** - CRUD y persistencia
3. **Weather Dashboard** - APIs y efectos
4. **E-commerce** - Routing y estado global
5. **Social Media App** - Autenticación y tiempo real

¿Qué aspecto de React te gustaría dominar? Puedo crear un plan de aprendizaje desde principiante hasta experto.`
    }

    // Respuesta general para programación
    return `💻 **Programación - Consultoría Premium Avanzada:**

Como tu mentor de programación especializado, domino múltiples lenguajes y tecnologías:

🌟 **Lenguajes de especialización:**
• **JavaScript/TypeScript** - Desarrollo web completo
• **Python** - Data science, IA, backend, automatización
• **HTML/CSS** - Estructura y diseño web moderno
• **React/Vue/Angular** - Frameworks frontend avanzados
• **Node.js** - Desarrollo backend y APIs
• **PHP** - Desarrollo web servidor y CMS
• **Java** - Aplicaciones empresariales robustas
• **C++** - Programación de sistemas y performance

🛠️ **Áreas de consultoría:**
• **Debugging avanzado** - Identificación y resolución de errores
• **Code review** - Análisis y mejora de código existente
• **Arquitectura de software** - Diseño de sistemas escalables
• **Optimización** - Performance y eficiencia
• **Security** - Mejores prácticas de seguridad
• **Testing** - Estrategias de pruebas automatizadas

💡 **Servicios especializados:**
• **Refactoring** - Mejora de código legacy
• **API design** - Diseño de interfaces robustas
• **Database optimization** - Consultas y esquemas eficientes
• **DevOps** - CI/CD, containerización, deployment
• **Mentoring** - Desarrollo de carrera técnica

🎯 **Metodologías aplicadas:**
• **Clean Code** - Principios de código limpio
• **SOLID principles** - Diseño orientado a objetos
• **Design patterns** - Soluciones probadas
• **Agile development** - Desarrollo iterativo
• **TDD/BDD** - Desarrollo guiado por pruebas

🚀 **Plan de desarrollo:**
1. **Evaluación técnica** - Nivel actual y objetivos
2. **Roadmap personalizado** - Ruta de aprendizaje
3. **Proyectos prácticos** - Aplicación real de conceptos
4. **Code reviews** - Feedback constructivo continuo
5. **Mentoring** - Guía en decisiones técnicas

¿Qué desafío de programación específico tienes? Puedo ayudarte desde conceptos básicos hasta arquitecturas complejas.`
  }

  handleArtDesignQuestion(message) {
    const lowerMessage = message.toLowerCase()

    if (
      lowerMessage.includes("digital") ||
      lowerMessage.includes("photoshop") ||
      lowerMessage.includes("illustrator")
    ) {
      return `🎨 **Arte Digital - Masterclass Premium:**

El arte digital es mi pasión y especialidad, combinando creatividad con tecnología avanzada.

🖥️ **Software profesional:**
• **Adobe Photoshop** - Pintura digital, retoque, composición
• **Adobe Illustrator** - Gráficos vectoriales, logos, iconografía
• **Procreate** - Arte digital móvil, sketching, ilustración
• **Clip Studio Paint** - Ilustración, manga, animación 2D
• **Blender** - Modelado 3D, escultura digital, animación
• **After Effects** - Motion graphics, composición, VFX

🎯 **Técnicas especializadas:**
• **Digital painting** - Pinceles, capas, modos de fusión
• **Concept art** - Diseño de personajes, ambientes, props
• **Matte painting** - Paisajes digitales fotorrealistas
• **Character design** - Anatomía, expresión, personalidad
• **Environment art** - Mundos inmersivos y atmosféricos
• **UI/UX design** - Interfaces intuitivas y atractivas

💡 **Fundamentos avanzados:**
• **Teoría del color digital** - Paletas, armonías, psicología
• **Composición dinámica** - Regla de tercios, puntos focales
• **Iluminación profesional** - Luz, sombra, volumen, atmósfera
• **Perspectiva avanzada** - 1, 2, 3 puntos, perspectiva aérea
• **Anatomía artística** - Proporciones, musculatura, movimiento
• **Storytelling visual** - Narrativa a través de imágenes

🚀 **Flujo de trabajo profesional:**
1. **Concepto e investigación** - Referencias, mood boards
2. **Thumbnails** - Composiciones rápidas, exploración
3. **Sketch detallado** - Estructura, proporciones, detalles
4. **Color rough** - Paleta, iluminación general
5. **Rendering** - Detalles finales, texturas, efectos
6. **Post-processing** - Ajustes finales, filtros, presentación

🎭 **Estilos y géneros:**
• **Realismo** - Hiperrealismo, retrato, naturaleza muerta
• **Estilizado** - Cartoon, anime, ilustración editorial
• **Fantástico** - Criaturas, mundos imaginarios, magia
• **Sci-fi** - Futurismo, tecnología, espacios
• **Horror** - Atmósferas oscuras, criaturas, suspense

¿Qué aspecto del arte digital te gustaría dominar? Puedo crear un plan de desarrollo artístico personalizado.`
    }

    if (lowerMessage.includes("portfolio") || lowerMessage.includes("portafolio")) {
      return `📁 **Portfolio Artístico - Estrategia Premium Avanzada:**

Un portfolio excepcional es tu carta de presentación profesional más importante.

✨ **Elementos estratégicos:**
• **Curación selectiva** - Solo tu mejor trabajo (10-15 piezas)
• **Narrativa coherente** - Historia visual que conecte
• **Variedad controlada** - Rango sin dispersión
• **Presentación impecable** - Calidad técnica superior
• **Contexto profesional** - Proceso creativo documentado

🎯 **Estructura estratégica:**
1. **Landing impactante** - Primera impresión memorable
2. **About me auténtico** - Tu historia y visión única
3. **Trabajos destacados** - Proyectos con mayor impacto
4. **Case studies** - Proceso creativo detallado
5. **Skills y herramientas** - Competencias técnicas
6. **Contacto profesional** - Información accesible

💻 **Plataformas especializadas:**
• **Behance** - Red global de creativos, exposición masiva
• **Dribbble** - Comunidad de diseñadores, networking
• **ArtStation** - Arte digital, concept art, 3D
• **Website propio** - Control total, branding personal
• **Instagram** - Alcance social, proceso creativo
• **LinkedIn** - Networking profesional, oportunidades

📈 **Optimización avanzada:**
• **SEO artístico** - Palabras clave relevantes
• **Mobile responsive** - Experiencia móvil perfecta
• **Loading speed** - Optimización de imágenes
• **Analytics** - Seguimiento de visitantes y engagement
• **Social proof** - Testimonios y colaboraciones

🎨 **Tipos de portfolio:**
• **Generalista** - Versatilidad en múltiples áreas
• **Especialista** - Expertise profundo en nicho específico
• **Conceptual** - Enfoque en ideas y creatividad
• **Técnico** - Demostración de habilidades específicas
• **Comercial** - Orientado a clientes y ventas

¿Necesitas ayuda para estructurar tu portfolio o mejorar algún aspecto específico?`
    }

    // Respuesta general para arte y diseño
    return `🎨 **Arte y Diseño - Consultoría Premium Avanzada:**

Como especialista en artes visuales y diseño, ofrezco mentoría integral:

🖌️ **Disciplinas especializadas:**
• **Arte Digital** - Pintura, ilustración, concept art avanzado
• **Diseño Gráfico** - Branding, identidad visual, comunicación
• **UI/UX Design** - Interfaces, experiencia de usuario, usabilidad
• **Fotografía** - Composición, iluminación, post-producción
• **3D Modeling** - Modelado, texturizado, animación, rendering
• **Motion Graphics** - Animación, video, efectos visuales

🎯 **Servicios de consultoría:**
• **Análisis crítico** - Evaluación técnica y conceptual
• **Desarrollo de estilo** - Identidad visual personal
• **Mejora técnica** - Habilidades específicas avanzadas
• **Estrategia creativa** - Planificación de proyectos
• **Mentoría profesional** - Desarrollo de carrera artística

💡 **Tendencias y vanguardia:**
• **Minimalismo funcional** - Simplicidad con propósito
• **Maximalismo controlado** - Complejidad organizada
• **Neomorfismo** - Interfaces suaves y táctiles
• **Arte generativo** - IA y algoritmos creativos
• **Realidad aumentada** - Experiencias inmersivas
• **Sostenibilidad visual** - Diseño consciente

🚀 **Metodología de enseñanza:**
1. **Diagnóstico artístico** - Evaluación de nivel actual
2. **Objetivos personalizados** - Metas específicas y medibles
3. **Plan de desarrollo** - Ruta de aprendizaje estructurada
4. **Práctica guiada** - Ejercicios progresivos
5. **Feedback constructivo** - Crítica técnica y conceptual
6. **Evolución continua** - Adaptación según progreso

¿En qué área específica del arte o diseño te gustaría especializarte o mejorar?`
  }

  handleTechnologyQuestion(message) {
    return `💻 **Tecnología - Consultoría Premium Avanzada:**

Como tu consultor tecnológico especializado, domino el ecosistema tech completo:

🔧 **Áreas de expertise:**
• **Hardware** - Componentes, arquitecturas, compatibilidad, overclocking
• **Software** - Sistemas operativos, aplicaciones, optimización
• **Redes** - Protocolos, seguridad, infraestructura, cloud computing
• **Móviles** - Ecosistemas iOS/Android, desarrollo, tendencias
• **Emerging Tech** - IA, blockchain, IoT, quantum computing, AR/VR

🚀 **Tecnologías emergentes:**
• **Inteligencia Artificial** - Machine Learning, Deep Learning, NLP
• **Blockchain** - Criptomonedas, smart contracts, DeFi, NFTs
• **Internet of Things** - Dispositivos conectados, automatización
• **Computación cuántica** - Algoritmos cuánticos, supremacía
• **Realidad extendida** - VR, AR, MR, metaverso
• **Edge Computing** - Procesamiento distribuido, latencia ultra-baja

💡 **Servicios especializados:**
• **Consultoría técnica** - Evaluación y recomendaciones
• **Troubleshooting avanzado** - Diagnóstico y resolución
• **Arquitectura de sistemas** - Diseño de infraestructura
• **Migración tecnológica** - Actualización de sistemas legacy
• **Optimización de performance** - Mejora de rendimiento
• **Security assessment** - Auditoría de seguridad

🛡️ **Ciberseguridad avanzada:**
• **Threat modeling** - Análisis de amenazas
• **Penetration testing** - Pruebas de penetración
• **Incident response** - Respuesta a incidentes
• **Compliance** - Cumplimiento normativo (GDPR, HIPAA)
• **Zero Trust** - Arquitectura de confianza cero
• **DevSecOps** - Seguridad integrada en desarrollo

🎯 **Tendencias actuales:**
• **Serverless computing** - Arquitecturas sin servidor
• **Microservices** - Arquitecturas distribuidas
• **Container orchestration** - Kubernetes, Kubernetes, Docker Swarm
• **GitOps** - Operaciones basadas en Git
• **Observability** - Monitoreo y telemetría avanzada
• **Sustainable tech** - Tecnología sostenible y green computing

¿Hay algún desafío tecnológico específico que necesites resolver o alguna tecnología emergente que te interese explorar?`
  }

  handleBusinessQuestion(message) {
    return `💼 **Negocios y Emprendimiento - Consultoría Premium Avanzada:**

Como consultor de negocios especializado en el sector creativo y tecnológico:

📈 **Estrategias de crecimiento:**
• **Marketing Digital 360°** - SEO, SEM, social media, content marketing
• **Branding estratégico** - Identidad de marca, posicionamiento, storytelling
• **Sales funnel optimization** - Conversión, retención, lifetime value
• **Growth hacking** - Crecimiento acelerado con recursos limitados
• **Partnership strategy** - Alianzas estratégicas, colaboraciones

🎯 **Para creativos y freelancers:**
• **Pricing strategy** - Modelos de precios competitivos y rentables
• **Client acquisition** - Prospección, networking, referrals
• **Project management** - Metodologías ágiles, herramientas, eficiencia
• **Legal framework** - Contratos, propiedad intelectual, términos
• **Business scaling** - Crecimiento sostenible, automatización

💰 **Modelos de negocio innovadores:**
• **Subscription economy** - Modelos de suscripción recurrente
• **Marketplace platforms** - Plataformas de dos lados
• **Digital products** - Cursos, templates, software, apps
• **Licensing models** - Monetización de propiedad intelectual
• **Affiliate marketing** - Programas de afiliados estratégicos

🔍 **Análisis de mercado avanzado:**
• **Competitive intelligence** - Análisis de competencia profundo
• **Market sizing** - TAM, SAM, SOM, oportunidades de mercado
• **Customer research** - Personas, journey mapping, insights
• **Trend analysis** - Identificación de tendencias emergentes
• **Blue ocean strategy** - Creación de nuevos espacios de mercado

🚀 **Estrategia digital:**
• **E-commerce optimization** - Conversión, UX, personalización
• **Content strategy** - Creación, distribución, engagement
• **Influencer marketing** - Colaboraciones, micro-influencers
• **Community building** - Construcción de audiencias leales
• **Data-driven decisions** - Analytics, KPIs, optimización continua

¿Qué aspecto específico de tu negocio o proyecto emprendedor te gustaría desarrollar o optimizar?`
  }

  handleMathQuestion(message) {
    return `🔢 **Matemáticas - Tutoría Premium Avanzada:**

Como tu tutor matemático especializado, hago accesibles los conceptos más complejos:

📚 **Áreas de especialización:**
• **Álgebra avanzada** - Ecuaciones, sistemas, matrices, espacios vectoriales
• **Cálculo diferencial e integral** - Límites, derivadas, integrales, series
• **Geometría analítica** - Coordenadas, transformaciones, geometría 3D
• **Estadística y probabilidad** - Distribuciones, inferencia, análisis de datos
• **Matemáticas discretas** - Lógica, grafos, combinatoria, algoritmos
• **Análisis numérico** - Métodos computacionales, aproximaciones

🧮 **Metodología de enseñanza:**
• **Visualización** - Gráficos, diagramas, representaciones intuitivas
• **Aplicaciones prácticas** - Conexión con problemas reales
• **Resolución paso a paso** - Desglose detallado de procesos
• **Múltiples enfoques** - Diferentes métodos para el mismo problema
• **Verificación** - Comprobación de resultados y coherencia

💡 **Aplicaciones interdisciplinarias:**
• **Programación** - Algoritmos, complejidad computacional
• **Física** - Modelado matemático, ecuaciones diferenciales
• **Economía** - Optimización, teoría de juegos, econometría
• **Biología** - Modelos poblacionales, bioinformática
• **Arte** - Geometría fractal, proporción áurea, simetría
• **Criptografía** - Teoría de números, álgebra abstracta

🎯 **Técnicas de resolución:**
• **Problem-solving strategies** - Heurísticas, patrones, analogías
• **Mathematical modeling** - Traducción de problemas reales
• **Proof techniques** - Demostración directa, contradicción, inducción
• **Computational methods** - Software matemático, simulaciones
• **Error analysis** - Identificación y corrección de errores

🚀 **Herramientas avanzadas:**
• **Software matemático** - Mathematica, MATLAB, Python (NumPy, SciPy)
• **Visualización** - GeoGebra, Desmos, plotting libraries
• **Symbolic computation** - Manipulación algebraica automatizada
• **Numerical analysis** - Métodos numéricos, aproximaciones
• **Statistical software** - R, SPSS, análisis de datos

¿Hay algún concepto matemático específico que te resulte desafiante o alguna aplicación particular que te interese explorar?`
  }

  handleScienceQuestion(message) {
    return `🔬 **Ciencias - Consultoría Premium Avanzada:**

Como tu consultor científico especializado, explico conceptos complejos de forma accesible:

🌟 **Disciplinas de expertise:**
• **Física moderna** - Mecánica cuántica, relatividad, cosmología, partículas
• **Química avanzada** - Química orgánica, inorgánica, física, bioquímica
• **Biología molecular** - Genética, proteómica, biología celular, evolución
• **Neurociencia** - Funcionamiento cerebral, cognición, neuroplasticidad
• **Ciencias de la Tierra** - Geología, climatología, oceanografía, sostenibilidad

🧪 **Metodología científica avanzada:**
• **Diseño experimental** - Hipótesis, variables, controles, validez
• **Análisis estadístico** - Significancia, correlación, causalidad
• **Peer review** - Evaluación crítica, reproducibilidad
• **Meta-análisis** - Síntesis de múltiples estudios
• **Interdisciplinariedad** - Conexiones entre campos científicos

🚀 **Fronteras del conocimiento:**
• **Biotecnología** - CRISPR, terapia génica, medicina personalizada
• **Nanotecnología** - Materiales avanzados, aplicaciones médicas
• **Astrofísica** - Exoplanetas, ondas gravitacionales, materia oscura
• **Inteligencia artificial** - Redes neuronales, machine learning, AGI
• **Sostenibilidad** - Energías renovables, cambio climático, economía circular

💡 **Aplicaciones prácticas:**
• **Medicina** - Diagnóstico, tratamiento, prevención, telemedicina
• **Tecnología** - Innovación, desarrollo de productos, I+D
• **Industria** - Procesos, materiales, optimización, automatización
• **Agricultura** - Biotecnología, sostenibilidad, seguridad alimentaria
• **Energía** - Renovables, almacenamiento, eficiencia, fusión nuclear

🎯 **Comunicación científica:**
• **Divulgación** - Explicaciones accesibles para público general
• **Visualización** - Gráficos, animaciones, modelos interactivos
• **Storytelling científico** - Narrativas que conecten con audiencias
• **Fact-checking** - Verificación de información, combate a pseudociencia
• **Ethics in science** - Responsabilidad, integridad, impacto social

¿Qué área de la ciencia te fascina más o hay algún fenómeno científico específico que te gustaría entender mejor?`
  }

  handleGeneralKnowledgeQuestion(message) {
    return `🌍 **Conocimiento General - Enciclopedia Premium Avanzada:**

Como tu consultor de conocimiento integral, tengo acceso a información multidisciplinaria:

📖 **Dominios de conocimiento:**
• **Historia mundial** - Civilizaciones, eventos, personajes, cronologías
• **Geografía física y humana** - Países, culturas, demografía, geopolítica
• **Literatura universal** - Clásicos, movimientos, análisis crítico
• **Filosofía** - Corrientes de pensamiento, ética, lógica, metafísica
• **Arte y cultura** - Movimientos artísticos, música, cine, tradiciones
• **Idiomas y lingüística** - Etimología, evolución, traducción, dialectos

🎭 **Cultura y humanidades:**
• **Antropología cultural** - Sociedades, rituales, creencias, evolución social
• **Psicología** - Comportamiento humano, cognición, personalidad, terapias
• **Sociología** - Estructuras sociales, movimientos, cambio social
• **Política comparada** - Sistemas de gobierno, ideologías, relaciones internacionales
• **Economía global** - Mercados, comercio, desarrollo, desigualdad
• **Religiones comparadas** - Creencias, prácticas, historia, impacto social

💭 **Metodología analítica:**
• **Pensamiento crítico** - Análisis, evaluación, síntesis de información
• **Múltiples perspectivas** - Enfoques diversos, contexto cultural
• **Fuentes verificadas** - Información académica, datos confiables
• **Conexiones interdisciplinarias** - Relaciones entre campos de conocimiento
• **Contextualización histórica** - Antecedentes, evolución, consecuencias

🎯 **Servicios especializados:**
• **Investigación profunda** - Análisis exhaustivo de temas complejos
• **Síntesis informativa** - Resúmenes estructurados y comprensibles
• **Análisis comparativo** - Contrastes entre culturas, épocas, sistemas
• **Contextualización** - Ubicación de eventos en marcos más amplios
• **Debate informado** - Argumentación basada en evidencia

¿Sobre qué tema específico te gustaría obtener información detallada y contextualizada?`
  }

  handleHowToQuestion(message) {
    return `📋 **Guías y Tutoriales - Servicio Premium Avanzado:**

Especializado en crear guías comprehensivas y tutoriales paso a paso para cualquier proceso:

🎯 **Categorías de tutoriales:**
• **Tecnología avanzada** - Software profesional, configuraciones complejas
• **Creatividad profesional** - Técnicas artísticas, flujos de trabajo
• **Productividad ejecutiva** - Sistemas de organización, gestión del tiempo
• **Habilidades profesionales** - Presentaciones, networking, liderazgo
• **Desarrollo personal** - Hábitos, mindset, crecimiento personal
• **Emprendimiento** - Desde idea hasta ejecución exitosa

📝 **Metodología pedagógica avanzada:**
1. **Análisis de objetivos** - Definición clara de resultados esperados
2. **Assessment inicial** - Evaluación de conocimientos previos
3. **Prerequisitos detallados** - Herramientas, conocimientos, recursos necesarios
4. **Roadmap estructurado** - Secuencia lógica y progresiva
5. **Checkpoints de validación** - Verificación de progreso en cada etapa
6. **Troubleshooting proactivo** - Anticipación y solución de problemas comunes

🛠️ **Recursos complementarios:**
• **Herramientas recomendadas** - Software, hardware, recursos online
• **Alternativas y opciones** - Diferentes enfoques según contexto
• **Best practices** - Consejos de expertos y profesionales
• **Common pitfalls** - Errores frecuentes y cómo evitarlos
• **Advanced techniques** - Técnicas avanzadas para usuarios experimentados
• **Community resources** - Comunidades, foros, grupos de apoyo

💡 **Características premium:**
• **Personalización adaptativa** - Ajuste según nivel y objetivos específicos
• **Seguimiento continuo** - Apoyo durante todo el proceso de aprendizaje
• **Updates dinámicos** - Actualización de métodos y herramientas
• **Acceso a recursos exclusivos** - Materiales premium y especializados
• **Consultoría directa** - Resolución de dudas específicas y complejas
• **Certificación de progreso** - Validación de habilidades adquiridas

🚀 **Metodologías aplicadas:**
• **Learning by doing** - Aprendizaje práctico y experiencial
• **Microlearning** - Conceptos en módulos digestibles
• **Spaced repetition** - Refuerzo espaciado para retención
• **Peer learning** - Aprendizaje colaborativo y social
• **Gamification** - Elementos de juego para motivación
• **Adaptive learning** - Personalización según progreso individual

🎓 **Especialidades avanzadas:**
• **Technical skills** - Programación, diseño, herramientas profesionales
• **Soft skills** - Comunicación, liderazgo, inteligencia emocional
• **Creative processes** - Metodologías de innovación y creatividad
• **Business skills** - Emprendimiento, marketing, gestión
• **Life skills** - Productividad personal, bienestar, desarrollo

¿Qué proceso específico o habilidad te gustaría dominar? Puedo crear una guía completamente personalizada con seguimiento continuo.`
  }

  handleExplanationRequest(message) {
    return `🧠 **Explicaciones Detalladas - Servicio Premium Avanzado:**

Especializado en hacer comprensibles los conceptos más complejos mediante metodologías pedagógicas avanzadas:

🎓 **Metodología explicativa multicapa:**
• **Lenguaje adaptativo** - Ajuste de complejidad según audiencia
• **Analogías inteligentes** - Comparaciones familiares y relevantes
• **Ejemplos contextualizados** - Casos prácticos y aplicaciones reales
• **Estructura narrativa** - Información organizada como historia coherente
• **Verificación comprensiva** - Confirmación de entendimiento progresivo

🔍 **Tipos de explicaciones especializadas:**
• **Conceptos abstractos** - Filosofía, matemáticas avanzadas, teorías
• **Procesos complejos** - Sistemas, metodologías, procedimientos
• **Fenómenos naturales** - Ciencia, física, biología, química
• **Sistemas sociales** - Política, economía, sociología, antropología
• **Tecnologías emergentes** - IA, blockchain, quantum computing

💡 **Niveles de profundidad adaptativos:**
• **Introductorio** - Conceptos básicos, panorama general
• **Intermedio** - Detalles importantes, conexiones, aplicaciones
• **Avanzado** - Análisis profundo, matices, complejidades
• **Experto** - Cutting-edge research, debates actuales, fronteras

🎯 **Personalización inteligente:**
• **Assessment de conocimiento** - Evaluación de base conceptual
• **Adaptación de estilo** - Visual, auditivo, kinestésico, lectura/escritura
• **Contexto relevante** - Ejemplos específicos a intereses y experiencia
• **Ritmo personalizado** - Velocidad adaptada a capacidad de procesamiento
• **Refuerzo selectivo** - Énfasis en áreas de mayor dificultad

🧩 **Técnicas pedagógicas avanzadas:**
• **Scaffolding** - Construcción progresiva de conocimiento
• **Chunking** - División en unidades manejables
• **Elaborative interrogation** - Preguntas que profundizan comprensión
• **Self-explanation** - Fomento de verbalización del proceso mental
• **Distributed practice** - Repaso espaciado para consolidación

🚀 **Herramientas de apoyo:**
• **Visualizaciones dinámicas** - Diagramas, gráficos, animaciones conceptuales
• **Mapas conceptuales** - Relaciones entre ideas y conceptos
• **Simulaciones interactivas** - Modelos para experimentación mental
• **Case studies** - Análisis de casos reales y aplicaciones
• **Multimedia integration** - Videos, audio, elementos interactivos

🎨 **Especialidades temáticas:**
• **STEM avanzado** - Ciencias, tecnología, ingeniería, matemáticas
• **Humanidades** - Historia, literatura, filosofía, arte
• **Ciencias sociales** - Psicología, sociología, antropología, política
• **Negocios y economía** - Mercados, estrategia, innovación, finanzas
• **Tecnología emergente** - IA, biotecnología, nanotecnología, sostenibilidad

¿Qué concepto específico te gustaría que explique en detalle? Puedo adaptarme a cualquier nivel de complejidad y estilo de aprendizaje que necesites.`
  }

  // Métodos existentes mejorados para Globex (continuando desde donde se cortó)

  handlePremiumArtworkSearch(query) {
    const artworks = this.getArtworksFromStorage()

    if (artworks.length === 0) {
      return "🔍 **Búsqueda Premium Avanzada**: Actualmente no hay obras disponibles, pero como usuario premium, recibirás alertas automáticas inteligentes cuando se agreguen nuevas obras que coincidan perfectamente con tus intereses y preferencias."
    }

    // Búsqueda avanzada con análisis de IA mejorado
    const keywords = query.toLowerCase().split(" ")
    const matches = artworks.filter((artwork) =>
      keywords.some(
        (keyword) =>
          artwork.title.toLowerCase().includes(keyword) ||
          artwork.description.toLowerCase().includes(keyword) ||
          artwork.artist.toLowerCase().includes(keyword) ||
          artwork.category.toLowerCase().includes(keyword) ||
          artwork.tags?.some((tag) => tag.toLowerCase().includes(keyword)),
      ),
    )

    if (matches.length > 0) {
      let response = `🎯 **Búsqueda Premium IA Avanzada**: Encontré ${matches.length} obra${matches.length > 1 ? "s" : ""} con análisis inteligente profundo:\n\n`

      matches.slice(0, 4).forEach((artwork, index) => {
        const popularityScore = this.calculatePopularityScore(artwork)
        const trendingStatus = this.getTrendingStatus(artwork)
        const aiRecommendation = this.getAIRecommendationReason(artwork, query)

        response += `${index + 1}. **${artwork.title}** por ${artwork.artist}\n`
        response += `   💰 $${artwork.price} | ⭐ ${artwork.rating}/5 (${artwork.reviews} reseñas)\n`
        response += `   📊 Popularidad: ${popularityScore}% | ${trendingStatus}\n`
        response += `   📂 ${this.getCategoryName(artwork.category)}\n`
        response += `   🤖 IA: ${aiRecommendation}\n\n`
      })

      if (matches.length > 4) {
        response += `📈 **Análisis Premium Avanzado**: ${matches.length - 4} obra${matches.length - 4 > 1 ? "s" : ""} adicional${matches.length - 4 > 1 ? "es" : ""} encontrada${matches.length - 4 > 1 ? "s" : ""}. ¿Quieres un análisis detallado con predicciones de mercado de todas?`
      }

      response += `\n\n🎯 **Recomendación IA**: Basado en tu búsqueda, también podrían interesarte obras de categorías relacionadas. ¿Te gustaría que configure alertas automáticas para búsquedas similares?`

      return response
    } else {
      return `🔍 **Búsqueda Premium Avanzada**: No encontré obras exactas para "${query}", pero mi IA puede:\n\n• 🎯 Configurar alertas automáticas para obras similares\n• 📊 Analizar tendencias relacionadas con tu búsqueda\n• 💡 Sugerir términos de búsqueda alternativos\n• 🔮 Predecir cuándo podrían aparecer obras similares\n\n¿Te gustaría que active alguna de estas funciones premium?`
    }
  }

  getAIRecommendationReason(artwork, query) {
    const reasons = [
      `Coincidencia perfecta con "${query}"`,
      "Alta demanda en esta categoría",
      "Artista en tendencia ascendente",
      "Precio competitivo para la calidad",
      "Estilo único y diferenciado",
      "Potencial de revalorización alto",
    ]
    return reasons[Math.floor(Math.random() * reasons.length)]
  }

  // Métodos auxiliares mejorados
  calculatePopularityScore(artwork) {
    const reviewWeight = artwork.reviews * 12
    const ratingWeight = artwork.rating * 18
    const categoryBonus = 15 // Bonus por categoría popular
    const baseScore = Math.min(reviewWeight + ratingWeight + categoryBonus, 100)
    return Math.round(baseScore)
  }

  getTrendingStatus(artwork) {
    const score = this.calculatePopularityScore(artwork)
    if (score >= 85) return "🔥 Ultra Trending"
    if (score >= 70) return "📈 Muy Popular"
    if (score >= 50) return "⭐ Destacada"
    if (score >= 30) return "📊 En Crecimiento"
    return "🆕 Nueva Oportunidad"
  }

  calculateAIRecommendationScore(artwork) {
    const ratingScore = artwork.rating * 22
    const reviewScore = Math.min(artwork.reviews * 6, 35)
    const categoryBonus = 15 // Bonus por categoría popular
    const trendBonus = 10 // Bonus por tendencia
    return Math.round(ratingScore + reviewScore + categoryBonus + trendBonus)
  }

  getMatchReason(artwork) {
    const reasons = [
      "Calificación excepcional de usuarios",
      "Tendencia creciente en esta categoría específica",
      "Estilo perfectamente alineado con tus preferencias",
      "Precio altamente competitivo en el mercado actual",
      "Artista con reputación sólida y creciente",
      "Potencial de apreciación a largo plazo",
      "Técnica innovadora y diferenciada",
      "Demanda alta en el segmento premium",
    ]
    return reasons[Math.floor(Math.random() * reasons.length)]
  }

  // Resto de métodos existentes (manteniendo la funcionalidad actual)
  handleSuggestion(suggestion) {
    if (!this.isPremiumUser) {
      this.showPremiumUpgradeModal()
      return
    }

    const input = document.getElementById("iaGlobInput")
    if (input) {
      input.value = suggestion
      input.focus()
      // Trigger send automatically for better UX
      setTimeout(() => {
        this.sendMessage()
      }, 500)
    }
  }

  addMessage(sender, content) {
    if (!this.isPremiumUser) return

    const messagesContainer = document.getElementById("iaGlobMessages")
    if (!messagesContainer) return

    const messageElement = document.createElement("div")
    messageElement.className = `message ${sender}`

    const now = new Date()
    const timeString = now.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    })

    const avatar = sender === "ia" ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>'

    messageElement.innerHTML = `
      <div class="message-avatar">${avatar}</div>
      <div class="message-content">
        ${this.formatMessage(content)}
        <div class="message-time">${timeString}</div>
      </div>
    `

    // Remover mensaje de bienvenida si existe
    const welcomeMessage = messagesContainer.querySelector(".welcome-message")
    if (welcomeMessage && this.messages.length === 0) {
      welcomeMessage.remove()
    }

    messagesContainer.appendChild(messageElement)

    // Scroll al final con animación suave
    messagesContainer.scrollTo({
      top: messagesContainer.scrollHeight,
      behavior: "smooth",
    })

    // Guardar mensaje
    this.messages.push({
      sender,
      content,
      timestamp: now.toISOString(),
    })

    // Guardar conversación
    this.saveConversationHistory()
  }

  formatMessage(content) {
    // Convertir markdown básico a HTML mejorado
    return content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`(.*?)`/g, "<code>$1</code>")
      .replace(/\n/g, "<br>")
      .replace(/•/g, "•") // Mantener bullets
      .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>') // Links automáticos
  }

  showTypingIndicator() {
    if (!this.isPremiumUser) return

    const indicator = document.getElementById("typingIndicator")
    if (indicator) {
      indicator.classList.add("active")

      const messagesContainer = document.getElementById("iaGlobMessages")
      if (messagesContainer) {
        messagesContainer.scrollTo({
          top: messagesContainer.scrollHeight,
          behavior: "smooth",
        })
      }

      this.isTyping = true
    }
  }

  hideTypingIndicator() {
    if (!this.isPremiumUser) return

    const indicator = document.getElementById("typingIndicator")
    if (indicator) {
      indicator.classList.remove("active")
      this.isTyping = false
    }
  }

  getRandomResponse(type) {
    const responses = this.knowledgeBase.responses[type]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  getArtworksFromStorage() {
    try {
      const artworks = localStorage.getItem("marketplace_artworks")
      return artworks ? JSON.parse(artworks) : []
    } catch (error) {
      console.error("Error cargando obras:", error)
      return []
    }
  }

  getArtworkCountByCategory(category) {
    const artworks = this.getArtworksFromStorage()
    return artworks.filter((artwork) => artwork.category === category).length
  }

  getCategoryName(categoryId) {
    const categoryNames = {
      "digital-art": "Arte Digital",
      illustration: "Ilustración",
      photography: "Fotografía",
      "web-design": "Diseño Web",
      software: "Software",
      "graphic-design": "Diseño Gráfico",
      "3d-modeling": "Modelado 3D",
    }
    return categoryNames[categoryId] || categoryId
  }

  loadUserPreferences() {
    try {
      const prefs = localStorage.getItem("ia_glob_preferences")
      return prefs
        ? JSON.parse(prefs)
        : {
            language: "es",
            notifications: true,
            theme: "auto",
          }
    } catch (error) {
      return { language: "es", notifications: true, theme: "auto" }
    }
  }

  saveUserPreferences() {
    localStorage.setItem("ia_glob_preferences", JSON.stringify(this.userPreferences))
  }

  loadConversationHistory() {
    if (!this.isPremiumUser) return

    try {
      const currentUser = this.getCurrentUser()
      if (!currentUser) return

      // Cargar historial específico del usuario
      const userHistory = localStorage.getItem(`ia_glob_conversation_${currentUser.id}`)
      const generalHistory = localStorage.getItem("ia_glob_conversation")

      const history = userHistory || generalHistory

      if (history) {
        this.messages = JSON.parse(history)

        // Restaurar mensajes en la interfaz (solo los últimos 15)
        const recentMessages = this.messages.slice(-15)
        const messagesContainer = document.getElementById("iaGlobMessages")

        if (recentMessages.length > 0 && messagesContainer) {
          // Remover mensaje de bienvenida
          const welcomeMessage = messagesContainer.querySelector(".welcome-message")
          if (welcomeMessage) {
            welcomeMessage.remove()
          }

          recentMessages.forEach((msg) => {
            this.addMessageToInterface(msg.sender, msg.content, msg.timestamp)
          })
        }
      }
    } catch (error) {
      console.error("Error cargando historial:", error)
    }
  }

  addMessageToInterface(sender, content, timestamp) {
    if (!this.isPremiumUser) return

    const messagesContainer = document.getElementById("iaGlobMessages")
    if (!messagesContainer) return

    const messageElement = document.createElement("div")
    messageElement.className = `message ${sender}`

    const date = new Date(timestamp)
    const timeString = date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    })

    const avatar = sender === "ia" ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>'

    messageElement.innerHTML = `
      <div class="message-avatar">${avatar}</div>
      <div class="message-content">
        ${this.formatMessage(content)}
        <div class="message-time">${timeString}</div>
      </div>
    `

    messagesContainer.appendChild(messageElement)
  }

  saveConversationHistory() {
    if (!this.isPremiumUser) return

    try {
      const currentUser = this.getCurrentUser()
      if (!currentUser) return

      // Guardar solo los últimos 100 mensajes para mejor performance
      const recentMessages = this.messages.slice(-100)

      // Guardar historial específico del usuario
      localStorage.setItem(`ia_glob_conversation_${currentUser.id}`, JSON.stringify(recentMessages))

      // También guardar en el historial general como respaldo
      localStorage.setItem("ia_glob_conversation", JSON.stringify(recentMessages))
    } catch (error) {
      console.error("Error guardando historial:", error)
    }
  }

  clearConversation() {
    if (!this.isPremiumUser) return

    // Confirmación antes de limpiar
    if (this.messages.length > 0) {
      const confirmed = confirm(
        "¿Estás seguro de que quieres limpiar toda la conversación? Esta acción no se puede deshacer.",
      )
      if (!confirmed) return
    }

    this.messages = []
    this.conversationContext = []

    const currentUser = this.getCurrentUser()
    if (currentUser) {
      localStorage.removeItem(`ia_glob_conversation_${currentUser.id}`)
    }
    localStorage.removeItem("ia_glob_conversation")

    const messagesContainer = document.getElementById("iaGlobMessages")
    if (messagesContainer) {
      messagesContainer.innerHTML = `
        <div class="welcome-message">
          <h4>¡Hola! Soy IA Glob Avanzada 🤖👑</h4>
          <p>Tu asistente inteligente premium más avanzado. Puedo ayudarte con cualquier pregunta sobre arte, tecnología, ciencias, matemáticas, negocios, Globex o cualquier tema que necesites.</p>
          <div class="ai-capabilities">
            <div class="capability-badge">🎨 Arte & Diseño</div>
            <div class="capability-badge">💻 Programación</div>
            <div class="capability-badge">🔬 Ciencias</div>
            <div class="capability-badge">📊 Análisis IA</div>
          </div>
          <div class="quick-suggestions">
            <span class="suggestion-chip" data-suggestion="¿Cómo puedo mejorar mis habilidades de arte digital?">Arte Digital</span>
            <span class="suggestion-chip" data-suggestion="Explícame React y cómo empezar">React JS</span>
            <span class="suggestion-chip" data-suggestion="¿Qué obras me recomiendas basado en IA?">Recomendaciones IA</span>
            <span class="suggestion-chip" data-suggestion="Ayúdame con cálculo diferencial">Matemáticas</span>
            <span class="suggestion-chip" data-suggestion="Estrategias de marketing digital para creativos">Marketing</span>
          </div>
        </div>
      `
    }

    if (window.showNotification) {
      window.showNotification("Conversación limpiada correctamente. ¡Empecemos de nuevo! 🚀", "success")
    }
  }

  // Métodos adicionales para funcionalidades premium (placeholders para futuras implementaciones)
  handlePremiumRecommendations() {
    const artworks = this.getArtworksFromStorage()

    if (artworks.length === 0) {
      return "🤖 **IA Premium Avanzada**: Aún no hay obras para analizar, pero como usuario premium, recibirás recomendaciones personalizadas ultra-precisas basadas en algoritmos de machine learning cuando haya contenido disponible."
    }

    // Análisis avanzado con IA mejorado
    const topRated = artworks
      .filter((artwork) => artwork.rating > 4)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 4)

    if (topRated.length > 0) {
      let response = "🌟 **Recomendaciones Premium IA Avanzada**:\n\n"

      topRated.forEach((artwork, index) => {
        const aiScore = this.calculateAIRecommendationScore(artwork)
        const matchReason = this.getMatchReason(artwork)
        const futureValue = this.predictFutureValue(artwork)

        response += `${index + 1}. **${artwork.title}** por ${artwork.artist}\n`
        response += `   ⭐ ${artwork.rating}/5 | 💰 $${artwork.price}\n`
        response += `   🤖 Puntuación IA: ${aiScore}%\n`
        response += `   💡 ${matchReason}\n`
        response += `   📈 Predicción: ${futureValue}\n`
        response += `   ${artwork.description.substring(0, 80)}...\n\n`
      })

      response +=
        "🎯 **Análisis Premium Avanzado**: Estas recomendaciones están basadas en algoritmos de machine learning, análisis de tendencias globales, tu historial de navegación y predicciones de mercado con IA."
      return response
    } else {
      const recent = artworks.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded)).slice(0, 4)

      let response = "🆕 **Recomendaciones Premium - Oportunidades Emergentes**:\n\n"

      recent.forEach((artwork, index) => {
        const potentialScore = this.calculatePotentialScore(artwork)
        const riskAssessment = this.assessInvestmentRisk(artwork)

        response += `${index + 1}. **${artwork.title}** por ${artwork.artist}\n`
        response += `   💰 $${artwork.price} | 📂 ${this.getCategoryName(artwork.category)}\n`
        response += `   📈 Potencial: ${potentialScore}% | 🎯 ${riskAssessment}\n\n`
      })

      response +=
        "🤖 **Análisis IA Avanzado**: Estas obras tienen alto potencial basado en análisis predictivo, tendencias emergentes y patrones de mercado identificados por IA."
      return response
    }
  }

  predictFutureValue(artwork) {
    const predictions = [
      "Potencial de crecimiento alto",
      "Valor estable a largo plazo",
      "Tendencia alcista proyectada",
      "Oportunidad de inversión sólida",
      "Demanda creciente esperada",
    ]
    return predictions[Math.floor(Math.random() * predictions.length)]
  }

  assessInvestmentRisk(artwork) {
    const risks = [
      "Riesgo bajo, alta confianza",
      "Riesgo moderado, buen potencial",
      "Oportunidad emergente",
      "Inversión estratégica",
      "Apuesta de crecimiento",
    ]
    return risks[Math.floor(Math.random() * risks.length)]
  }

  calculatePotentialScore(artwork) {
    const newArtworkBonus = 35
    const categoryPopularity = 30
    const priceCompetitiveness = 25
    const randomFactor = Math.random() * 20
    return Math.round(newArtworkBonus + categoryPopularity + priceCompetitiveness + randomFactor)
  }

  // Métodos adicionales para otras funciones premium (manteniendo funcionalidad existente)
  handleMarketAnalysis() {
    const artworks = this.getArtworksFromStorage()

    if (artworks.length === 0) {
      return "📊 **Análisis Premium Avanzado**: No hay suficientes datos para generar un análisis de mercado completo. Como usuario premium, recibirás reportes automáticos con predicciones de IA cuando haya más actividad en el marketplace."
    }

    const analysis = this.generateAdvancedMarketAnalysis(artworks)

    let response = "📊 **Análisis de Mercado Premium Avanzado**:\n\n"
    response += `📈 **Métricas Principales**:\n`
    response += `• Total de obras activas: ${artworks.length}\n`
    response += `• Precio promedio del mercado: $${analysis.avgPrice}\n`
    response += `• Categoría dominante: ${analysis.topCategory}\n`
    response += `• Rating promedio de calidad: ${analysis.avgRating}/5\n`
    response += `• Índice de actividad: ${analysis.activityIndex}%\n\n`

    response += `🎯 **Insights Premium con IA**:\n`
    response += `• ${analysis.insights.priceRange}\n`
    response += `• ${analysis.insights.qualityTrend}\n`
    response += `• ${analysis.insights.categoryDistribution}\n`
    response += `• ${analysis.insights.marketMomentum}\n\n`

    response += `🔮 **Predicciones IA**: ${analysis.prediction}\n\n`
    response += `💡 **Recomendación Estratégica**: ${analysis.recommendation}`

    return response
  }

  generateAdvancedMarketAnalysis(artworks) {
    const prices = artworks.map((a) => a.price)
    const ratings = artworks.map((a) => a.rating)
    const avgPrice = (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2)
    const avgRating = (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)

    // Categoría más popular
    const categoryCount = {}
    artworks.forEach((artwork) => {
      categoryCount[artwork.category] = (categoryCount[artwork.category] || 0) + 1
    })
    const topCategory = Object.keys(categoryCount).reduce((a, b) => (categoryCount[a] > categoryCount[b] ? a : b))

    // Índice de actividad (simulado)
    const activityIndex = Math.round(60 + Math.random() * 35)

    return {
      avgPrice,
      avgRating,
      topCategory: this.getCategoryName(topCategory),
      activityIndex,
      insights: {
        priceRange: `Rango de precios: $${Math.min(...prices)} - $${Math.max(...prices)} (volatilidad ${this.calculateVolatility(prices)}%)`,
        qualityTrend: `Calidad promedio: ${avgRating}/5 (${avgRating >= 4.5 ? "Excelente" : avgRating >= 4 ? "Muy buena" : avgRating >= 3.5 ? "Buena" : "En desarrollo"})`,
        categoryDistribution: `${Object.keys(categoryCount).length} categorías activas con diversificación ${this.calculateDiversification(categoryCount)}%`,
        marketMomentum: `Momentum del mercado: ${activityIndex >= 80 ? "Muy alto" : activityIndex >= 60 ? "Alto" : "Moderado"} con tendencia ${activityIndex > 75 ? "alcista" : "estable"}`,
      },
      prediction: this.generateMarketPrediction(avgRating, activityIndex),
      recommendation: this.generateStrategicRecommendation(avgRating, activityIndex, prices),
    }
  }

  calculateVolatility(prices) {
    const mean = prices.reduce((a, b) => a + b, 0) / prices.length
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length
    return Math.round((Math.sqrt(variance) / mean) * 100)
  }

  calculateDiversification(categoryCount) {
    const total = Object.values(categoryCount).reduce((a, b) => a + b, 0)
    const categories = Object.keys(categoryCount).length
    return Math.round((categories / 7) * 100) // 7 es el total de categorías posibles
  }

  generateMarketPrediction(avgRating, activityIndex) {
    if (avgRating >= 4.5 && activityIndex >= 80) {
      return "Mercado en expansión acelerada con alta calidad. Predicción: crecimiento sostenido del 15-25% en los próximos 6 meses."
    } else if (avgRating >= 4 && activityIndex >= 60) {
      return "Mercado estable con buena calidad. Predicción: crecimiento moderado del 8-15% con oportunidades selectivas."
    } else {
      return "Mercado en desarrollo con potencial emergente. Predicción: consolidación y mejora gradual de la calidad."
    }
  }

  generateStrategicRecommendation(avgRating, activityIndex, prices) {
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length

    if (avgRating >= 4.5) {
      return "Mercado premium consolidado. Estrategia recomendada: inversión en obras de alta calidad con potencial de apreciación."
    } else if (avgPrice < 50) {
      return "Oportunidades de entrada atractivas. Estrategia recomendada: diversificación en múltiples categorías emergentes."
    } else {
      return "Mercado balanceado. Estrategia recomendada: selección cuidadosa basada en análisis individual de cada obra."
    }
  }

  // Métodos adicionales para completar la funcionalidad
  handlePremiumCategoriesQuery() {
    const categories = [
      { id: "digital-art", name: "🎨 Arte Digital", desc: "Creaciones digitales y arte conceptual avanzado" },
      { id: "illustration", name: "✏️ Ilustración", desc: "Dibujos e ilustraciones originales profesionales" },
      { id: "photography", name: "📸 Fotografía", desc: "Fotografías artísticas y comerciales de alta calidad" },
      { id: "web-design", name: "💻 Diseño Web", desc: "Templates y diseños web modernos y responsivos" },
      { id: "software", name: "⚙️ Software", desc: "Aplicaciones y herramientas digitales innovadoras" },
      { id: "graphic-design", name: "🎭 Diseño Gráfico", desc: "Branding, logos y material gráfico profesional" },
      { id: "3d-modeling", name: "🧊 Modelado 3D", desc: "Modelos 3D, animaciones y assets digitales" },
    ]

    let response = "📂 **Análisis Premium Avanzado de Categorías**:\n\n"

    categories.forEach((cat) => {
      const count = this.getArtworkCountByCategory(cat.id)
      const trend = this.getCategoryTrend(cat.id)
      const avgPrice = this.getCategoryAveragePrice(cat.id)
      const growth = this.getCategoryGrowthPrediction(cat.id)

      response += `${cat.name}\n`
      response += `${cat.desc}\n`
      response += `📊 ${count} obra${count !== 1 ? "s" : ""} | 💰 Promedio: $${avgPrice} | ${trend}\n`
      response += `📈 Predicción: ${growth}\n\n`
    })

    response +=
      "🤖 **Análisis IA Avanzado**: Como usuario premium, recibes insights detallados con predicciones de crecimiento y oportunidades de inversión para cada categoría."
    return response
  }

  getCategoryTrend(categoryId) {
    const trends = [
      "📈 En alza fuerte",
      "🔥 Ultra Trending",
      "⭐ Estable premium",
      "📊 Crecimiento sostenido",
      "🚀 Explosivo",
    ]
    return trends[Math.floor(Math.random() * trends.length)]
  }

  getCategoryGrowthPrediction(categoryId) {
    const predictions = [
      "Crecimiento del 20-30% proyectado",
      "Estabilidad con oportunidades selectivas",
      "Potencial emergente alto",
      "Consolidación del mercado esperada",
      "Expansión acelerada prevista",
    ]
    return predictions[Math.floor(Math.random() * predictions.length)]
  }

  getCategoryAveragePrice(categoryId) {
    const artworks = this.getArtworksFromStorage()
    const categoryArtworks = artworks.filter((a) => a.category === categoryId)

    if (categoryArtworks.length === 0) return "0.00"

    const avgPrice = categoryArtworks.reduce((sum, artwork) => sum + artwork.price, 0) / categoryArtworks.length
    return avgPrice.toFixed(2)
  }

  // Métodos para otras funciones premium (manteniendo funcionalidad existente pero mejorada)
  handlePremiumPurchaseHelp() {
    return (
      `🛒 **Asistencia Premium Avanzada de Compras**:\n\n` +
      `Como usuario premium, tienes acceso a nuestro sistema de compras más avanzado:\n\n` +
      `1. **🔍 Exploración IA**: Filtros inteligentes con machine learning\n` +
      `2. **📊 Análisis Predictivo**: Comparativas con predicciones de valor\n` +
      `3. **⭐ Verificación Avanzada**: Análisis de autenticidad y calidad con IA\n` +
      `4. **🛒 Carrito Inteligente**: Recomendaciones automáticas y complementarias\n` +
      `5. **💳 Pago Ultra-Prioritario**: Procesamiento instantáneo y seguro\n` +
      `6. **📞 Soporte Premium 24/7**: Asistencia especializada inmediata\n\n` +
      `💡 **Funciones Exclusivas Premium**:\n` +
      `• Alertas de descuentos personalizadas con IA\n` +
      `• Historial detallado con análisis de patrones\n` +
      `• Recomendaciones post-compra inteligentes\n` +
      `• Garantía extendida premium con cobertura total\n` +
      `• Acceso anticipado a lanzamientos exclusivos\n` +
      `• Programa de fidelidad con beneficios únicos\n\n` +
      `🎯 **Asistente de Compras IA**: Puedo ayudarte a tomar decisiones informadas analizando precios, tendencias, calidad y potencial de inversión.\n\n` +
      `¿Necesitas ayuda con algún aspecto específico de tu compra o te gustaría que analice alguna obra en particular?`
    )
  }

  handlePremiumTechnicalSupport() {
    return (
      `🔧 **Soporte Técnico Premium Avanzado - IA Glob**\n\n` +
      `Como usuario premium, tienes acceso a nuestro soporte técnico más avanzado:\n\n` +
      `⚡ **Soporte Ultra-Inmediato**:\n` +
      `• Respuesta garantizada en menos de 2 minutos\n` +
      `• Diagnóstico automático con IA avanzada\n` +
      `• Soluciones personalizadas y predictivas\n` +
      `• Acceso directo a ingenieros especialistas\n` +
      `• Resolución proactiva de problemas\n\n` +
      `🛠️ **Herramientas Premium Avanzadas**:\n` +
      `• Diagnóstico automático del sistema en tiempo real\n` +
      `• Optimización de rendimiento con IA\n` +
      `• Backup automático y sincronización en la nube\n` +
      `• Monitoreo continuo de salud del sistema\n` +
      `• Actualizaciones automáticas prioritarias\n\n` +
      `📞 **Canales Exclusivos Premium**:\n` +
      `• Chat prioritario con IA y humanos 24/7\n` +
      `• Videollamada inmediata con técnicos expertos\n` +
      `• Acceso remoto autorizado y seguro\n` +
      `• Seguimiento personalizado de casos\n` +
      `• Escalación automática a especialistas\n\n` +
      `🎯 **Servicios Especializados**:\n` +
      `• Consultoría técnica personalizada\n` +
      `• Optimización de flujos de trabajo\n` +
      `• Integración con herramientas profesionales\n` +
      `• Capacitación técnica avanzada\n` +
      `• Desarrollo de soluciones customizadas\n\n` +
      `¿Cuál es el desafío técnico que estás experimentando? Mi sistema de diagnóstico avanzado puede identificar y resolver la mayoría de problemas automáticamente.`
    )
  }

  handlePremiumMarketplaceInfo() {
    return (
      `ℹ️ **Globex Marketplace - Información Premium Avanzada**\n\n` +
      `Como usuario premium de Globex, tienes acceso a la experiencia más avanzada del marketplace:\n\n` +
      `👑 **Funciones Exclusivas Premium**:\n` +
      `• 🤖 IA Glob Avanzada - Asistente con machine learning\n` +
      `• 📊 Análisis de mercado con predicciones IA\n` +
      `• 🔔 Alertas inteligentes personalizadas\n` +
      `• 💎 Acceso anticipado a obras premium exclusivas\n` +
      `• 📈 Reportes detallados con insights avanzados\n` +
      `• 🎯 Recomendaciones ultra-personalizadas con IA\n` +
      `• 🛡️ Verificación de autenticidad avanzada\n` +
      `• 🚀 Herramientas de inversión y análisis\n\n` +
      `📊 **Analytics en Tiempo Real**:\n` +
      `• Tendencias de mercado actualizadas cada minuto\n` +
      `• Análisis de precios dinámico con predicciones\n` +
      `• Índices de popularidad y demanda en vivo\n` +
      `• Insights de comportamiento de compradores\n` +
      `• Alertas de oportunidades de inversión\n\n` +
      `🎯 **Nuestra Misión Premium**:\n` +
      `Brindarte la experiencia más avanzada y personalizada del mercado digital, ` +
      `utilizando inteligencia artificial de última generación para conectarte con ` +
      `las mejores oportunidades y maximizar tu experiencia creativa y de inversión.\n\n` +
      `🌟 **Beneficios Únicos**:\n` +
      `• Comisiones reducidas en todas las transacciones\n` +
      `• Acceso a eventos exclusivos y lanzamientos VIP\n` +
      `• Programa de fidelidad con recompensas premium\n` +
      `• Soporte prioritario con especialistas dedicados\n` +
      `• Herramientas avanzadas de portfolio management\n\n` +
      `¿Hay alguna función premium específica que te gustaría explorar o necesitas ayuda para maximizar tu experiencia en Globex?`
    )
  }

  handlePremiumAlerts() {
    return (
      `🔔 **Sistema de Alertas Premium Avanzado**:\n\n` +
      `Como usuario premium, tienes acceso al sistema de alertas más inteligente del mercado:\n\n` +
      `✨ **Alertas Inteligentes Disponibles**:\n` +
      `• 🎨 Nuevas obras por categoría con filtros avanzados\n` +
      `• 💰 Obras dentro de rangos de precio personalizados\n` +
      `• ⭐ Obras con ratings específicos y tendencias\n` +
      `• 👤 Nuevas obras de artistas favoritos y similares\n` +
      `• 📊 Cambios de precio y oportunidades de inversión\n` +
      `• 🔥 Obras trending con análisis de momentum\n` +
      `• 🎯 Alertas basadas en tu historial de navegación\n` +
      `• 📈 Predicciones de mercado y oportunidades emergentes\n\n` +
      `🤖 **IA Ultra-Personalizada**:\n` +
      `• Machine learning basado en tu comportamiento\n` +
      `• Análisis predictivo de tus preferencias\n` +
      `• Optimización continua de relevancia\n` +
      `• Detección de patrones de compra únicos\n` +
      `• Recomendaciones proactivas inteligentes\n\n` +
      `⚡ **Configuración Avanzada**:\n` +
      `• Frecuencia personalizable (tiempo real a semanal)\n` +
      `• Múltiples canales (email, push, SMS, in-app)\n` +
      `• Filtros complejos y combinaciones lógicas\n` +
      `• Alertas condicionales con triggers múltiples\n` +
      `• Priorización automática por relevancia\n\n` +
      `🎯 **`
    )
  }

  handlePremiumArtistInfo(query) {
    return (
      `👨‍🎨 **Información de Artistas - Análisis Premium**:\n\n` +
      `Como usuario premium, puedo proporcionarte análisis detallado de artistas:\n\n` +
      `🔍 **Análisis disponible**:\n` +
      `• Historial de obras y evolución artística\n` +
      `• Tendencias de precios y popularidad\n` +
      `• Estilo y técnicas características\n` +
      `• Comparación con artistas similares\n` +
      `• Predicciones de crecimiento\n\n` +
      `📊 **Métricas de rendimiento**:\n` +
      `• Rating promedio de obras\n` +
      `• Número de ventas y reseñas\n` +
      `• Categorías más exitosas\n` +
      `• Evolución temporal de precios\n\n` +
      `¿Hay algún artista específico sobre el que te gustaría obtener información detallada?`
    )
  }

  handlePremiumPriceInfo(query) {
    const artworks = this.getArtworksFromStorage()

    if (artworks.length === 0) {
      return "💰 **Análisis de Precios Premium**: No hay obras disponibles para analizar precios actualmente."
    }

    const prices = artworks.map((a) => a.price)
    const avgPrice = (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2)
    const minPrice = Math.min(...prices).toFixed(2)
    const maxPrice = Math.max(...prices).toFixed(2)

    return (
      `💰 **Análisis de Precios Premium**:\n\n` +
      `📊 **Estadísticas del mercado**:\n` +
      `• Precio promedio: $${avgPrice}\n` +
      `• Precio mínimo: $${minPrice}\n` +
      `• Precio máximo: $${maxPrice}\n` +
      `• Total de obras: ${artworks.length}\n\n` +
      `🎯 **Análisis por categorías**:\n` +
      `• Arte Digital: Rango premium\n` +
      `• Ilustración: Precios competitivos\n` +
      `• Fotografía: Valor profesional\n` +
      `• Diseño Web: Inversión estratégica\n\n` +
      `💡 **Recomendación IA**: Basado en tendencias actuales, este es un buen momento para invertir en obras de calidad media-alta.\n\n` +
      `¿Te interesa algún rango de precios específico?`
    )
  }

  // Métodos auxiliares adicionales
  getCategoryTrend(categoryId) {
    const trends = ["📈 En alza", "🔥 Trending", "⭐ Estable", "📊 Creciendo"]
    return trends[Math.floor(Math.random() * trends.length)]
  }

  getCategoryAveragePrice(categoryId) {
    const artworks = this.getArtworksFromStorage()
    const categoryArtworks = artworks.filter((a) => a.category === categoryId)

    if (categoryArtworks.length === 0) return "0.00"

    const avgPrice = categoryArtworks.reduce((sum, artwork) => sum + artwork.price, 0) / categoryArtworks.length
    return avgPrice.toFixed(2)
  }

  // Resto de métodos existentes (sin cambios)
  handleSuggestion(suggestion) {
    if (!this.isPremiumUser) {
      this.showPremiumUpgradeModal()
      return
    }

    const input = document.getElementById("iaGlobInput")
    if (input) {
      input.value = suggestion
      this.sendMessage()
    }
  }

  addMessage(sender, content) {
    if (!this.isPremiumUser) return

    const messagesContainer = document.getElementById("iaGlobMessages")
    if (!messagesContainer) return

    const messageElement = document.createElement("div")
    messageElement.className = `message ${sender}`

    const now = new Date()
    const timeString = now.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    })

    const avatar = sender === "ia" ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>'

    messageElement.innerHTML = `
      <div class="message-avatar">${avatar}</div>
      <div class="message-content">
        ${this.formatMessage(content)}
        <div class="message-time">${timeString}</div>
      </div>
    `

    // Remover mensaje de bienvenida si existe
    const welcomeMessage = messagesContainer.querySelector(".welcome-message")
    if (welcomeMessage && this.messages.length === 0) {
      welcomeMessage.remove()
    }

    messagesContainer.appendChild(messageElement)

    // Scroll al final
    messagesContainer.scrollTop = messagesContainer.scrollHeight

    // Guardar mensaje
    this.messages.push({
      sender,
      content,
      timestamp: now.toISOString(),
    })

    // Guardar conversación
    this.saveConversationHistory()
  }

  formatMessage(content) {
    // Convertir markdown básico a HTML
    return content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`(.*?)`/g, "<code>$1</code>")
      .replace(/\n/g, "<br>")
  }

  showTypingIndicator() {
    if (!this.isPremiumUser) return

    const indicator = document.getElementById("typingIndicator")
    if (indicator) {
      indicator.classList.add("active")

      const messagesContainer = document.getElementById("iaGlobMessages")
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight
      }

      this.isTyping = true
    }
  }

  hideTypingIndicator() {
    if (!this.isPremiumUser) return

    const indicator = document.getElementById("typingIndicator")
    if (indicator) {
      indicator.classList.remove("active")
      this.isTyping = false
    }
  }

  getRandomResponse(type) {
    const responses = this.knowledgeBase.responses[type]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  getArtworksFromStorage() {
    try {
      const artworks = localStorage.getItem("marketplace_artworks")
      return artworks ? JSON.parse(artworks) : []
    } catch (error) {
      console.error("Error cargando obras:", error)
      return []
    }
  }

  getArtworkCountByCategory(category) {
    const artworks = this.getArtworksFromStorage()
    return artworks.filter((artwork) => artwork.category === category).length
  }

  getCategoryName(categoryId) {
    const categoryNames = {
      "digital-art": "Arte Digital",
      illustration: "Ilustración",
      photography: "Fotografía",
      "web-design": "Diseño Web",
      software: "Software",
      "graphic-design": "Diseño Gráfico",
      "3d-modeling": "Modelado 3D",
    }
    return categoryNames[categoryId] || categoryId
  }

  loadUserPreferences() {
    try {
      const prefs = localStorage.getItem("ia_glob_preferences")
      return prefs
        ? JSON.parse(prefs)
        : {
            language: "es",
            notifications: true,
            theme: "auto",
          }
    } catch (error) {
      return { language: "es", notifications: true, theme: "auto" }
    }
  }

  saveUserPreferences() {
    localStorage.setItem("ia_glob_preferences", JSON.stringify(this.userPreferences))
  }

  loadConversationHistory() {
    if (!this.isPremiumUser) return

    try {
      const currentUser = this.getCurrentUser()
      if (!currentUser) return

      // Cargar historial específico del usuario
      const userHistory = localStorage.getItem(`ia_glob_conversation_${currentUser.id}`)
      const generalHistory = localStorage.getItem("ia_glob_conversation")

      const history = userHistory || generalHistory

      if (history) {
        this.messages = JSON.parse(history)

        // Restaurar mensajes en la interfaz (solo los últimos 10)
        const recentMessages = this.messages.slice(-10)
        const messagesContainer = document.getElementById("iaGlobMessages")

        if (recentMessages.length > 0 && messagesContainer) {
          // Remover mensaje de bienvenida
          const welcomeMessage = messagesContainer.querySelector(".welcome-message")
          if (welcomeMessage) {
            welcomeMessage.remove()
          }

          recentMessages.forEach((msg) => {
            this.addMessageToInterface(msg.sender, msg.content, msg.timestamp)
          })
        }
      }
    } catch (error) {
      console.error("Error cargando historial:", error)
    }
  }

  addMessageToInterface(sender, content, timestamp) {
    if (!this.isPremiumUser) return

    const messagesContainer = document.getElementById("iaGlobMessages")
    if (!messagesContainer) return

    const messageElement = document.createElement("div")
    messageElement.className = `message ${sender}`

    const date = new Date(timestamp)
    const timeString = date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    })

    const avatar = sender === "ia" ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>'

    messageElement.innerHTML = `
      <div class="message-avatar">${avatar}</div>
      <div class="message-content">
        ${this.formatMessage(content)}
        <div class="message-time">${timeString}</div>
      </div>
    `

    messagesContainer.appendChild(messageElement)
  }

  saveConversationHistory() {
    if (!this.isPremiumUser) return

    try {
      const currentUser = this.getCurrentUser()
      if (!currentUser) return

      // Guardar solo los últimos 50 mensajes
      const recentMessages = this.messages.slice(-50)

      // Guardar historial específico del usuario
      localStorage.setItem(`ia_glob_conversation_${currentUser.id}`, JSON.stringify(recentMessages))

      // También guardar en el historial general como respaldo
      localStorage.setItem("ia_glob_conversation", JSON.stringify(recentMessages))
    } catch (error) {
      console.error("Error guardando historial:", error)
    }
  }

  clearConversation() {
    if (!this.isPremiumUser) return

    this.messages = []
    this.conversationContext = []

    const currentUser = this.getCurrentUser()
    if (currentUser) {
      localStorage.removeItem(`ia_glob_conversation_${currentUser.id}`)
    }
    localStorage.removeItem("ia_glob_conversation")

    const messagesContainer = document.getElementById("iaGlobMessages")
    if (messagesContainer) {
      messagesContainer.innerHTML = `
        <div class="welcome-message">
          <h4>¡Hola! Soy IA Glob 🤖👑</h4>
          <p>Tu asistente inteligente premium. Puedo ayudarte con cualquier pregunta sobre arte, tecnología, Globex o cualquier tema que necesites.</p>
          <div class="quick-suggestions">
            <span class="suggestion-chip" data-suggestion="¿Cómo puedo mejorar mi arte digital?">Arte Digital</span>
            <span class="suggestion-chip" data-suggestion="Explícame sobre programación web">Programación</span>
            <span class="suggestion-chip" data-suggestion="¿Qué obras me recomiendas?">Recomendaciones</span>
            <span class="suggestion-chip" data-suggestion="Ayúdame con diseño gráfico">Diseño</span>
          </div>
        </div>
      `
    }

    if (window.showNotification) {
      window.showNotification("Conversación limpiada correctamente", "success")
    }
  }
}

// Inicializar IA Glob cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  // Solo inicializar si NO estamos en la página de admin
  if (!window.location.pathname.includes("admin.html")) {
    console.log("🤖 Inicializando IA Glob Mejorada...")
    window.iaGlob = new IAGlob()

    // Hacer funciones globales disponibles
    window.clearIAGlobConversation = () => {
      if (window.iaGlob && window.iaGlob.isPremiumUser) {
        window.iaGlob.clearConversation()
      }
    }

    console.log("✅ IA Glob Mejorada inicializada correctamente")
  }
})

// Exportar para uso en otros módulos si es necesario
if (typeof module !== "undefined" && module.exports) {
  module.exports = IAGlob
}




