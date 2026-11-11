import { useState } from "react";
import {
  FaBehance,
  FaWhatsapp,
  FaInstagram,
  FaPinterest,
} from "react-icons/fa";

import { FaXTwitter } from "react-icons/fa6";
import Confessions from "../components/home/Confessions";

const contacts = [
  {
    name: "WhatsApp",
    icon: FaWhatsapp,
    href: "https://wa.me/message/URTQO34LCW5KP1",
  },
  {
    name: "Instagram",
    icon: FaInstagram,
    href: "https://www.instagram.com/_sammyarts",
  },
  {
    name: "X",
    icon: FaXTwitter,
    href: "https://x.com/_SAMMYARTS?t=kieEXkx49s6OJ30A7F-y7Q&s=09",
  },
  { name: "Behance", icon: FaBehance, href: "https://www.behance.net/smllsl" },
  { name: "Pinterest", icon: FaPinterest, href: "https://pin.it/3ucODLwzR" },
];

const whatsappLink = contacts.find((c) => c.name === "WhatsApp").href;

// Boxed fields, quiet at rest, accent border on focus
const fieldClass =
  "w-full rounded-3xl border border-border bg-white/[0.03] px-4 py-4 text-sm text-text outline-none transition-colors placeholder:text-muted/70 hover:border-muted/60 focus:border-accent focus-visible:ring-1 focus-visible:ring-accent";

const services = [
  "Brand strategy",
  "Visual identity",
  "Logo design",
  "Packaging and print",
  "Social and campaign design",
  "Something else",
];

function Contact() {
  const [values, setValues] = useState({
    name: "",
    email: "",
    brand: "",
    service: "",
    message: "",
  });
  const [status, setStatus] = useState("idle"); // idle | sent

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const text = [
      `Hello, my name is ${values.name.trim()}.`,
      `Email: ${values.email.trim()}`,
      `Brand: ${values.brand.trim()}`,
      `Looking for: ${values.service}`,
      "",
      values.message.trim(),
    ].join("\n");

    const url = `${whatsappLink}?text=${encodeURIComponent(text)}`;

    window.open(url, "_blank", "noopener,noreferrer");
    setValues({ name: "", email: "", brand: "", service: "", message: "" });
    setStatus("sent");
  };

  return (
    <section
      id="contact"
      className="page-reveal flex flex-col items-center gap-16 overflow-x-clip bg-brand px-6 py-24 text-text md:gap-20 md:px-12 md:py-32"
    >
      {/* Heading */}
      <div className="flex max-w-4xl flex-col items-center text-center">
        <h1 className="text-[clamp(2.75rem,6.5vw,7rem)] font-medium leading-[0.95] tracking-[-0.04em]">
          Got a brand that needs a voice?{" "}
          <span className="text-accent">
            <h1>Let&rsquo;s talk</h1>
          </span>
        </h1>
        <p className="mt-6 max-w-md text-sm tracking-[-0.01em] opacity-70">
          Share a few details and the conversation continues on WhatsApp.
        </p>
      </div>

      {/* Contact form and social links */}
      <div className="flex w-full max-w-2xl flex-col gap-10">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="name" className="sr-only">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={values.name}
              onChange={handleChange}
              placeholder="Name *"
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor="email" className="sr-only">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={values.email}
              onChange={handleChange}
              placeholder="Email *"
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor="brand" className="sr-only">
              Brand or company
            </label>
            <input
              id="brand"
              name="brand"
              type="text"
              autoComplete="organization"
              required
              value={values.brand}
              onChange={handleChange}
              placeholder="Brand or company *"
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor="service" className="sr-only">
              What do you need
            </label>
            <select
              id="service"
              name="service"
              required
              value={values.service}
              onChange={handleChange}
              className={`${fieldClass} appearance-none ${
                values.service ? "" : "text-muted/70"
              }`}
            >
              <option value="" disabled>
                What do you need? *
              </option>
              {services.map((s) => (
                <option key={s} value={s} className="text-black">
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="message" className="sr-only">
              Project description
            </label>
            <textarea
              id="message"
              name="message"
              rows={7}
              required
              value={values.message}
              onChange={handleChange}
              placeholder="A brief description of your project is always best :)"
              className={`${fieldClass} min-h-48 resize-y`}
            />
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2">
            <button
              type="submit"
              className="button-slide rounded-full border border-accent bg-bg px-6 py-3 text-base font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Send
            </button>

            <p
              role="status"
              aria-live="polite"
              className="text-xs tracking-[-0.01em] text-muted"
            >
              {status === "sent" &&
                "Opening WhatsApp. Send the message there to reach me."}
            </p>
          </div>
        </form>

        <ul className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-xs leading-relaxed">
          {contacts.map(({ name, icon: Icon, href }) => (
            <li key={name}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-text transition-colors hover:text-accent"
              >
                <Icon aria-hidden="true" className="h-4 w-4" />
                {name}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <Confessions />
    </section>
  );
}

export default Contact;
