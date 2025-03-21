exports.up = function(knex) {
  return knex.schema.createTable('photos', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('title').notNullable();
    table.text('description');
    table.string('url').notNullable();
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('project_id').references('id').inTable('projects').onDelete('SET NULL');
    table.jsonb('metadata').defaultTo('{}');
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('photos');
}; 