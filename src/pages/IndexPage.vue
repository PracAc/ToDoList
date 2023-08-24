<template>
  <FullCalendar ref="fullCalendar" :options="calendarOptions">
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
        <q-input v-model="Ptitle" label="제목" />
        <q-input type="date" v-model="StartDay" label="시작날짜" />
        <q-input type="date" v-model="EndDay" label="끝나는날짜" />
        <q-toggle label="추가항목 설정" v-model="AddMore" />

        <q-expansion-item v-for="Mitem in this.MoreArr" :label="Mitem.moretitle" :key=Mitem.key group="MoreOptGroup"
          caption="상세 설정" :disable="!AddMore">
          <template v-slot:after>
            <q-btn round dense flat icon="expand_more" color="blue-5" v-model="test" @click="test = !test" />
            <q-btn round dense flat icon="remove" color="red-4" />
          </template>
          <q-item-section>
            <q-input type="text" v-model="Mitem.moreprice" label="사용금액" />
            <q-input type="text" v-model="Mitem.moredescription" label="설명" />
            <q-btn class="q-mt-sm" label="항목 삭제" color="red-4" @click="DelMore(Mitem.id)" />
          </q-item-section>
        </q-expansion-item>

        <q-input label="항목명" v-show="AddMore" v-model="MoreTitle">
          <template v-slot:after>
            <q-btn round dense flat icon="add" color="blue-5" @click="CreateMore" />
          </template>
        </q-input>

        <q-input label="항목명">
          <template v-slot:after>
            <q-btn round dense flat icon="expand_more" color="blue-5" v-model="test" @click="test = !test" />
            <q-btn round dense flat icon="remove" color="red-4" />
          </template>
        </q-input>
        <q-slide-transition v-show="test">
          <div>
            <q-input type="text" label="설명" />
            <q-input type="text" label="사용금액" />
          </div>
        </q-slide-transition>

        <!-- <q-card bordered>

          <q-card-section>
            <q-input label="항목명">
              <template v-slot:after>
                <q-btn color="blue-5" round flat dense :icon="test ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
                  @click="test = !test" />
                <q-btn round dense flat icon="remove" color="red-4" />
              </template>
            </q-input>
          </q-card-section>
          <q-slide-transition>
            <div v-show="test">
              <q-separator />
              <q-card-section class="text-subtitle2">
                <q-input type="text" label="사용금액" />
                <q-input type="text" label="설명" />
              </q-card-section>
            </div>
          </q-slide-transition>
        </q-card> -->

      </q-card-section>


      <q-btn-group spread class="q-mt-sm">
        <q-btn label="등록하기" color="blue-6" @click="CreatePlan"></q-btn>
      </q-btn-group>
    </q-card>
  </q-dialog>

  <!-- 일정수정,삭제 -->
  <q-dialog v-model="Chkplan">
    <!-- 입력된 일정 확인부분 -->
    <q-card class="ModalCard" v-if="ModifyChk === true">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">등록된 일정</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section v-if="MoreListChk === true">
        <q-input v-model="Ptitle" :readonly="ModifyChk" label="제목" />
        <q-input type="date" v-model="StartDay" :readonly="ModifyChk" label="시작날짜" />
        <q-input type="date" v-model="EndDay" :readonly="ModifyChk" label="끝나는날짜" />
        <q-toggle :label="`추가항목보기`" v-model="ShowList" />
        <q-expansion-item v-show="ShowList" v-for="Mitem in this.MoreArr" :label="Mitem.moretitle" :key=Mitem.key
          group="MoreOptGroup" caption="상세 보기">
          <q-card>
            <q-card-section class="no-padding">
              <q-list>
                <q-item tag="label">
                  <q-item-section>
                    <q-input type="text" v-model="Mitem.moreprice" :readonly="MoreListChk" label="사용금액" />
                    <q-input type="text" v-model="Mitem.moredescription" :readonly="MoreListChk" label="설명" />
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </q-expansion-item>
      </q-card-section>

      <q-card-section v-else>
        <q-input v-model="Ptitle" :readonly="ModifyChk" label="제목" />
        <q-input type="date" v-model="StartDay" :readonly="ModifyChk" label="시작날짜" />
        <q-input type="date" v-model="EndDay" :readonly="ModifyChk" label="끝나는날짜" />
      </q-card-section>

      <q-btn-group spread class="q-mt-sm">
        <q-btn label="수정하기" color="blue-5" @click="ModifyChk = false" />
        <q-btn label="삭제하기" color="red-4" @click="ConDel = true" />
      </q-btn-group>
    </q-card>

    <!-- 입력된 일정 수정부분 -->
    <q-card class="ModalCard" v-else>
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">등록된 일정</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-input id="subject" v-model="Ptitle" label="제목" />
        <q-input id="SDay" type="date" v-model="StartDay" label="시작날짜" />
        <q-input id="EDay" type="date" v-model="EndDay" label="끝나는날짜" />
        <q-toggle :label="`추가항목 설정`" v-model="AddMore" />

        <q-input bottom-slots label="항목명" :disable="!AddMore" v-model="MoreTitle">
          <template v-slot:append>
            <q-btn round dense flat icon="add" color="blue-5" @click="CreateMore" />
          </template>
        </q-input>

        <q-expansion-item v-for="Mitem in this.MoreArr" :label="Mitem.moretitle" :key=Mitem.key group="MoreOptGroup"
          caption="상세 설정">
          <q-card>
            <q-card-section class="no-padding">
              <q-list>
                <q-item tag="label">
                  <q-item-section>
                    <q-input :readonly="!AddMore" v-model="Mitem.moreprice" type="text" label="사용금액" />
                    <q-input :readonly="!AddMore" v-model="Mitem.moredescription" type="text" label="설명" />
                    <q-btn :disable="!AddMore" class="q-mt-sm" label="항목 삭제" color="red-4"
                      @click="DelMore(Mitem.moreid)" />
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </q-expansion-item>
      </q-card-section>

      <q-btn-group spread class="q-mt-sm">
        <q-btn label="수정완료" color="blue-5" @click="ModifyPlan" />
      </q-btn-group>
    </q-card>
  </q-dialog>

  <!-- 삭제 prompt -->
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
import { database, oTodosinDB } from 'src/boot/firebase';
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
      AddMore: ref(false),

      // 모달안 인풋부분 설정변수
      StartDay: ref(''),
      EndDay: ref(''),
      Info: ref(''),
      Ptitle: ref(''),
      FindId: ref(''),
      Price: ref(''),
      ConDescription: ref(''),

      MoreArr: ref([]),
      MoreTitle: ref(''),
      MoreIncrease: ref(0),
      ShowList: ref(false),
      test: ref(false),
      // 수정설정 변수
      ModifyChk: ref(true),
      MoreListChk: ref(false)

    };
  },
  firestore: { oTodos: oTodosinDB },
  methods: {

    // 캘린더 이벤트 함수
    handleDateSelect(selectInfo) {
      // 값초기화
      this.Ptitle = '';
      this.Price = '';
      this.ConDescription = '';
      this.Price = '';
      this.MoreOpt = false;
      this.StartDay = selectInfo.startStr;
      this.EndDay = selectInfo.endStr;
      this.Info = selectInfo;

      // 추가항목 초기화
      this.AddMore = false;
      this.MoreArr = [];
      this.MoreTitle = '';
      this.MoreIncrease = 0;

      // 모달 show
      this.AddPlan = true;
    },

    handleEventClick(clickInfo) {
      // 모달 show
      this.Chkplan = true;
      this.ModifyChk = true;
      this.MoreOpt = false;

      // 값초기화
      this.MoreListChk = false;
      this.Ptitle = '';
      this.StartDay = '';
      this.EndDay = '';
      this.FindId = '';
      this.Info = '';

      // 추가항목 초기화
      this.AddMore = false;
      this.MoreArr = [];
      this.MoreTitle = '';
      this.MoreIncrease = 0;
      this.ShowList = false;

      this.Ptitle = clickInfo.event.title;
      this.StartDay = clickInfo.event.startStr;
      this.EndDay = clickInfo.event.endStr;
      this.FindId = clickInfo.event.id;

      this.Info = clickInfo;

      // filter 사용해서해당 db값 otdos에서가져오기
      let FindTodo = this.oTodos.filter((item) => item.id === clickInfo.event.id);
      // console.log(FindTodo[0].morelist);
      if (FindTodo[0].morelist.length >= 1) {
        this.MoreListChk = true;
        this.MoreArr = FindTodo[0].morelist;
        this.MoreIncrease = this.MoreArr[this.MoreArr.length - 1].moreid;
      } else {
        this.MoreListChk = false;
        this.MoreArr = [];
      }
      // console.log(this.MoreArr);
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
        this.MoreArr = [];
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
      this.ToDoUpdate(this.FindId);

      this.Chkplan = false;
    },

    // firebase 저장,삭제,수정 함수
    ToDoSave(Info) {
      const pKey = createEventId();
      if (this.AddMore === true) {
        console.log(this.MoreArr);
        for (let moreitem of this.MoreArr) {
          if (moreitem.moretitle === '') {
            this.DelMore(moreitem.id);
          }
        }
        setDoc(doc(database, 'Lists', pKey), {
          id: pKey,
          title: this.Ptitle,
          start: Info.startStr,
          end: Info.endStr,
          allDay: Info.allDay,
          important: false,
          finishChk: false,
          morelist: this.MoreArr
        });
      } else {
        setDoc(doc(database, 'Lists', pKey), {
          id: pKey,
          title: this.Ptitle,
          start: Info.startStr,
          end: Info.endStr,
          allDay: Info.allDay,
          important: false,
          finishChk: false,
          morelist: []
        });
      }
    },
    ToDoDelete(pKey) {
      deleteDoc(doc(database, 'Lists', pKey));
    },
    async ToDoUpdate(pKey) {
      if (this.AddMore === true) {
        await updateDoc(doc(database, 'Lists', pKey), {
          title: this.Ptitle,
          start: this.StartDay,
          end: this.EndDay,
          morelist: this.MoreArr,
        });
      } else {
        updateDoc(doc(database, 'Lists', pKey), {
          title: this.Ptitle,
          start: this.StartDay,
          end: this.EndDay,
        });
      }
    },

    // 추가항목 생성함수
    CreateMore() {
      if (this.AddMore && this.MoreTitle !== '') {
        this.MoreArr.push(
          {
            moreid: this.MoreIncrease,
            moretitle: this.MoreTitle,
            moreprice: '',
            moredescription: '',
          });
        this.MoreTitle = '';
        this.MoreIncrease = this.MoreIncrease + 1;
      }
      console.log(this.MoreArr);
    },
    // 추가항목 삭제함수
    DelMore(key) {
      let FindObj_i = this.MoreArr.findIndex((obj) => obj.moreid === key);
      // console.log(FindObj.id);
      this.MoreArr.splice(FindObj_i, 1);
    }
  },
  setup() {
    return {
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