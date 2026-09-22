import type { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.sql(`
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";
  `);

    pgm.createTable("users", {
        id: {
            type: "uuid",
            primaryKey: true,
            default: pgm.func("gen_random_uuid()")
        },

        email: {
            type: "text",
            notNull: true,
            unique: true
        },

        password_hash: {
            type: "text",
            notNull: true
        },

        role: {
            type: "text",
            notNull: true,
            default: "student"
        },

        created_at: {
            type: "timestamptz",
            notNull: true,
            default: pgm.func("now()")
        }
    });

    pgm.createTable("profiles", {
        user_id: {
            type: "uuid",
            primaryKey: true,
            references: "users(id)",
            onDelete: "CASCADE"
        },

        education: {
            type: "jsonb"
        },

        programming_skills: {
            type: "text[]",
            default: "{}"
        },

        technical_subjects: {
            type: "text[]",
            default: "{}"
        },

        target_companies: {
            type: "text[]",
            default: "{}"
        },

        timeline_weeks: {
            type: "integer"
        },

        updated_at: {
            type: "timestamptz",
            notNull: true,
            default: pgm.func("now()")
        }
    });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropTable("profiles");
    pgm.dropTable("users");
}