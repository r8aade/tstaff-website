"use client";

import { useEffect } from "react";

export default function HomeScripts() {
  useEffect(() => {
    const nav = document.getElementById("home-nav");
    const onScroll = () => {
      if (!nav) return;
      nav.style.boxShadow = window.scrollY > 20 ? "0 4px 20px rgba(22,21,15,0.06)" : "none";
    };
    document.addEventListener("scroll", onScroll, { passive: true });

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

    return () => {
      document.removeEventListener("scroll", onScroll);
      revealObserver.disconnect();
    };
  }, []);

  return null;
}
