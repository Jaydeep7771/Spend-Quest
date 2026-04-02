export function ok(res, data, code = 200) {
  return res.status(code).json({ success: true, data });
}

export function fail(res, error, code = 400) {
  return res.status(code).json({ success: false, data: null, error });
}
