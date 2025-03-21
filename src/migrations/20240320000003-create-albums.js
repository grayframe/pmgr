exports.up = function(knex) {
  return knex.schema.createTable('albums', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name').notNullable();
    table.text('description');
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('project_id').references('id').inTable('projects').onDelete('SET NULL');
    table.jsonb('settings').defaultTo('{}');
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('albums');
}; 