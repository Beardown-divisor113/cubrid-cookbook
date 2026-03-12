# SQLAlchemy Examples

SQLAlchemy Core + ORM examples with CUBRID using [sqlalchemy-cubrid](https://github.com/cubrid-labs/sqlalchemy-cubrid) — the production-ready CUBRID dialect for SQLAlchemy 2.0.

## Features

- SQLAlchemy 2.0 API with `DeclarativeBase`, `mapped_column`, and type-annotated models
- Core and ORM patterns — `Table`, `select()`, `Session`, relationships
- CUBRID-specific DML extensions — `ON DUPLICATE KEY UPDATE`, `MERGE`, `REPLACE INTO`
- Schema reflection — inspect tables, columns, indexes, and constraints at runtime
- Connection pool management — `pool_size`, `pool_pre_ping`, `pool_recycle`
- Two driver options — `cubrid://` (C extension) or `cubrid+pycubrid://` (pure Python)

## Prerequisites

- Python 3.10+
- CUBRID running on `localhost:33000` with database `testdb`

The root project Docker Compose provides CUBRID. Start from the repository root:

```bash
make up
```

## Setup

```bash
pip install -r requirements.txt
```

## Examples

| File | Topic | Key Concepts |
|------|-------|--------------|
| `01_engine.py` | Engine creation | URLs, pool settings, events, driver selection |
| `02_core.py` | SQLAlchemy Core | `Table`, `select()`, `insert()`, `text()`, JOINs, aggregation |
| `03_orm.py` | ORM basics | `DeclarativeBase`, `mapped_column`, `Session` CRUD, pagination |
| `04_relationships.py` | Relationships | One-to-many, many-to-many, eager loading |
| `05_dml_extensions.py` | CUBRID DML | `ON DUPLICATE KEY UPDATE`, `MERGE`, `REPLACE INTO` |
| `06_reflection.py` | Schema reflection | `inspect()` tables, columns, indexes, constraints |

## Run

```bash
python 01_engine.py
python 02_core.py
python 03_orm.py
python 04_relationships.py
python 05_dml_extensions.py
python 06_reflection.py
```

Each script is self-contained — it creates its own tables and cleans up after.

## Code Highlights

### Engine Creation

```python
from sqlalchemy import create_engine, text

# Pure Python driver (recommended — no C build required)
engine = create_engine("cubrid+pycubrid://dba@localhost:33000/testdb")

# With pool settings for production use
engine = create_engine(
    "cubrid+pycubrid://dba@localhost:33000/testdb",
    pool_size=5,
    pool_pre_ping=True,
    pool_recycle=3600,
)

with engine.connect() as conn:
    result = conn.execute(text("SELECT version()"))
    print(f"CUBRID: {result.scalar()}")
```

### ORM Model Definition

```python
from sqlalchemy import String, create_engine, select
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column

class Base(DeclarativeBase):
    pass

class Book(Base):
    __tablename__ = "cookbook_books"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(200))
    author: Mapped[str] = mapped_column(String(100))
    price: Mapped[float] = mapped_column(default=0.0)

# Create tables and add data
engine = create_engine("cubrid+pycubrid://dba@localhost:33000/testdb")
Base.metadata.create_all(engine)

with Session(engine) as session:
    session.add(Book(title="Clean Code", author="Robert C. Martin", price=39.99))
    session.commit()

    books = session.scalars(select(Book)).all()
    for b in books:
        print(f"  {b.title} by {b.author} — ${b.price:.2f}")
```

### CUBRID-Specific DML Extensions

```python
from sqlalchemy_cubrid import insert, merge, replace

# ON DUPLICATE KEY UPDATE (upsert)
stmt = (
    insert(Config)
    .values(key="app.name", value="Cookbook v2")
    .on_duplicate_key_update(value="Cookbook v2")
)
session.execute(stmt)

# REPLACE INTO (delete + insert if exists)
stmt = replace(Config).values(key="db.host", value="production.db.local")
session.execute(stmt)

# MERGE (conditional insert/update from source table)
stmt = (
    merge(counters_table)
    .using(counter_source)
    .on(counters_table.c.name == counter_source.c.name)
    .when_matched_then_update({"count": counters_table.c.count + counter_source.c.count})
    .when_not_matched_then_insert({
        counters_table.c.name: counter_source.c.name,
        counters_table.c.count: counter_source.c.count,
    })
)
conn.execute(stmt)
```

## Expected Output

Running `01_engine.py`:

```
=== Basic Engine ===
  SELECT 1 + 1 = 2
  CUBRID version: 11.2.0.0338
  ✓ Engine created and disposed

=== Engine with Pool Settings ===
  Pool size: 5
  Checked in: 0
  Checked out: 0
  After connect — checked out: 1
  After close — checked out: 0
  ✓ Pool engine created and disposed
```

Running `03_orm.py`:

```
=== ORM — Add Books ===
  ✓ Added 5 books
    Book(id=1, title='Clean Code', author='Robert C. Martin')
    Book(id=2, title='Design Patterns', author='Gang of Four')
    ...

=== ORM — Query Books ===
  All books (5):
    Clean Code                      by Robert C. Martin       $39.99
    Design Patterns                 by Gang of Four           $49.99
    ...
```

## Key Concepts

### URL Format

| Driver | URL | Notes |
|--------|-----|-------|
| pycubrid (pure Python) | `cubrid+pycubrid://dba@localhost:33000/testdb` | Recommended — no build needed |
| CUBRIDdb (C extension) | `cubrid://dba:password@localhost:33000/testdb` | Faster, requires C build |

### SQLAlchemy Core vs ORM

| Pattern | When to Use |
|---------|-------------|
| **Core** (`Table`, `select()`, `text()`) | Lightweight queries, raw SQL, bulk operations |
| **ORM** (`DeclarativeBase`, `Session`) | Domain models, relationships, application logic |

### CUBRID-Specific Imports

```python
from sqlalchemy_cubrid import insert     # ON DUPLICATE KEY UPDATE
from sqlalchemy_cubrid import merge      # MERGE statement
from sqlalchemy_cubrid import replace    # REPLACE INTO
from sqlalchemy_cubrid import SET, MULTISET, SEQUENCE  # Collection types
from sqlalchemy_cubrid import MONETARY, OBJECT         # CUBRID-specific types
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `NoSuchModuleError: cubrid` | Install the dialect: `pip install sqlalchemy-cubrid` |
| `OperationalError: connect failed` | Ensure CUBRID is running: `make up` from repo root |
| `UNIQUE constraint violation` | Row exists — use `on_duplicate_key_update()` or `replace()` |
| Slow connection startup | Enable `pool_pre_ping=True` and set `pool_recycle=3600` |

## Learn More

- [sqlalchemy-cubrid documentation](https://github.com/cubrid-labs/sqlalchemy-cubrid)
- [SQLAlchemy 2.0 Tutorial](https://docs.sqlalchemy.org/en/20/tutorial/)
- [CUBRID SQL Guide](https://www.cubrid.org/manual/en/11.2/sql/index.html)
