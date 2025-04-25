// Migration: create_albums_table.js
exports.up = function(knex)
{
	return knex.schema.createTable('album', function(table)
	{
		table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
		table.string('title').notNullable();
		table.text('description');
		table.jsonb('appearance').defaultTo({});
		table.jsonb('order').defaultTo([]);
		table.string('visibility');
		table.uuid('project_id').references('id').inTable('project').onDelete('RESTRICT');
		table.boolean('trashed').notNullable().defaultTo(false);
		table.jsonb('history').notNullable();
		table.timestamps(true, true);
	});
};

exports.down = function(knex)
{
	return knex.schema.dropTable('album');
};
