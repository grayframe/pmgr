exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('email').unique().notNullable();
    table.string('display_name').notNullable();
    table.string('profile_picture');
    table.uuid('default_project_id');
    table.enum('status', ['active', 'inactive', 'suspended']).defaultTo('active');
    table.jsonb('preferences').defaultTo('{}');
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
}; 