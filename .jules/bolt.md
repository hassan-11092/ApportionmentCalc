## 2024-05-22 - [DOM Performance in Modal]
**Learning:** Rendering thousands of complex HTML tables in a single `.innerHTML` update causes significant browser freeze (18s for 5000 items).
**Action:** Limit the number of detailed items rendered in modal views or use virtualization. For this app, limiting "Quotient Detail" to the first 50 rounds reduced render time by ~85% while preserving the Summary Table which contains the most critical info.
