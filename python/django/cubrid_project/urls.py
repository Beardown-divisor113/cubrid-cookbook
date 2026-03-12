from __future__ import annotations

from collections.abc import Callable
from importlib import import_module
from typing import cast

django_admin = import_module(".".join(["django", "contrib", "admin"]))
django_urls = import_module(".".join(["django", "urls"]))

include = cast(Callable[[str], object], django_urls.include)
path = cast(Callable[..., object], django_urls.path)
admin_site = cast(object, getattr(django_admin, "site"))
admin_urls = cast(object, getattr(admin_site, "urls"))

urlpatterns = [
    path("admin/", admin_urls),
    path("", include("cookbook.urls")),
]
