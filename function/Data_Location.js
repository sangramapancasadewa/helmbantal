const fs = require('fs')

JSON_DATA = {
db_user: JSON.parse(fs.readFileSync('./database/pengguna.json')),
}

exports.db_user_JSON = JSON_DATA.db_user;
