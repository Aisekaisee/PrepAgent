import type { MigrationBuilder } from "node-pg-migrate";

export const shorthands = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable("companies", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    name: {
      type: "text",
      notNull: true,
      unique: true,
    },
    created_at: {
      type: "timestamptz",
      default: pgm.func("now()"),
    },
  });

  pgm.createTable("company_requirements", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    company_id: {
      type: "uuid",
      notNull: true,
      references: "companies(id)",
      onDelete: "CASCADE",
    },
    topic: {
      type: "text",
      notNull: true,
    },
    expected_level: {
      type: "text",
      notNull: true,
      check: "expected_level IN ('beginner','intermediate','advanced','expert')",
    },
  });

  pgm.addConstraint("company_requirements", "company_requirements_company_topic_unique", {
    unique: ["company_id", "topic"],
  });

  pgm.createIndex("company_requirements", ["company_id"]);

  // Seed common companies and requirements
  pgm.sql(`
    INSERT INTO companies (name) VALUES
      ('Google'),
      ('Amazon'),
      ('Microsoft'),
      ('Meta'),
      ('Flipkart'),
      ('Adobe')
    ON CONFLICT (name) DO NOTHING;

    INSERT INTO company_requirements (company_id, topic, expected_level)
    SELECT c.id, req.topic, req.expected_level
    FROM companies c
    JOIN (VALUES
      ('Google',    'data-structures',      'expert'),
      ('Google',    'algorithms',           'expert'),
      ('Google',    'system-design',        'advanced'),
      ('Google',    'operating-systems',    'intermediate'),
      ('Google',    'databases',            'intermediate'),
      ('Amazon',    'data-structures',      'advanced'),
      ('Amazon',    'algorithms',           'advanced'),
      ('Amazon',    'system-design',        'advanced'),
      ('Amazon',    'leadership-principles','advanced'),
      ('Amazon',    'databases',            'intermediate'),
      ('Microsoft', 'data-structures',      'advanced'),
      ('Microsoft', 'algorithms',           'advanced'),
      ('Microsoft', 'system-design',        'intermediate'),
      ('Microsoft', 'object-oriented',      'advanced'),
      ('Microsoft', 'databases',            'intermediate'),
      ('Meta',      'data-structures',      'expert'),
      ('Meta',      'algorithms',           'expert'),
      ('Meta',      'system-design',        'advanced'),
      ('Meta',      'product-sense',        'intermediate'),
      ('Flipkart',  'data-structures',      'advanced'),
      ('Flipkart',  'algorithms',           'advanced'),
      ('Flipkart',  'databases',            'advanced'),
      ('Flipkart',  'system-design',        'intermediate'),
      ('Adobe',     'data-structures',      'intermediate'),
      ('Adobe',     'algorithms',           'intermediate'),
      ('Adobe',     'object-oriented',      'advanced'),
      ('Adobe',     'databases',            'intermediate')
    ) AS req(company, topic, expected_level) ON c.name = req.company
    ON CONFLICT DO NOTHING;
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable("company_requirements");
  pgm.dropTable("companies");
}
