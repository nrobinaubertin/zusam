import { http, util } from "/core";

export const entityStore = store => {
  store.on('@init', () => ({}))

  store.on('entity/update', (state, args) => ({[args.url]: args.entity}))

  store.on('entity/fetch', (state, url) => {
    url = util.toApp(url);
    http.get(url).then(r => {
      if (r?.id) {
        store.on('entity/update', {url, entity: r});
      } else {
        console.warn("Something went wrong with entity/fetch");
      }
    });
  })

  store.on('entity/remove', (state, url) => ({[url]: null}))
}
