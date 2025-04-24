// Migration: create_photos_table.js
exports.up = function(knex)
{
	return knex.schema.createTable('photo', function(table)
	{
		table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
		table.string('title', 255).notNullable();
		table.jsonb('tags'); // Tags associated with the photo
		table.string('original_filename').notNullable();
		table.string('path').notNullable();
		table.text('description'); // Description of the photo
		table.string('hash').notNullable(); // Hash of the photo for locating it on the filesystem
		table.integer('width').notNullable();
		table.integer('height').notNullable();
		table.boolean('is_monochrome').defaultTo(false); // True if photo is monochrome
		table.jsonb('exif'); // Exif data (stored as JSONb)
		table.uuid('project_id').references('id').inTable('projects').onDelete('RESTRICT');
		table.timestamps(true, true); // created_at, updated_at
		table.jsonb('history'); // Track changes made to this photo
	});
};

exports.down = function(knex)
{
	return knex.schema.dropTable('photos');
};
