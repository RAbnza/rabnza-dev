export interface ContactConfig {
  service: string;
  template: string;
  publicKey: string;
}
const config: ContactConfig = {
  service: import.meta.env.PUBLIC_EMAILJS_SERVICE_ID ?? "",
  template: import.meta.env.PUBLIC_EMAILJS_TEMPLATE_ID ?? "",
  publicKey: import.meta.env.PUBLIC_EMAILJS_PUBLIC_KEY ?? "",
};

export function setupContactForm(settings: ContactConfig = config) {
  const form = document.querySelector<HTMLFormElement>("[data-contact-form]");
  if (!form) return () => {};
  const button = form.querySelector<HTMLButtonElement>("[data-send-message]")!;
  const status = form.querySelector<HTMLElement>("[data-form-status]")!;
  if (!settings.service || !settings.template || !settings.publicKey)
    return () => {};
  button.disabled = false;
  form.noValidate = true;
  let sending = false;
  let nextAllowed = 0;
  let request: AbortController | undefined;
  const fields = ["from_name", "reply_to", "message"] as const;
  const field = (name: string) =>
    form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement;
  const showError = (name: string, message: string) => {
    const input = field(name);
    input.setAttribute("aria-invalid", String(Boolean(message)));
    const error = form.querySelector<HTMLElement>(`[data-error="${name}"]`);
    if (error) error.textContent = message;
  };
  const submit = async (event: SubmitEvent) => {
    event.preventDefault();
    if (sending) return;
    status.textContent = "";
    fields.forEach((name) => showError(name, ""));
    const name = field("from_name").value.trim();
    const email = field("reply_to").value.trim();
    const message = field("message").value.trim();
    if (name.length < 2 || name.length > 100)
      showError("from_name", "Please enter your name (2–100 characters).");
    if (!email || !field("reply_to").validity.valid)
      showError("reply_to", "Please enter a valid email address.");
    if (message.length < 10 || message.length > 5000)
      showError(
        "message",
        "Please write a message between 10 and 5,000 characters.",
      );
    const invalid = form.querySelector<HTMLElement>('[aria-invalid="true"]');
    if (invalid) {
      status.textContent = "Please check the highlighted fields.";
      invalid.focus();
      return;
    }
    if (field("website").value) {
      status.textContent =
        "Unable to send this message. Please use the email link instead.";
      return;
    }
    if (Date.now() < nextAllowed) {
      status.textContent =
        "Please wait a moment before sending another message.";
      return;
    }
    sending = true;
    button.disabled = true;
    form.setAttribute("aria-busy", "true");
    status.textContent = "Sending your message…";
    request = new AbortController();
    const timeout = window.setTimeout(() => request?.abort(), 15000);
    try {
      const response = await fetch(
        "https://api.emailjs.com/api/v1.0/email/send",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: request.signal,
          body: JSON.stringify({
            service_id: settings.service,
            template_id: settings.template,
            user_id: settings.publicKey,
            template_params: {
              from_name: name,
              reply_to: email,
              subject: field("subject").value.trim() || "Portfolio enquiry",
              message,
            },
          }),
        },
      );
      if (!response.ok)
        throw new Error(response.status === 429 ? "rate-limit" : "send-failed");
      form.reset();
      nextAllowed = Date.now() + 30000;
      status.textContent = "Message sent. Thank you for getting in touch.";
    } catch (error) {
      nextAllowed = Date.now() + 2000;
      status.textContent =
        error instanceof Error && error.message === "rate-limit"
          ? "The message service is busy. Please try again shortly, or use the email link."
          : "Your message could not be confirmed as sent. Your text is still here—please try again, or use the email link.";
    } finally {
      clearTimeout(timeout);
      sending = false;
      button.disabled = false;
      form.removeAttribute("aria-busy");
    }
  };
  form.addEventListener("submit", submit);
  return () => {
    request?.abort();
    form.removeEventListener("submit", submit);
  };
}
