import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { query, collection, onSnapshot, addDoc, where, serverTimestamp, updateDoc, doc, orderBy, limit, getDoc, FieldValue, increment, startAfter } from "firebase/firestore";
import { productConverter } from "src/app/models/product"
import { db } from "src/app/app.module"
import { AlertController, ModalController } from '@ionic/angular';
import { AddProductPage } from 'src/app/dialogs/add-product/add-product.page';
import { categories } from 'src/app/app.component';
import { Category } from 'src/app/models/category';
import { getProductImage } from 'src/app/utils/firestore-util';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-products',
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss']
})
export class ProductsPage implements OnInit {

  pageSize = 30;
  totalItems = 0;
  isLoadingData = false;
  previousPageQuery = null;

  pageInfo = {
    page: 0,
    label: '0'
  }

  categoryId = null;
  categories = [];
  products: any = [];
  imageUrl: String = "";
  searchValue: String = "";
  _getProductImage = getProductImage;

  constructor(
    public alertController: AlertController,
    public modalController: ModalController,
    public ref: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.categories = categories;
    this.categories.unshift(new Category(null, "Tất cả", 0));

    this.isLoadingData = true;
    this.getProducts().subscribe(() => {
      this.isLoadingData = false;
      this.ref.detectChanges();
    });
  }

  async getTotalProducts() {
    const docRef = doc(db, "orders", "numberOfDocs");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      this.totalItems = docSnap.data().count;
    } else {
      console.log("No such document!");
    }
  }

  getProducts(): Observable<boolean> {
    return new Observable<boolean>(observer => {
      const conditions = [];

      if (this.searchValue) {
        conditions.push(where("name", ">=", this.searchValue));
        conditions.push(where("name", "<=", this.searchValue + "\uf8ff"));
      }
      if (this.categoryId) {
        conditions.push(where("categoryId", "==", this.categoryId));
      }

      var q = query(
        collection(db, "orders").withConverter(productConverter),
        ...conditions,
        where("status", "==", 1),
        orderBy("name", "asc"),
        orderBy("createdAt", "desc"),
        limit(this.pageSize)
      );

      if (this.previousPageQuery) {
        q = query(q, startAfter(this.previousPageQuery))
      }

      onSnapshot(q, (it) => {
        setTimeout(() => {
          it.forEach((doc) => {
            this.products.push(doc.data());
          });
          this.previousPageQuery = it.docs[it.docs.length - 1];
          observer.next(it.docs.length - 1 <= 0);
          this.ref.detectChanges();
        }, 500);
      });
    })
  }

  doRefresh(event: any) {
    this.products = [];
    this.previousPageQuery = null;

    this.isLoadingData = true;
    this.getProducts().subscribe(() => {
      event.target.complete();
      this.isLoadingData = false;
      this.ref.detectChanges();
    });
  }

  loadMoreData(event: any) {
    this.isLoadingData = true;
    this.getProducts().subscribe((isLoadAllData: boolean) => {
      event.target.complete();
      event.target.disabled = isLoadAllData;
      this.isLoadingData = false;
      this.ref.detectChanges();
    });
  }

  async openAddProductsDialog() {
    const modal = await this.modalController.create({
      component: AddProductPage,
      cssClass: 'custom-modal'
    });
    modal.onDidDismiss().then((product) => {
      if (product.data && product.data.id == '') {
        this.addProduct(product.data)
      }
    });
    return await modal.present();
  }

  private async addProduct(product: any) {
    addDoc(collection(db, "orders").withConverter(productConverter), product)
      .then(function (docRef) {
        updateDoc(doc(db, "orders", "numberOfDocs"), { count: increment(1) });
      })
      .catch(function (error) {
        console.error("Error adding document: ", error);
      });
  }

  async openEditAlert(product: any) {
    const modal = await this.modalController.create({
      component: AddProductPage,
      cssClass: 'custom-modal',
      componentProps: {
        id: product.id,
        code: product.code,
        name: product.name,
        price: product.price,
        quantity: product.quantity,
        categoryId: product.categoryId,
        size: product.size,
        brand: product.brand,
        color: product.color,
        image: product.image,
        insertedDate: product.insertedDate
      }
    });
    modal.onDidDismiss().then((updateData) => {
      if (updateData.data && updateData.data.id != '') {
        this.updateProduct(updateData.data)
      }
    });
    return await modal.present();
  }

  private async updateProduct(product: any) {
    updateDoc(doc(db, "orders", product.id), {
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
      insertedDate: product.insertedDate,
      updatedAt: serverTimestamp(),
    })
      .then(function (docRef) {
        console.log("Update document id: ", product.id);
      })
      .catch(function (error) {
        console.error("Error adding document: ", error);
      });
  }

  private async deleteProduct(product: any) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Xoá sản phẩm',
      message: 'Bạn có muốn xoá sản phẩm <strong>' + product.name + '</strong> không?',
      buttons: [
        {
          text: 'Xác nhận',
          handler: () => {
            updateDoc(doc(db, "orders", product.id), {
              status: 0,
              deletedAt: serverTimestamp()
            });
            updateDoc(doc(db, "orders", "numberOfDocs"), { count: increment(-1) });
          }
        }, {
          text: 'Huỷ',
          role: 'cancel',
          cssClass: 'secondary'
        }
      ]
    });

    await alert.present();
  }
}

