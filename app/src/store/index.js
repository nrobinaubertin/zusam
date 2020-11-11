import { createStoreon } from 'storeon'
import { crossTab } from '@storeon/crosstab'

import { me } from './me.js'

const store = createStoreon([
  me,
  crossTab({ filter: () => true })
]);

export default store;
