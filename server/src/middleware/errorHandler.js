export function notFoundHandler(_req, res) {
  res.status(404).json({ success: false, data: null, error: 'Route not found' });
}

export function errorHandler(err, _req, res, _next) {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    data: null,
    error: err.message || 'Internal server error'
  });
}
