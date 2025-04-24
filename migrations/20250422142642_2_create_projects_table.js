// Migration: create_projects_table.js
exports.up = function(knex)
{
	return knex.schema.createTable('project', function(table)
	{
		table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
		table.string('title').notNullable();
		table.text('description');
		table.jsonb('appearance'); // UI-related preferences for this project (e.g., slideshow settings)
		table.jsonb('order'); // Custom ordering of photos (list of UUIDs for photos in this project)
		table.jsonb('visibility'); // Define visibility levels (public, private, etc.)
		table.uuid('account_id').references('id').inTable('accounts').onDelete('RESTRICT');
		table.timestamps(true, true); // created_at, updated_at
		table.jsonb('history'); // Track changes made to this project
	});
};

exports.down = function(knex)
{
	return knex.schema.dropTable('projects');
};
