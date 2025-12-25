// Мобильное меню
const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

menuToggle.addEventListener("click", () => {
  mainNav.classList.toggle("active");
  menuToggle.innerHTML = mainNav.classList.contains("active")
    ? '<i class="fas fa-times"></i>'
    : '<i class="fas fa-bars"></i>';
});

// Закрытие меню при клике на пункт (на мобильных)
const navLinks = document.querySelectorAll(".main-nav a");
navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    if (window.innerWidth <= 768) {
      mainNav.classList.remove("active");
      menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    }
  });
});

// Работа выпадающего меню на мобильных
const dropdowns = document.querySelectorAll(".dropdown > a");
dropdowns.forEach((dropdown) => {
  dropdown.addEventListener("click", (e) => {
    if (window.innerWidth <= 768) {
      e.preventDefault();
      const parent = dropdown.parentElement;
      parent.classList.toggle("active");
    }
  });
});

// Плавная прокрутка для всех якорных ссылок
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const href = this.getAttribute("href");
    // Прокручиваем только если это якорь на текущей странице (не начинается с имени файла)
    if (href.startsWith("#") && href.length > 1) {
      e.preventDefault();
      const targetElement = document.querySelector(href);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: "smooth",
        });
      }
    }
    // Если ссылка ведет на другую страницу с якорем (например, index.html#characters-block),
    // то стандартное поведение браузера сработает само.
  });
});

// Обработка формы обратной связи
const contactForm = document.getElementById("contactForm");
const formMessage = document.getElementById("formMessage");
const submitBtn = document.getElementById("submitBtn");
const btnText = document.getElementById("btnText");
const spinner = document.getElementById("spinner");

// Скрыть поле антиспама для реальных пользователей
document.addEventListener("DOMContentLoaded", () => {
  const antispamField = document.getElementById("antispam");
  if (antispamField) {
    antispamField.style.display = "none";
  }
});

// Валидация формы на лету
function validateField(field, type) {
  const value = field.value.trim();
  const errorElement = document.getElementById(`${field.id}Error`);

  if (!errorElement) return true;

  errorElement.textContent = "";

  // Проверка в зависимости от типа поля
  switch (type) {
    case "name":
      if (value.length < 2) {
        errorElement.textContent = "Имя должно содержать минимум 2 символа";
        return false;
      }
      if (value.length > 50) {
        errorElement.textContent = "Имя не должно превышать 50 символов";
        return false;
      }
      if (!/^[a-zA-Zа-яА-ЯёЁ\s\-]+$/u.test(value)) {
        errorElement.textContent =
          "Имя может содержать только буквы, пробелы и дефисы";
        return false;
      }
      break;

    case "phone":
      if (!/^[\+]?[0-9\s\-\(\)]{10,20}$/.test(value)) {
        errorElement.textContent = "Введите корректный номер телефона";
        return false;
      }
      break;

    case "email":
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errorElement.textContent = "Введите корректный email адрес";
        return false;
      }
      break;

    case "comment":
      if (value.length < 10) {
        errorElement.textContent =
          "Комментарий должен содержать минимум 10 символов";
        return false;
      }
      if (value.length > 1000) {
        errorElement.textContent =
          "Комментарий не должен превышать 1000 символов";
        return false;
      }
      break;
  }

  return true;
}

// Добавляем валидацию при вводе
const formFields = [
  { id: "name", type: "name" },
  { id: "phone", type: "phone" },
  { id: "email", type: "email" },
  { id: "comment", type: "comment" },
];

formFields.forEach((field) => {
  const element = document.getElementById(field.id);
  if (element) {
    element.addEventListener("blur", () => validateField(element, field.type));
    element.addEventListener("input", () => {
      const errorElement = document.getElementById(`${field.id}Error`);
      if (errorElement) errorElement.textContent = "";
    });
  }
});

// Обработка отправки формы
if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Сброс предыдущих сообщений
    formMessage.className = "form-message";
    formMessage.textContent = "";

    // Валидация всех полей
    let isValid = true;
    formFields.forEach((field) => {
      const element = document.getElementById(field.id);
      if (element && !validateField(element, field.type)) {
        isValid = false;
      }
    });

    if (!isValid) {
      formMessage.className = "form-message error";
      formMessage.textContent = "Пожалуйста, исправьте ошибки в форме";
      return;
    }

    // Показываем спиннер
    btnText.style.opacity = "0.5";
    spinner.classList.remove("hidden");
    submitBtn.disabled = true;

    // Собираем данные формы
    const formData = new FormData(contactForm);

    try {
      // Отправляем данные на сервер
      const response = await fetch("send_email.php", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      // Обработка ответа
      if (result.success) {
        // Успешная отправка
        formMessage.className = "form-message success";
        formMessage.textContent = result.message;
        contactForm.reset();

        // Прокрутка к сообщению об успехе
        formMessage.scrollIntoView({ behavior: "smooth", block: "nearest" });
      } else {
        // Ошибка отправки или валидации
        formMessage.className = "form-message error";
        formMessage.textContent = result.message;

        // Показываем ошибки полей, если они есть
        if (result.errors) {
          Object.keys(result.errors).forEach((fieldName) => {
            const errorElement = document.getElementById(`${fieldName}Error`);
            if (errorElement) {
              errorElement.textContent = result.errors[fieldName];
            }
          });
        }
      }
    } catch (error) {
      // Ошибка сети или сервера
      console.error("Ошибка отправки формы:", error);
      formMessage.className = "form-message error";
      formMessage.textContent =
        "Ошибка сети. Пожалуйста, проверьте подключение к интернету.";
    } finally {
      // Скрываем спиннер
      btnText.style.opacity = "1";
      spinner.classList.add("hidden");
      submitBtn.disabled = false;
    }
  });
}

// Защита от спама: заполняем скрытое поле для ботов
if (document.getElementById("antispam")) {
  // Боты часто заполняют все поля, включая скрытые
  // Оставляем поле пустым для настоящих пользователей
  document.getElementById("antispam").value = "";
}
