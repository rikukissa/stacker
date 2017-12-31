import Router from "routes";
import { parse } from "url";

export default function createRouter(routes: {
  [path: string]: (...args: any[]) => void;
}) {
  const router = Router();

  Object.keys(routes).forEach(path => {
    router.addRoute(path, routes[path]);
  });

  const pushState = window.history.pushState;

  function match(pathname: string) {
    const route = router.match(pathname);
    if (!route) {
      return;
    }
    route.fn(route.params);
  }

  window.history.pushState = (...args: any[]) => {
    const [, , url] = args;
    const parts = parse(url);
    if (parts.pathname) {
      match(parts.pathname);
    }
    return pushState.apply(history, args);
  };

  match(location.pathname);
}
