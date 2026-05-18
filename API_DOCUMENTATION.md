# Dokumentasi API - ABG Konveksi

Dokumentasi ini berisi daftar endpoint API yang tersedia pada aplikasi ABG Konveksi beserta detail method, request, dan response yang diharapkan.

Semua endpoint berbasis di bawah `/api`.

---

## 1. Authentication (`/api/auth`)

### 1.1 Login
- **URL:** `/api/auth`
- **Method:** `POST`
- **Deskripsi:** Melakukan proses autentikasi user.
- **Request Body (JSON):**
  ```json
  {
    "username": "admin",
    "password": "password123"
  }
  ```
- **Response Sukses (200 OK):**
  ```json
  {
    "message": "Login berhasil",
    "data": {
      "id": 1,
      "username": "admin",
      "role": "ADMIN"
    }
  }
  ```
- **Response Gagal (400/401):** Username/password salah atau tidak diisi.

### 1.2 Get Current Session
- **URL:** `/api/auth` atau `/api/auth/me`
- **Method:** `GET`
- **Deskripsi:** Mengambil data session user yang sedang login.
- **Response Sukses (200 OK):**
  ```json
  {
    "data": {
      "userId": 1,
      "username": "admin",
      "role": "ADMIN"
    }
  }
  ```
- **Response Gagal (401 Unauthorized):** Jika belum login.

### 1.3 Logout
- **URL:** `/api/auth`
- **Method:** `DELETE`
- **Deskripsi:** Menghapus session saat ini (logout).
- **Response Sukses (200 OK):**
  ```json
  {
    "message": "Logout berhasil"
  }
  ```

---

## 2. User Management (`/api/user`)

Membutuhkan otorisasi dengan role **ADMIN**.

### 2.1 Create User
- **URL:** `/api/user`
- **Method:** `POST`
- **Deskripsi:** Membuat akun KASIR atau ADMIN baru.
- **Request Body (JSON):**
  ```json
  {
    "username": "kasir1",
    "password": "password123",
    "role": "KASIR" // atau "ADMIN"
  }
  ```
- **Response Sukses (201 Created):**
  ```json
  {
    "message": "Akun berhasil dibuat",
    "data": {
      "id": 2,
      "username": "kasir1",
      "role": "KASIR"
    }
  }
  ```

### 2.2 Get All Users
- **URL:** `/api/user`
- **Method:** `GET`
- **Deskripsi:** Mengambil daftar semua user.
- **Response Sukses (200 OK):**
  ```json
  {
    "data": [
      {
        "id": 1,
        "username": "admin",
        "role": "ADMIN",
        "createdAt": "2023-01-01T00:00:00.000Z"
      }
    ]
  }
  ```

---

## 3. Order Management (`/api/order`)

Membutuhkan otorisasi dengan role **ADMIN** atau **KASIR**.

### 3.1 Create Order
- **URL:** `/api/order`
- **Method:** `POST`
- **Deskripsi:** Membuat order baru (termasuk pembuatan data alamat/guest customer secara otomatis jika belum ada). Akan mengembalikan link Midtrans jika metode pembayaran menggunakan TRANSFER.
- **Request Body (JSON):**
  ```json
  {
    "items": [
      {
        "variantId": 1,
        "quantity": 2,
        "price": 50000
      }
    ],
    "customerId": 1, // Opsional
    "addressId": 1, // Opsional
    "newAddress": "Jl. Mawar No. 2", // Opsional, jika addressId tidak diisi
    "addressLabel": "Rumah", // Opsional
    "latitude": -6.200000, // Opsional
    "longitude": 106.816666, // Opsional
    "note": "Catatan tambahan", // Opsional
    "total": 100000,
    "paymentMethod": "CASH", // CASH, TRANSFER, atau COD
    "amountPaid": 100000, // Opsional
    "proofOfPayment": "url_gambar" // Opsional, untuk TRANSFER
  }
  ```
- **Response Sukses (201 Created):**
  ```json
  {
    "message": "Order created successfully",
    "data": {
      // Data order, customer, address, payment
      "midtrans": {
        "token": "midtrans_token",
        "redirect_url": "https://app.sandbox.midtrans.com/snap/v2/vtweb/..."
      }
    }
  }
  ```

### 3.2 Get All Orders
- **URL:** `/api/order`
- **Method:** `GET`
- **Deskripsi:** Mengambil daftar semua order dengan urutan terbaru di atas.
- **Response Sukses (200 OK):** Menampilkan array data orders yang berisi detail order, customer, address, dan list items.

### 3.3 Get Order by ID
- **URL:** `/api/order/[id]`
- **Method:** `GET`
- **Deskripsi:** Mengambil detail order tertentu berdasarkan ID.

### 3.4 Update Order
- **URL:** `/api/order/[id]`
- **Method:** `PUT`
- **Deskripsi:** Mengupdate status order atau catatan.
- **Request Body (JSON):**
  ```json
  {
    "status": "PROCESSING",
    "note": "Diproses secepatnya"
  }
  ```

### 3.5 Delete Order
- **URL:** `/api/order/[id]`
- **Method:** `DELETE`
- **Deskripsi:** Menghapus order berdasarkan ID.

---

## 4. Payment (`/api/payment/hook`)

### 4.1 Midtrans Webhook (Notification)
- **URL:** `/api/payment/hook`
- **Method:** `POST`
- **Deskripsi:** Endpoint khusus untuk menerima notifikasi status pembayaran dari Midtrans (Webhook).
- **Request Body:** Berasal dari Midtrans notification payload (`order_id`, `transaction_status`, `fraud_status`, `status_code`, `gross_amount`, `signature_key`, dll).

---

## 5. Product Management (`/api/product`)

### 5.1 Get All Products
- **URL:** `/api/product`
- **Method:** `GET`
- **Deskripsi:** Mengambil semua produk yang tersedia.

### 5.2 Create Product
- **URL:** `/api/product`
- **Method:** `POST`
- **Deskripsi:** Membuat produk baru. Format request disesuaikan dengan `productService`.

### 5.3 Get, Update, Delete Product by ID
- **URL:** `/api/product/[id]`
- **Method:** `GET` | `PUT` | `DELETE`
- **Deskripsi:** Berfungsi untuk mengambil, mengubah, atau menghapus produk berdasarkan ID.

---

## 6. Product Category (`/api/product/category`)

### 6.1 Get All Categories
- **URL:** `/api/product/category`
- **Method:** `GET`
- **Deskripsi:** Mengambil semua daftar kategori produk.

### 6.2 Create Category
- **URL:** `/api/product/category`
- **Method:** `POST`
- **Request Body (JSON):**
  ```json
  {
    "name": "Kemeja"
  }
  ```

### 6.3 Get, Update, Delete Category by ID
- **URL:** `/api/product/category/[id]`
- **Method:** `GET` | `PUT` | `DELETE`

---

## 7. Product Size (`/api/product/size`)

### 7.1 Get All Sizes
- **URL:** `/api/product/size`
- **Method:** `GET`
- **Deskripsi:** Mengambil semua ukuran (size) produk.

### 7.2 Create Size
- **URL:** `/api/product/size`
- **Method:** `POST`
- **Request Body (JSON):**
  ```json
  {
    "name": "XL"
  }
  ```

### 7.3 Get, Update, Delete Size by ID
- **URL:** `/api/product/size/[id]`
- **Method:** `GET` | `PUT` | `DELETE`
