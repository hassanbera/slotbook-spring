INSERT INTO employees(id,created_at,name,title,color) VALUES
 ('10000000-0000-0000-0000-000000000001',now(),'Deniz Yılmaz','Ürün danışmanı','#4263eb'),
 ('10000000-0000-0000-0000-000000000002',now(),'Ece Demir','Tasarım danışmanı','#48a58c'),
 ('10000000-0000-0000-0000-000000000003',now(),'Bora Kaya','Teknik danışman','#cf914b');
INSERT INTO appointments(id,created_at,employee_id,title,client_name,client_email,note,start_at,end_at,status,version) VALUES
 ('10000000-0000-0000-0000-000000000004',now(),'10000000-0000-0000-0000-000000000001','Proje keşif görüşmesi','Nova Studio','hello@example.com','Kapsam ve hedefler',date_trunc('week',now())+interval '1 day 7 hours',date_trunc('week',now())+interval '1 day 8 hours','SCHEDULED',1),
 ('10000000-0000-0000-0000-000000000005',now(),'10000000-0000-0000-0000-000000000002','Tasarım değerlendirmesi','Luna Creative','luna@example.com','Yeni tasarımlar üzerine',date_trunc('week',now())+interval '2 days 9 hours',date_trunc('week',now())+interval '2 days 10 hours','SCHEDULED',1),
 ('10000000-0000-0000-0000-000000000006',now(),'10000000-0000-0000-0000-000000000003','Teknik yol haritası','Atlas Atölye','atlas@example.com','API entegrasyonu',date_trunc('week',now())+interval '3 days 8 hours',date_trunc('week',now())+interval '3 days 9 hours','SCHEDULED',1),
 ('10000000-0000-0000-0000-000000000007',now(),'10000000-0000-0000-0000-000000000001','Haftalık durum toplantısı','Mavi Girişim','mavi@example.com','Hafta değerlendirmesi',date_trunc('week',now())+interval '4 days 11 hours',date_trunc('week',now())+interval '4 days 12 hours','COMPLETED',2);
