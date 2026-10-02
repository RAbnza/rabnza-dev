---
title: "TindaTrack"

summary: "A mobile-first inventory and sales management system for small local retailers, designed around inventory correctness, transactional sales, auditability, and role-based access."

type: "full-stack"

priority: 1

featured: true

status: "completed"

technologies:
  - "React"
  - "TypeScript"
  - "Vite"
  - "Tailwind CSS"
  - "Node.js"
  - "Express"
  - "PostgreSQL"
  - "Prisma"
  - "Vitest"
  - "React Testing Library"
  - "Supertest"

contribution:
  role: "Contribution details pending verification"
  details: []

gallery: []

links:
  demo: "https://tindatrack.pages.dev/"
  source: "https://github.com/RAbnza/TindaTrack"

publication:
  published: false
  homepage: false
---

TindaTrack is an inventory and sales management application designed for small local retail stores such as sari-sari stores.

The system focuses on operational correctness rather than broad accounting or e-commerce functionality. Inventory is derived from a movement ledger instead of being stored as an independently editable stock value, giving inventory changes a traceable source.

Sales are processed as transactional operations. Product data and prices are reloaded by the server, stock availability is validated, totals are calculated by the backend, and the sale, sale items, stock movements, and audit evidence are committed together.

The application supports OWNER and STAFF roles, with authorization enforced by the backend API. It also includes stock receiving, stock adjustments, inventory visibility, reporting, movement history, and audit history.
