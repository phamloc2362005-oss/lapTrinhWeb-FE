# Phân Tích Front-End – FindJobs (lapTrinhWeb-FE)

> Tài liệu này phân tích toàn bộ phần front-end của repo `phamloc2362005-oss/lapTrinhWeb-FE`,
> giúp chuẩn bị vấn đáp về kiến trúc, luồng dữ liệu, màn hình/chức năng và các pattern kỹ thuật.

---

## 1. Framework, cách chạy, build config

- **Stack chính**: React 18 + TypeScript + Vite 4, React Router v6, Redux Toolkit, Ant Design/Pro
  (`package.json:14-50`)
- **Scripts**:
  | Script | Lệnh |
  |--------|------|
  | Dev    | `npm run dev` hoặc `npm run start` |
  | Build  | `npm run build` = `tsc && vite build` |
  | Preview| `npm run preview` |
  (`package.json:8-13`)
- **Vite config** (`vite.config.ts`):
  - Plugin React SWC (`:18-21`)
  - Port lấy từ env `PORT` (`:22-24`)
  - Path alias: `@`, `components`, `styles`, `config`, `pages` (`:25-33`)
- **Biến môi trường quan trọng**:
  - `VITE_BACKEND_URL` – URL backend API (`.env.development:3`, `.env.production:3`)
  - `VITE_ACL_ENABLE` – bật/tắt kiểm tra ACL chi tiết (`.env.development:4`)
- **TypeScript** – path alias đồng bộ với Vite (`tsconfig.json:22-39`).

---

## 2. Kiến trúc thư mục

```
src/
├── App.tsx                  # Router + bootstrap app
├── main.tsx                 # Entry, bọc Redux/ConfigProvider
├── pages/
│   ├── auth/                # login, register, forgot-password
│   ├── home/                # Trang chủ hero + search
│   ├── job/                 # Danh sách & chi tiết việc làm
│   ├── company/             # Danh sách & chi tiết công ty
│   ├── skills/              # Danh sách kỹ năng → filter job
│   └── admin/               # CRUD: company, user, job, skill, resume, permission, role
├── components/
│   ├── client/              # Header, Footer, Search, Cards, Modals, Mega-menu
│   ├── admin/               # Layout admin, modal CRUD, role-permission matrix, job upsert
│   └── share/               # ProtectedRoute, Access (ACL), Loading, NotFound, LayoutApp
├── config/
│   ├── api.ts               # Tất cả hàm gọi API
│   ├── axios-customize.ts   # Axios instance + interceptors + refresh token
│   ├── permissions.ts       # Hằng số ACL (tên module, action)
│   └── utils.ts             # Helpers (convertSlug, LOCATION_LIST, colorMethod…)
├── redux/
│   ├── store.ts
│   ├── hooks.ts             # useAppDispatch / useAppSelector
│   └── slice/               # account, company, user, job, resume, permission, role, skill
├── styles/
│   ├── app.module.scss      # Global reset nhẹ
│   ├── client.module.scss   # Client pages/components
│   ├── admin.module.scss    # Admin layout/tables
│   ├── auth.module.scss     # Login/Register
│   └── reset.scss           # Override Ant Design / Quill
└── types/
    └── backend.d.ts         # TypeScript interfaces toàn project
```

**Ghi chú:** Không có thư mục `src/hooks` riêng; typed Redux hooks tập trung trong
`redux/hooks.ts`.

---

## 3. Routes / Pages

### 3.1 Public routes

| Path | Component | Ghi chú |
|------|-----------|---------|
| `/` | `pages/home/index.tsx` | Hero + search + cards |
| `/job` | `pages/job/index.tsx` | Danh sách, filter URL |
| `/job/:slug?id=` | `pages/job/detail.tsx` | Chi tiết, nút Apply |
| `/company` | `pages/company/index.tsx` | Danh sách công ty |
| `/company/:slug?id=` | `pages/company/detail.tsx` | Chi tiết + job của công ty |
| `/skills` | `pages/skills/index.tsx` | Grid tất cả skill |
| `/login` | `pages/auth/login.tsx` | |
| `/register` | `pages/auth/register.tsx` | |
| `/forgot-password` | `pages/auth/forgot-password.tsx` | |

(`App.tsx:75-167`)

### 3.2 Admin routes (bọc ProtectedRoute)

| Path | Component |
|------|-----------|
| `/admin` | `components/admin/layout.admin.tsx` |
| `/admin/company` | `pages/admin/company.tsx` |
| `/admin/user` | `pages/admin/user.tsx` |
| `/admin/job` | `pages/admin/job/job.tabs.tsx` |
| `/admin/job/upsert` | `components/admin/job/upsert.job.tsx` |
| `/admin/resume` | `pages/admin/resume.tsx` |
| `/admin/permission` | `pages/admin/permission.tsx` |
| `/admin/role` | `pages/admin/role.tsx` |

---

## 4. State Management (Redux Toolkit)

Store đăng ký 8 slice (`redux/store.ts:15-25`):

| Slice | File | Mô tả |
|-------|------|-------|
| `account` | `accountSlide.ts` | Auth state, user, permissions, isLoading, refreshToken flag |
| `company` | `companySlide.ts` | Danh sách công ty (admin) |
| `user` | `userSlide.ts` | Danh sách user (admin) |
| `job` | `jobSlide.ts` | Danh sách job (admin) |
| `resume` | `resumeSlide.ts` | Danh sách resume (admin) |
| `permission` | `permissionSlide.ts` | Danh sách permission |
| `role` | `roleSlide.ts` | Danh sách role + singleRole chi tiết |
| `skill` | `skillSlide.ts` | Danh sách skill |

**Pattern thống nhất** ở mỗi slice:
- `createAsyncThunk` gọi hàm API từ `config/api.ts`
- 3 case: `pending → isFetching=true`, `rejected → isFetching=false`, `fulfilled → set meta/result`

**accountSlide** đặc biệt hơn, quản lý:
- `isAuthenticated`, `isLoading` (global spinner)
- `user.role.permissions[]` (danh sách quyền chi tiết)
- `userLoginSuccess`, `setLogoutAction`, `setUserLoginInfo`
- `fetchAccount()` thunk gọi khi app mount để phục hồi session

---

## 5. Luồng dữ liệu chính

### 5.1 API layer

- Toàn bộ hàm gọi API tập trung tại `src/config/api.ts` (`api.ts:8-272`).
- Chia module: Auth, Company, Skill, User, Job, Resume, Permission, Role, Subscribers.
- Không dùng RTK Query hay SWR; UI components gọi trực tiếp `callXxx(...)`.

### 5.2 Axios + Token

**`src/config/axios-customize.ts`**:

```
instance = axios.create({
  baseURL: VITE_BACKEND_URL,
  withCredentials: true      ← gửi refresh cookie
})

Request interceptor:
  → đọc localStorage('access_token') → gắn Authorization header

Response interceptor:
  → 401 (không phải login):
      ├─ dùng mutex (axiosMutex) chống refresh song song
      ├─ gọi GET /api/v1/auth/refresh (cookie-based)
      ├─ lưu access_token mới vào localStorage
      ├─ retry request gốc (header x-no-retry=true)
      └─ fail (400) → dispatch onRefreshTokenError ở admin
  → 403 → notification.error "Bạn không có quyền..."
```

(`axios-customize.ts:15-79`)

### 5.3 Auth flow

```
Login:
  callLogin() → { access_token, user }
  → localStorage.setItem('access_token', ...)
  → dispatch(setUserLoginInfo(user))
  → navigate(callback || '/')

App mount (App.tsx:66-73):
  if (!login && !register) → dispatch(fetchAccount())
    → GET /api/v1/auth/account
    → cập nhật Redux user + permissions

Logout:
  callLogout() → dispatch(setLogoutAction())
    → localStorage.removeItem('access_token')
    → reset user state → navigate('/')
```

(`login.tsx:30-50`, `App.tsx:62-73`, `accountSlide.ts:77-90`)

### 5.4 Route Protection

```
<ProtectedRoute>
  isLoading → <Loading /> (HashLoader)
  !isAuthenticated → <Navigate to="/login" />
  authenticated → <RoleBaseRoute>
                    role === 'NORMAL_USER' → <NotPermitted />
                    else → render children
```

(`protected-route.ts/index.tsx:8-39`)

### 5.5 ACL chi tiết

Component `<Access hideChildren permission={{apiPath, method, module}}>`:
- Tìm permission khớp trong `user.role.permissions`
- `allow=true` → render children; `false` + `hideChildren=false` → `<NotPermitted />`
- `VITE_ACL_ENABLE=false` → bypass, allow tất cả

(`access.tsx:16-55`)

---

## 6. Màn hình / Chức năng chính

### 6.1 Client – Search & Filter

**SearchClient** (`components/client/search.client.tsx`):
- Chọn skills (multi-select, gọi API `/skills`) + location (LOCATION_LIST cố định)
- Submit → navigate `/job?skills=...&location=...`
- Sync form state từ URL query params khi mount

**JobCard** (`components/client/card/job.card.tsx`):
- Đọc query params `location/skills/expertise/level`
- Build spring-filter query (`sfIn(...)`) → `callFetchPublicJob(query)`
- Phân trang, sort theo `updatedAt desc`
- Click → navigate `/job/{slug}?id={id}`

**JobMegaMenu** (`components/client/job/job-mega-menu.tsx`):
- Dropdown hover từ Header, có 4 nhóm: kỹ năng, cấp bậc, công ty, thành phố
- Mỗi link build query URL tương ứng

### 6.2 Client – Job Detail

**`pages/job/detail.tsx`**:
- Lấy `id` từ `?id=` query string, gọi `callFetchJobById(id)`
- Hiển thị `Tag` skills, meta (lương, địa điểm, level, số lượng)
- Sidebar: thông tin công ty + similar jobs
- Nút "Ứng tuyển" → `<ApplyModal />`

**ApplyModal** (`components/client/modal/apply.modal.tsx`):
- Chưa đăng nhập → redirect `/login?callback=...`
- Đã đăng nhập → upload CV (PDF/DOC < 5MB) → `callUploadSingleFile()` → lấy `fileName`
  → `callCreateResume(url, jobId, email, userId)`

### 6.3 Client – Manage Account

**ManageAccount** (`components/client/modal/manage.account.tsx`) có 4 tab:
| Tab | Chức năng |
|-----|-----------|
| Rải CV | Xem danh sách CV đã nộp, link xem file |
| Nhận Jobs qua Email | Subscribe job theo skill (tạo/cập nhật Subscribers) |
| Cập nhật thông tin | Placeholder (chưa implement) |
| Thay đổi mật khẩu | Form đổi mật khẩu với validate confirm |

### 6.4 Admin – CRUD pattern

Mỗi entity admin (Company/User/Job/Skill/Resume/Permission/Role) theo cùng pattern:
1. **ProTable** với ProSearch toolbar (`antd/pro-components`)
2. Redux thunk fetch khi mount hoặc sau CUD
3. Button "Thêm mới" → mở modal create; icon sửa/xóa trên từng row
4. Modal/form AntD Pro (`ModalForm`) với `dataInit` null = create, có id = update
5. Sau submit thành công: `message.success`, `reloadTable()`, đóng modal
6. Xóa: `Popconfirm` → `callDelete...()` → `message.success`

**Đặc biệt:**
- Job: form upsert dài trên full page (không dùng Modal), có ReactQuill cho description/required/benefit (`upsert.job.tsx:38-442`)
- Role: có `ModuleApi` component matrix toggle permission theo module/method (`module.api.tsx:26-153`)
- Resume: chỉ xem + thay đổi status (PENDING/REVIEWING/APPROVED/REJECTED) (`view.resume.tsx:20-38`)

---

## 7. Cấu trúc Styling SCSS

| File | Scope | Biến/ghi chú |
|------|-------|-------------|
| `app.module.scss` | Global reset nhẹ | Không có biến (import bị comment) |
| `client.module.scss` | Toàn bộ client | Không có biến, màu hard-code trực tiếp |
| `admin.module.scss` | Admin layout | Có `$admin-primary, $admin-page-bg, $admin-border, $admin-text, $admin-text-muted` |
| `auth.module.scss` | Login/Register | Có `$color-white/black/light/blue/gray`, `$shadow-normal/medium/large` |
| `reset.scss` | Override global | Override Ant Design/Quill `.ql-editor`, `.ant-menu-horizontal`, v.v. |

**Điểm chú ý:**
- `client.module.scss` dùng `:global(...)` để override class Ant Design (`client.module.scss:281-292`)
- Responsive breakpoints viết trực tiếp trong module file (không có mixin riêng)
- Không có file `variables.scss` dùng chung toàn project; các biến chỉ ở cục bộ từng module

---

## 8. Các Pattern Quan Trọng

### 8.1 Form Handling / Validation

- AntD `Form` + ProForm, validation bằng `rules` array
- Custom validator: confirm password (`forgot-password.tsx:173-187`), rich text not empty (`upsert.job.tsx:407-427`)
- ProForm submit qua `onFinish`, `form.resetFields()` sau khi xong
- Debounced search select (`DebounceSelect`) cho chọn công ty/role (`debouce.select.tsx:12-64`)

### 8.2 Error Handling

| Cấp độ | Cách xử lý |
|--------|-----------|
| API error (400/409) | `if (!res.data) notification.error({...res.message})` |
| 401 | axios interceptor auto-retry refresh token |
| 403 | axios interceptor `notification.error('Bạn không có quyền')` |
| Validation | AntD form validation inline |
| Upload fail | `message.error(info.file.error.event.message)` |

### 8.3 Loading States

| Loại | Pattern |
|------|---------|
| App init (auth) | `account.isLoading` → `<Loading />` HashLoader toàn màn hình |
| List data | `isLoading` state cục bộ → `<Spin spinning={isLoading}>` |
| Detail page | `<Skeleton />` khi đang fetch |
| Submit button | `loading={isSubmitting}` trên Button |
| Admin ProTable | `loading={isFetching}` từ Redux slice |

### 8.4 File Upload

- `callUploadSingleFile(file, folder)` → trả về `{ fileName }`
- Folder param phân biệt: `"company"` (logo), `"resume"` (CV), v.v.
- `customRequest` Ant Design Upload override để gọi API trực tiếp
- Validate type/size trước khi upload (`beforeUpload`)

### 8.5 Internationalization

- **Không có** thư viện i18n (không có react-intl / i18next)
- Locale AntD: `viVN` mặc định app (`App.tsx:172-174`), `vi_VN` cho DataTable
- Một số form/modal dùng `enUS` Ant locale (`apply.modal.tsx:6`, `upsert.job.tsx:13`)
- Ngôn ngữ UI: tiếng Việt hard-code trực tiếp trong JSX

---

## 9. File Then Chốt & Vai Trò

| File | Vai trò | Điểm cần lưu ý khi vấn đáp |
|------|---------|---------------------------|
| `src/App.tsx` | Router trung tâm + bootstrap fetchAccount | Route detail dùng query `?id=` thay vì route param |
| `src/config/axios-customize.ts` | Axios + token + refresh retry + mutex | Điểm mấu chốt toàn bộ auth flow |
| `src/config/api.ts` | Contract gọi backend (toàn bộ endpoint) | Nếu bị hỏi endpoint cụ thể → xem ở đây |
| `src/redux/slice/accountSlide.ts` | Auth state + user + logout | `fetchAccount`, `setLogoutAction`, `onRefreshTokenError` |
| `src/components/share/protected-route.ts/index.tsx` | Guard route theo auth/role | NORMAL_USER bị chặn khỏi admin |
| `src/components/share/access.tsx` | Guard UI theo permission ACL | `VITE_ACL_ENABLE=false` để test |
| `src/components/admin/layout.admin.tsx` | Sidebar admin, menu động theo permissions | Menu item ẩn/hiện theo ACL |
| `src/components/admin/job/upsert.job.tsx` | Form tạo/sửa job phức tạp nhất | ReactQuill + DebounceSelect + skill/company mapping |
| `src/components/client/modal/manage.account.tsx` | Quản lý tài khoản user | 4 tab: CV, subscribe, update info, đổi mật khẩu |
| `src/types/backend.d.ts` | TypeScript interfaces tất cả entity | IJob, IUser, IResume, IRole, IPermission, ISubscribers |

---

## 10. Bộ Câu Hỏi Vấn Đáp Thường Gặp

### Q1: Dự án dùng framework gì? Tại sao không dùng Next.js?
**A**: React 18 + Vite, không phải Next.js. Đây là SPA thuần; không cần SSR/SSG vì là
trang job board nội bộ, tốc độ phát triển ưu tiên. (`package.json:27-50`)

### Q2: Chạy local thế nào?
**A**: `npm install` → `npm run dev`. Build production: `npm run build`. Preview build:
`npm run preview`. Port lấy từ biến `PORT` trong `.env`. (`package.json:8-13`)

### Q3: Router tổ chức như thế nào?
**A**: `createBrowserRouter` tại `App.tsx` với routes lồng nhau. Public routes không cần
auth. Admin routes bọc `<ProtectedRoute>`. (`App.tsx:75-151`)

### Q4: Khi đăng nhập, token được xử lý như thế nào?
**A**:
1. Gọi `callLogin()` → nhận `{ access_token, user }`
2. `localStorage.setItem('access_token', token)`
3. Dispatch Redux `setUserLoginInfo(user)` (lưu user + permissions)
4. Navigate về trang callback hoặc home

(`login.tsx:30-50`, `accountSlide.ts:57-70`)

### Q5: Refresh token hoạt động thế nào?
**A**: Axios response interceptor bắt lỗi 401, dùng mutex để tránh nhiều request cùng
refresh, gọi `GET /auth/refresh` (gửi cookie `refresh_token`), nhận access token mới,
cập nhật localStorage, retry request gốc. Nếu refresh fail → `onRefreshTokenError`.
(`axios-customize.ts:20-60`)

### Q6: Phân quyền admin hoạt động như thế nào?
**A**: Hai lớp:
- **Route**: `ProtectedRoute` + `RoleBaseRoute` chặn NORMAL_USER vào `/admin`
- **UI/button**: `<Access permission={{apiPath, method, module}}>` so khớp với
  `user.role.permissions[]`. Toggle bằng `VITE_ACL_ENABLE`.

(`protected-route.ts/index.tsx`, `access.tsx`, `accountSlide.ts:28-35`)

### Q7: Admin CRUD được tổ chức ra sao?
**A**: Mỗi entity dùng pattern: ProTable + Redux thunk fetch + Modal form (ModalForm) với
`dataInit` null (create) hoặc có id (update). Sau CRUD thành công → `message.success()` +
`reloadTable()`. (`admin/company.tsx:47-207`, `modal.company.tsx:71-106`)

### Q8: Cách filter/tìm kiếm job thực hiện thế nào?
**A**: SearchClient build query URL `?skills=...&location=...`, JobCard đọc query params
và build `spring-filter-query-builder` expression, encode vào `filter=` param khi gọi API.
(`search.client.tsx:54-73`, `job.card.tsx:49-70`)

### Q9: User ứng tuyển job như thế nào?
**A**:
1. Click nút "Ứng tuyển" trên job detail → mở `ApplyModal`
2. Nếu chưa đăng nhập → redirect `/login?callback=...`
3. Nếu đã đăng nhập → upload CV (PDF/DOC) qua `callUploadSingleFile(file, 'resume')`
4. Submit `callCreateResume(fileName, jobId, email, userId)`

(`apply.modal.tsx:26-50`, `pages/job/detail.tsx:161-165`)

### Q10: Form validation được xử lý thế nào?
**A**: AntD Form `rules` array với built-in validators (required, email, min) và custom
validator function. Ví dụ: confirm password dùng `getFieldValue('newPassword')` so sánh
(`manage.account.tsx:256-259`), rich text check `isQuillEmpty(html)` (`upsert.job.tsx:407`).

### Q11: Styling strategy là gì?
**A**: SCSS Modules cho từng vùng (client/admin/auth). Override Ant Design dùng `:global()`
selector trong module file. Một file `reset.scss` cho override global. Không có mixins/variables
dùng chung toàn project (mỗi module có biến riêng).

### Q12: Có i18n đa ngôn ngữ không?
**A**: Không có thư viện i18n. UI tiếng Việt hard-code trong JSX. Chỉ có AntD locale
`viVN` để format date/table. Một số form dùng `enUS` cho date picker format.

### Q13: Có giỏ hàng/checkout không?
**A**: Không. Đây là job board (tìm việc IT), không phải e-commerce. Chức năng gần nhất là
"Rải CV" (submit application) và "Subscribe job qua email". (`App.tsx:75-167`)

### Q14: Loading state được quản lý như thế nào?
**A**: Ba lớp:
1. Global auth loading: `account.isLoading` → `<Loading />` (HashLoader)
2. List/detail: `isLoading` local state → `<Spin>` hoặc `<Skeleton>`
3. Button submit: `loading={isSubmitting}` state cục bộ

(`accountSlide.ts:39,102-122`, `loading.tsx`, `job.card.tsx:98`)

### Q15: Điểm kỹ thuật nào cần cải thiện?
**A**:
- Route detail dùng query `?id=` thay vì route param (`/job/:id`) → không nhất quán với
  khai báo `path: '/job/:id'` trong router (`App.tsx:83`, `job/detail.tsx:25-27`)
- Không có custom hooks tách biệt data fetching logic → logic trong component
- Không có `variables.scss` dùng chung → màu sắc hard-code nhiều nơi trong `client.module.scss`
- `UserUpdateInfo` tab chỉ là placeholder, chưa implement (`manage.account.tsx:101`)

---

## 11. TypeScript Interfaces Chính

```typescript
// src/types/backend.d.ts

IBackendRes<T>       // { statusCode, message, error?, data?: T }
IModelPaginate<T>    // { meta: { page, pageSize, pages, total }, result: T[] }
IAccount             // { access_token, user: { id, email, name, role: { permissions[] } } }
ICompany             // { id, name, address, logo, description, ... }
ISkill               // { id, name, ... }
IUser                // { id, name, email, age, gender, address, role?, company? }
IJob                 // { id, name, skills[], company?, location, salary, quantity,
                     //   level, description, required?, benefit?, startDate, endDate, active }
IResume              // { id, email, userId, url, status, companyId, jobId, history? }
IPermission          // { id, name, apiPath, method, module }
IRole                // { id, name, description, active, permissions[] }
ISubscribers         // { id, name, email, skills[] }
```

---

*Tài liệu tổng hợp – cập nhật theo code tại nhánh `copilot/research-frontend-analysis`*
