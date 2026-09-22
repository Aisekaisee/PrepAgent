import type { MigrationBuilder } from "node-pg-migrate";

export async function up(
    pgm: MigrationBuilder
): Promise<void> {
    pgm.createTable("questions", {
        id: {
            type: "uuid",
            primaryKey: true,
            default: pgm.func("gen_random_uuid()")
        },

        type: {
            type: "text",
            notNull: true
        },

        topic: {
            type: "text",
            notNull: true
        },

        difficulty: {
            type: "text",
            notNull: true
        },

        company_tags: {
            type: "text[]",
            default: "{}"
        },

        content: {
            type: "jsonb",
            notNull: true
        },

        answer_key: {
            type: "jsonb",
            notNull: true
        },

        created_at: {
            type: "timestamptz",
            notNull: true,
            default: pgm.func("now()")
        }
    });

    pgm.addConstraint(
        "questions",
        "questions_type_check",
        {
            check: `
        type IN (
          'coding',
          'aptitude',
          'technical'
        )
      `
        }
    );

    pgm.addConstraint(
        "questions",
        "questions_difficulty_check",
        {
            check: `
        difficulty IN (
          'easy',
          'medium',
          'hard'
        )
      `
        }
    );

    pgm.createIndex(
        "questions",
        ["topic", "difficulty"],
        {
            name: "questions_topic_difficulty_idx"
        }
    );
}

export async function down(
    pgm: MigrationBuilder
): Promise<void> {
    pgm.dropTable("questions");
}