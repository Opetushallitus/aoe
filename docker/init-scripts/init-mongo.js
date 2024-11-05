db = db.getSiblingDB('aoe');

// Create a new user with readWrite access on the appdb database
db.createUser({
    user: 'aoeuser',
    pwd: 'aoepassword',  // Replace with your desired password
    roles: [{ role: 'readWrite', db: 'aoe' }]
});