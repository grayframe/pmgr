// Migration: create_accounts_table.js
exports.up = function(knex)
{
	return knex.schema.createTable('account', function(table)
	{
		table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
		table.string('first_name').notNullable();
		table.string('last_name').notNullable();
		table.string('email').unique().notNullable();
		table.string('phone');
		table.jsonb('addresses');
		table.jsonb('payment_info');
		table.uuid('user_id').notNullable().unique().references('id').inTable('user').onDelete('RESTRICT');
		table.timestamps(true, true);
		table.jsonb('history');
	});
};

exports.down = function(knex)
{
	return knex.schema.dropTable('account');
};
