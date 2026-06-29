# BiznesPlan AI — Test Cases

This document lists different entrepreneur scenarios to test the app with real API calls.

## Quick Test Without API Key
```
http://localhost:5174/?demo=1
```
Shows: Jizzax novvoyxona, 88/100 score, full business plan

---

## Test Scenarios (Once You Have API Key)

### Scenario 1: High-Risk New Business
```
1. Biznesingiz nima? → Yangi do'kon (startup)
2. Qaysi viloyatda? → Tashkent
3. Necha yildan beri ishlaysiz? → 1 oy
4. Oylik tushum? → 5 million so'm
5. Kredit nimaga kerak? → Tovar sotib olish
6. Qancha kredit, muddati? → 20 million, 12 oyga
7. Garov bormi? → Yo'q
8. Xodimlar soni? → Faqat o'zim
9. Raqiblar? → Yonidagi do'konlar
10. 2 yil rejasi? → Biznes kengaytirish

Expected: 35-45/100 (O'rta yoki Past band, needs improvement)
```

### Scenario 2: Medium Business with Collateral
```
1. Biznesingiz nima? → Avtomobil ta'mirlash
2. Viloyat? → Samarqand
3. Davomi? → 2 yil
4. Tushum? → 35 million so'm
5. Kredit maqsadi? → Yangi uskunalar
6. Miqdor/muddati? → 40 million, 24 oyga
7. Garov? → Avtomobil bor
8. Xodimlar? → 3 nafar
9. Raqiblar? → Boshqa ta'mirlash korxonalari
10. Reja? → Filial ochish

Expected: 55-70/100 (O'rta yoki Yuqori band)
```

### Scenario 3: Strong Established Business
```
1. Biznesingiz nima? → Oziq-ovqat ishlab chiqarish (kolbaski)
2. Viloyat? → Fergona
3. Davomi? → 5 yil
4. Tushum? → 150 million so'm
5. Kredit maqsadi? → Eksport uchun yangi laboratoriya
6. Miqdor/muddati? → 300 million, 36 oyga
7. Garov? → 5 xona uy-joy bor
8. Xodimlar? → 12 nafar
9. Raqiblar? → 2-3 ta boshqa korxona
10. Reja? → Eksport boshlash

Expected: 75-90/100 (Yuqori band, strong position)
```

---

## What to Check

### ✅ Correct Parsing
- Numbers are extracted as numbers (not strings)
- Collateral type is correctly identified (real estate / vehicle / machinery)
- Years operating is normalized ("2 yil" → 2, not "2 yil")
- Sector is detected ("kolbaski" → food/agri)

### ✅ Scoring Logic
- Track record: 3+ years = higher score
- Revenue/loan ratio: Coverage ≥ 2.0 = strong score
- Collateral: Real estate > vehicle > machinery > none
- Employees: More employees = higher score

### ✅ Output Quality
- Executive summary is at least 1 paragraph
- Market analysis mentions region + sector
- Financial forecast has actual numbers with assumptions
- 2-3 bank recommendations specific to the loan size
- 5-8 checklist items with actionable steps

### ✅ Fallback Behavior
- If API fails or key is missing → auto-fallback to demo
- No error messages shown to user (graceful degradation)
- Console logs the error for debugging

---

## Common Parsing Errors (Now Fixed)

| Input | Old Behavior | New Behavior |
|-------|---|---|
| "18 million so'm" | Crash (string) | ✅ Parses to 18000000 |
| "3 yil" | Crash (string) | ✅ Parses to 3 |
| "garovim yo'q" | has_collateral = "no" | ✅ Parses to false |
| "50 mlrd" | Rejected | ✅ Parses to 50000000000 |
| empty response | Validation error | ✅ Now requires min length |

---

## How to Debug

1. **View console errors:**
   ```
   Chrome DevTools → Console
   ```
   Look for validation errors or API failures

2. **Check what Claude returned:**
   In browser console:
   ```javascript
   // Will show raw JSON from API
   ```

3. **Test mock data:**
   Edit `src/lib/demoFixture.ts` and change values, reload `?demo=1`

4. **Run TypeScript check:**
   ```bash
   npm run typecheck
   ```

---

## Success Criteria

- [ ] All 3 scenarios produce scores between 30-90
- [ ] No crashes with varied input
- [ ] PDF exports without errors
- [ ] Fallback to demo works when API unavailable
- [ ] All text in Uzbek Latin script
- [ ] Numbers render correctly in scoring breakdown
