// Mobile navigation toggle
const menuToggle = document.getElementById("menuToggle");
const navShell = document.getElementById("navLinks");
const navbar = document.getElementById("navbar");

if (menuToggle && navShell) {
  menuToggle.addEventListener("click", () => {
    const isOpen = navShell.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

// Sticky navbar shadow
if (navbar) {
  const syncNavbar = () => {
    navbar.classList.toggle("is-sticky", window.scrollY > 12);
  };
  syncNavbar();
  window.addEventListener("scroll", syncNavbar, { passive: true });
}

// Scroll reveal animation
const revealItems = document.querySelectorAll(".reveal");
if (revealItems.length > 0 && "IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

// Animated counters
const counters = document.querySelectorAll(".counter");
if (counters.length > 0) {
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        const counter = entry.target;
        const target = Number(counter.dataset.target);
        let current = 0;
        const step = Math.max(1, Math.ceil(target / 80));

        const tick = () => {
          current += step;
          if (current >= target) {
            counter.textContent = `${target}${target >= 10000 ? "+" : "+"}`;
            return;
          }
          counter.textContent = `${current}`;
          requestAnimationFrame(tick);
        };

        tick();
        counterObserver.unobserve(counter);
      });
    },
    { threshold: 0.4 }
  );

  counters.forEach((counter) => counterObserver.observe(counter));
}

// Testimonial slider
const testimonialTrack = document.getElementById("testimonialTrack");
const prevButton = document.getElementById("prevTestimonial");
const nextButton = document.getElementById("nextTestimonial");

if (testimonialTrack && prevButton && nextButton) {
  const slides = Array.from(testimonialTrack.querySelectorAll(".testimonial-card"));
  let activeIndex = 0;

  const showSlide = (index) => {
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === index);
    });
  };

  const moveSlide = (direction) => {
    activeIndex = (activeIndex + direction + slides.length) % slides.length;
    showSlide(activeIndex);
  };

  prevButton.addEventListener("click", () => moveSlide(-1));
  nextButton.addEventListener("click", () => moveSlide(1));
  setInterval(() => moveSlide(1), 5500);
}

// EmailJS appointment forms
if (window.emailjs) {
  emailjs.init({
    publicKey: "_wCkOBOWkRnWlvU8B",
  });
}

const appointmentForms = document.querySelectorAll(".emailjs-form");

appointmentForms.forEach((form) => {
  const submitButton = form.querySelector(".submit-button");
  const messageBox = form.querySelector(".form-message");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);

    const name = String(formData.get("patient_name") || "").trim();
    const phone = String(formData.get("patient_phone") || "").trim();
    const email = String(formData.get("patient_email") || "").trim();
    const department = String(formData.get("department") || "").trim();
    const appointmentDate = String(formData.get("appointment_date") || "").trim();
    const details = String(formData.get("message") || "").trim();

    if (!name || !phone || !email || !department || !appointmentDate || !details) {
      messageBox.textContent = "Please complete all appointment fields.";
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      messageBox.textContent = "Please enter a valid email address.";
      return;
    }

    if (!/^[0-9+\-\s]{10,15}$/.test(phone)) {
      messageBox.textContent = "Please enter a valid phone number.";
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Sending...";
    messageBox.textContent = "Submitting appointment request...";

    try {
      await emailjs.send("service_rtsqa4w", "template_1h5o9nv", {
        patient_name: name,
        patient_phone: phone,
        patient_email: email,
        department,
        appointment_date: appointmentDate,
        message: details,
        hospital_name: "BLP YASHODA Hospital and Research Centre",
      });

      form.reset();
      messageBox.textContent = "Appointment request sent successfully. The hospital team will contact you soon.";
    } catch (error) {
      messageBox.textContent = "The request could not be sent right now. Please call +91 8808456820.";
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Send Appointment Request";
    }
  });
});
