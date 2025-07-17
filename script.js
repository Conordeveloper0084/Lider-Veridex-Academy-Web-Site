let isMenuOpen = false

const carouselConfigs = {
  classrooms: {
    currentIndex: 0,
    itemsPerView: 3,
    totalItems: 0,
    autoPlayInterval: 4000,
    autoPlay: true,
  },
  teachers: {
    currentIndex: 0,
    itemsPerView: 3,
    totalItems: 0,
    autoPlayInterval: 4000,
    autoPlay: true,
  },
  results: {
    currentIndex: 0,
    itemsPerView: 3,
    totalItems: 0,
    autoPlayInterval: 4000,
    autoPlay: true,
  },
}

const navbar = document.getElementById("navbar")
const mobileMenuBtn = document.getElementById("mobileMenuBtn")
const mobileMenu = document.getElementById("mobileMenu")

document.addEventListener("DOMContentLoaded", () => {
  initializeApp()
})

function initializeApp() {
  setupEventListeners()
  setupScrollAnimations()
  setupNavbarScroll()
  initializeCarousels()
  updateCarouselResponsiveness()
}

function setupEventListeners() {
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener("click", toggleMobileMenu)
  }

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

  document.addEventListener("click", (event) => {
    if (isMenuOpen && !mobileMenu.contains(event.target) && !mobileMenuBtn.contains(event.target)) {
      toggleMobileMenu()
    }
  })

  window.addEventListener("resize", () => {
    if (window.innerWidth > 768 && isMenuOpen) {
      toggleMobileMenu()
    }
    updateCarouselResponsiveness()
  })
}

function toggleMobileMenu() {
  isMenuOpen = !isMenuOpen
  mobileMenu.classList.toggle("active")
  mobileMenuBtn.classList.toggle("active")
  document.body.style.overflow = isMenuOpen ? "hidden" : ""
}

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

function initializeCarousels() {
  Object.keys(carouselConfigs).forEach((carouselName) => {
    initializeCarousel(carouselName)
  })
}

function initializeCarousel(carouselName) {
  const config = carouselConfigs[carouselName]
  const track = document.getElementById(`${carouselName}Track`)
  const prevBtn = document.getElementById(`${carouselName}Prev`)
  const nextBtn = document.getElementById(`${carouselName}Next`)
  const indicatorsContainer = document.getElementById(`${carouselName}Indicators`)

  if (!track) return

  const items = track.querySelectorAll(".carousel-item")
  config.totalItems = items.length

  createIndicators(carouselName, indicatorsContainer)

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      moveCarousel(carouselName, "prev")
    })
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      moveCarousel(carouselName, "next")
    })
  }

  const indicators = indicatorsContainer?.querySelectorAll(".indicator")
  indicators?.forEach((indicator, index) => {
    indicator.addEventListener("click", () => {
      goToSlide(carouselName, index)
    })
  })

  initializeDragFunctionality(carouselName, track)

  updateCarouselPosition(carouselName)

  if (config.autoPlay) {
    startAutoPlay(carouselName)
  }

  const carousel = document.getElementById(`${carouselName}Carousel`)
  if (carousel && config.autoPlay) {
    carousel.addEventListener("mouseenter", () => stopAutoPlay(carouselName))
    carousel.addEventListener("mouseleave", () => startAutoPlay(carouselName))
  }
}

function initializeDragFunctionality(carouselName, track) {
  let isDragging = false
  let startPos = 0
  let currentTranslate = 0
  let prevTranslate = 0
  let animationId = 0

  track.addEventListener("mousedown", dragStart)
  track.addEventListener("mouseup", dragEnd)
  track.addEventListener("mouseleave", dragEnd)
  track.addEventListener("mousemove", dragMove)

  track.addEventListener("touchstart", dragStart)
  track.addEventListener("touchend", dragEnd)
  track.addEventListener("touchmove", dragMove)

  function dragStart(event) {
    if (event.type === "touchstart") {
      startPos = event.touches[0].clientX
    } else {
      startPos = event.clientX
      event.preventDefault()
    }

    isDragging = true
    animationId = requestAnimationFrame(animation)
    track.classList.add("dragging")

    stopAutoPlay(carouselName)
  }

  function dragMove(event) {
    if (!isDragging) return

    let currentPosition = 0
    if (event.type === "touchmove") {
      currentPosition = event.touches[0].clientX
    } else {
      currentPosition = event.clientX
    }

    currentTranslate = prevTranslate + currentPosition - startPos
  }

  function dragEnd() {
    if (!isDragging) return

    isDragging = false
    cancelAnimationFrame(animationId)
    track.classList.remove("dragging")

    const movedBy = currentTranslate - prevTranslate

    if (movedBy < -100) {
      moveCarousel(carouselName, "next")
    }

    if (movedBy > 100) {
      moveCarousel(carouselName, "prev")
    }

    currentTranslate = 0
    prevTranslate = 0

    if (carouselConfigs[carouselName].autoPlay) {
      setTimeout(() => {
        startAutoPlay(carouselName)
      }, 1000)
    }
  }

  function animation() {
    if (isDragging) {
      const config = carouselConfigs[carouselName]
      const items = track.children
      if (items.length === 0) return

      const itemWidth = items[0].offsetWidth
      const gap = 48
      const moveDistance = (itemWidth + gap) * config.itemsPerView
      const baseTranslate = -config.currentIndex * moveDistance

      track.style.transform = `translateX(${baseTranslate + currentTranslate}px)`
      requestAnimationFrame(animation)
    }
  }
}

function createIndicators(carouselName, container) {
  if (!container) return

  const config = carouselConfigs[carouselName]
  const totalSlides = Math.ceil(config.totalItems / config.itemsPerView)

  container.innerHTML = ""
  for (let i = 0; i < totalSlides; i++) {
    const indicator = document.createElement("div")
    indicator.className = `indicator ${i === 0 ? "active" : ""}`
    container.appendChild(indicator)
  }
}

function moveCarousel(carouselName, direction) {
  const config = carouselConfigs[carouselName]
  const totalSlides = Math.ceil(config.totalItems / config.itemsPerView)

  if (direction === "next") {
    config.currentIndex = (config.currentIndex + 1) % totalSlides
  } else {
    config.currentIndex = (config.currentIndex - 1 + totalSlides) % totalSlides
  }

  updateCarouselPosition(carouselName)
  updateIndicators(carouselName)
}

function goToSlide(carouselName, index) {
  const config = carouselConfigs[carouselName]
  const totalSlides = Math.ceil(config.totalItems / config.itemsPerView)
  config.currentIndex = Math.min(Math.max(index, 0), totalSlides - 1)
  updateCarouselPosition(carouselName)
  updateIndicators(carouselName)
}

function updateCarouselPosition(carouselName) {
  const config = carouselConfigs[carouselName]
  const track = document.getElementById(`${carouselName}Track`)

  if (!track) return

  const items = track.children
  if (items.length === 0) return

  const itemWidth = items[0].offsetWidth
  const gap = 48
  const moveDistance = (itemWidth + gap) * config.itemsPerView
  const translateX = -config.currentIndex * moveDistance

  track.style.transition = 'transform 0.5s ease-in-out'
  track.style.transform = `translateX(${translateX}px)`
}

function updateIndicators(carouselName) {
  const config = carouselConfigs[carouselName]
  const indicatorsContainer = document.getElementById(`${carouselName}Indicators`)

  if (!indicatorsContainer) return

  const indicators = indicatorsContainer.querySelectorAll(".indicator")
  indicators.forEach((indicator, index) => {
    indicator.classList.toggle("active", index === config.currentIndex)
  })
}

function startAutoPlay(carouselName) {
  const config = carouselConfigs[carouselName]

  if (config.autoPlayTimer) {
    clearInterval(config.autoPlayTimer)
  }

  config.autoPlayTimer = setInterval(() => {
    moveCarousel(carouselName, "next")
  }, config.autoPlayInterval)
}

function stopAutoPlay(carouselName) {
  const config = carouselConfigs[carouselName]

  if (config.autoPlayTimer) {
    clearInterval(config.autoPlayTimer)
    config.autoPlayTimer = null
  }
}

function updateCarouselResponsiveness() {
  const screenWidth = window.innerWidth

  Object.keys(carouselConfigs).forEach((carouselName) => {
    const config = carouselConfigs[carouselName]

    if (screenWidth <= 480) {
      config.itemsPerView = 1
    } else if (screenWidth <= 768) {
      config.itemsPerView = 2
    } else {
      config.itemsPerView = 3
    }

    config.currentIndex = 0
    createIndicators(carouselName, document.getElementById(`${carouselName}Indicators`))
    updateCarouselPosition(carouselName)
    updateIndicators(carouselName)
  })
}

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
}

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

function setupAccessibility() {
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        toggleMobileMenu()
      }
    })
  }

  if (isMenuOpen) {
    const firstLink = mobileMenu?.querySelector("a")
    if (firstLink) firstLink.focus()
  }
}

window.addEventListener("error", (e) => {
  console.error("JavaScript error:", e.error)
})

function trackEvent(eventName, eventData = {}) {
  console.log("Event tracked:", eventName, eventData)
}

document.addEventListener("DOMContentLoaded", () => {
  setupLazyLoading()
  setupAccessibility()

  setTimeout(() => {
    const heroContent = document.querySelector(".hero-content")
    if (heroContent) {
      heroContent.classList.add("fade-in", "visible")
    }
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