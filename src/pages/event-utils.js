let eventGuid = 0;
let todayStr = new Date().toISOString().replace(/T.*$/, ''); // YYYY-MM-DD of today
// 파이어베이스 앱 객체 모듈 가져오기
import { database, oTodosinDB } from 'src/datasources/firebase';
import { doc, collection, getDocs } from "firebase/firestore";
// let PEvents = [];
// let GetEvent = async function () {
//     let querySnapshot = await getDocs(oTodosinDB);
//     querySnapshot.forEach((doc) => {
//         PEvents.push(doc.data());
//         // console.log(doc.data());
//         return PEvents;
//     });
// };
// GetEvent();
// export const INITIAL_EVENTS = PEvents;
// export const INITIAL_EVENTS = [
//     {
//         id: createEventId(),
//         title: 'All-day event',
//         start: todayStr
//     },
//     {
//         id: createEventId(),
//         title: 'Timed event',
//         start: todayStr + 'T12:00:00'
//     }
//     // {
//     //     id: createEventId(),
//     //     title: oTodos[1].title,
//     //     start: todayStr + 'T12:00:00'
// end:
//     // }
// ];
// console.log(PEvents);
// console.log(INITIAL_EVENTS);

export function createEventId() {
    console.log();
    return String(eventGuid++);
}


