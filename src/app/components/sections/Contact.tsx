"use client";

// Contact Section (Footer Wrapper)
const Contact = () => {
  return (
    <section
      id="contact"
      className="bg-[#04041E] font-sans overflow-x-hidden"
    >
      <Footer />
    </section>
  );
};

export default Contact;

// Footer Component
const Footer = () => {
  const navLinks = ["Home", "About", "Members", "Contact"];

  return (
    <footer className="relative w-full h-[450px] flex items-center justify-center overflow-hidden mt-20">
      {/* Gradient Background */}
      <div
        className="absolute top-0 w-[2353px] h-full"
        style={{
          background:
            "linear-gradient(154.35deg, #04051B 25%, #2A2594 60%, #04051B 95%)",
          borderTopLeftRadius: "50%",
          borderTopRightRadius: "50%",
        }}
      />

      {/* White border overlay */}
      <div
        className="absolute top-0 w-[2353px] h-full pointer-events-none"
        style={{
          borderTop: "1.5px solid rgba(255, 255, 255, 0.3)",
          borderTopLeftRadius: "50%",
          borderTopRightRadius: "50%",
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-end h-full pb-10">
        <div className="w-full flex flex-col items-center gap-10">
          <div className="w-full flex flex-col md:flex-row justify-between items-center gap-8">
            {/* Logo */}
            <img
              src="/vertex-logo.png"
              alt="VERTEX Logo"
              className="h-8 w-auto"
            />

            {/* Nav Links */}
            <nav className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-y-4 gap-x-8 md:gap-x-14">
              {navLinks.map((link) => (
                <a
                  key={link}
                  href={`#${link.toLowerCase()}`}
                  className="font-semibold text-white text-xl hover:opacity-80 transition-opacity"
                >
                  {link}
                </a>
              ))}
            </nav>

            {/* Social Icons */}
            <div className="flex items-center gap-4">
              {/* Instagram */}
              <a
                href="https://www.instagram.com/vertex_ete/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 bg-white rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#04051B">
                  <path d="M12 2.2c3.2 0 3.6 0 4.9.1 3.2.1 4.8 1.7 4.9 4.9.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-3.2-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-3.2 1.7-4.8 4.9-4.9C8.4 2.2 8.8 2.2 12 2.2zm0 3.5a6.3 6.3 0 100 12.6 6.3 6.3 0 000-12.6zm0 10.4a4.1 4.1 0 110-8.2 4.1 4.1 0 010 8.2zm6.5-11.1a1.47 1.47 0 100 2.94 1.47 1.47 0 000-2.94z" />
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/company/vertex-et-dsce/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 bg-white rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#04051B">
                  <path d="M4.98 3.5a2.5 2.5 0 110 5 2.5 2.5 0 010-5zM3 9h4v12H3V9zm7 0h3.8v1.7h.1a4.2 4.2 0 013.8-2.1c4 0 4.7 2.6 4.7 6v6.4h-4v-5.7c0-1.4 0-3.2-2-3.2s-2.3 1.5-2.3 3.1v5.8h-4V9z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Divider */}
          <hr className="w-full border-t border-white/50" />

          {/* Copyright */}
          <p className="text-white text-sm text-center tracking-wider">
            Made with ❤️ by Vertex
          </p>
        </div>
      </div>
    </footer>
  );
};
