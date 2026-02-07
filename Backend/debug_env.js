const dotenv = require('dotenv');
const result = dotenv.config();

if (result.error) {
    console.log('Dotenv error:', result.error);
}

console.log('Parsed:', result.parsed);
console.log('JWT_SECRET:', process.env.JWT_SECRET);
