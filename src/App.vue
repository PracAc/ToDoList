<template>
  <router-view />
</template>

<script>
import { defineComponent } from 'vue';
// 동기화페이지 컴포넌트 가져옴
// import indexPage from '@/pages/indexPage';
// 파이어베이스에서 oTodosinDB 객체 변수 가져옴
import { oTodosinDB } from '/src/datasources/firebase';
// 파이어스토어 모듈객체 가져오기
import { doc, setDoc } from "firebase/firestore";

export default defineComponent({
  name: 'App',
  // components: { 'indexPage': indexPage },
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
    // setDoc(db, 'doc', 'id') 할 일 제목, 완료, 수정모드 상태값을 DB에 저장
    fnSubmitTodo() {
      setDoc(doc(oTodosinDB), {
        todo_title: this.sTodoTitle,
        b_completed: false,
        b_edit: false
      });
      this.sTodoTitle = '';
    }
  }
});
</script>
