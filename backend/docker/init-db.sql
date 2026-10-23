-- Create test database alongside main database for automated testing
SELECT 'CREATE DATABASE squid_protocol_test'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'squid_protocol_test')\gexec

GRANT ALL PRIVILEGES ON DATABASE squid_protocol TO squid_user;
GRANT ALL PRIVILEGES ON DATABASE squid_protocol_test TO squid_user;
