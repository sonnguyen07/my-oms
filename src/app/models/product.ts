import { environment } from "src/environments/environment.prod";

export class Product {
    public id: String;
    public code: String;
    public name: String;
    public price: number;
    public quantity: number;
    public categoryId: number;
    public brand: String;
    public image: String;
    public color: String;
    public size: String;
    public insertedDate: String;
    public status: number = 1;
    public createdAt: any;

    constructor(
        id: String, code: String, name: String, price: number, quantity: number, categoryId: number, 
        brand: String, image: String, color: String, size: String, status: number, createdAt: any, insertedDate: String
    ){
        this.id = id;
        this.code = code;
        this.name = name;
        this.price = price;
        this.quantity = quantity;
        this.categoryId = categoryId;
        this.brand = brand;
        this.image = image;
        this.color = color;
        this.size = size;
        this.status = status;
        this.createdAt = createdAt;
        this.insertedDate = insertedDate;
    }
 }

 export const productConverter = {
    toFirestore: (product: Product) => {
        return {
            code: product.code,
            name: product.name,
            price: product.price,
            quantity: product.quantity,
            categoryId: product.categoryId,
            brand: product.brand,
            image: product.image,
            color: product.color,
            size: product.size,
            status: product.status,
            createdAt: product.createdAt,
            insertedDate: product.insertedDate
        };
    },
    fromFirestore: (snapshot: any, options: any) => {
        const data = snapshot.data(options);
        return new Product(
            snapshot.id,
            data.code,
            data.name,
            data.price,
            data.quantity,
            data.categoryId,
            data.brand,
            data.image,
            data.color,
            data.size,
            data.status,
            data.createdAt,
            data.insertedDate
        );
    }
};