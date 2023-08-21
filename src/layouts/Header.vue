<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>
          Quasar App
        </q-toolbar-title>
        <!-- <div>Quasar v{{ $q.version }}</div> -->
        <q-btn flat @click="toggleRightDrawer" round dense icon="menu" aria-label="Menu" />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header>
        </q-item-label>

        <EssentialLink v-for="link in essentialLinks" :key="link.title" v-bind="link" />
      </q-list>
    </q-drawer>
    <q-drawer side="right" v-model="drawerRight" show-if-above overlay :width="300" :breakpoint="500" bordered
      :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-3'">
      <q-scroll-area class="fit" :horizontal-thumb-style="{ opacity: 0 }">
        <q-list padding>

          <q-expansion-item group="ListGroup" clickable icon="inbox" label="inbox">
            <q-card>
              <q-card-section class="no-padding">
                <q-list bordered>
                  <q-item tag="label" v-ripple v-for="item in this.oTodos" :key=item.key>
                    <q-item-section side>
                      <q-checkbox v-model="ListChk" :val=item.value @click="fnChkFinish(item.id)" />
                    </q-item-section>

                    <q-item-section>
                      <q-item-label>{{ item.title }}</q-item-label>
                      <q-item-label caption>
                        시작날짜 : {{ item.start }}
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-checkbox v-model="ImportChk" :val=item.id checked-icon="star" unchecked-icon="star_border"
                        indeterminate-icon="help" />
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>
          </q-expansion-item>

          <q-expansion-item group="ListGroup" clickable icon="star" label="star">
            <q-card>
              <q-card-section>
                Lorem ipsum
              </q-card-section>
            </q-card>
          </q-expansion-item>

          <q-expansion-item group="ListGroup" class="fixed-bottom" clickable icon="star" label="완료한 목록">
            <q-card>
              <q-card-section>
                Lorem ipsum
              </q-card-section>
            </q-card>
          </q-expansion-item>

        </q-list>
      </q-scroll-area>
    </q-drawer>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from 'vue';
import EssentialLink from 'components/EssentialLink.vue';
import { INITIAL_EVENTS, FINISH_CHK } from '/src/pages/event-utils';

import { database, oTodosinDB } from 'src/datasources/firebase';
import { doc, deleteDoc, updateDoc, setDoc, getDoc, getDocs } from "firebase/firestore";

const linksList = [
  {
    title: 'Docs',
    caption: 'quasar.dev',
    icon: 'school',
    link: 'https://quasar.dev'
  },
  {
    title: 'Github',
    caption: 'github.com/quasarframework',
    icon: 'code',
    link: 'https://github.com/quasarframework'
  },
  {
    title: 'Quasar Awesome',
    caption: 'Community Quasar projects',
    icon: 'favorite',
    link: 'https://awesome.quasar.dev'
  }
];

export default defineComponent({
  name: 'MainLayout',

  components: {
    EssentialLink
  },
  data() {
    return {
      oTodos: [],
      ListChk: ref([]),
      ImportChk: ref([]),
    };
  },
  firestore: { oTodos: oTodosinDB },
  methods: {
    fnChkFinish: async function (pKey) {
      console.log(this.ListChk);
      let ChkComplete = await getDoc(doc(database, 'Lists', pKey));
      ChkComplete.data().finishChk === true ?
        updateDoc(doc(database, 'Lists', pKey), { finishChk: false }) :
        updateDoc(doc(database, 'Lists', pKey), { finishChk: true });
    },
  },
  setup() {
    const leftDrawerOpen = ref(false);
    const drawerRight = ref(true);
    let FINISH_CHK = async function () {
      let querySnapshot = await getDocs(oTodosinDB);
      querySnapshot.forEach(function (doc) {
        if (doc.data().finishChk === true) {
          this.ListChk.push(doc.data().value); // DB정보 배열로 가져오기
        }
      });
      console.log(ListChk);
      return this.ListChk;
    };
    return {
      essentialLinks: linksList,
      leftDrawerOpen, drawerRight,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
      toggleRightDrawer() {
        drawerRight.value = !drawerRight.value;
      },

    };
  }
});
</script>
