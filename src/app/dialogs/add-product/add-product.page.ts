import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { serverTimestamp } from '@firebase/firestore';
import { ModalController } from '@ionic/angular';
import { getDownloadURL, ref, updateMetadata, uploadBytes } from 'firebase/storage';
import { categories } from 'src/app/app.component';
import { storage } from 'src/app/app.module';
import { Product } from 'src/app/models/product';
import imageCompression from 'browser-image-compression';
import { getProductImage } from 'src/app/utils/firestore-util';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.page.html',
  styleUrls: ['./add-product.page.scss'],
})
export class AddProductPage implements OnInit {

  static readonly DEFAULT_IMAGE = "../../assets/images/img_no_image.jpeg";

  @Input() id: String = "";
  @Input() code: String = "";
  @Input() name: String = "";
  @Input() price: number = 0;
  @Input() quantity: number = 0;
  @Input() brand: String = "";
  @Input() categoryId: number = -1;
  @Input() size: String = "";
  @Input() color: String = "";
  @Input() image: String = "";
  @Input() imageUrl: any = AddProductPage.DEFAULT_IMAGE;
  @Input() insertedDate: String = new Date().toISOString();
  imageBlob: any;
  loading: any;

  categories = [];

  constructor(
    public modalController: ModalController,
    private sanitizer: DomSanitizer,
    public loadingController: LoadingController
  ) { }

  ngOnInit() {
    this.categories = categories;
    this.imageUrl = this.image ? getProductImage(this.image) : AddProductPage.DEFAULT_IMAGE;
  }

  compareSelection(a: any, b: any) {
    return a == b;
  }

  onImageChange(event: any) {
    if (event.target.value === "") {
      this.imageUrl = AddProductPage.DEFAULT_IMAGE;
    }
  }

  validateNumber(event: any, value: any) {
    if (!Number.isInteger(event.target.value)) {
      value = "";
    }
  }

  onPaste(event: any) {
    let _this = this;
    if (event.clipboardData.getData('text') && event.clipboardData.getData('text') != "") {
      this.imageUrl = event.clipboardData.getData('text');
      fetch(this.imageUrl)
        .then(function (response) {
          return response.blob();
        })
        .then(function (blob) {
          _this.imageBlob = blob;
          _this.image = _this.generateImageName();
        });
      return
    }
    if (event.clipboardData || event.originalEvent.clipboardData) {
      const items = (event.clipboardData || event.originalEvent.clipboardData).items;
      for (const item of items) {
        if (item.type.indexOf('image') === 0) {
          this.imageBlob = item.getAsFile();
          let objectURL = URL.createObjectURL(this.imageBlob);
          this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
          this.image = this.generateImageName();
        }
      }
      return
    }
    this.imageUrl = AddProductPage.DEFAULT_IMAGE;
  }

  onSelectedDate(event: any) {
    if (event) {
      this.insertedDate = new Date(event).toISOString();
    }
  }

  async save() {
    this.loading = await this.loadingController.create();
    this.loading.present();
    
    if (this.image) {
      this.updaloadImage();
    }
  }

  addproduct() {
    let product = new Product(
      this.id,
      this.code,
      this.name,
      this.price,
      this.quantity,
      this.categoryId,
      this.brand,
      this.image,
      this.color,
      this.size,
      1,
      serverTimestamp(),
      this.insertedDate
    )
    this.modalController.dismiss(product);
    this.loading.dismiss();
  }

  generateImageName() {
    return new Date().getTime() + ".jpg";
  }

  updaloadImage() {
    let _this = this;
    const resizeOptions = {
      maxSizeMB: 1,
      maxWidthOrHeight: 400,
      useWebWorker: true
    }
    imageCompression(this.imageBlob, resizeOptions)
      .then(function (compressedBlob) {
        let storageRef = ref(storage, "images/products/" + _this.image);
        uploadBytes(storageRef, compressedBlob).then(() => {
          const newMetadata = {
            cacheControl: "public,max-age=3600",
            contentType: "image/jpg"
          };
          updateMetadata(storageRef, newMetadata)
            .then(() => {
              _this.addproduct();
            }).catch((error) => {
              _this.loading.dismiss();
              console.log(error.message);
            });
        });
      })
      .catch(function (error) {
        _this.loading.dismiss();
        console.log(error.message);
      });
  }
}
