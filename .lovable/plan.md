
Goal: student home page par announcement clearly dikhana aur admin side se add/view flow ko properly work karwana.

What I found:
- Backend me 1 active announcement already present hai.
- Code ke hisaab se announcement `/` page par header ke neeche, hero section ke upar dikhna chahiye.
- Browser check me top par announcement ka container present hai, but empty aa raha hai.
- Admin announcements page bhi “Loading announcements...” par atak rahi hai.
- Iska matlab problem sirf banner styling ki nahi hai; frontend ke data queries complete hi nahi ho rahe.
- Ek aur separate issue: admin page ko direct open kar diya gaya hai, lekin backend abhi bhi sirf real admin role ko announcement create/delete karne deta hai. Isliye “add announcement” fail hona expected hai.

Implementation plan:
1. Fix shared data-loading path
   - Home aur admin dono me jo backend reads use ho rahe hain unka common failure point trace karunga.
   - `rooms` aur `announcements` dono ke fetch flow ko align karunga taaki pending state me latakne ke bajay proper success/error aaye.
   - Generated backend client file ko touch nahi karunga; app-side integration aur query flow ko fix karunga.

2. Make announcement banner debuggable and visible
   - `AnnouncementBanner` me explicit `isLoading`, `error`, aur empty-state handling add karunga.
   - Silent `return null` behavior hataunga jab request fail ho, taaki blank gap na dikhe.
   - Banner ko thoda more prominent banaunga so students clearly dekh saken.

3. Fix admin announcement creation flow safely
   - Current mismatch clear hai: page open hai, but write permission admin-only hai.
   - Main admin UI ko backend rules ke saath sync karunga:
     - ya to write actions ke liye proper login/admin check dikhaya jayega,
     - ya clear message diya jayega ki create/delete ke liye admin auth zaroori hai.
   - Security ke liye announcement insert/update/delete sabke liye open nahi kiya jayega.

4. Refresh + cache sync
   - Admin se announcement add/delete hone par student banner query bhi refetch/invalidate hogi.
   - Taaki naya announcement turant home page par reflect ho.

5. End-to-end verification
   - `/admin/announcements` par list load ho
   - test announcement create ho
   - `/` par banner header ke neeche dikhe
   - rooms/stats jaisa dusra public data bhi load ho
   - mobile viewport par bhi banner visible ho

Files likely involved:
- `src/components/AnnouncementBanner.tsx`
- `src/components/admin/AdminAnnouncements.tsx`
- `src/hooks/useRooms.tsx`
- `src/pages/Index.tsx`
- possibly auth/query-related UI files if the loading issue traces there

Technical notes:
- Current backend rules allow public read for active announcements, so students ko banner dekhne ke liye login ki zaroorat nahi honi chahiye.
- Current backend rules do not allow public writes, so direct-open admin UI ke bawajood create/delete tab tak fail honge jab tak real admin auth na ho.
- Main fix ka focus hoga:
  1) public read path ko reliable banana
  2) admin write flow ko backend permissions ke saath consistent banana
  3) blank UI ki jagah clear loading/error feedback dena
