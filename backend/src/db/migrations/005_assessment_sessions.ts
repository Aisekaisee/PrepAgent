import type { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable("assessment_sessions", {
        id: {
            type: "uuid",
            primaryKey: true,
            default: pgm.func("gen_random_uuid()")
        },
        user_id: {
            type: "uuid",
            notNull: true,
            references: "users(id)",
            onDelete: "CASCADE"
        },
        topic: {
            type: "text"
        },
        status: {
            type: "text",
            notNull: true,
            default: "active"
        },
        score: {
            type: "numeric(5, 2)"
        },
        topic_breakdown: {
            type: "jsonb"
        },
        started_at: {
            type: "timestamptz",
            notNull: true,
            default: pgm.func("now()")
        },
        submitted_at: {
            type: "timestamptz"
        }
    });

    pgm.addConstraint("assessment_sessions", "assessment_sessions_status_check", {
        check: "status IN ('active', 'submitted')"
    });

    pgm.createIndex("assessment_sessions", ["user_id", "started_at"]);

    pgm.createTable("question_answers", {
        id: {
            type: "uuid",
            primaryKey: true,
            default: pgm.func("gen_random_uuid()")
        },
        session_id: {
            type: "uuid",
            notNull: true,
            references: "assessment_sessions(id)",
            onDelete: "CASCADE"
        },
        question_id: {
            type: "uuid",
            notNull: true,
            references: "questions(id)",
            onDelete: "CASCADE"
        },
        student_answer: {
            type: "jsonb",
            notNull: true
        },
        is_correct: {
            type: "boolean"
        },
        answered_at: {
            type: "timestamptz",
            notNull: true,
            default: pgm.func("now()")
        }
    });

    pgm.createIndex("question_answers", ["session_id", "answered_at"]);
    pgm.createIndex("question_answers", ["session_id", "question_id"]);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropTable("question_answers");
    pgm.dropTable("assessment_sessions");
}
