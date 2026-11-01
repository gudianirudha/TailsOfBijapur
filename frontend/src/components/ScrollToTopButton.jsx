import { useEffect, useState } from "react";

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setVisible(window.scrollY > 250);
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    visible && (
      <button
        onClick={scrollToTop}
        aria-label="Scroll to top"
        className="
          fixed bottom-6 right-6 z-50
          bg-orange-500 hover:bg-orange-600
          p-3 md:p-4
          shadow-xl
          active:scale-95
          transition-transform duration-200
        "
      >
        <svg
          viewBox="0 0 64 64"
          className="w-7 h-7 md:w-9 md:h-9"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Paw */}
          <g fill="white">
            <circle cx="16" cy="20" r="6" />
            <circle cx="32" cy="14" r="6" />
            <circle cx="48" cy="20" r="6" />
            <path d="M32 28c-10 0-18 8-18 16 0 6 4 10 8 10 4 0 6-2 10-2s6 2 10 2c4 0 8-4 8-10 0-8-8-16-18-16z" />
          </g>

          {/* Up Arrow */}
          <g
            fill="none"
            stroke="#FF7A00"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M32 46V34" />
            <path d="M26 40l6-6 6 6" />
          </g>
        </svg>
      </button>
    )
  );
}
