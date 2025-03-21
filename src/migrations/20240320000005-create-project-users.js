exports.up = function(knex) {
  return knex.schema.createTable('project_users', function(table) {
    table.uuid('project_id').notNullable().references('id').inTable('projects').onDelete('CASCADE');
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.timestamps(true, true);
    
    // Composite primary key
    table.primary(['project_id', 'user_id']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('project_users');
}; 