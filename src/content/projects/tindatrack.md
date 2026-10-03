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
  role: "Full-stack portfolio project"
  teamContext: "A full-stack project presented through its documented architecture and workflows. The descriptions below refer to application behavior; individual ownership of each feature is not independently verified."

cover:
  src: "../../assets/projects/tindatrack/dashboard.png"
  alt: "TindaTrack owner dashboard showing daily sales, transaction count, stock alerts, active products, active staff, and quick actions."
  caption: "The OWNER dashboard summarizes daily store activity, inventory attention points, and common operational actions."

gallery:
  - src: "../../assets/projects/tindatrack/sell.png"
    alt: "TindaTrack New Sale screen with Coke, Instant Noodles, and Sardines selected, an estimated total of ₱119.50, cash payment selected, and a Record Sale action."
    caption: "The sale workflow lets the user review items and payment while the server remains responsible for validating stock and calculating the final transaction."
    role: "sell"

  - src: "../../assets/projects/tindatrack/receipt.png"
    alt: "TindaTrack sale receipt for transaction 5 showing three items, cash payment, and a total of ₱119.50."
    caption: "A recorded sale produces a transaction receipt using the server-confirmed items, prices, and total."
    role: "receipt"

  - src: "../../assets/projects/tindatrack/movements.png"
    alt: "TindaTrack Stock Movements screen listing sale-driven inventory changes with products, signed quantity changes, timestamps, and linked sale-item sources."
    caption: "Inventory changes remain traceable through a movement ledger that records the product, quantity delta, actor, time, and business source."
    role: "track"

  - src: "../../assets/projects/tindatrack/audit.png"
    alt: "TindaTrack Audit History screen showing sale-created events with actor, entity, timestamp, and expandable evidence."
    caption: "Audit history connects business actions to the actor, affected entity, time, and supporting evidence."
    role: "audit"

  - src: "../../assets/projects/tindatrack/review.png"
    alt: "TindaTrack Daily Sales report for October 3, 2026 showing one ₱119.50 transaction with its payment method and expanded item details."
    caption: "Daily reporting brings completed transactions and their line items back into a reviewable operational record."
    role: "review"

links:
  demo: "https://tindatrack.pages.dev/"
  source: "https://github.com/RAbnza/TindaTrack"

publication:
  published: true
  homepage: true
---

TindaTrack is an inventory and sales management application designed for small local retail stores such as sari-sari stores.

The system focuses on operational correctness rather than broad accounting or e-commerce functionality. Inventory is derived from a movement ledger instead of being stored as an independently editable stock value, giving inventory changes a traceable source.

Sales are processed as transactional operations. Product data and prices are reloaded by the server, stock availability is validated, totals are calculated by the backend, and the sale, sale items, stock movements, and audit evidence are committed together.

The application supports OWNER and STAFF roles, with authorization enforced by the backend API. It also includes stock receiving, stock adjustments, inventory visibility, reporting, movement history, and audit history.
