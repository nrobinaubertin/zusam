import http from "/core";

export const meStore = store => {
  store.on('@init', () => ({
    me: {},
    notifications: [],
  }))

  store.on('me/update', (state, me) => {
    return {me};
  })

  store.on('notifications/update', (state, notifications) => {
    return {notifications};
  })

  store.on('notifications/remove', async (state, notification) => {
    await http.delete(`/api/notifications/${notification.id}`);
    return {
      notifications: state.notifications.filter(n => n.id != notification.id)
    };
  })

  //store.on('bookmark/add', (state, id) => {
  //  if (!me.hasBookmark(id)) {
  //    http.post(`/api/bookmarks/${id}`).then(user => {
  //      store.dispatch('me/update', user);
  //    });
  //  }
  //})

  //store.on('bookmark/remove', (state, id) => {
  //  if (me.hasBookmark(id)) {
  //    http.delete(`/api/bookmarks/${id}`).then(user => {
  //      store.dispatch('me/update', user);
  //    });
  //  }
  //})
}
