exports.up = function(knex) {
  return knex.schema.createTable('projects', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name').notNullable();
    table.text('description');
    table.uuid('owner_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.jsonb('settings').defaultTo('{}');
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('projects');
}; 