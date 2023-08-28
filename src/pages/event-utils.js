let eventGuid = 0;

// 파이어베이스 앱 객체 모듈 가져오기
import { database, oTodosinDB } from 'src/boot/firebase';
import { doc, collection, getDocs } from "firebase/firestore";

export async function INITIAL_EVENTS() {
    const todoTextList = [];
    let querySnapshot = await getDocs(oTodosinDB);
    querySnapshot.forEach((doc) => {
        let ResetEnd = new Date(doc.data().end);
        ResetEnd = new Date(ResetEnd.setDate(ResetEnd.getDate() + 1));
        ResetEnd = ResetEnd.toISOString().slice(0, 10);
        todoTextList.push({
            id: doc.data().id,
            title: doc.data().title,
            start: doc.data().start,
            end: ResetEnd,
            allDay: doc.data().allDay,
        }); // DB정보 배열로 가져오기
        eventGuid = doc.data().id;
    });
    return todoTextList;
};
export function createEventId() {
    return String(eventGuid++);
}


