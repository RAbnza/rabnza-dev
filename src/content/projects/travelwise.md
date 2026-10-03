---
title: TravelWise
summary: A Java desktop application that turns destinations, activities, and a budget into a considered travel itinerary.
type: desktop-application
priority: 3
featured: true
status: completed
technologies: [Java, Swing, Boyer–Moore, Branch and bound]
contribution:
  role: Academic team project
  teamContext: Presented in the original portfolio as a collaborative project. This overview focuses on the documented application and algorithms.
cover:
  src: ../../assets/projects/archive/travelwise.webp
  alt: TravelWise project cover with a blue location-pin and airplane mark.
  caption: Original project cover artwork. A workflow screenshot is not yet available.
links:
  source: https://github.com/RAbnza/TravelWise
publication:
  published: true
  homepage: true
---

## Planning within a constraint

TravelWise helps users choose activities for Philippine destinations while working within a trip budget. It combines a Java Swing interface with search and optimization algorithms, making an abstract problem visible as a practical planning workflow.

Users choose a destination, explore activities with costs and ratings, set a budget, and review an itinerary summary. The source includes destinations such as Baguio, El Nido, and Siargao.

## Search and selection are different problems

Boyer–Moore string matching supports searching and filtering. A branch-and-bound knapsack algorithm selects activities under a budget constraint. Separating these tasks lets people first find relevant options, then compare a constrained selection.

The resulting itinerary depends on the supplied activity costs and ratings. Maximizing a numerical rating is an explicit model of value, not a guarantee of the best real-world trip.

## Tradeoffs and validation

A desktop Swing application keeps the workflow local and avoids a service dependency. It also requires a Java environment rather than opening directly in a browser.

The README and original project artwork were inspected. No runtime benchmarks or automated test results were independently produced for this case study. Costs are project data, not current travel quotations; booking and live availability are outside the documented workflow.

## Design takeaway

An optimization result becomes more useful when its assumptions are visible. Showing cost, duration, and ratings alongside the final selection gives the user context for the algorithm's choices.
