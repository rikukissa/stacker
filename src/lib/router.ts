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

  window.history.pushState = (...args: any[]) => {
    const [, , url] = args;
    console.log(parse(url).pathname);

    console.log(router.match(parse(url).pathname));

    return pushState.apply(history, args);
  };
  console.log(router.match(location.pathname));
}
