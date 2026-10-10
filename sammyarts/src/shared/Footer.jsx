import { PageTransitionLink } from "./PageTransition";
import logo from "/img/Light.png";
const footerLinks = [
  { name: "Home", href: "/" },
  { name: "Gallery", href: "/gallery" },
  { name: "Atelier", href: "/atelier" },
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "/contact" },
];

function Footer() {
  return (
    <footer className="px-5 pb-6 pt-16 text-text md:px-10 md:pt-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 flex flex-col gap-10 md:mb-24 md:items-center md:justify-center">
          <div className="flex flex-col justify-center items-center">
            <img src={logo} className="w-[400px]" />
            <p className="max-w-xs text-sm text-center leading-relaxed text-muted">
              Hand-crafted pieces shaped from raw materials and deep intention.
            </p>
          </div>

          <nav aria-label="Footer navigation">
            <h2 className="mb-4 text-2xl font-serif italic tracking-[-0.07em] text-text">
              Explore
            </h2>
            <ul className="grid grid-cols-2 gap-x-10 gap-y-3 text-sm sm:grid-cols-3 md:flex md:gap-8">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <PageTransitionLink to={link.href}>
                    <span className="inline-block text-muted transition-[color,transform] duration-200 hover:scale-105 hover:text-accent-hover focus-visible:scale-105 focus-visible:text-accent-hover">
                      {link.name}
                    </span>
                  </PageTransitionLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} SammyArts. All rights reserved.
          </p>
          <PageTransitionLink
            to="/"
            className="w-fit transition-colors hover:text-accent-hover focus-visible:text-accent-hover"
          >
            Back to home
          </PageTransitionLink>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
