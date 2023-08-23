// 파이어베이스 앱 객체 모듈 가져오기
import { initializeApp } from "firebase/app";
// 파이어스토어 객체 변수 가져오기
import { getFirestore, collection } from 'firebase/firestore';


// app.use(VueFire, { modules: [VueFireFirestoreOptionsAPI(options)] });

// 파이어베이스 DB를 초기화하고 연결
const oDB = initializeApp({
  apiKey: "AIzaSyDN_HCT-3LRzAb0KzH6pLtR7tlQTadUaiE",
  authDomain: "neural-proton-391703.firebaseapp.com",
  projectId: "neural-proton-391703",
  storageBucket: "neural-proton-391703.appspot.com",
  messagingSenderId: "813702590765",
  appId: "1:813702590765:web:88042544dac9fe9724e3a4"
  // 파이어베이스 콘솔에서 복사하여 붙여넣기
});
// 파이어베이스 DB객체 중에서 todos 항목을 다른 곳에서 oTodosinDB로 사용하도록 내보내기
export const database = getFirestore(oDB);
export const oTodosinDB = collection(database, 'Lists');
