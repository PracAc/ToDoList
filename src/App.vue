<template>
  <router-view />
</template>

<script>
import { defineComponent } from 'vue';
// 파이어베이스에서 oTodosinDB 객체 변수 가져옴
import { oTodosinDB } from 'src/datasources/firebase';

export default defineComponent({
  name: 'App',
  data() {
    return {
      oTodos: [], // 할일 데이터 목록 저장 변수
      sTodoTitle: '' // 할 일 제목 저장 문자열 변수
    };
  },
  // firestore를 쉽게 사용하도록 oTodos 변수로 변경
  firestore: {
    oTodos: oTodosinDB
  },
  methods: {

  }
});
</script>
