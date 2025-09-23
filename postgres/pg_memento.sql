DO
$$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_catalog.pg_available_extensions
        WHERE name = 'pgmemento'
    ) THEN
        EXECUTE 'CREATE SCHEMA IF NOT EXISTS audit';

        EXECUTE 'CREATE EXTENSION IF NOT EXISTS pgmemento WITH SCHEMA audit';
    ELSE
        RAISE NOTICE 'pgMemento extension is not installed. Skipping setup.';
    END IF;
END;
$$;
