// ===== GLOBAL VARIABLES =====
let currentVisibleResults = 8 // Dastlabki ko'rinadigan natijalar soni
const resultsPerBatch = 8 // Har bir bosishda qo'shiladigan natijalar soni
const totalResults = 24 // Jami natijalar soni
let isMenuOpen = false

// ===== DOM ELEMENTS =====
const navbar = document.getElementById("navbar")
const mobileMenuBtn = document.getElementById("mobileMenuBtn")
const mobileMenu = document.getElementById("mobileMenu")
const showMoreBtn = document.getElementById("showMoreBtn")
const closeBtn = document.getElementById("closeBtn")
const resultsGrid = document.getElementById("resultsGrid")
const allResultCards = document.querySelectorAll("#resultsGrid .result-card") // Barcha natija kartochkalarini olamiz

// ===== INITIALIZATION =====
document.addEventListener("DOMContentLoaded", () => {
  initializeApp()
})

function initializeApp() {
  setupEventListeners()
  updateResultsVisibility() // Natijalarni dastlabki holatda ko'rsatish
  setupScrollAnimations()
  setupNavbarScroll()
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
  // Mobile menu toggle
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener("click", toggleMobileMenu)
  }

  // Results buttons
  if (showMoreBtn) {
    showMoreBtn.addEventListener("click", showMoreResults)
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", closeResults)
  }

  // Smooth scrolling for navigation links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault()
      const target = document.querySelector(this.getAttribute("href"))
      if (target) {
        const offsetTop = target.offsetTop - 80
        window.scrollTo({
          top: offsetTop,
          behavior: "smooth",
        })

        if (isMenuOpen) {
          toggleMobileMenu()
        }
      }
    })
  })

  // Close mobile menu when clicking outside
  document.addEventListener("click", (event) => {
    if (isMenuOpen && !mobileMenu.contains(event.target) && !mobileMenuBtn.contains(event.target)) {
      toggleMobileMenu()
    }
  })

  // Handle window resize
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768 && isMenuOpen) {
      toggleMobileMenu()
    }
  })
}

// ===== MOBILE MENU =====
function toggleMobileMenu() {
  isMenuOpen = !isMenuOpen
  mobileMenu.classList.toggle("active")
  mobileMenuBtn.classList.toggle("active")

  document.body.style.overflow = isMenuOpen ? "hidden" : ""
}

// ===== NAVBAR SCROLL EFFECT =====
function setupNavbarScroll() {
  let lastScrollTop = 0

  window.addEventListener("scroll", () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop

    if (scrollTop > 100) {
      navbar.style.background = "rgba(255, 255, 255, 0.95)"
      navbar.style.backdropFilter = "blur(10px)"
      navbar.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.1)"
    } else {
      navbar.style.background = "rgba(255, 255, 255, 0.95)"
      navbar.style.backdropFilter = "blur(10px)"
      navbar.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.08)"
    }

    if (scrollTop > lastScrollTop && scrollTop > 200) {
      navbar.style.transform = "translateY(-100%)"
    } else {
      navbar.style.transform = "translateY(0)"
    }

    lastScrollTop = scrollTop
  })
}

// ===== RESULTS SECTION LOGIC (HTML-based) =====
function updateResultsVisibility() {
  allResultCards.forEach((card, index) => {
    if (index < currentVisibleResults) {
      card.classList.remove("hidden-result-card")
      card.style.animationDelay = `${index * 0.05}s` // Animatsiya kechikishini qo'shish
    } else {
      card.classList.add("hidden-result-card")
    }
  })

  // Tugmalar holatini yangilash
  if (currentVisibleResults >= totalResults) {
    showMoreBtn.classList.add("hidden")
  } else {
    showMoreBtn.classList.remove("hidden")
  }

  if (currentVisibleResults > resultsPerBatch) {
    // Dastlabki 8 tadan ko'p bo'lsa "Yopish" tugmasi ko'rinadi
    closeBtn.classList.remove("hidden")
  } else {
    closeBtn.classList.add("hidden")
  }
}

function showMoreResults() {
  showMoreBtn.innerHTML = "Yuklanmoqda..."
  showMoreBtn.disabled = true

  setTimeout(() => {
    currentVisibleResults = Math.min(currentVisibleResults + resultsPerBatch, totalResults)
    updateResultsVisibility()

    showMoreBtn.innerHTML = "Ko'proq Ko'rish"
    showMoreBtn.disabled = false
  }, 500) // Yuklanish animatsiyasi uchun biroz kechikish
}

function closeResults() {
  closeBtn.innerHTML = "Yopilmoqda..."
  closeBtn.disabled = true

  setTimeout(() => {
    currentVisibleResults = resultsPerBatch // Dastlabki 8 ta cardga qaytarish
    updateResultsVisibility()

    closeBtn.innerHTML = "Yopish"
    closeBtn.disabled = false
  }, 500) // Yuklanish animatsiyasi uchun biroz kechikish
}

// ===== SCROLL ANIMATIONS =====
function setupScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible")
        observer.unobserve(entry.target)
      }
    })
  }, observerOptions)

  document.querySelectorAll(".fade-in, .slide-in-left, .slide-in-right").forEach((el) => {
    observer.observe(el)
  })

  // Natija kartochkalari uchun alohida animatsiya, chunki ular dinamik ko'rinadi/yashirinadi
  allResultCards.forEach((el) => {
    observer.observe(el)
  })
}

// ===== UTILITY FUNCTIONS (o'zgarishsiz qoldi) =====
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

function throttle(func, limit) {
  let inThrottle
  return function () {
    const args = arguments

    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// ===== PERFORMANCE OPTIMIZATIONS (o'zgarishsiz qoldi) =====
function setupLazyLoading() {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target
        img.src = img.dataset.src
        img.classList.remove("lazy")
        observer.unobserve(img)
      }
    })
  })

  document.querySelectorAll("img[data-src]").forEach((img) => {
    imageObserver.observe(img)
  })
}

// ===== ACCESSIBILITY IMPROVEMENTS (o'zgarishsiz qoldi) =====
function setupAccessibility() {
  mobileMenuBtn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      toggleMobileMenu()
    }
  })

  if (isMenuOpen) {
    const firstLink = mobileMenu.querySelector("a")
    if (firstLink) firstLink.focus()
  }

//   const skipLink = document.createElement("a")
//   skipLink.href = "#main-content"
//   skipLink.textContent = "Skip to main content"
//   skipLink.className = "skip-link"
//   skipLink.style.cssText = `
//         position: absolute;
//         top: -40px;
//         left: 6px;
//         background: #16a34a;
//         color: white;
//         padding: 8px;
//         text-decoration: none;
//         border-radius: 4px;
//         z-index: 1001;
//         transition: top 0.3s;
//     `

//   skipLink.addEventListener("focus", () => {
//     skipLink.style.top = "6px"
//   })

//   skipLink.addEventListener("blur", () => {
//     skipLink.style.top = "-40px"
//   })

//   document.body.insertBefore(skipLink, document.body.firstChild)
}

// ===== ERROR HANDLING (o'zgarishsiz qoldi) =====
window.addEventListener("error", (e) => {
  console.error("JavaScript error:", e.error)
})

// ===== ANALYTICS & TRACKING (o'zgarishsiz qoldi) =====
function trackEvent(eventName, eventData = {}) {
  console.log("Event tracked:", eventName, eventData)
}

document.addEventListener("click", (e) => {
  if (e.target.matches(".btn")) {
    trackEvent("button_click", {
      button_text: e.target.textContent.trim(),
      button_href: e.target.href || null,
    })
  }
})

// ===== FINAL INITIALIZATION (o'zgarishsiz qoldi) =====
document.addEventListener("DOMContentLoaded", () => {
  setupLazyLoading()
  setupAccessibility()

  setTimeout(() => {
    document.querySelector(".hero-content").classList.add("fade-in", "visible")
  }, 300)

  console.log("🎓 Veridex Academy website initialized successfully!")
})

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("ServiceWorker registration successful")
      })
      .catch((err) => {
        console.log("ServiceWorker registration failed")
      })
  })
}



