// Migration: create_photos_table.js
exports.up = function(knex)
{
	return knex.schema.createTable('photo', function(table)
	{
		table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
		table.string('title', 255).notNullable();
		table.jsonb('tags').defaultTo(`'[]'::jsonb`);
		table.string('original_filename').notNullable();
		table.string('path').notNullable();
		table.text('description');
		table.string('hash').notNullable();
		table.integer('width').notNullable();
		table.integer('height').notNullable();
		table.boolean('is_monochrome').defaultTo(false);
		table.jsonb('exif').defaultTo(`'{}'::jsonb`);
		table.uuid('project_id').references('id').inTable('project').onDelete('RESTRICT');
		table.boolean('trashed').notNullable().defaultTo(false);
		table.jsonb('history').notNullable();
		table.timestamps(true, true);
	});
};

exports.down = function(knex)
{
	return knex.schema.dropTable('photo');
};
