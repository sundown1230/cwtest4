-- c:\Users\pasca\cwtest4\test_simple_insert.sql
DROP TABLE IF EXISTS simple_test;
CREATE TABLE simple_test (id INTEGER PRIMARY KEY, message TEXT);
INSERT INTO simple_test (id, message) VALUES (1, 'Hello D1 from test script!');
SELECT * FROM simple_test;
