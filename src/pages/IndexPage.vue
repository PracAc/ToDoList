<template>
  <FullCalendar ref="fullCalendar" :options="calendarOptions" id="PFC">
  </FullCalendar>

  <q-dialog v-model="icon">
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
        <button @click="CreatePlan">등록하기</button>
      </q-card-section>
    </q-card>
  </q-dialog>
  <q-dialog v-model="ModiDel">
    <q-card>
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">등록된 일정</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-input id="subject" v-model="Ptitle" label="제목" />
        <q-input id="SDay" type="date" v-model="StartDay" label="시작날짜" />
        <q-input id="EDay" type="date" v-model="EndDay" label="끝나는날짜" />
        <button @click="CreatePlan">등록하기</button>
      </q-card-section>
    </q-card>
  </q-dialog>
  <div>123</div>
  <!-- <div v-for="item in " :key=item.title>
    <span>{{ item }}</span>
  </div> -->
</template>

<script>
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { createEventId } from './event-utils';
// import { INITIAL_EVENTS, createEventId } from './event-utils';
import { ref } from 'vue';

// 파이어베이스에서 oTodosinDB 객체 변수 가져옴
import { database, oTodosinDB } from 'src/datasources/firebase';
// 파이어스토어 모듈객체 가져오기
import { doc, deleteDoc, updateDoc, setDoc, getDocs, collection } from "firebase/firestore";
// let PEvents = [];
// let GetEvent = async function () {
//   let querySnapshot = await getDocs(oTodosinDB);
//   querySnapshot.forEach((doc) => {

//     PEvents.push(doc.data());
//     // console.log(doc.data());
//   });
//   //   return PEvents;
// };
let getEvent = async function () {
  const todoTextList = [];
  let querySnapshot = await getDocs(oTodosinDB);
  querySnapshot.forEach((doc) => {
    todoTextList.push(doc.data()); // DB정보 배열로 가져오기
    console.log(doc.data()['todo_title']); // DB정보 제목만 찍기
  });
  console.log(todoTextList);
};
// GetEvent();
export default {
  components: {
    FullCalendar // make the <FullCalendar> tag available
  },
  data() {
    console.log(oTodosinDB);
    getEvent();
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
        initialEvents: PEvents,
        // initialEvents: INITIAL_EVENTS,
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
    };
  },
  firestore: { oTodos: oTodosinDB },
  methods: {
    handleDateClick: function (arg) {
      console.log(arg);
    },
    handleDateSelect(selectInfo) {

      this.StartDay = selectInfo.startStr;
      this.EndDay = selectInfo.endStr;

      this.Info = selectInfo;
      this.icon = true;
    },
    handleEventClick(clickInfo) {
      console.log(clickInfo.event.startStr);
      createEventId();
      // if (confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'`)) {
      //   clickInfo.event.remove();
      // }
    },
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
        this.fnSaveEdit(this.Info);
        this.Ptitle = '';
        this.icon = false;
        console.log(this.Info);
      }
      else {
      }
    },

    // deleteDoc(doc(db, 'doc', 'id')) 전달된 할 일을 DB에서 제거
    fnRemoveTodo(pKey) {
      deleteDoc(doc(database, 'Lists', pKey));
    },
    // updateDoc(doc(db, 'doc', 'id'),{필드수정}) 전달된 할 일의 b_edit를 수정모드로 변경
    fnSetEditTodo(pKey) {
      updateDoc(doc(database, 'Lists', pKey), { b_edit: true });
    },
    // updateDoc(doc(db, 'doc', 'id'),{필드수정}) 전달된 할 일의 b_edit를 읽기모드로 변경
    fnCancelEdit(pKey) {
      updateDoc(doc(database, 'Lists', pKey), { b_edit: false });
    },
    // updateDoc(doc(db, 'doc', 'id'),{필드수정}) 체크박스 선택되면 DB에 b_completed 변경값 저장
    fnCheckboxChange(sKey) {
      const pKey = sKey.id;
      updateDoc(doc(database, 'Lists', pKey), {
        b_completed: sKey.b_completed
      });
    }
  },

  setup() {
    let icon = ref(false);
    let ModiDel = ref(false);
    let StartDay = ref('');
    let EndDay = ref('');
    let Info = ref('');
    let Ptitle = ref('');
    let item = [];
    // updateDoc(doc(db, 'doc', 'id'),{필드수정}) 전달된 할 일의 수정값을 DB에 저장
    let fnSaveEdit = function (Info) {
      const pKey = this.Ptitle;
      setDoc(doc(database, 'Lists', pKey), {
        id: createEventId(),
        title: pKey,
        start: Info.startStr,
        end: Info.endStr,
        allDay: Info.allDay,
      });
    };

    return {
      icon, StartDay, EndDay, Ptitle, Info, ModiDel, fnSaveEdit,
    };
  }
};
console.log();
// 파이어스토어 규칙 변경
// match /databases/{database}/documents {
//     // 자신의 데이터만 읽고 쓸 수 있도록 허용
//     match /users/{userId} { 
//       allow read, update, delete: if request.auth != null && request.auth.uid == userId;
//       allow create: if request.auth != null;
//     }
//   }
</script>