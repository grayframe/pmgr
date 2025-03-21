exports.up = function(knex) {
  return knex.schema.createTable('auth_providers', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('provider').notNullable();
    table.string('provider_id').notNullable();
    table.string('access_token');
    table.string('refresh_token');
    table.timestamp('expires_at');
    table.jsonb('profile_data').defaultTo('{}');
    table.boolean('is_primary').defaultTo(false);
    table.timestamps(true, true);
    
    // Unique constraint for provider + provider_id combination
    table.unique(['provider', 'provider_id']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('auth_providers');
}; 