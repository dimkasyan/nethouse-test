(function () {
  "use strict";

  let form = document.getElementById("test_form");
  if (!form) return;

  let elements = Array.from(form.querySelectorAll(".form-control")),
    btnSendForm = document.getElementById("send_form"),
    inputPhone = document.querySelector("input[name=phone]"),
    inputName = document.querySelector("input[name=name]"),
    notficationBar = document.querySelector(".notification-bar"),
    notficationText = notficationBar.querySelector(".notification-text"),
    regExName = /^[А-ЯA-Z][а-яa-zА-ЯA-Z\-]{0,}\s[А-ЯA-Z][а-яa-zА-ЯA-Z\-]{1,}(\s[А-ЯA-Z][а-яa-zА-ЯA-Z\-]{1,})?$/,
    regExMail = /^[A-Za-z0-9](([_\.\-]?[a-zA-Z0-9]+)*)@gmail.com/,
    regExPhone = /(\+7|8|07)\d{10}/,
    errorMessage = [
      "Незаполненное поле ввода",
      "Введите Ваше имя",
      "Укажите Ваш Email",
      "Неверный формат Email",
      "Укажите телефон",
      "Неверный формат телефона",
    ],
    isError = false;

  function addSomeEventsListener(elem, events, handler) {
    events.forEach((item) => elem.addEventListener(item, handler));
  }

  function changePasteRegex(event, regEx) {
    return event.type === "paste"
      ? event.clipboardData.getData("text/plain").replace(regEx, "")
      : event.target.value.replace(regEx, "");
  }

  addSomeEventsListener(inputPhone, ["paste", "input"], function (event) {
    let text = changePasteRegex(event, /[^\+\d+]/g);
    return (this.value = text);
  });

  addSomeEventsListener(inputName, ["paste", "input"], function (event) {
    let text = changePasteRegex(event, /\d+/);
    return (this.value = text);
  });

  inputName.addEventListener("keydown", (event) => {
    if (event.keyCode === 46 ||
      event.keyCode === 8 ||
      event.keyCode === 9 ||
      event.keyCode === 27 ||
      ((event.keyCode === 86 || event.keyCode === 67) &&
        event.ctrlKey === true) ||
      (event.keyCode >= 35 && event.keyCode <= 39)) {

      return;
    } else {
      if (!(event.keyCode >= 65 && event.keyCode < 96) && event.keyCode !== 32 && event.keyCode !== 0) {
        event.preventDefault();
      }
    }
  });

  inputPhone.addEventListener("keydown", (event) => {
    if (event.keyCode === 46 ||
      event.keyCode === 8 ||
      event.keyCode == 9 ||
      event.keyCode === 27 ||
      event.keyCode === 107 ||
      ((event.keyCode === 86 || event.keyCode === 67) &&
        event.ctrlKey === true) ||
      (event.keyCode >= 35 && event.keyCode <= 39) ||
      event.keyCode === 187 ||
      event.keyCode === 107) {

      return;
    } else {
      if ((event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105)) {
        event.preventDefault();
      }
    }
  });

  btnSendForm.addEventListener("click", validForm);

  form.addEventListener("focus", () => {
      let element = document.activeElement;
      if (element !== btnSendForm) {
        cleanError(element);
      }
    },
    true
  );

  function validForm(e) {
    e.preventDefault();
    let formVal = getFormData(form), error;

    Object.keys(formVal).forEach((key) => {
      error = getError(formVal, key);
      if (error.length != 0) {
        isError = true;
        showError(key, error);
      }
    });

    if (!isError) {
      sendFormData(form);
    }
    return false;
  }

  function getError(formVal, property) {
    let error = "";
    let validate = {
      name: () => {
        if (formVal.name.length === 0 || regExName.test(formVal.name) === false) {
          error = errorMessage[1];
        }
      },
      email: () => {
        if (formVal.email.length === 0) {
          error = errorMessage[2];
        } else if (regExMail.test(formVal.email) === false) {
          error = errorMessage[3];
        }
      },
      phone: () => {
        if (formVal.phone.length === 0) {
          error = errorMessage[4];
        } else if (regExPhone.test(formVal.phone) === false) {
          error = errorMessage[5];
        }
      },
    };
    validate[property]();
    return error;
  }

  elements.forEach((element) => {
    element.addEventListener("blur", (e) => {
      let formElement = e.target,
        property = formElement.getAttribute("name"),
        dataField = {};

      dataField[property] = formElement.value;

      let error = getError(dataField, property);
      if (error.length !== 0) {
        showError(property, error);
      }
      return false;
    });
  });

  function showError(property, error) {
    let formElement = form.querySelector(`[name=${property}]`);
    let errorBox = formElement.parentElement.nextElementSibling;

    formElement.classList.add("form-control_error");
    errorBox.textContent = error;
    errorBox.classList.add("is-show");
  }

  function cleanError(el) {
    let errorBox = el.parentElement.nextElementSibling;
    el.classList.remove("form-control_error");
    errorBox.classList.remove("is-show");
  }

  function getFormData(form) {
    let controls = {};
    if (!form.elements) return "";
    let arrayElements = Array.from(form.elements);
    arrayElements.forEach((element) => {
      if (element.tagName.toLowerCase() !== "button") {
        controls[element.name] = element.value;
      }
    });
    return controls;
  }

  async function sendFormData(form) {
    let formData = new FormData(form);

    try {
      let response = await fetch("/article/formdata/post/user", {
        method: "POST",
        body: formData,
      });

      let result = await response.json();

      notficationBar.classList.add("is-show");
      notficationText.textContent = "Форма успешно отправлена!";

      setTimeout(() => {
        notficationBar.classList.remove("is-show");
        notficationText.textContent = "";
      }, 7500);

      return result;
    } catch (e) {
      notficationBar.classList.add("is-error", "is-show");
      notficationText.textContent = `Форма не отправлена из-за ошибки: ${e}`;

      setTimeout(() => {
        notficationBar.classList.remove("is-error", "is-show");
        notficationText.textContent = "";
      }, 7500);

      console.error(`Error request : ${e}`);
    }
  }
})();
