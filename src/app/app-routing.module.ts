import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: () => import('./screens/home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'orders',
    loadChildren: () => import('./screens/orders/orders.module').then( m => m.OrdersPageModule)
  },
  {
    path: 'products',
    loadChildren: () => import('./screens/products/products.module').then( m => m.ProductsPageModule)
  },
  {
    path: 'add-product',
    loadChildren: () => import('./dialogs/add-product/add-product.module').then( m => m.AddProductPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
