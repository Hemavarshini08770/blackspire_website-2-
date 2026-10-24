"use strict";

/* Contact form (demo): validates in the browser only.
   Before launch, send the data to an approved backend/CRM and
   validate again on the server (see blueprint section 5). */
const form = document.getElementById("contactForm");
const message = document.getElementById("formMessage");

// contact.html?venture=reviveev pre-selects the venture being asked about
const venture = new URLSearchParams(location.search).get("venture");
if (venture) {
  form.elements.venture_id.value = venture;
  document.getElementById("ventureHint").textContent = "Enquiry about: " + venture;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;

  // Spam trap: real visitors never fill the hidden field
  if (form.elements.website.value) return;

  message.textContent =
    "Thanks. The form works in demo mode, so nothing has been sent or saved. " +
    "Connect an approved backend before launch.";
  form.reset();
});
