// Migration: create_users_table.js
exports.up = function(knex)
{
	return knex.schema.createTable('users', function(table)
	{
		table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
		table.string('username').unique().notNullable();
		table.string('display_name');
		table.string('password_hash').notNullable();
		table.string('email').unique();
		table.jsonb('favorites'); // List of favorite projects, albums, etc.
		table.jsonb('uiprefs'); // Frontend UI preferences
		table.jsonb('prefs'); // Backend-related preferences (e.g., policy settings)
		table.uuid('account_id').references('id').inTable('accounts').onDelete('RESTRICT');
		table.timestamps(true, true); // created_at, updated_at
		table.jsonb('history'); // Track changes made to this user
	});
};

exports.down = function(knex)
{
	return knex.schema.dropTable('users');
};
