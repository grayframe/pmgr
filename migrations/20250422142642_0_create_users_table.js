// Migration: create_users_table.js
exports.up = function(knex)
{
	return knex.schema.createTable('user', function(table)
	{
		table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
		table.string('username').unique().notNullable();
		table.string('display_name');
		table.string('password_hash').notNullable();
		table.string('email').unique();
		table.jsonb('favorites');
		table.jsonb('uiprefs');
		table.jsonb('prefs');
		table.timestamps(true, true);
		table.jsonb('history');
	});
};

exports.down = function(knex)
{
	return knex.schema.dropTable('user');
};
