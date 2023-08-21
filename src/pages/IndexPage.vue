<template>
  <FullCalendar ref="fullCalendar" :options="calendarOptions" id="PFC">
  </FullCalendar>

  <!-- 일정등록 -->
  <q-dialog v-model="AddPlan">
    <q-card>
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">일정 추가하기</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-input id="subject" v-model="Ptitle" label="제목" />
        <q-input id="SDay" type="date" v-model="StartDay" label="시작날짜" />
        <q-input id="EDay" type="date" v-model="EndDay" label="끝나는날짜" />
        <q-btn label="등록하기" color="primary" @click="CreatePlan"></q-btn>
      </q-card-section>
    </q-card>
  </q-dialog>

  <!-- 일정수정,삭제 -->
  <q-dialog v-model="Chkplan">
    <q-card>
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">등록된 일정</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-input id="subject" v-model="Ptitle" :readonly="ModifyChk" label="제목" />
        <q-input id="SDay" type="date" v-model="StartDay" :readonly="ModifyChk" label="시작날짜" />
        <q-input id="EDay" type="date" v-model="EndDay" :readonly="ModifyChk" label="끝나는날짜" />
        <q-btn-group v-if="ModifyChk === true">
          <q-btn label="수정하기" color="primary" @click="ModifyChk === false ? ModifyChk = true : ModifyChk = false;" />
          <q-btn label="삭제하기" color="primary" @click="ConDel = true" />
        </q-btn-group>
        <q-btn-group v-else>
          <q-btn label="수정완료" color="primary" @click="ModifyPlan" />
          <q-btn label="삭제하기" color="primary" @click="ConDel = true" />
        </q-btn-group>
      </q-card-section>
    </q-card>
  </q-dialog>

  <q-dialog v-model="ConDel" persistent>
    <q-card>
      <q-card-section class="row items-center">
        <span class="q-ml-sm">{{ this.Ptitle }} 일정을 정말 삭제하시겠습니까?</span>
      </q-card-section>

      <q-card-actions>
        <q-btn flat label="취소" color="primary" v-close-popup />
        <q-btn flat label="삭제" color="primary" v-close-popup @click="DelPlan(true)" />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- <q-table flat bordered title="목록" :rows="TableRow" :columns="columns" row-key="id">
    <template v-slot:header="props">
      <q-tr :props="props">
        <q-th auto-width />
        <q-th v-for="col in props.cols" :key="col.name" :props="props">
          {{ col.label }}
        </q-th>
      </q-tr>
    </template>

    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td auto-width>
          <q-btn size="sm" color="accent" round dense @click="props.expand = !props.expand"
            :icon="props.expand ? 'remove' : 'add'" />
        </q-td>
        <q-td v-for="col in props.cols" :key="col.name" :props="props">
          {{ col.value }}
        </q-td>
      </q-tr>
      <q-tr v-show="props.expand" :props="props">
        <q-td colspan="100%">
          <div class="text-left">This is expand slot for row above: {{ props.row.name }}.</div>
        </q-td>
      </q-tr>
    </template>
  </q-table> -->
  <div class="q-pa-md" style="max-width: 350px">
    <q-list bordered padding>

      <q-item tag="label" v-ripple v-for="item in this.oTodos" :key=item.key>
        <q-item-section side>
          <q-checkbox v-model="ListChk" :val=item.value />
        </q-item-section>

        <q-item-section>
          <q-item-label>{{ item.title }}</q-item-label>
          <q-item-label caption>
            시작날짜 : {{ item.start }}
          </q-item-label>
          <q-item-label caption>
            끝나는날짜 : {{ item.end }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script>
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { ref } from 'vue';

import { INITIAL_EVENTS, createEventId } from './event-utils';
// 파이어베이스에서 oTodosinDB 객체 변수 가져옴
import { database, oTodosinDB } from 'src/datasources/firebase';
// 파이어스토어 모듈객체 가져오기
import { doc, deleteDoc, updateDoc, setDoc } from "firebase/firestore";

export default {
  components: {
    FullCalendar // make the <FullCalendar> tag available
  },
  data() {
    return {
      calendarOptions: {
        plugins: [dayGridPlugin, interactionPlugin],
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth'
        },
        locale: 'ko',
        initialView: 'dayGridMonth',
        // 기본값으로 설정하는 이벤트 추후 db연동 세팅
        // initialEvents: DBevent,
        // initialEvents: this.InitialEvent,
        events: function () { return INITIAL_EVENTS(); },
        timeZone: 'local',
        editable: true,
        selectable: true,
        selectMirror: true,
        dayMaxEvents: true,
        weekends: true,
        dateClick: this.handleDateClick,
        select: this.handleDateSelect,
        eventClick: this.handleEventClick,
      },
      oTodos: [],

      // 모달 설정변수
      AddPlan: ref(false),
      Chkplan: ref(false),
      ConDel: ref(false),

      // 모달안 인풋부분 설정변수
      StartDay: ref(''),
      EndDay: ref(''),
      Info: ref(''),
      Ptitle: ref(''),
      FindId: ref(''),

      // 수정설정 변수
      ModifyChk: ref(true),

      ListChk: ref([]),
    };
  },
  firestore: { oTodos: oTodosinDB },
  methods: {
    // 캘린더 이벤트 함수
    handleDateSelect(selectInfo) {
      this.Ptitle = '';
      this.StartDay = selectInfo.startStr;
      this.EndDay = selectInfo.endStr;

      this.Info = selectInfo;
      this.AddPlan = true;
      console.log(selectInfo.endStr);
    },
    handleEventClick(clickInfo) {
      this.Chkplan = true;
      this.Ptitle = '';

      this.Ptitle = clickInfo.event.title;
      this.StartDay = clickInfo.event.startStr;
      this.EndDay = clickInfo.event.endStr;
      this.FindId = clickInfo.event.id;

      this.Info = clickInfo;
    },

    // 버튼이벤트 함수
    CreatePlan() {
      let calendarApi = this.Info.view.calendar;
      // calendarApi = calendarApi.view.calendar;
      let subject = this.Ptitle;
      // 유효성검사시 공백란 제거 필요
      if (subject !== '') {
        calendarApi.addEvent({
          id: createEventId(),
          title: subject,
          start: this.StartDay,
          end: this.EndDay,
          allDay: true,
        });
        this.ToDoSave(this.Info);

        this.AddPlan = false;
        console.log(this.Info);
      }
    },
    DelPlan(val) {
      if (val === true) {
        let subject = this.Ptitle;
        if (subject !== '') {
          this.ToDoDelete(this.FindId);
          this.Info.event.remove();
          this.Chkplan = false;
        }
      }
    },
    ModifyPlan() {
      let calendarApi = this.Info.view.calendar;
      this.Info.event.remove();

      calendarApi.addEvent({
        id: this.FindId,
        title: this.Ptitle,
        start: this.StartDay,
        end: this.EndDay,
        allDay: true,
      });
      this.ToDoUpdate(this.Info);
      this.ModifyChk = true;
    },

    // firebase 저장,삭제,수정 함수
    ToDoSave(Info) {
      const pKey = createEventId();
      setDoc(doc(database, 'Lists', pKey), {
        id: pKey,
        title: this.Ptitle,
        start: Info.startStr,
        end: Info.endStr,
        allDay: Info.allDay,
        value: this.Ptitle + Info.startStr,
        important: false,
        finishChk: false
      });
    },
    ToDoDelete(pKey) {
      deleteDoc(doc(database, 'Lists', pKey));
    },
    ToDoUpdate() {
      const pKey = this.FindId;
      updateDoc(doc(database, 'Lists', pKey), {
        title: this.Ptitle,
        start: this.StartDay,
        end: this.EndDay,
        value: this.Ptitle + this.StartDay
      });
    },
  },
  setup() {
    // let AddPlan, Chkplan, ConDel = ref(false);

    // let StartDay, EndDay, Info, Ptitle, FindId = ref('');

    // let ModifyChk = ref(true);
    // let editBtn = ref('');

    // let TableRow = ref(INITIAL_EVENTS());
    // firebase 저장
    // let ToDoSave = function (Info) {
    //   const pKey = createEventId();
    //   setDoc(doc(database, 'Lists', pKey), {
    //     id: pKey,
    //     title: this.Ptitle,
    //     start: Info.startStr,
    //     end: Info.endStr,
    //     allDay: Info.allDay,
    //   });
    // };
    // firebase 삭제
    // let ToDoDelete = function (pKey) {
    //   deleteDoc(doc(database, 'Lists', pKey));
    // };
    // let ToDoUpdate = function () {
    //   const pKey = this.FindId;
    //   updateDoc(doc(database, 'Lists', pKey), {
    //     title: this.Ptitle,
    //     start: this.StartDay,
    //     end: this.EndDay,
    //   });
    // };

    // const Inner = INITIAL_EVENTS();
    // Inner.then((result) => {
    //   TableRow = result;
    //   // return result;
    // });
    return {
      // AddPlan, Chkplan, ConDel
      // StartDay, EndDay, Ptitle, Info, FindId,
      // ModifyChk, editBtn,
      // ToDoSave, ToDoDelete, ToDoUpdate
    };
  }
};
// 파이어스토어 규칙 변경
// match /databases/{database}/documents {
//     // 자신의 데이터만 읽고 쓸 수 있도록 허용
//     match /users/{userId} { 
//       allow read, update, delete: if request.auth != null && request.auth.uid == userId;
//       allow create: if request.auth != null;
//     }
//   }

</script>