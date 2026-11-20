# Format 1 dynamic field coverage

Statuses are across the 10 real invoices. GST split cells stay blank until the API stores per-line SGST/CGST/IGST; that is not inferred.

| Span | Label | Sample | Binding | Status on 10 real invoices |
|---|---|---|---|---|
| p1s1 | — | 1/28/2019 | — | empty in the record |
| p1s13 | GST18-SGST9% | 792.00 | invoice.tax | filled |
| p1s15 | GST18-CGST9% | 792.00 | invoice.tax | filled |
| p1s29 | 4G LOGISTICS INDIA PVT L | 10, DBS CENTRE, NUNGAMBAKKAM HIGH | — | filled |
| p1s30 | 4G LOGISTICS INDIA PVT L | ROAD, NUNGAMBAKKAM, CHENNAI, T | — | filled on 6/10; empty in the record on 0 |
| p1s32 | 4G LOGISTICS INDIA PVT L | LNADU, INDIA, 600084 | — | no source |
| p1s37 | Invoice No./Date | MAAINV1900717 / 28-JAN-19 (CREA | invoice.numberDate | filled |
| p1s50 | ANY LLC | CEXP190148 / 28-JAN-19 | — | filled |
| p1s53 | Shipment No. | B/EXP/19/0251 / 22-JAN-19 | shipment.number | empty in the record |
| p1s57 | WB No. | MBLC9878909999 / 21-JAN-19 | — | filled on 2/10; empty in the record on 8 |
| p1s61 | WB No. | PLMAAJEA00080 / 23-JAN-19 | — | filled on 1/10; empty in the record on 9 |
| p1s87 | Narration | B/EXP/19/0251 MBL NO. MBLC9878909999 | invoice.narration | empty in the record |
| p1s88 | MSC MARINA / 876 | / HBL NO. PLMAAJEA00080 / JOB NO.CEX | — | filled on 4/10; empty in the record on 6 |
| p1s96 | Reference No. | REFE NO. 987890 / 22-JAN-19 | shipment.reference | empty in the record |
| p1s100 | Currency | 1.000000 | invoice.currencyRate | filled |
| p1s103 | IGM No. | 8987777 / 25-JAN-19 | shipment.igm | empty in the record |
| p1s110 | 1X20: SHIPMENT T | O JEBEL ALI - CMA CGM - PO NO. 9877777 DA | — | no source |
| p1s127 | 18,000.000 K | 20.000 | — | no source |
| p1s161 | 1 | 100.00 | invoice.lines (column role) | empty in the record |
| p1s163 | USD | 70.00000 | invoice.lines (column role) | empty in the record |
| p1s164 | USD | 100.00 | invoice.lines (column role) | empty in the record |
| p1s165 | USD | 7,000.00 | invoice.lines (column role) | empty in the record |
| p1s166 | USD | 7,000.00 | invoice.lines (column role) | empty in the record |
| p1s172 | 1 | 5,500.00 | invoice.lines (column role) | empty in the record |
| p1s174 | INR | 1.00000 | invoice.lines (column role) | empty in the record |
| p1s175 | INR | 5,500.00 | invoice.lines (column role) | empty in the record |
| p1s176 | INR | 5,500.00 | invoice.lines (column role) | empty in the record |
| p1s177 | INR | 9.00 | invoice.lines (column role) | empty in the record |
| p1s178 | INR | 495.00 | invoice.lines (column role) | empty in the record |
| p1s179 | INR | 9.00 | invoice.lines (column role) | empty in the record |
| p1s180 | INR | 495.00 | invoice.lines (column role) | empty in the record |
| p1s181 | INR | 6,490.00 | invoice.lines (column role) | empty in the record |
| p1s184 | SEAL FEE | 300.00 | cargo.sealNo | empty in the record |
| p1s186 | SEAL FEE | 1.00000 | cargo.sealNo | empty in the record |
| p1s187 | SEAL FEE | 300.00 | cargo.sealNo | empty in the record |
| p1s188 | SEAL FEE | 300.00 | cargo.sealNo | empty in the record |
| p1s189 | SEAL FEE | 9.00 | cargo.sealNo | empty in the record |
| p1s190 | SEAL FEE | 27.00 | cargo.sealNo | empty in the record |
| p1s191 | SEAL FEE | 9.00 | cargo.sealNo | empty in the record |
| p1s192 | SEAL FEE | 27.00 | cargo.sealNo | empty in the record |
| p1s193 | SEAL FEE | 354.00 | cargo.sealNo | empty in the record |
| p1s196 | BILL OF LADING | 3,000.00 | shipment.hbl | empty in the record |
| p1s198 | BILL OF LADING | 1.00000 | shipment.hbl | empty in the record |
| p1s199 | BILL OF LADING | 3,000.00 | shipment.hbl | empty in the record |
| p1s200 | BILL OF LADING | 3,000.00 | shipment.hbl | empty in the record |
| p1s201 | BILL OF LADING | 9.00 | shipment.hbl | empty in the record |
| p1s202 | BILL OF LADING | 270.00 | shipment.hbl | empty in the record |
| p1s203 | BILL OF LADING | 9.00 | shipment.hbl | empty in the record |
| p1s204 | BILL OF LADING | 270.00 | shipment.hbl | empty in the record |
| p1s205 | BILL OF LADING | 3,540.00 | shipment.hbl | empty in the record |
| p1s206 | Amount | 8,800.00 | invoice.amount | filled |
| p1s207 | Amount | 7,000.00 | invoice.amount | empty in the record |
| p1s208 | SGST | 792.00 | invoice.sgstTotal | needs GST breakdown |
| p1s209 | CGST | 792.00 | invoice.cgstTotal | needs GST breakdown |
| p1s210 | (INR) | 17,384.00 | invoice.lines (column role) | filled |
| p1s212 | Rupee Seventeen Thousand Three Hundred Eighty-Four Only | 17,384.00 | invoice.amountWords | filled on 3/10; empty in the record on 7 |

