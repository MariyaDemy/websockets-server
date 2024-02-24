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

        response.data = {
            name: user.name,
            index: user.id,
            error: false,
            errorText: '',
        };

        try {
            if(user.password !== data.password){
                throw new Error('Your password is incorrect. Try again');
            }
        } catch (error) {
            response.data = {...response.data, error:true, errorText: error.message};
        }

        response.data = JSON.stringify(response.data);
        return response;
    }
}

const wsMessageHandler = new WSMessageHandler();

export { wsMessageHandler };