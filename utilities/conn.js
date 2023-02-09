const { MongoClient } = require("mongodb");

// const connectionString = 'mongodb+srv://juan:Isabelms04@cluster0.wjvatxw.mongodb.net/?retryWrites=true&w=majority';
// const connectionString = 'mongodb://localhost:27017/';
// const connectionString = 'mongodb://kolink_angga:123123123@45.130.229.79/:27017?authMechanism=DEFAULT';

const client = new MongoClient(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

let dbConnection;

module.exports = {
    connectToServer: function(callback) {
        client.connect(function(err, db) {
            if (err || !db) {
                return callback(err);
            }
            dbConnection = db.db("gms");
            console.log("Successfully connected to MongoDB.");

            return callback();
        });
    },

    getDb: function() {
        return dbConnection;
    },
};