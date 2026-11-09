import React from "react";

export const skills = {
  "Cyber Security": [
    "CTT Bank Phishing Kit Analysis",
    "HTB machine __ Walkthough",
  ],
  "Data Science": [
    "London API predicting model",
  ],
  "Other Personal Projects": [
  ],
};

const CategoryIcons = {
  "Cyber Security": (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--sec)] flex-shrink-0"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>
  ),
  "Data Science": (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--sec)] flex-shrink-0"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="m19 9-5 5-4-4-3 3"/></svg>
  ),
  "Other Personal Projects": (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--sec)] flex-shrink-0"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>
  ),
};

const SkillsList = () => {
  const getSlug = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 w-full items-start">
      {Object.entries(skills).map(([category, items]) => (
        <div
          key={category}
          className="group relative p-5 rounded-2xl bg-[#1414149c] border border-[var(--white-icon-tr-button)] hover:border-[var(--sec)] transition-all duration-300 h-auto cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {CategoryIcons[category as keyof typeof CategoryIcons]}
              <h3 className="text-xl font-semibold text-[var(--white)] group-hover:text-[var(--sec)] transition-colors">
                {category}
              </h3>
            </div>
            <span className="text-xs text-[var(--white-icon)] font-mono bg-[#1f1f1f] px-2.5 py-1 rounded-full border border-[var(--white-icon-tr)]">
              {items.length}
            </span>
          </div>
            
          <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-300 ease-out">
            <div className="overflow-hidden">
              <ul className="pt-4 space-y-2 text-sm text-[var(--white-icon)] border-t border-[var(--white-icon-tr)]/40 mt-4">
                {items.length > 0 ? (
                  items.map((item, index) => (
                    <a
                      key={index}
                      href={`/${getSlug(item)}`}
                      className="flex items-center hover:text-[var(--white)] transition-colors py-1 cursor-pointer"
                    >
                      <span className="text-[var(--sec)]">•</span>
                      <span className="pl-2">{item}</span>
                    </a>
                  ))
                ) : (
                  <li className="text-xs italic text-[var(--white-icon)] opacity-60">
                    Coming soon...
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkillsList;