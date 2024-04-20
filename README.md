## E-commerce pet-project.
**Tech Stack:**
- **React, Next.js, TypeScript**
- **Zustand**
- **react-hook-form & Zod**
- **Tailwind, Headless UI, ShadCN (built on top of Tailwind, Chakra UI)**
- **Prisma (PostgreSQL)**
- **Clerk, Neon, Cloudinary, Stripe**

**Features:**
- **Dashboard as CMS, Admin, API and E-commerce Store(-s).**
- **Main store page (Client).**

![alt main-page](https://i.ibb.co/yy7pjx7/image.png)
- **Multiple Store management (Admin).**
  
![alt multiple-store](https://i.ibb.co/mN5hJtK/image.png)
  
- **Billboards, Categories, Sizes, Colors, Products management.**
  
![alt product-creating](https://i.ibb.co/grSdMrS/image.png)
- **Which results in:**
  
![alt product-creating-filled](https://i.ibb.co/p2CwHB8/image.png)
- **Uploading and storing images via Cloudinary.**

![alt image-uploading-via-cloudinary](https://i.ibb.co/bgf9cD7/image.png)
- **Uploaded products are displayed both on the admin and client side.**
- **Admin side, including search and pagination, id copying, editing and deleting:**
- **Products preview.**
  
![alt products-preview](https://i.ibb.co/JcFBBrG/image.png)
- **Actions.**
  
![alt actions](https://i.ibb.co/fr0Sxkn/image.png)
- **Can also be accessed via public/private API.**
  
![alt api](https://i.ibb.co/QPJs16V/image.png)
- **Client side, including filtering, product preview popup and adding to the cart:**
- **All products preview.**

![alt products-preview](https://i.ibb.co/Xy1PsYQ/image.png)
- **Clicked product preview popup.**
  
![alt product-preview-popup](https://i.ibb.co/nmdXG1v/image.png)
- **Products in the cart.**
  
![alt cart](https://i.ibb.co/Jyb7xys/image.png)
- **Product page.**

![alt product-page](https://i.ibb.co/GVB4kTW/image.png)
- **Cart page.**

![alt cart-page](https://i.ibb.co/sjSQJ92/image.png)
- **Stripe's checkout page.**

![alt checkout-page](https://i.ibb.co/6N9Wnw1/image.png)
- **Success/Error toasts by react-hot-toast.**

![alt toast](https://i.ibb.co/zS6wr8F/image.png)
- **The order is displayed afterwards (Admin).**

![alt placed-order](https://i.ibb.co/2hy62T5/image.png)
- **Sales Analytics and Revenue Graphs via recharts.**

![alt overview](https://i.ibb.co/0Y7HJ3x/overview-page.png)
- **Dark mode.**
  
![alt dark-mode](https://i.ibb.co/LY7pRWk/image.png)
- **Authentication via Clerk.**

![alt clerk](https://i.ibb.co/vxsmJFD/image.png)
![alt clerk](https://i.ibb.co/TcK9yVk/image.png)
- **User management via Clerk.**
  
![alt clerk](https://i.ibb.co/tMs0j2t/image.png)
- **Serverless DB management via Neon.**

![alt neon](https://i.ibb.co/VNQskJf/image.png)

## Setup .env file

```js
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

DATABASE_URL=''
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=""
STRIPE_API_KEY=
FRONTEND_STORE_URL=
STRIPE_WEBHOOK_SECRET=
```

## Connect to Neon and Push Prisma

```shell
npx prisma generate
npx prisma db push
```

## Start the app

```shell
npm run dev
```

## Test Stripe payments
use [Stripe Testing Cards](https://stripe.com/docs/testing)