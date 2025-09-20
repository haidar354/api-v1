class CustomResponse extends Response {
  constructor(data, status, pagination) {
    super(JSON.stringify(data), {
      status,
      headers: {
        "Content-Type": "application/json",
        ...(pagination && { "X-Pagination": JSON.stringify(pagination) }),
      },
    });
    this.data = data; // Still set for backend use
    this.pagination = pagination;
  }
}

export function jsonResponse(data, status = 200, pagination = null) {
  return new CustomResponse(data, status, pagination);
}

export function errorResponse(message, status) {
  return jsonResponse({ error: message }, status);
}
