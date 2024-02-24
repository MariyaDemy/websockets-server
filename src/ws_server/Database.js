class Database {
    users = new Map();

    constructor(){}

    getUser(name){
        name = name.trim();
        return this.users.get(name);
    }

    createUser({name, password}){
        name = name.trim();
        this.users.set(
            name,
            {
                id: this.users.size + 1,
                name,
                password,
            }
        )
        return this.getUser(name);
    }
}

const database = new Database();

export { database };