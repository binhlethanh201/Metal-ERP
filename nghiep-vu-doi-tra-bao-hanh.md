# Nghiệp vụ Đổi trả - Bảo hành - NCC - Kho hàng - Bán hàng

## Tổng quan

Hệ thống Metal-ERP quản lý toàn bộ vòng đời sản phẩm từ nhập kho, bán hàng, đổi trả, bảo hành đến khi NCC trả hàng về. Mô hình tồn kho sử dụng **Tồn khả dụng bán (SellableQuantity)**:

```
SellableQuantity = AvailableStock - WarrantyQuantity
```

---

## 1. Mô hình dữ liệu

### 1.1 Bảng BranchProduct (tồn kho theo chi nhánh)
| Field | Mô tả |
|-------|-------|
| `ActualStock` | Tồn thực tế (hàng nằm trong kho) |
| `AvailableStock` | Tồn khả dụng (ActualStock - ReservedStock) |
| `WarrantyQuantity` | Số lượng đang giữ cho bảo hành (không được bán) |

### 1.2 Bảng ReturnOrder (phiếu đổi trả)
| Field | Mô tả |
|-------|-------|
| `ReturnType` | `REFUND` (trả hàng hoàn tiền) / `EXCHANGE` (đổi hàng bảo hành) |
| `ReturnCode` | Mã phiếu (RET-YYYYMMDD-NNNN) |
| `Status` | `Pending` -> `Completed` / `Cancelled` |

### 1.3 Bảng WarrantyTicket (phiếu bảo hành)
| Field | Mô tả |
|-------|-------|
| `ReturnItemId` | FK -> ReturnItem gốc |
| `BranchProductId` | FK -> BranchProduct |
| `ProductId` | FK -> Product |
| `Quantity` | SL bảo hành |
| `SupplierId` | NCC được chọn gửi bảo hành |
| `Status` | `PENDING_ASSIGN` -> `AWAITING_SUPPLIER` -> `COMPLETED` |

---

## 2. Luồng nghiệp vụ

### 2.1 Bán hàng (POS)
```
POS Screen -> Chọn SP -> Thêm vào giỏ -> Thanh toán
  -> FinalizeInvoice: AvailableStock -= SL, ActualStock -= SL
  -> SignalR "InvoiceFinalized" -> POS refresh products
```

### 2.2 Đổi trả hàng (POS Return)
```
POS ReturnForm:
  1. Nhập mã hóa đơn -> tìm invoice
  2. Chọn sản phẩm + SL + loại (REFUND/EXCHANGE)
  3. Tạo ReturnOrder -> thêm ReturnItem -> Finalize
```

#### 2.2a Trả hàng (REFUND)
```
FinalizeReturn (REFUND):
  -> AvailableStock += SL (hoàn kho)
  -> ActualStock += SL
  -> Ghi InventoryLedger (CUSTOMER_RETURN)
  -> Tạo RefundRecord nếu hoàn tiền mặt
```

#### 2.2b Đổi hàng bảo hành (EXCHANGE)
```
FinalizeReturn (EXCHANGE):
  -> AvailableStock KHÔNG ĐỔI (hàng vẫn nằm ở cửa hàng)
  -> ActualStock KHÔNG ĐỔI
  -> WarrantyQuantity += SL (tăng SL giữ bảo hành)
  -> Tạo WarrantyTicket (PENDING_ASSIGN)
  -> SignalR "StockUpdated" -> POS refresh -> SellableQuantity giảm
```

### 2.3 Quản lý bảo hành (Owner)

```
Owner Warranty History:
  -> Xem danh sách SP lỗi (từ EXCHANGE Completed)
  -> Tra cứu NCC (từ lịch sử nhập kho)
  -> Chọn NCC -> Gửi bảo hành -> Status -> AWAITING_SUPPLIER
  -> Xác nhận hàng về (ACP) -> Status -> COMPLETED
```

#### 2.3a Tra cứu NCC
```
GET /api/warranty/{productId}/suggested-suppliers
  -> Query StockTicketItems (PURCHASE, COMPLETED)
  -> Tính TotalSuppliedQuantity = SUM(ActualQuantity)
  -> Tính RemainingWarrantyQuantity = TotalSupplied - SUM(WarrantyTicket chưa COMPLETED)
  -> Trả về danh sách NCC kèm SL còn lại
```

#### 2.3b Gửi NCC
```
POST /api/warranty/{id}/assign-supplier
  -> Validate: SL bảo hành <= RemainingWarrantyQuantity của NCC
  -> Nếu vượt -> lỗi: "SL bảo hành (X) vượt quá SL NCC này có thể nhận (Y)"
  -> Status: PENDING_ASSIGN -> AWAITING_SUPPLIER
```

#### 2.3c Xác nhận ACP
```
POST /api/warranty/{id}/accept
  -> WarrantyQuantity -= SL (giải phóng tồn)
  -> Status: AWAITING_SUPPLIER -> COMPLETED
  -> Ghi InventoryLedger (WARRANTY_ACP)
  -> SignalR "StockUpdated" -> POS refresh -> SellableQuantity khôi phục
```

### 2.4 Đơn cũ (chưa có WarrantyTicket)
```
POST /api/warranty/init/{returnItemId}
  -> Tạo WarrantyTicket từ ReturnItem cũ
  -> WarrantyQuantity += SL (bù lại phần chưa tính)
  -> Status: PENDING_ASSIGN
```

---

## 3. Tác động đến tồn kho

| Hành động | AvailableStock | ActualStock | WarrantyQuantity | SellableQuantity |
|-----------|---------------|-------------|------------------|-----------------|
| Nhập kho | +SL | +SL | 0 | +SL |
| Bán hàng | -SL | -SL | 0 | -SL |
| Trả hàng (REFUND) | +SL | +SL | 0 | +SL |
| Đổi hàng (EXCHANGE) | **Không đổi** | **Không đổi** | +SL | -SL |
| Gửi NCC bảo hành | Không đổi | Không đổi | Không đổi | Không đổi |
| ACP bảo hành | Không đổi | Không đổi | -SL | +SL |

---

## 4. SignalR Events

| Event | Phát từ | Nhận bởi | Payload |
|-------|---------|----------|---------|
| `InvoiceFinalized` | InvoicesController | POSScreen | `{ invoiceId, ... }` |
| `StockUpdated` | ReturnsController (EXCHANGE) / WarrantyController (ACP) | POSScreen | `{ ProductId, BranchId, NewSellableQuantity, WarrantyQuantity }` |

---

## 5. API Endpoints

### 5.1 Đổi trả
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/pos/returns` | Danh sách phiếu đổi trả |
| POST | `/api/pos/returns` | Tạo phiếu đổi trả |
| GET | `/api/pos/returns/{id}` | Chi tiết phiếu |
| POST | `/api/pos/returns/{id}/items` | Thêm SP vào phiếu |
| POST | `/api/pos/returns/{id}/finalize` | Hoàn tất (cập nhật tồn + tạo WarrantyTicket) |
| PATCH | `/api/pos/returns/{id}/cancel` | Hủy phiếu |
| GET | `/api/pos/returns/defective-items` | Danh sách SP lỗi (EXCHANGE Completed) |

### 5.2 Bảo hành
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/warranty/{productId}/suggested-suppliers` | Gợi ý NCC + SL còn lại |
| POST | `/api/warranty/init/{returnItemId}` | Khởi tạo WarrantyTicket cho đơn cũ |
| POST | `/api/warranty/{id}/assign-supplier` | Gửi bảo hành cho NCC (có validate SL) |
| POST | `/api/warranty/{id}/accept` | Xác nhận hàng về (ACP) |

### 5.3 POS Sản phẩm
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/pos/products` | Danh sách SP (có `WarrantyQuantity`, `SellableQuantity`) |

---

## 6. Vòng đời WarrantyTicket

```
                    ┌──────────────────┐
                    │  PENDING_ASSIGN  │  Chờ phân công NCC
                    │  (vàng)          │
                    └────────┬─────────┘
                             │
                    Owner chọn NCC + Gửi
                    (validate SL <= Remaining)
                             │
                             ▼
                    ┌──────────────────┐
                    │ AWAITING_SUPPLIER│  Chờ hàng về
                    │ (xanh dương)     │
                    └────────┬─────────┘
                             │
                    Owner bấm ACP
                    (WarrantyQuantity -= SL)
                             │
                             ▼
                    ┌──────────────────┐
                    │    COMPLETED     │  Hoàn tất
                    │ (xanh lá)        │
                    └──────────────────┘
```

---

## 7. File liên quan

### Frontend (Metal-ERP)
| File | Vai trò |
|------|---------|
| `src/modules/pos/pages/POSScreen.jsx` | Màn hình bán hàng, SignalR listener, mapToPosProduct |
| `src/modules/pos/hooks/usePosProductList.js` | Fetch + normalize sản phẩm POS (đè availableStock = sellable) |
| `src/modules/pos/hooks/usePosCart.js` | Giỏ hàng, validate stock |
| `src/modules/pos/components/product/ProductCard.jsx` | Thẻ SP, hiển thị stock |
| `src/modules/pos/components/return/ReturnForm.jsx` | Form tạo đơn đổi trả |
| `src/modules/pos/components/return/ReturnDetail.jsx` | Chi tiết đơn đổi trả, nút finalize |
| `src/modules/pos/pages/ReturnOrderPage.jsx` | Trang danh sách đơn đổi trả |
| `src/modules/pos/services/posService.js` | API service POS |
| `src/modules/owner/pages/OwnerWarrantyHistory.jsx` | Trang quản lý bảo hành (Owner) |
| `src/modules/owner/hooks/useOwnerWarrantyHistory.js` | Hook bảo hành (state, handlers) |
| `src/modules/owner/services/ownerWarrantyService.js` | API service bảo hành |
| `src/modules/inventory/utils/productUtils.js` | normalizeProduct (kho) |

### Backend (MEP_Management_System)
| File | Vai trò |
|------|---------|
| `Controllers/SaleController/ReturnsController.cs` | API đổi trả, FinalizeReturn tạo WarrantyTicket |
| `Controllers/SaleController/WarrantyController.cs` | API bảo hành (suggested-suppliers, assign, accept, init) |
| `Controllers/SaleController/ProductsController.cs` | API SP POS (trả về WarrantyQuantity) |
| `Controllers/InventoryController/ProductsController.cs` | API SP kho (trả về WarrantyQuantity) |
| `Models/BranchProduct.cs` | Model tồn kho (có WarrantyQuantity) |
| `Models/WarrantyTicket.cs` | Model phiếu bảo hành |
| `Models/ReturnItem.cs` | Model dòng đổi trả (FK -> WarrantyTicket) |
| `Models/ReturnOrder.cs` | Model phiếu đổi trả |
| `Models/MEPDatabaseContext.cs` | DbContext + Fluent API config |
| `DTOs/SaleDTOs/ProductPriceDto.cs` | DTO SP POS (SellableQuantity computed) |
| `DTOs/SaleDTOs/DefectiveItemDto.cs` | DTO SP lỗi (kèm warranty info) |
| `DTOs/SaleDTOs/WarrantyDtos.cs` | DTO bảo hành (SuggestedSupplier, AssignRequest) |
| `DTOs/InventoryDTOs/ProductDto.cs` | DTO SP kho (WarrantyQuantity, SellableQuantity) |
| `AutoMapper/SaleMapper/SaleMappingProfile.cs` | Mapping WarrantyTicket |
| `Hubs/PosHub.cs` | SignalR hub cho POS |