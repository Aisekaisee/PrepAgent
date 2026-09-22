import type {
    MigrationBuilder
} from "node-pg-migrate";

export async function up(
    pgm: MigrationBuilder
): Promise<void> {
    pgm.createTable("profile_history", {
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

        snapshot: {
            type: "jsonb",
            notNull: true
        },

        changed_at: {
            type: "timestamptz",
            notNull: true,
            default: pgm.func("now()")
        }
    });

    pgm.createIndex(
        "profile_history",
        ["user_id", "changed_at"]
    );
}

export async function down(
    pgm: MigrationBuilder
): Promise<void> {
    pgm.dropTable("profile_history");
}