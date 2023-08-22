<template>
  <FullCalendar ref="fullCalendar" :options="calendarOptions" id="PFC">
  </FullCalendar>

  <!-- 일정등록 -->
  <q-dialog v-model="AddPlan">
    <q-card class="ModalCard">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-blue-5">일정 추가하기</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-input id="subject" v-model="Ptitle" label="제목" />
        <q-input id="SDay" type="date" v-model="StartDay" label="시작날짜" />
        <q-input id="EDay" type="date" v-model="EndDay" label="끝나는날짜" />
        <q-expansion-item label="추가항목 입력" @click="MoreOpt = !MoreOpt;">
          <q-card>
            <q-card-section class="no-padding">
              <q-list>
                <q-item tag="label">
                  <q-item-section>
                    <q-input type="text" v-model="Price" label="사용금액" />
                    <q-input type="textarea" v-model="Description" label="설명" />
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </q-expansion-item>
      </q-card-section>

      <q-btn-group spread class="q-mt-sm">
        <q-btn label="등록하기" color="blue-6" @click="CreatePlan"></q-btn>
      </q-btn-group>
    </q-card>
  </q-dialog>

  <!-- 일정수정,삭제 -->
  <q-dialog v-model="Chkplan">
    <q-card class="ModalCard">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">등록된 일정</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-input v-model="Ptitle" :readonly="ModifyChk" label="제목" />
        <q-input type="date" v-model="StartDay" :readonly="ModifyChk" label="시작날짜" />
        <q-input type="date" v-model="EndDay" :readonly="ModifyChk" label="끝나는날짜" />
        <q-input type="text" v-model="Price" :readonly="ModifyChk" label="사용금액" />
        <q-input type="textarea" v-model="Description" :readonly="ModifyChk" label="설명" />
      </q-card-section>
      <q-btn-group v-if="ModifyChk === true" spread class="q-mt-sm">
        <q-btn label="수정하기" color="blue-5" @click="ModifyChk === false ? ModifyChk = true : ModifyChk = false;" />
        <q-btn label="삭제하기" color="red-4" @click="ConDel = true" />
      </q-btn-group>
      <q-btn-group v-else spread class="q-mt-sm">
        <q-btn label="수정완료" color="blue-5" @click="ModifyPlan" />
        <q-btn label="삭제하기" color="red-4" @click="ConDel = true" />
      </q-btn-group>
    </q-card>
  </q-dialog>

  <q-dialog v-model="ConDel" persistent>
    <q-card>
      <q-card-section class="row items-center">
        <span class="q-ml-sm"><span class="text-red-5">{{ this.Ptitle }}</span> 일정을 정말 삭제하시겠습니까?</span>
      </q-card-section>

      <q-card-actions>
        <q-btn flat label="취소" color="primary" v-close-popup />
        <q-btn flat label="삭제" color="red-5" v-close-popup @click="DelPlan(true)" />
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
          left: 'prev today',
          center: 'title',
          right: 'next'
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
        select: this.handleDateSelect,
        eventClick: this.handleEventClick,
      },
      oTodos: [],

      // 모달 설정변수
      AddPlan: ref(false),
      Chkplan: ref(false),
      ConDel: ref(false),
      MoreOpt: ref(false),

      // 모달안 인풋부분 설정변수
      StartDay: ref(''),
      EndDay: ref(''),
      Info: ref(''),
      Ptitle: ref(''),
      FindId: ref(''),
      Price: ref(''),
      Description: ref(''),

      // 수정설정 변수
      ModifyChk: ref(true),


    };
  },
  firestore: { oTodos: oTodosinDB },
  methods: {
    // 캘린더 이벤트 함수
    handleDateSelect(selectInfo) {
      // 값초기화
      this.Ptitle = '';
      this.Price = '';
      this.Description = '';
      this.MoreOpt = false;
      this.StartDay = selectInfo.startStr;
      this.EndDay = selectInfo.endStr;
      this.Info = selectInfo;

      // 모달 show
      this.AddPlan = true;
    },
    handleEventClick(clickInfo) {
      // 모달 show
      this.Chkplan = true;

      // 값초기화
      this.Ptitle = '';
      this.StartDay = '';
      this.EndDay = '';
      this.FindId = '';
      this.Info = '';

      // filter 사용해서해당 db값 otdos에서가져오기
      console.log();
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
        description: this.Description,
        price: this.Price
      });
      this.ToDoUpdate(this.Info);

      this.ModifyChk = true;
      this.Chkplan = false;
    },

    // firebase 저장,삭제,수정 함수
    ToDoSave(Info) {
      const pKey = createEventId();
      if (this.MoreOpt === true) {
        setDoc(doc(database, 'Lists', pKey), {
          id: pKey,
          title: this.Ptitle,
          start: Info.startStr,
          end: Info.endStr,
          allDay: Info.allDay,
          important: false,
          finishChk: false,
          description: this.Description,
          consume: this.Price
        });
      } else {
        setDoc(doc(database, 'Lists', pKey), {
          id: pKey,
          title: this.Ptitle,
          start: Info.startStr,
          end: Info.endStr,
          allDay: Info.allDay,
          important: false,
          finishChk: false
        });
      }
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