var Datastore = require('nedb')
var fs = require('fs')

const DB_PATH = '/vyvolavac/vyvolavac.db'

var db = new Datastore({ filename: DB_PATH, autoload: true });

module.exports = db