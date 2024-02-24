import { database } from "./Database.js";

class WSMessageHandler {
    constructor(){
        this.database = database;
    }

    handleMessage(command, data){
        data = JSON.parse(data);
        switch(command){
            case 'reg':
            return this.loginUser(data);
        }
    }

    loginUser(data){
        let user = this.database.getUser(data.name);
        if(!user){
            user = this.database.createUser(data);
        }

        const response = {
            type: "reg",
            id: 0,
        };

        response.data = JSON.stringify({
            name: user.name,
            index: user.id,
            error: false,
            errorText: '',
        });

        return response;
    }
}

const wsMessageHandler = new WSMessageHandler();

export { wsMessageHandler };