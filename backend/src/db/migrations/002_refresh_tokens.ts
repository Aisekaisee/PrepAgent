import type { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable("refresh_tokens", {
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

        token_hash: {
            type: "text",
            notNull: true,
            unique: true
        },

        expires_at: {
            type: "timestamptz",
            notNull: true
        },

        revoked_at: {
            type: "timestamptz"
        },

        created_at: {
            type: "timestamptz",
            notNull: true,
            default: pgm.func("now()")
        }
    });

    pgm.createIndex(
        "refresh_tokens",
        ["user_id"]
    );
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropTable("refresh_tokens");
}