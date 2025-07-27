const publicPaths = [
  { path: "/", method: "get", exact: true },
  { path: "/about", method: "get", startsWith: true },
  { path: "/contact", method: "get", startsWith: true },
  { path: "/auth", method: "all", startsWith: true },
  { path: "/posts", method: "get", startsWith: true },
  { path: "/topics", method: "get", startsWith: true },
];

function isPublicRoute(path, method) {
  console.log(path);

  const normalizedMethod = method.toLowerCase();
  return publicPaths.some((rule) => {
    const fullPath = rule.path;
    const methodMatch =
      rule.method === "all" || rule.method === normalizedMethod;

    if (rule.exact) return path === fullPath;
    if (!methodMatch) return false;
    if (rule.startsWith) return path.startsWith(fullPath);

    return false;
  });
}

module.exports = isPublicRoute;
