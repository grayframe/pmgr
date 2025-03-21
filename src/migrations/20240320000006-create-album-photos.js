exports.up = function(knex) {
  return knex.schema.createTable('album_photos', function(table) {
    table.uuid('album_id').notNullable().references('id').inTable('albums').onDelete('CASCADE');
    table.uuid('photo_id').notNullable().references('id').inTable('photos').onDelete('CASCADE');
    table.integer('order').defaultTo(0);
    table.timestamps(true, true);
    
    // Composite primary key
    table.primary(['album_id', 'photo_id']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('album_photos');
}; 