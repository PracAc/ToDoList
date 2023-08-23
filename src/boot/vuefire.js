import { boot } from 'quasar/wrappers';

import { VueFire, VueFireFirestoreOptionsAPI } from 'vuefire';

export default boot(({ app }) => {
    app.use(VueFire, { modules: [VueFireFirestoreOptionsAPI()] });
});