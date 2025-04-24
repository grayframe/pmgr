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
		table.jsonb('addresses'); // An array of address objects, each with type (shipping, billing, etc.)
		table.jsonb('payment_info'); // External payment references (e.g., Stripe or PayPal account IDs)
		table.timestamps(true, true); // created_at, updated_at
		table.jsonb('history'); // Track changes made to this account
	});
};

exports.down = function(knex)
{
	return knex.schema.dropTable('accounts');
};
