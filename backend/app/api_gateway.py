
from typing import Dict, Any, Optional
import time

def api_response(
    data: Any = None,
    message: str = "Success",
    status: str = "ok",
    meta: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    response = {
        "status": status,
        "message": message,
        "data": data,
        "meta": {
            "timestamp": int(time.time()),
            "version": "1.0.0",
            **(meta or {})
        }
    }
    return response

def paginated_response(
    items: list,
    total: int,
    page: int = 1,
    limit: int = 25,
    message: str = "Success"
) -> Dict[str, Any]:
    total_pages = (total + limit - 1) // limit
    has_next = page < total_pages
    has_prev = page > 1
    
    return api_response(
        data=items,
        message=message,
        meta={
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "total_pages": total_pages,
                "has_next": has_next,
                "has_prev": has_prev
            }
        }
    )

def error_response(
    message: str,
    code: str = "ERROR",
    details: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    return {
        "status": "error",
        "message": message,
        "error": {
            "code": code,
            **(details or {})
        },
        "meta": {
            "timestamp": int(time.time())
        }
    }

