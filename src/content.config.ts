import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const projects = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/projects",
  }),

  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string(),

      type: z.enum([
        "full-stack",
        "frontend",
        "backend",
        "web-application",
        "website",
        "portfolio",
        "other",
      ]),

      priority: z.number().int().positive(),

      featured: z.boolean().default(false),

      status: z.enum([
        "completed",
        "in-development",
        "archived",
        "retrospective",
      ]),

      technologies: z.array(z.string()).default([]),

      contribution: z.object({
        role: z.string(),
        teamContext: z.string().optional(),
        details: z.array(z.string()).default([]),
      }),

      dates: z
        .object({
          started: z.string().optional(),
          completed: z.string().optional(),
        })
        .optional(),

      cover: z
        .object({
          src: image(),
          alt: z.string(),
          caption: z.string().optional(),
        })
        .optional(),

      gallery: z
        .array(
          z.object({
            src: image(),
            alt: z.string(),
            caption: z.string().optional(),

            role: z
              .enum([
                "sell",
                "receipt",
                "track",
                "audit",
                "review",
                "supporting",
              ])
              .default("supporting"),
          }),
        )
        .default([]),

      links: z.object({
        demo: z.string().url().optional(),
        source: z.string().url().optional(),
      }),

      publication: z.object({
        published: z.boolean().default(false),
        homepage: z.boolean().default(false),
      }),
    }),
});

export const collections = {
  projects,
};