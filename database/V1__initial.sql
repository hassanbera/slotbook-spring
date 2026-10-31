CREATE TABLE employees (id uuid PRIMARY KEY, created_at timestamptz NOT NULL,
 name varchar(80) NOT NULL,
 title varchar(80) NOT NULL,
 color varchar(20) NOT NULL);
CREATE TABLE appointments (id uuid PRIMARY KEY, created_at timestamptz NOT NULL,
 employee_id uuid NOT NULL,
 title varchar(120) NOT NULL,
 client_name varchar(100) NOT NULL,
 client_email varchar(200) NOT NULL,
 note varchar(1500) NOT NULL,
 start_at timestamptz NOT NULL,
 end_at timestamptz NOT NULL,
 status varchar(20) NOT NULL,
 version integer NOT NULL);
CREATE EXTENSION IF NOT EXISTS btree_gist;
ALTER TABLE appointments ADD FOREIGN KEY(employee_id) REFERENCES employees(id);
ALTER TABLE appointments ADD CHECK(end_at>start_at AND end_at<=start_at+interval '12 hours');
ALTER TABLE appointments ADD CHECK(status IN ('SCHEDULED','COMPLETED','CANCELLED'));
ALTER TABLE appointments ADD CONSTRAINT no_overlap EXCLUDE USING gist
 (employee_id WITH =, tstzrange(start_at,end_at,'[)') WITH &&) WHERE(status='SCHEDULED');
CREATE INDEX ON appointments(start_at,end_at);
