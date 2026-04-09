const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");
const navbar = document.getElementById("navbar");

if (menuToggle && navMenu) {
  menuToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("open");
    menuToggle.classList.toggle("is-active", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("nav-open", isOpen);
  });

  navMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("open");
      menuToggle.classList.remove("is-active");
      menuToggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("nav-open");
    });
  });
}

if (navbar) {
  const syncNavbar = () => {
    navbar.classList.toggle("is-sticky", window.scrollY > 12);
  };
  syncNavbar();
  window.addEventListener("scroll", syncNavbar, { passive: true });
}

if (window.AOS) {
  window.AOS.init({
    duration: 700,
    easing: "ease-out-cubic",
    once: true,
    offset: 60,
  });
}

const counters = document.querySelectorAll(".counter");
if (counters.length > 0 && "IntersectionObserver" in window) {
  const counterObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        const counter = entry.target;
        const target = Number(counter.dataset.target || 0);
        const suffix = String(counter.dataset.suffix || "");
        let current = 0;
        const step = Math.max(1, Math.ceil(target / 80));

        const animate = () => {
          current += step;
          if (current >= target) {
            counter.textContent = `${target.toLocaleString()}${suffix}`;
            return;
          }
          counter.textContent = `${current.toLocaleString()}`;
          requestAnimationFrame(animate);
        };

        animate();
        observer.unobserve(counter);
      });
    },
    { threshold: 0.45 }
  );

  counters.forEach((counter) => counterObserver.observe(counter));
}

const testimonialTrack = document.getElementById("testimonialTrack");
const prevButton = document.getElementById("prevTestimonial");
const nextButton = document.getElementById("nextTestimonial");
const sliderDots = document.getElementById("sliderDots");

if (testimonialTrack && prevButton && nextButton) {
  const slides = Array.from(testimonialTrack.querySelectorAll(".testimonial-card"));
  let activeIndex = 0;
  let autoRotate = null;

  const buildDots = () => {
    if (!sliderDots) {
      return;
    }
    slides.forEach((_, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "slider-dot";
      dot.setAttribute("aria-label", `Show testimonial ${index + 1}`);
      dot.addEventListener("click", () => {
        showSlide(index);
        restartAutoRotate();
      });
      sliderDots.appendChild(dot);
    });
  };

  const showSlide = (index) => {
    activeIndex = index;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === activeIndex);
    });
    if (sliderDots) {
      const dots = sliderDots.querySelectorAll(".slider-dot");
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle("is-active", dotIndex === activeIndex);
      });
    }
  };

  const moveSlide = (direction) => {
    const nextIndex = (activeIndex + direction + slides.length) % slides.length;
    showSlide(nextIndex);
  };

  const restartAutoRotate = () => {
    if (autoRotate) {
      window.clearInterval(autoRotate);
    }
    autoRotate = window.setInterval(() => moveSlide(1), 5000);
  };

  buildDots();
  showSlide(0);
  restartAutoRotate();

  prevButton.addEventListener("click", () => {
    moveSlide(-1);
    restartAutoRotate();
  });

  nextButton.addEventListener("click", () => {
    moveSlide(1);
    restartAutoRotate();
  });
}

document.querySelectorAll('input[type="date"]').forEach((dateInput) => {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  dateInput.min = `${today.getFullYear()}-${month}-${day}`;
});

if (window.emailjs) {
  window.emailjs.init({ publicKey: "_wCkOBOWkRnWlvU8B" });
}

const emailForms = document.querySelectorAll(".emailjs-form");
const validators = {
  patient_name: (value) => value.trim().length >= 3 || "Please enter a valid full name.",
  patient_phone: (value) => /^[0-9+\-\s]{10,15}$/.test(value.trim()) || "Please enter a valid phone number.",
  patient_email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) || "Please enter a valid email address.",
  department: (value) => value.trim() !== "" || "Please select a department.",
  appointment_date: (value) => value.trim() !== "" || "Please choose an appointment date.",
  message: (value) => value.trim().length >= 10 || "Please enter at least 10 characters in the message.",
};

const setFieldState = (field, message) => {
  const wrapper = field.closest(".form-field");
  const errorBox = wrapper ? wrapper.querySelector(".field-error") : null;
  const isValid = message === true;
  if (wrapper) {
    wrapper.classList.toggle("is-invalid", !isValid);
  }
  if (errorBox) {
    errorBox.textContent = isValid ? "" : String(message);
  }
  return isValid;
};

emailForms.forEach((form) => {
  const submitButton = form.querySelector(".submit-button");
  const formMessage = form.querySelector(".form-message");
  const fields = Array.from(form.querySelectorAll("[name]"));

  fields.forEach((field) => {
    field.addEventListener("blur", () => {
      const validate = validators[field.name];
      if (validate) {
        setFieldState(field, validate(field.value));
      }
    });
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    let isFormValid = true;

    fields.forEach((field) => {
      const validate = validators[field.name];
      if (!validate) {
        return;
      }
      const fieldValid = setFieldState(field, validate(field.value));
      if (!fieldValid) {
        isFormValid = false;
      }
    });

    if (!isFormValid) {
      formMessage.textContent = "Please review the highlighted fields before submitting.";
      return;
    }

    if (!window.emailjs) {
      formMessage.textContent = "Email service is not available right now. Please call +91 8808456820.";
      return;
    }

    const formData = new FormData(form);
    const payload = {
      patient_name: String(formData.get("patient_name") || "").trim(),
      patient_phone: String(formData.get("patient_phone") || "").trim(),
      patient_email: String(formData.get("patient_email") || "").trim(),
      department: String(formData.get("department") || "").trim(),
      appointment_date: String(formData.get("appointment_date") || "").trim(),
      message: String(formData.get("message") || "").trim(),
      hospital_name: "BLP YASHODA Hospital and Research Centre",
    };

    submitButton.disabled = true;
    submitButton.textContent = "Sending Request...";
    formMessage.textContent = "Submitting your appointment request...";

    try {
      await window.emailjs.send("service_rtsqa4w", "template_1h5o9nv", payload);
      form.reset();
      fields.forEach((field) => setFieldState(field, true));
      formMessage.textContent = "Appointment request sent successfully. The hospital team will contact you soon.";
    } catch (error) {
      formMessage.textContent = "The request could not be sent right now. Please call +91 8808456820.";
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Send Appointment Request";
    }
  });
});
