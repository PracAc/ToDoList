<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title>
          캘린더
        </q-toolbar-title>
        <!-- <div>Quasar v{{ $q.version }}</div> -->
        <q-btn flat @click="toggleRightDrawer" round dense icon="menu" aria-label="Menu" />
      </q-toolbar>
    </q-header>

    <q-drawer side="right" v-model="drawerRight" show-if-above overlay :width="300" :breakpoint="300" bordered
      :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-3'">
      <q-scroll-area class="fit" :horizontal-thumb-style="{ opacity: 0 }">
        <q-list padding>

          <!-- 전체목록표시 -->
          <q-expansion-item group="ListGroup" clickable default-opened icon="inbox" label="전체 리스트">
            <q-card v-for="item in this.oTodos" :key=item.key>
              <q-card-section class="no-padding">
                <q-list>
                  <q-item tag="label" v-ripple v-if="item.finishChk === false">
                    <q-item-section side>
                      <q-checkbox v-model="ListChk" :val=item.id @click="fnChkFinish(item.id)" />
                    </q-item-section>

                    <q-item-section>
                      <q-item-label>{{ item.title }}</q-item-label>
                      <q-item-label caption>
                        시작날짜 : {{ item.start }}
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-checkbox v-model="ImportChk" :val=item.id checked-icon="star" unchecked-icon="star_border"
                        indeterminate-icon="help" @click="fnChkImportant(item.id)" />
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>
          </q-expansion-item>

          <!-- 중요한목록표시 -->
          <q-expansion-item group="ListGroup" clickable icon="star" label="중요한 리스트">
            <q-card v-for="item in this.oTodos" :key=item.key>
              <q-card-section class="no-padding">
                <q-list>
                  <q-item tag="label" v-ripple v-if="item.finishChk === false && item.important === true">
                    <q-item-section side>
                      <q-checkbox v-model="ListChk" :val=item.id @click="fnChkFinish(item.id)" />
                    </q-item-section>

                    <q-item-section>
                      <q-item-label>{{ item.title }}</q-item-label>
                      <q-item-label caption>
                        시작날짜 : {{ item.start }}
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-checkbox v-model="ImportChk" :val=item.id checked-icon="star" unchecked-icon="star_border"
                        indeterminate-icon="help" @click="fnChkImportant(item.id)" />
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>
          </q-expansion-item>

          <!-- 완료목록 표시 -->
          <q-expansion-item group="ListGroup" class="fixed-bottom" clickable icon="add_task" label="완료한 리스트">
            <q-card v-for="item in this.oTodos" :key=item.key>
              <q-card-section class="no-padding">
                <q-list class="FinishList">
                  <q-item tag="label" v-ripple v-if="item.finishChk === true">
                    <q-item-section side>
                      <q-checkbox v-model="ListChk" :val=item.id @click="fnChkFinish(item.id)" />
                    </q-item-section>

                    <q-item-section>
                      <q-item-label>{{ item.title }}</q-item-label>
                      <q-item-label caption>
                        시작날짜 : {{ item.start }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>
          </q-expansion-item>

        </q-list>
      </q-scroll-area>
      <div class="q-px-sm q-mt-sm">
        Your selection is: <strong>{{ ListChk }}</strong><br>
        Your selection is: <strong>{{ ImportChk }}</strong>
      </div>
    </q-drawer>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from 'vue';

import { database, oTodosinDB } from 'src/datasources/firebase';
import { doc, deleteDoc, updateDoc, setDoc, getDoc, getDocs } from "firebase/firestore";



export default defineComponent({
  name: 'MainLayout',

  data() {
    return {
      oTodos: [],
      ListChk: ref(this.FinishList),
      ImportChk: ref(this.ImportantList),
    };
  },
  firestore: { oTodos: oTodosinDB },
  methods: {
    fnChkFinish: async function (pKey) {
      let ChkComplete = await getDoc(doc(database, 'Lists', pKey));
      ChkComplete.data().finishChk === true ?
        updateDoc(doc(database, 'Lists', pKey), { finishChk: false }) :
        updateDoc(doc(database, 'Lists', pKey), { finishChk: true });
    },
    fnChkImportant: async function (pKey) {
      let ChkComplete = await getDoc(doc(database, 'Lists', pKey));
      ChkComplete.data().important === true ?
        updateDoc(doc(database, 'Lists', pKey), { important: false }) :
        updateDoc(doc(database, 'Lists', pKey), { important: true });
    },

  },
  setup() {
    const drawerRight = ref(true);

    const FinishList = [];
    const ImportantList = [];
    let FINISH_CHK = async function () {
      let querySnapshot = await getDocs(oTodosinDB);
      querySnapshot.forEach(function (doc) {
        if (doc.data().finishChk === true) {
          FinishList.push(doc.data().id); // DB정보 배열로 가져오기
        }
      });
    };
    let ImoprtantCHK = async function () {
      let querySnapshot = await getDocs(oTodosinDB);
      querySnapshot.forEach(function (doc) {
        if (doc.data().important === true) {
          ImportantList.push(doc.data().id); // DB정보 배열로 가져오기
        }
      });
    };
    FINISH_CHK();
    ImoprtantCHK();
    return {
      drawerRight, FinishList, ImportantList,
      toggleRightDrawer() {
        drawerRight.value = !drawerRight.value;
      },

    };
  },
});

</script>
