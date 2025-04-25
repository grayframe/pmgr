// Migration: create_accounts_table.js
exports.up = function(knex)
{
	return knex.schema.createTable('account', function(table)
	{
		table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
		table.string('first_name');
		table.string('last_name');
		table.string('phone');
		table.jsonb('addresses').defaultTo([]);
		table.jsonb('payment_info').defaultTo([]);
		table.uuid('user_id').notNullable().unique().references('id').inTable('user').onDelete('RESTRICT');
		table.boolean('trashed').notNullable().defaultTo(false);
		table.jsonb('history').notNullable();
		table.timestamps(true, true);
	});
};

exports.down = function(knex)
{
	return knex.schema.dropTable('account');
};
