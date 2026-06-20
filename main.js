/* ============================================================
   FAKULTAS JOKI — script.js
   Berisi semua logika interaktivitas website.
   ============================================================ */

/* ============================================================
   0. UTILITAS: Jalankan setelah DOM siap
============================================================ */
document.addEventListener('DOMContentLoaded', () => {

  initNavbar();         // 1. Sticky navbar + hamburger menu
  initSmoothScroll();   // 2. Smooth scroll untuk link navigasi
  initFAQ();            // 3. Akordeon FAQ
  initSlider();         // 4. Slider testimoni
  initScrollReveal();   // 5. Animasi elemen saat scroll
  initScrollTop();      // 6. Tombol scroll-to-top

});


/* ============================================================
   1. NAVBAR — Sticky + Hamburger Menu
============================================================ */
function initNavbar() {
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navMenu   = document.getElementById('navMenu');
  const navLinks  = document.querySelectorAll('.nav-link');

  // --- Sticky: tambah class saat scroll ke bawah ---
  function handleScroll() {
    if (window.scrollY > 50) {
      navbar.classList.add('navbar--scrolled');
    } else {
      navbar.classList.remove('navbar--scrolled');
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Jalankan sekali saat load (kalau halaman sudah di-scroll)

  // --- Hamburger: toggle menu mobile ---
  hamburger.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('is-open');
    hamburger.classList.toggle('is-open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));

    // Cegah scroll body saat menu mobile terbuka
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // --- Tutup menu saat salah satu link diklik ---
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('is-open');
      hamburger.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // --- Tutup menu saat klik di luar (pada overlay) ---
  document.addEventListener('click', (e) => {
    const isInsideNav = navbar.contains(e.target);
    if (!isInsideNav && navMenu.classList.contains('is-open')) {
      navMenu.classList.remove('is-open');
      hamburger.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
}


/* ============================================================
   2. SMOOTH SCROLL
   Menangani klik pada link dengan href="#section-id"
============================================================ */
function initSmoothScroll() {
  const navbarHeight = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--navbar-height'),
    10
  );

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');

      // Jika hanya "#" (link kosong), abaikan
      if (targetId === '#') return;

      const targetEl = document.querySelector(targetId);
      if (!targetEl) return;

      e.preventDefault();

      // Hitung posisi target dengan offset tinggi navbar
      const targetTop = targetEl.getBoundingClientRect().top + window.scrollY - navbarHeight;

      window.scrollTo({
        top: targetTop,
        behavior: 'smooth'
      });
    });
  });
}


/* ============================================================
   3. FAQ AKORDEON
   Klik pertanyaan untuk menampilkan/menyembunyikan jawaban.
============================================================ */
function initFAQ() {
  const faqList = document.getElementById('faqList');
  if (!faqList) return;

  const faqItems = faqList.querySelectorAll('.faq__item');

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq__question');

    questionBtn.addEventListener('click', () => {
      const isCurrentlyOpen = item.classList.contains('is-open');

      // Tutup semua item lainnya (hanya satu yang bisa terbuka sekaligus)
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('is-open');
          otherItem.querySelector('.faq__question').setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle item yang diklik
      if (isCurrentlyOpen) {
        item.classList.remove('is-open');
        questionBtn.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('is-open');
        questionBtn.setAttribute('aria-expanded', 'true');
      }
    });
  });
}


/* ============================================================
   4. SLIDER TESTIMONI
   Slider manual dengan tombol prev/next dan dot navigasi.
============================================================ */
function initSlider() {
  const track      = document.getElementById('testimoniTrack');
  const prevBtn    = document.getElementById('sliderPrev');
  const nextBtn    = document.getElementById('sliderNext');
  const dotsWrapper= document.getElementById('sliderDots');

  if (!track) return;

  const cards = track.querySelectorAll('.testimoni__card');
  let currentIndex = 0;
  let autoplayTimer = null;

  // Hitung berapa kartu yang terlihat sekaligus
  function getVisibleCount() {
    const wrapperWidth = track.parentElement.offsetWidth;
    const cardWidth = cards[0].offsetWidth;
    // Lebih aman: hitung berapa kartu yang muat
    return Math.round(wrapperWidth / (cardWidth + 24)); // 24 = gap
  }

  // Hitung total "halaman" (kelompok slide)
  function getTotalPages() {
    return Math.ceil(cards.length / getVisibleCount());
  }

  // Buat dot navigasi
  function buildDots() {
    dotsWrapper.innerHTML = '';
    const total = getTotalPages();
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('button');
      dot.classList.add('slider-dot');
      dot.setAttribute('aria-label', `Halaman testimoni ${i + 1}`);
      if (i === 0) dot.classList.add('is-active');
      dot.addEventListener('click', () => goToPage(i));
      dotsWrapper.appendChild(dot);
    }
  }

  // Pergi ke halaman tertentu
  function goToPage(pageIndex) {
    const total = getTotalPages();
    // Clamp index agar tidak keluar batas
    currentIndex = Math.max(0, Math.min(pageIndex, total - 1));

    // Hitung terjemahan dalam persen
    const visibleCount = getVisibleCount();
    const translatePercent = currentIndex * (100 / cards.length) * visibleCount;
    track.style.transform = `translateX(-${translatePercent}%)`;

    // Update dot aktif
    const dots = dotsWrapper.querySelectorAll('.slider-dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === currentIndex);
    });
  }

  // Tombol prev
  prevBtn.addEventListener('click', () => {
    const total = getTotalPages();
    goToPage((currentIndex - 1 + total) % total);
    resetAutoplay();
  });

  // Tombol next
  nextBtn.addEventListener('click', () => {
    goToPage((currentIndex + 1) % getTotalPages());
    resetAutoplay();
  });

  // Autoplay setiap 5 detik
  function startAutoplay() {
    autoplayTimer = setInterval(() => {
      goToPage((currentIndex + 1) % getTotalPages());
    }, 5000);
  }

  function resetAutoplay() {
    clearInterval(autoplayTimer);
    startAutoplay();
  }

  // Swipe gesture untuk mobile
  let touchStartX = 0;
  let touchEndX   = 0;

  track.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  track.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    const threshold = 50; // Minimal jarak swipe (px)

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // Swipe kiri → next
        goToPage((currentIndex + 1) % getTotalPages());
      } else {
        // Swipe kanan → prev
        const total = getTotalPages();
        goToPage((currentIndex - 1 + total) % total);
      }
      resetAutoplay();
    }
  });

  // Pause autoplay saat hover
  track.addEventListener('mouseenter', () => clearInterval(autoplayTimer));
  track.addEventListener('mouseleave', startAutoplay);

  // Rebuild saat resize (responsive)
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      buildDots();
      goToPage(0);
    }, 200);
  });

  // Inisialisasi
  buildDots();
  startAutoplay();
}


/* ============================================================
   5. SCROLL REVEAL ANIMATION
   Elemen dengan kelas "reveal" akan fade-in saat masuk viewport.
============================================================ */
function initScrollReveal() {
  // Tambahkan kelas reveal ke elemen yang ingin dianimasikan
  const elementsToReveal = [
    { selector: '.keunggulan__card',   delayBase: true },
    { selector: '.layanan__card',      delayBase: true },
    { selector: '.step-item',          delayBase: true },
    { selector: '.testimoni__card',    delayBase: false },
    { selector: '.faq__item',          delayBase: false },
    { selector: '.section-header',     delayBase: false },
  ];

  elementsToReveal.forEach(({ selector, delayBase }) => {
    document.querySelectorAll(selector).forEach((el, index) => {
      el.classList.add('reveal');
      if (delayBase) {
        // Tambah delay bertahap agar animasi bergelombang
        const delayClass = `reveal-delay-${(index % 6) + 1}`;
        el.classList.add(delayClass);
      }
    });
  });

  // Gunakan IntersectionObserver untuk memicu animasi
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          // Hentikan observasi setelah animasi muncul
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,        // Picu saat 10% elemen terlihat
      rootMargin: '0px 0px -50px 0px' // Sedikit sebelum elemen sampai di bawah viewport
    }
  );

  // Amati semua elemen dengan kelas "reveal"
  document.querySelectorAll('.reveal').forEach(el => {
    observer.observe(el);
  });
}


/* ============================================================
   6. SCROLL TO TOP BUTTON
   Tampilkan tombol saat pengguna scroll cukup jauh ke bawah.
============================================================ */
function initScrollTop() {
  const scrollTopBtn = document.getElementById('scrollTop');
  if (!scrollTopBtn) return;

  // Tampilkan tombol saat scroll lebih dari 400px
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      scrollTopBtn.classList.add('is-visible');
    } else {
      scrollTopBtn.classList.remove('is-visible');
    }
  }, { passive: true });

  // Klik untuk kembali ke atas
  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}