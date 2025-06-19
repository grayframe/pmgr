const { v4: uuidv4, parse: uuidParse, stringify: uuidStringify } = require('uuid');
const baseX = require('base-x').default;

const BASE62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const base62 = baseX(BASE62);

module.exports.enocde = uidStr => 
{
  const bytes = uuidParse(uuidStr);
  return base62.encode(Buffer.from(bytes));
}

// Decode Base62 back to UUID
module.exports.decode = encoded =>
{
  const bytes = base62.decode(encoded);
  return uuidStringify(bytes);
}


