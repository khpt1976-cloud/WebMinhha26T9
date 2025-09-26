# 🔧 SỬA LỖI KHÔNG HIỂN THỊ SẢN PHẨM

## 📋 **MÔ TẢ VẤN ĐỀ**

**Triệu chứng:** 
- Website load được, API connection successful
- Nhưng trang category hiển thị "Không có sản phẩm nào"
- DevTools không báo lỗi CORS

**Nguyên nhân:** Frontend gọi sai API endpoints so với Backend

---

## 🔍 **PHƯƠNG PHÁP DEBUG SYSTEMATIC**

### **1. PHÂN TÍCH TRIỆU CHỨNG**
```
Triệu chứng: "Không có sản phẩm nào" trên trang category
↓
Nhưng DevTools hiển thị "API connection successful"
↓
Có nghĩa là: Frontend kết nối được backend, nhưng không lấy được dữ liệu
```

### **2. KIỂM TRA BACKEND TRƯỚC**
```bash
# Kiểm tra backend có dữ liệu không
curl -s https://work-2-huysglptbcssgdhx.prod-runtime.all-hands.dev/api/products
curl -s https://work-2-huysglptbcssgdhx.prod-runtime.all-hands.dev/api/categories
```
**Kết quả:** ✅ Backend có đầy đủ dữ liệu!

### **3. PHÂN TÍCH LUỒNG DỮ LIỆU**
```
Backend có data → Frontend không hiển thị
↓
Vấn đề ở giữa: API CALLS
```

### **4. TRACE CODE FRONTEND**
```typescript
// Xem CategoryPage.tsx gọi API như thế nào
const allProducts = await getProducts(); // ← Đây!
```

### **5. KIỂM TRA API SERVICE**
```typescript
// frontend/src/services/api.ts
async getProducts(): Promise<Product[]> {
  const response = await api.get('/api/v1/public/products/'); // ← SAI!
}
```

### **6. SO SÁNH VỚI BACKEND DOCS**
```
Frontend gọi: /api/v1/public/products/
Backend có:   /api/products
↓
MISMATCH! 🎯
```

---

## ✅ **CÁCH SỬA**

### **File cần sửa:** `frontend/src/services/api.ts`

### **1. Sửa endpoint getProducts:**
```typescript
// TỪ:
async getProducts(): Promise<Product[]> {
  const response = await api.get('/api/v1/public/products/');
  // ...
}

// THÀNH:
async getProducts(): Promise<Product[]> {
  const response = await api.get('/api/products');
  // Backend trả về dữ liệu với format khác, map lại cho frontend
  return products.map((product: any) => ({
    ...product,
    name: product.title || product.name || '',
    title: product.title || product.name || '',
    image: product.image || product.main_image_url || '',
    price: product.price || product.current_price?.toString() || '0',
    original_price: product.original_price || 0,
    rating: product.rating || product.rating_average || 0,
    category: product.category || product.category_name || ''
  }));
}
```

### **2. Sửa endpoint getCategories:**
```typescript
// TỪ:
async getCategories(): Promise<Category[]> {
  const response = await api.get('/api/v1/public/categories/');
  // ...
}

// THÀNH:
async getCategories(): Promise<Category[]> {
  const response = await api.get('/api/categories');
  const categories = response.data.categories || response.data.data || response.data;
  return categories;
}
```

### **3. Sửa endpoint getCategory:**
```typescript
// TỪ:
async getCategory(slug: string): Promise<Category> {
  const response = await api.get(`/api/v1/public/categories/${slug}/`);
  // ...
}

// THÀNH:
async getCategory(slug: string): Promise<Category> {
  const response = await api.get(`/api/categories/${slug}`);
  const category = response.data.data || response.data;
  return category;
}
```

### **4. Sửa endpoint searchProducts:**
```typescript
// TỪ:
async searchProducts(query: string): Promise<{query: string, results: Product[], total: number}> {
  const response = await api.get(`/api/v1/public/products/?search=${encodeURIComponent(query)}`);
  // ...
}

// THÀNH:
async searchProducts(query: string): Promise<{query: string, results: Product[], total: number}> {
  const response = await api.get(`/api/search?q=${encodeURIComponent(query)}`);
  // Backend trả về dữ liệu với format khác, map lại cho frontend
  const results = products.map((product: any) => ({
    ...product,
    name: product.title || product.name || '',
    title: product.title || product.name || '',
    image: product.image || product.main_image_url || '',
    price: product.price || product.current_price?.toString() || '0',
    original_price: product.original_price || 0,
    rating: product.rating || product.rating_average || 0,
    category: product.category || product.category_name || ''
  }));
  
  return {
    query,
    results,
    total: results.length
  };
}
```

---

## 🔄 **RESTART SERVICES**

Sau khi sửa xong, restart lại services:

```bash
cd /workspace/project/WebMinhha26T9
pkill -f "npm start"
sleep 3
nohup ./start_universal.sh > startup.log 2>&1 &
```

---

## 🧠 **TƯ DUY DEBUG**

### **Top-Down Approach:**
1. **Triệu chứng** → Phân tích nguyên nhân có thể
2. **Kiểm tra từng layer** → Backend → API → Frontend  
3. **Isolate vấn đề** → Tìm điểm đứt gãy
4. **Fix và verify** → Sửa và test lại

### **Tools sử dụng:**
- **Browser DevTools** → Xem API calls
- **curl** → Test backend trực tiếp
- **Code inspection** → Trace luồng dữ liệu  
- **API Documentation** → So sánh endpoints

### **Key Insight:**
> **"API connection successful" ≠ "Data loading successful"**
> 
> Connection thành công chỉ có nghĩa là HTTPS/CORS OK, nhưng có thể gọi sai endpoint!

---

## 📊 **BẢNG SO SÁNH ENDPOINTS**

| Chức năng | Frontend (Cũ) | Backend (Thực tế) | Frontend (Mới) |
|-----------|----------------|-------------------|----------------|
| Lấy sản phẩm | `/api/v1/public/products/` | `/api/products` | `/api/products` ✅ |
| Lấy danh mục | `/api/v1/public/categories/` | `/api/categories` | `/api/categories` ✅ |
| Lấy danh mục theo slug | `/api/v1/public/categories/{slug}/` | `/api/categories/{slug}` | `/api/categories/{slug}` ✅ |
| Tìm kiếm | `/api/v1/public/products/?search=` | `/api/search?q=` | `/api/search?q=` ✅ |

---

## ✅ **KẾT QUẢ**

Sau khi sửa:
- ✅ Trang category hiển thị đầy đủ sản phẩm
- ✅ Tất cả menu navigation hoạt động
- ✅ Tìm kiếm hoạt động
- ✅ Frontend-Backend connection hoàn toàn

**Website hoạt động 100%!** 🎉

---

## 📝 **GHI CHÚ**

- **Ngày sửa:** 26/09/2025
- **Vấn đề:** API endpoints mismatch
- **Giải pháp:** Cập nhật frontend API service
- **Thời gian debug:** ~30 phút
- **Phương pháp:** Systematic debugging approach

**Bài học:** Luôn kiểm tra API endpoints mapping giữa frontend và backend khi có vấn đề về dữ liệu!