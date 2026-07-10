import time


class RequestLoggingMiddleware:
    """
    Lightweight request logging for production diagnostics.
    Logs method/path/status/time to stdout so Render logs show incoming traffic.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start = time.time()
        response = self.get_response(request)
        elapsed_ms = int((time.time() - start) * 1000)
        try:
            print(
                f"[REQ] {request.method} {request.path} -> {response.status_code} ({elapsed_ms}ms)"
            )
        except Exception:
            # Never block request flow for logging issues.
            pass
        return response

