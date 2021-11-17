import { environment } from "src/environments/environment.prod";

export function getProductImage(imageName: String): String {
    return environment.firebaseConfig.storageUrl + "images%2Fproducts%2F" + imageName + "?alt=media";
}