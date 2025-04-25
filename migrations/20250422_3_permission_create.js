// Migration: create_permissions_table.js
exports.up = function(knex)
{
	return knex.schema.createTable('permission', function(table)
	{
		table.uuid('user_id').references('id').inTable('user').onDelete('CASCADE');
		table.uuid('project_id').references('id').inTable('project').onDelete('CASCADE');
		table.string('role');
		table.primary(['user_id', 'project_id']);
		table.boolean('trashed').notNullable().defaultTo(false);
		table.jsonb('history').notNullable();
		table.timestamps(true, true);
	});
};

exports.down = function(knex)
{
	return knex.schema.dropTable('permission');
};
