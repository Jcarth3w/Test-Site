/**
 * Thin pg wrapper that mirrors the sqlite3 callback API used by routes:
 *   db.get(sql, params, cb)
 *   db.all(sql, params, cb)
 *   db.run(sql, params, function(err) { this.lastID; this.changes })
 *
 * Converts `?` placeholders to Postgres `$1, $2, ...`.
 */

function convertPlaceholders(sql) {
  let index = 0;
  return String(sql).replace(/\?/g, () => `$${++index}`);
}

function normalizeArgs(params, callback) {
  if (typeof params === 'function') {
    return { params: [], callback: params };
  }
  return { params: params || [], callback };
}

class PgDb {
  constructor(pool) {
    this.pool = pool;
  }

  get(sql, params, callback) {
    const args = normalizeArgs(params, callback);
    this.pool
      .query(convertPlaceholders(sql), args.params)
      .then((result) => args.callback(null, result.rows[0]))
      .catch((err) => args.callback(err));
  }

  all(sql, params, callback) {
    const args = normalizeArgs(params, callback);
    this.pool
      .query(convertPlaceholders(sql), args.params)
      .then((result) => args.callback(null, result.rows))
      .catch((err) => args.callback(err));
  }

  run(sql, params, callback) {
    const args = normalizeArgs(params, callback);
    let query = convertPlaceholders(sql);
    const isInsert = /^\s*insert\s+/i.test(sql);
    if (isInsert && !/\breturning\b/i.test(sql)) {
      query += ' RETURNING id';
    }

    this.pool
      .query(query, args.params)
      .then((result) => {
        const ctx = {
          lastID: result.rows[0]?.id ?? 0,
          changes: result.rowCount ?? 0,
        };
        args.callback.call(ctx, null);
      })
      .catch((err) => {
        args.callback.call({ lastID: 0, changes: 0 }, err);
      });
  }

  query(sql, params = []) {
    return this.pool.query(convertPlaceholders(sql), params);
  }
}

function isUniqueViolation(err) {
  if (!err) return false;
  if (err.code === '23505') return true;
  return /unique|duplicate key/i.test(String(err.message || ''));
}

module.exports = { PgDb, convertPlaceholders, isUniqueViolation };
