// Migration: create_permissions_table.js
exports.up = function(knex)
{
	return knex.schema.createTable('permission', function(table)
	{
		table.uuid('user_id').references('id').inTable('user').onDelete('CASCADE');
		table.uuid('project_id').references('id').inTable('project').onDelete('CASCADE');
		table.jsonb('permissions'); // Define the permissions (e.g., read, write, admin)
		table.timestamps(true, true); // created_at, updated_at
		table.jsonb('history'); // Track changes to this permission record
		table.primary(['user_id', 'project_id']);
	});
};

exports.down = function(knex)
{
	return knex.schema.dropTable('permission');
};
