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
</template>
<script>
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { INITIAL_EVENTS, createEventId } from './event-utils';
import { ref } from 'vue';

const PCalendar = document.querySelector('#PFC');

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
        initialEvents: INITIAL_EVENTS,
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
  methods: {
    handleDateClick: function (arg) {
      console.log(arg);
    },
    handleDateSelect(selectInfo) {
      // 나중에 날짜 계산디테일 필요시
      // let Pday = new Date(selectInfo.endStr);
      // Pday = new Date(Pday.setDate(Pday.getDate() - 1));
      // Pday = Pday.toISOString().slice(0, 10);

      this.StartDay = selectInfo.startStr;
      this.EndDay = selectInfo.endStr;

      this.Info = selectInfo;
      this.icon = true;
      console.log();
    },
    handleEventClick(clickInfo) {
      if (confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'`)) {
        clickInfo.event.remove();
      }
    },
    CreatePlan() {
      let calendarApi = this.Info.view.calendar;
      // calendarApi = calendarApi.view.calendar;

      let subject = this.Ptitle;
      if (subject === null || subject === '') {
        // input 입력하라는 조건
      }
      else {
        calendarApi.addEvent({
          // id: createEventId(),
          title: subject,
          start: this.StartDay,
          end: this.EndDay,
          allDay: true,
          editable: true,
        });
        this.Ptitle = '';
        this.icon = false;
      }
    },
  },

  setup() {
    let icon = ref(false);
    let StartDay = ref('');
    let EndDay = ref('');
    let Info = ref('');
    let Ptitle = ref(null);
    return {
      icon, StartDay, EndDay, Ptitle, Info
    };
  }
};
</script>