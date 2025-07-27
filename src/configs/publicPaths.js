const { match } = require("path-to-regexp");
const publicPaths = [
  { path: "/", method: "get", exact: true },
  { path: "/about", method: "get", startsWith: true },
  { path: "/contact", method: "get", startsWith: true },
  { path: "/auth", method: "all", startsWith: true },
  { path: "/posts", method: "get", exact: true },
  { path: "/posts/:id", method: "get", pattern: true, exact: true },
  { path: "/topics", method: "get", startsWiths: true },
];

function isPublicRoute(path, method) {
  const normalizedMethod = method.toLowerCase();
  return publicPaths.some((rule) => {
    const fullPath = rule.path;
    const methodMatch =
      rule.method === "all" || rule.method === normalizedMethod;

    if (!methodMatch) return false;
    if (rule.exact) return path === fullPath;
    if (rule.pattern) {
      const matcher = match(fullPath, { decode: decodeURIComponent });
      return matcher(path) !== false;
    }
    if (rule.startsWith) return path.startsWith(fullPath);

    return false;
  });
}

module.exports = isPublicRoute;
