// Migration: create_projects_table.js
exports.up = function(knex)
{
	return knex.schema.createTable('project', function(table)
	{
		table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
		table.string('title').notNullable();
		table.text('description');
		table.uuid('owner_id').references('id').inTable('account').onDelete('RESTRICT');
		table.timestamps(true, true);
		table.jsonb('history');
	});
};

exports.down = function(knex)
{
	return knex.schema.dropTable('project');
};
