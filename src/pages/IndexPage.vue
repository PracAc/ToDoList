<template>
  <FullCalendar id="Cal" ref="fullCalendar" :options="calendarOptions">
  </FullCalendar>

  <!-- 일정등록 -->
  <q-dialog v-model="AddPlan" full-width>
    <q-card class="ModalCard">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-blue-5">일정 추가하기</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-input v-model="Ptitle" :rules="[ChkNull]" outlined dense hint="* 필수 입력" label="제목" />
        <q-input type="date" :rules="[ChkDate]" v-model="StartDay" dense label="시작날짜" />
        <q-input type="date" :rules="[ChkDate]" v-model="EndDay" dense label="끝나는날짜" />
        <q-toggle v-model="AddMoreObj" label="추가항목(상세일정, 지출기록) 설정" />

        <q-list v-for="Mitem in this.MoreArr" :key=Mitem.key bordered class="q-pa-sm q-mb-sm" group="somegroup">
          <q-input dense v-model="Mitem.moretitle" :rules="[MoreExpandBtnOpt(Mitem)]" :disable="!AddMoreObj" label="항목명"
            hint="상세설정">
            <template v-slot:after>
              <q-btn v-if="Mitem.moretitle === ''" round flat color="blue-5" disable icon="keyboard_arrow_down"
                @click="Mitem.morechk = !Mitem.morechk" />
              <q-btn v-else round flat color="blue-5" :disable="!AddMoreObj"
                :icon="Mitem.morechk ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
                @click="Mitem.morechk = !Mitem.morechk" />
              <q-btn round flat icon="remove" color="red-4" :disable="!AddMoreObj" @click="DelMore(Mitem.moreid)" />
            </template>
          </q-input>

          <q-slide-transition v-if="AddMoreObj === true" v-show="Mitem.morechk">
            <div>
              <q-input dense type="text" :rules="[ChkPrice]" v-model="Mitem.moreprice" label="사용금액" />
              <q-input dense type="text" v-model="Mitem.moredescription" label="설명" />
            </div>
          </q-slide-transition>
        </q-list>

        <q-input outlined dense v-show="AddMoreObj" v-model="MoreTitle" label="항목명">
          <template v-slot:after>
            <q-btn round flat icon="add" color="blue-5" @click="CreateMore" />
          </template>
        </q-input>
      </q-card-section>

      <q-btn-group spread class="q-mt-sm">
        <q-btn label="등록하기" color="blue-6" :disable="ChkInsertBtn" @click="CreatePlan"></q-btn>
      </q-btn-group>
    </q-card>
  </q-dialog>

  <!-- 일정수정,삭제 -->
  <q-dialog v-model="Chkplan" full-width>
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
        <q-expansion-item dense class="q-mb-sm q-pa-xs itemBorder" v-show="ShowList" v-for="Mitem in this.MoreArr"
          :label="Mitem.moretitle" :key=Mitem.key group="MoreOptGroup" caption="상세 보기">
          <q-card>
            <q-card-section class="q-pt-none">
              <q-input dense v-model="Mitem.moreprice" :readonly="MoreListChk" type="text" label="사용금액" />
              <q-input dense v-model="Mitem.moredescription" :readonly="MoreListChk" type="text" label="설명" />
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
        <q-input v-model="Ptitle" :rules="[ChkNull]" outlined dense hint="* 필수 입력" label="제목" />
        <q-input type="date" v-model="StartDay" label="시작날짜" />
        <q-input type="date" v-model="EndDay" label="끝나는날짜" />
        <q-toggle :label="`추가항목 설정`" v-model="AddMoreObj" />

        <q-list v-for="Mitem in this.MoreArr" :key=Mitem.key bordered class="q-pa-sm q-mb-sm" group="somegroup">
          <q-input dense v-model="Mitem.moretitle" :readonly="!AddMoreObj" label="항목명" hint="상세설정">
            <template v-slot:after>
              <q-btn round flat color="blue-5" :icon="Mitem.morechk ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
                @click="Mitem.morechk = !Mitem.morechk" />
              <q-btn round flat icon="remove" color="red-4" :disable="!AddMoreObj" @click="DelMore(Mitem.moreid)" />
            </template>
          </q-input>

          <q-slide-transition v-show="Mitem.morechk">
            <div>
              <q-input dense :readonly="!AddMoreObj" type="text" v-model="Mitem.moredescription" label="사용금액" />
              <q-input dense :readonly="!AddMoreObj" type="text" v-model="Mitem.moreprice" label="설명" />
            </div>
          </q-slide-transition>
        </q-list>

        <q-input outlined dense v-show="AddMoreObj" v-model="MoreTitle" label="항목명">
          <template v-slot:after>
            <q-btn round flat icon="add" color="blue-5" @click="CreateMore" />
          </template>
        </q-input>
      </q-card-section>

      <q-btn-group spread class="q-mt-sm">
        <q-btn label="수정완료" color="blue-6" :disable="ChkInsertBtn" @click="ModifyPlan" />
      </q-btn-group>
    </q-card>
  </q-dialog>

  <!-- 삭제 prompt -->
  <q-dialog v-model="ConDel" persistent>
    <q-card>
      <q-card-section class="row items-center">
        <span><span class="text-red-5">{{ this.Ptitle }}</span> 일정을 정말 삭제하시겠습니까?</span>
      </q-card-section>

      <q-card-actions>
        <q-btn flat label="취소" color="primary" v-close-popup />
        <q-btn flat label="삭제" color="red-5" v-close-popup @click="DelPlan(true)" />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog v-model="ErrorChkNum" persistent>
    <q-card>
      <q-card-section class="row items-center">
        <span>금액입력이 잘못되었습니다</span>
      </q-card-section>

      <q-card-actions>
        <q-btn flat label="확인" color="primary" v-close-popup />
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
import { doc, deleteDoc, updateDoc, setDoc, deleteField } from "firebase/firestore";


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
        dateClick: this.handleDateSelect,
        height: 'auto',
      },
      oTodos: [],

      // 모달 설정변수
      AddPlan: ref(false),
      Chkplan: ref(false),
      ConDel: ref(false),
      MoreOpt: ref(false),
      AddMoreObj: ref(false),

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
      MoreListChk: ref(false),

      ChkInsertBtn: ref(true),
      ChkExpandObjBtn: ref(true),
      ErrorChkNum: ref(false)
    };
  },
  firestore: { oTodos: oTodosinDB },
  methods: {
    FormInit() {
      // 값 초기화
      this.ConDescription = '';
      this.Price = '';
      this.MoreOpt = false;
      this.MoreListChk = false;
      this.Ptitle = '';
      this.StartDay = '';
      this.EndDay = '';
      this.FindId = '';
      this.Info = '';
      this.ChkInsertBtn = false;

      // 추가항목 초기화
      this.AddMoreObj = false;
      this.MoreArr = [];
      this.MoreTitle = '';
      this.MoreIncrease = 0;
      this.ShowList = false;
    },
    // 캘린더 이벤트 함수
    handleDateSelect(selectInfo) {
      this.FormInit();
      // 값초기화

      this.StartDay = selectInfo.startStr;
      if (selectInfo.endStr !== undefined) {
        this.EndDay = this.DateInit(selectInfo.endStr);
      } else { this.EndDay = undefined; }
      this.Info = selectInfo;
      this.ChkInsertBtn = true;
      // 모달 show
      this.AddPlan = true;
    },

    handleEventClick(clickInfo) {
      this.FormInit();
      // 모달 show
      this.Chkplan = true;
      this.ModifyChk = true;
      this.MoreOpt = false;

      this.Ptitle = clickInfo.event.title;
      this.FindId = clickInfo.event.id;
      this.Info = clickInfo;

      // filter 사용해서해당 db값 otdos에서가져오기
      let FindTodo = this.oTodos.filter((item) => item.id === clickInfo.event.id);
      this.StartDay = FindTodo[0].start;
      this.EndDay = FindTodo[0].end;

      if (FindTodo[0].morelist.length > 0) {
        for (let i = 0; i < FindTodo[0].morelist.length; i++) {
          if (FindTodo[0].morelist[i].moretitle !== '') {
            this.MoreArr.push(FindTodo[0].morelist[i]);
          }
        }
        updateDoc(doc(database, 'Lists', this.FindId), {
          morelist: deleteField()
        });
        updateDoc(doc(database, 'Lists', this.FindId), {
          morelist: this.MoreArr,
          // dropdown초기화
          morechk: false
        });

        // toggle버튼 생성여부
        this.MoreListChk = true;

        // morelist 마지막 id이어서 생성받기위한 설정
        this.MoreIncrease = this.MoreArr[this.MoreArr.length - 1].moreid;

        this.MoreArr.morechk = false;

      } else {
        this.MoreListChk = false;
      }
    },
    // 끝나는 날짜 재설정함수
    DateInit(endStr) {
      let EndDateInit = new Date(endStr);
      EndDateInit = new Date(EndDateInit.setDate(EndDateInit.getDate() - 1));
      EndDateInit = EndDateInit.toISOString().slice(0, 10);
      return EndDateInit;
    },
    DateInitPlus(endStr) {
      let ResetEnd = new Date(endStr);
      ResetEnd = new Date(ResetEnd.setDate(ResetEnd.getDate() + 1));
      ResetEnd = ResetEnd.toISOString().slice(0, 10);
      return ResetEnd;
    },

    // 버튼이벤트 함수
    CreatePlan() {
      let calendarApi = this.Info.view.calendar;
      let subject = this.Ptitle;

      // 자동증가값(숫자) PK
      let Pkey = createEventId();
      console.log(Pkey);

      let numReg = /^[0-9]+$/;
      for (let item of this.MoreArr) {
        if (item.moreprice === '') {
        } else {
          if (numReg.test(item.moreprice) === false) {
            this.ErrorChkNum = true;
            return;
          }
        }
        // break;
      }

      if (subject !== '' || this.EndDay !== undefined || this.StartDay !== undefined) {
        // 캘린더 이벤트추가
        let ResetEnd = '';
        ResetEnd = this.DateInitPlus(this.EndDay);

        calendarApi.addEvent({
          id: Pkey,
          title: subject,
          start: this.StartDay,
          end: ResetEnd,
          allDay: true,
        });
        // firebase 데이터저장
        this.ToDoSave(Pkey);
        this.MoreArr = [];

        // 모달 닫기
        this.AddPlan = false;
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

      let ResetEnd = this.DateInitPlus(this.EndDay);
      calendarApi.addEvent({
        id: this.FindId,
        title: this.Ptitle,
        start: this.StartDay,
        end: ResetEnd,
        allDay: true,
      });
      this.ToDoUpdate(this.FindId);

      this.Chkplan = false;
    },

    // firebase 저장,삭제,수정 함수
    ToDoSave(Pkey) {
      let primary = Pkey;
      if (this.AddMoreObj === true) {
        // let Nullchk = false
        for (let moreitem in this.MoreArr) {
          if (moreitem.moretitle === '') {
            this.DelMore(moreitem.id);
            continue;
          }
        }
        setDoc(doc(database, 'Lists', primary), {
          id: primary,
          title: this.Ptitle,
          start: this.StartDay,
          end: this.EndDay,
          allDay: true,
          important: false,
          finishChk: false,
          morelist: this.MoreArr
        });
      } else {
        setDoc(doc(database, 'Lists', primary), {
          id: primary,
          title: this.Ptitle,
          start: this.StartDay,
          end: this.EndDay,
          allDay: true,
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
      if (this.AddMoreObj === true) {
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
      if (this.AddMoreObj === true && this.MoreTitle !== '') {
        if (this.MoreArr.length > 0) {
          this.MoreArr.push(
            {
              moreid: this.MoreIncrease,
              moretitle: this.MoreTitle,
              moreprice: '',
              moredescription: '',
              morechk: false,
            });
        } else {
          this.MoreArr.push(
            {
              moreid: this.MoreIncrease,
              moretitle: this.MoreTitle,
              moreprice: '',
              moredescription: '',
              morechk: true,
            });
        }
        this.MoreTitle = '';
        this.MoreIncrease = this.MoreIncrease + 1;
      }
    },
    // 추가항목 삭제함수
    DelMore(key) {
      let FindObj_i = this.MoreArr.findIndex((obj) => obj.moreid === key);
      this.MoreArr.splice(FindObj_i, 1);
    },
    ChkNull(val) {
      return new Promise((resolve, reject) => {
        if (val === '' && this.Ptitle === '' || this.StartDay === undefined || this.EndDay === undefined) {
          this.ChkInsertBtn = true;
        } else {
          this.ChkInsertBtn = false;
        }
        resolve(!!val || '* 입력해주세요.');
      });
    },
    ChkDate(val) {
      return new Promise((resolve, reject) => {
        if (this.StartDay === undefined || this.EndDay === undefined || this.Ptitle === '') {
          this.ChkInsertBtn = true;
        } else {
          this.ChkInsertBtn = false;
        }
        resolve(!!val || '* 입력해주세요.');
      });
    },
    ChkPrice(val) {
      let numReg = /^[0-9]+$/g;

      let num = null;
      num = numReg.test(val);
    },

    // 상세보기버튼 아이콘설정
    MoreExpandBtnOpt(itemArr) {
      if (itemArr.moretitle === '') {
        itemArr.morechk = false;
      }
      if (this.AddMoreObj === false) {
        itemArr.morechk = false;
      }
    },
  },
  setup() {
    let Calen = document.querySelector('#Cal');
    return {
      Calen
    };
  },
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

