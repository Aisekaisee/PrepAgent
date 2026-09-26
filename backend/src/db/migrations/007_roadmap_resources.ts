import type { MigrationBuilder } from "node-pg-migrate";

export const shorthands = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  // Resources table (PostgreSQL metadata; embeddings live in ChromaDB)
  pgm.createTable("resources", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    type: {
      type: "text",
      notNull: true,
      check: "type IN ('problem','article','question')",
    },
    topic: {
      type: "text",
      notNull: true,
    },
    difficulty: {
      type: "text",
      notNull: true,
      check: "difficulty IN ('easy','medium','hard')",
    },
    company_tags: {
      type: "text[]",
      default: "{}",
    },
    title: {
      type: "text",
      notNull: true,
    },
    url: {
      type: "text",
    },
    content: {
      type: "text",
    },
    embedding_id: {
      type: "text", // ChromaDB document ID
    },
    created_at: {
      type: "timestamptz",
      default: pgm.func("now()"),
    },
  });

  pgm.createIndex("resources", ["topic", "difficulty"]);

  // Roadmaps table — versioned per user
  pgm.createTable("roadmaps", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    user_id: {
      type: "uuid",
      notNull: true,
      references: "users(id)",
      onDelete: "CASCADE",
    },
    version: {
      type: "integer",
      notNull: true,
      default: 1,
    },
    generated_at: {
      type: "timestamptz",
      default: pgm.func("now()"),
    },
    status: {
      type: "text",
      notNull: true,
      default: "'active'",
      check: "status IN ('active','superseded')",
    },
    source: {
      type: "text",
      notNull: true,
      default: "'ai_generated'",
    },
    weeks: {
      type: "jsonb",
      notNull: true,
    },
  });

  // Composite index for fast active roadmap lookups
  pgm.createIndex("roadmaps", ["user_id", "status"]);

  // Roadmap items — one row per week entry
  pgm.createTable("roadmap_items", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    roadmap_id: {
      type: "uuid",
      notNull: true,
      references: "roadmaps(id)",
      onDelete: "CASCADE",
    },
    week_no: {
      type: "integer",
      notNull: true,
    },
    topic: {
      type: "text",
      notNull: true,
    },
    goals: {
      type: "text[]",
      default: "{}",
    },
    resource_refs: {
      type: "uuid[]",
      default: "{}",
    },
    status: {
      type: "text",
      notNull: true,
      default: "'pending'",
      check: "status IN ('pending','started','completed','skipped')",
    },
    updated_at: {
      type: "timestamptz",
      default: pgm.func("now()"),
    },
  });

  pgm.createIndex("roadmap_items", ["roadmap_id"]);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable("roadmap_items");
  pgm.dropTable("roadmaps");
  pgm.dropTable("resources");
}
