// Migration: create_projects_table.js
exports.up = function(knex)
{
	return knex.schema.createTable('project', function(table)
	{
		table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
		table.uuid('owner_id').references('id').inTable('account').onDelete('RESTRICT');
		table.string('title').notNullable();
		table.text('description');
		table.boolean('trashed').notNullable().defaultTo(false);
		table.jsonb('history').notNullable();
		table.timestamps(true, true);
	});
};

exports.down = function(knex)
{
	return knex.schema.dropTable('project');
};
