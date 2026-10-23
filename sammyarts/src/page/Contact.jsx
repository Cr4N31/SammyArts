import { useState } from "react";
import { sendContactMessage } from "../data/contact";
import {
  FaBehance,
  FaWhatsapp,
  FaInstagram,
  FaPinterest,
} from "react-icons/fa";

import { FaXTwitter } from "react-icons/fa6";

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

const fieldClass =
  "w-full border-b border-accent bg-transparent py-3 text-base outline-none transition-colors placeholder:opacity-30 focus:border-current";

const labelClass = "text-xs uppercase tracking-[0.14em] opacity-60";

function Contact() {
  const [values, setValues] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");

    try {
      await sendContactMessage(values);
      setValues({ name: "", email: "", message: "" });
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section
      id="contact"
      className="page-reveal flex min-h-[50vh] flex-col justify-center gap-16 px-6 py-24 text-text md:px-12 md:py-32"
    >
      <div>
        <h1 className="text-[clamp(3rem,12vw,9rem)] font-semibold italic leading-[0.9] tracking-[-0.05em]">
          Need some help?
        </h1>
        <p className="mt-6 max-w-md text-sm tracking-[-0.02em] opacity-70">
          Send us an email and our team will reach out to sort whatever issues
          or enquiries you may have.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-2xl flex-col gap-10"
      >
        <div className="grid gap-10 md:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="name" className={labelClass}>
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
              placeholder="Your name"
              className={fieldClass}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="email" className={labelClass}>
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={values.email}
              onChange={handleChange}
              placeholder="you@company.com"
              className={fieldClass}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="message" className={labelClass}>
            Context
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            required
            value={values.message}
            onChange={handleChange}
            placeholder="Tell us a little about what you need"
            className={`${fieldClass} resize-none`}
          />
        </div>

        <div className="flex items-center justify-between gap-6">
          <p
            role="status"
            aria-live="polite"
            className="text-xs tracking-[-0.01em] opacity-70"
          >
            {status === "sent" && "Message sent. We will be in touch."}
            {status === "error" && "Something went wrong. Please try again."}
          </p>

          <button
            type="submit"
            disabled={status === "sending"}
            className="group rounded-full px-4 py-2 text-sm uppercase tracking-[0.14em] text-accent transition-all duration-250 hover:bg-accent hover:text-brand disabled:opacity-40"
          >
            {status === "sending" ? "Sending" : "Send"}
            <span
              aria-hidden
              className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1"
            >
              →
            </span>
          </button>
        </div>
      </form>
      <span className="text-center text-accent uppercase">Or</span>
      <div className="flex flex-col items-center gap-6">
        <h2 className="text-sm uppercase tracking-[0.14em] opacity-70">
          Reach out to us on our other platforms
        </h2>

        <ul className="flex items-center gap-6">
          {contacts.map(({ name, icon: Icon, href }) => (
            <li key={name}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={name}
                className="text-accent transition-all duration-250 hover:-translate-y-1 hover:opacity-70"
              >
                <Icon size={24} aria-hidden />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default Contact;
