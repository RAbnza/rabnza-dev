---
title: HomeRoom
summary: A shared place for landlords and tenants to keep rental payments, households, and announcements organized.
type: full-stack
priority: 2
featured: true
status: completed
technologies: [Laravel, PHP, Tailwind CSS, SQLite]
contribution:
  role: Team project
  teamContext: A collaborative web development project. This case study describes the application; individual responsibilities are not attributed without confirmation.
cover:
  src: ../../assets/projects/archive/homeroom.webp
  alt: HomeRoom landlord dashboard showing property statistics, quick actions, announcements, and maintenance requests.
  caption: Actual dashboard capture distributed in the HomeRoom repository. The displayed figures are screenshot content, not claimed business outcomes.
links:
  source: https://github.com/COMP-016-Web-Development-Group-1/HomeRoom
publication:
  published: true
  homepage: true
---

## One household, two perspectives

Rental management brings together recurring payments, household administration, and communication. HomeRoom gives landlords and tenants a shared system for those tasks, with different views of the same rental relationship.

Landlords can manage households and monitor payment status. Tenants can check monthly dues, review rental history, and read household announcements.

## A server-rendered foundation

The project uses Laravel and PHP, with Blade templates and Tailwind CSS for the interface. The repository documents SQLite for local development. This is a local configuration, not a claim about the production database.

Keeping the application in one Laravel project puts routing, validation, templates, and persistence in a familiar structure. The tradeoff is a tighter relationship between the interface and server than a separately deployed API and frontend.

## Verification and boundaries

The public README documents installation, migrations, seeding, and a test command. Those instructions were reviewed for this case study; the application's test suite was not run as part of building this portfolio. No claims are made about active tenants, payment processing, or deployment scale.

## Design takeaway

The central challenge is clarity across roles: a landlord's overview and a tenant's individual account need different information without contradicting each other. The project is a useful example of organizing a shared workflow around those perspectives.
