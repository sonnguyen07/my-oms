export class Category {
    public id: String;
    public type: String;
    public order: number;

    constructor(id: String, type: String, order: number){
        this.id = id;
        this.type = type;
        this.order = order;
    }
 }