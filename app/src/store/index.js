import { createStoreon } from 'storeon';
//import { crossTab } from '@storeon/crosstab';

import { meStore } from './me.js';
import { routerStore } from './router.js';
import { entityStore } from './entity.js';

const store = createStoreon([meStore, routerStore, entityStore]);
export default store;
