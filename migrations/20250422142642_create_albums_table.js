// Migration: create_albums_table.js
exports.up = function(knex)
{
	return knex.schema.createTable('albums', function(table)
	{
		table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
		table.string('title').notNullable();
		table.text('description');
		table.jsonb('appearance'); // UI-related settings (e.g., slideshow settings for this album)
		table.jsonb('order'); // Custom ordering of photos in the album (list of UUIDs)
		table.jsonb('members'); // List of users who are members of this album
		table.uuid('project_id').references('id').inTable('projects').onDelete('RESTRICT');
		table.timestamps(true, true); // created_at, updated_at
		table.jsonb('history'); // Track changes made to this album
	});
};

exports.down = function(knex)
{
	return knex.schema.dropTable('albums');
};
