export const site = {
  name: "Diogo Cardoso",
  firstName: "Diogo",
  initials: "DC",
  role: "Data Scientist moving into Cyber Security",
  shortRole: "Data Science → Security",
  description:
    "Portfolio of Diogo Cardoso — a data science graduate transitioning into cyber security. You'll find my projects on both those areas, and more...",
  location: "Portugal",
  email: "dicarduso@protonmail.com",
  availability: "Looking for web penetration testing jobs",
  url: "https://darkminimal.vercel.app",
  socials: {
    github: "https://github.com/dicarduso/",
    linkedin: "https://www.linkedin.com/in/diogo-cardoso-262648430/",
  },
  nav: [
    { label: "Home", href: "/#home" },
    { label: "About", href: "/#about" },
    { label: "Skills", href: "/#skills" },
    { label: "Projects", href: "/#projects" },
    { label: "Contact", href: "/#contact" },
  ],
} as const;

export type Site = typeof site;
