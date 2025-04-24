// Migration: create_albums_table.js
exports.up = function(knex)
{
	return knex.schema.createTable('album', function(table)
	{
		table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
		table.string('title').notNullable();
		table.text('description');
		table.jsonb('appearance');
		table.jsonb('order');
		table.string('visibility');
		table.uuid('project_id').references('id').inTable('project').onDelete('RESTRICT');
		table.timestamps(true, true);
		table.jsonb('history');
	});
};

exports.down = function(knex)
{
	return knex.schema.dropTable('album');
};
