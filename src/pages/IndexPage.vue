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
        <button @click="CreatePlan">등록하기</button>
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
        <q-input id="subject" v-model="Ptitle" :readonly="editable" label="제목" />
        <q-input id="SDay" type="date" v-model="StartDay" :readonly="editable" label="시작날짜" />
        <q-input id="EDay" type="date" v-model="EndDay" :readonly="editable" label="끝나는날짜" />
        <q-btn-group v-if="editable === false">
          <q-btn label="수정하기" color="primary" @click="editable === false ? editable = true : editable = false;" />
          <q-btn label="삭제하기" color="primary" @click="ConDel = true" />
        </q-btn-group>
        <q-btn-group v-else>
          <q-btn label="수정하기" color="primary" @click="editable === false ? editable = true : editable = false;" />
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
import { doc, deleteDoc, updateDoc, setDoc, getDocs, collection } from "firebase/firestore";

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
    };
  },
  firestore: { oTodos: oTodosinDB },
  methods: {
    handleDateSelect(selectInfo) {
      this.Ptitle = '';
      this.StartDay = selectInfo.startStr;
      this.EndDay = selectInfo.endStr;

      this.Info = selectInfo;
      this.AddPlan = true;
      console.log(selectInfo);
    },
    handleEventClick(clickInfo) {
      this.Chkplan = true;
      this.Ptitle = '';

      this.Ptitle = clickInfo.event.title;
      this.StartDay = clickInfo.event.startStr;
      this.EndDay = clickInfo.event.endStr;
      this.FindId = clickInfo.event.id;

      this.Info = clickInfo;

      // console.log(calendarApi.getEventById(clickInfo.event.id));
      // console.log(clickInfo.event.getEvents());
      // createEventId();
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
        this.ToDoSave(this.Info);

        this.AddPlan = false;
        console.log(this.Info);
      }
    },
    DelPlan(val) {
      if (val === true) {
        let subject = this.Ptitle;
        if (subject !== '') {
          this.ToDoDelete(this.Ptitle);
          this.Info.event.remove();
          this.Chkplan = false;
        }
      }
    },
    ModifyPlan() {

    },
    // deleteDoc(doc(db, 'doc', 'id')) 전달된 할 일을 DB에서 제거

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
    let AddPlan = ref(false);
    let Chkplan = ref(false);
    let ConDel = ref(false);

    let StartDay = ref('');
    let EndDay = ref('');
    let Info = ref('');
    let Ptitle = ref('');
    let FindId = ref('');

    let editable = ref(true);
    let editBtn = ref('');
    // firebase 저장
    let ToDoSave = function (Info) {
      const pKey = this.Ptitle;
      setDoc(doc(database, 'Lists', pKey), {
        id: createEventId,
        title: pKey,
        start: Info.startStr,
        end: Info.endStr,
        allDay: Info.allDay,
      });
    };
    // firebase 삭제
    let ToDoDelete = function (pKey) {
      deleteDoc(doc(database, 'Lists', pKey));
    };


    return {
      AddPlan, Chkplan, ConDel,
      StartDay, EndDay, Ptitle, Info, FindId,
      editable, editBtn,
      ToDoSave, ToDoDelete,
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