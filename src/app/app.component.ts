import { query, collection, orderBy, getDocs } from "firebase/firestore";
import { Component, OnInit } from '@angular/core';
import { db } from "src/app/app.module"
import { Category } from "./models/category";

export let categories = [];

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  public appPages = [
    { title: 'Trang chính', url: '/home', icon: 'home' },
    { title: 'Quản lý xuất', url: '/orders', icon: 'bag-handle' },
    { title: 'Quản lý nhập', url: '/products', icon: 'archive' },
    { title: 'Quản lý khách hàng', url: '/folder/Archived', icon: 'people-circle' },
    { title: 'Thống kê', url: '/folder/Trash', icon: 'stats-chart' },
  ];
  public labels = [];

  constructor() {}
  
  ngOnInit() {
    this.getCategories();
  }

  async getCategories() {
    categories = [];
    const q = query(
      collection(db, "categories"),
      orderBy("order", "asc")
    );
    const querySnapshot = await getDocs(q)
    querySnapshot.forEach((doc) => {
      categories.push(
        new Category(
          doc.id,
          doc.data().type,
          doc.data().order
        )
      );
    });
  }
}
