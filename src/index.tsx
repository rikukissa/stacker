import { UnauthorizedError } from "./api";
import diffSelect from './features/diff-select'
import { createContext } from "./lib/context";
import { isPRView } from "./lib/location";

(async function run() {
  if(!isPRView(document.location)) {
    return
  }
  const context = await createContext(document.location)
  diffSelect(context)

})().catch(err => {
  if(err instanceof UnauthorizedError) {
    const token = window.prompt('Please enter an access token')
    if(token) {
      window.localStorage.setItem('TODO_token', token);
      window.location.reload()
    }
  }

  console.log(err);
});
