# Python Error Handling Examples

Focused examples for handling common CUBRID failures with `pycubrid` and defensive transaction patterns.

## Files

- `01_connection_failure.py` - Catch connection failures with `OperationalError`
- `02_constraint_violation.py` - Catch unique constraint errors with `IntegrityError`
- `03_query_timeout.py` - Catch lock/query timeout failures and rollback safely

## Run

```bash
cd /data/GitHub/cubrid-cookbook/python/error-handling
python 01_connection_failure.py
python 02_constraint_violation.py
python 03_query_timeout.py
```
