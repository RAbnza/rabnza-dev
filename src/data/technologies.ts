/** Evidence: project collection frontmatter and this repository's package.json.
 * These are project-used tools, not proficiency ratings or personal ownership claims.
 */
export const technologyGroups = [
  {
    title: "The interface",
    tools: ["React", "TypeScript", "Tailwind CSS"],
    context: "Interfaces, components, and responsive layouts.",
    references: [
      { label: "Original portfolio", href: "/projects/original-portfolio/" },
      { label: "TindaTrack", href: "/projects/tindatrack/" },
    ],
  },
  {
    title: "Behind the screen",
    tools: ["Node.js", "Express", "PostgreSQL", "Prisma"],
    context: "APIs, relational data, and transactional workflows.",
    references: [
      {
        label: "TindaTrack architecture",
        href: "/projects/tindatrack/#engineering",
      },
    ],
  },
  {
    title: "Other ways to build",
    tools: ["PHP", "Laravel", "SQLite", "Java", "JavaFX", "MySQL"],
    context: "Tools encountered across collaborative web and desktop projects.",
    references: [
      { label: "HomeRoom · team project", href: "/projects/homeroom/" },
      { label: "RentEase · team project", href: "/projects/rentease/" },
      { label: "TravelWise · Java / Swing", href: "/projects/travelwise/" },
    ],
  },
  {
    title: "Build, test, refine",
    tools: [
      "Astro",
      "Anime.js",
      "Playwright",
      "Vitest",
      "React Testing Library",
      "Supertest",
    ],
    context:
      "Astro, Anime.js, and Playwright power this portfolio. Vitest, React Testing Library, and Supertest are documented in TindaTrack.",
    references: [
      {
        label: "TindaTrack testing",
        href: "/projects/tindatrack/#engineering",
      },
    ],
  },
] as const;
