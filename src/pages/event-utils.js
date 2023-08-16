let eventGuid = 0;
let todayStr = new Date().toISOString().replace(/T.*$/, ''); // YYYY-MM-DD of today
// 파이어베이스 앱 객체 모듈 가져오기
import { initializeApp } from "firebase/app";
// 파이어스토어 객체 변수 가져오기
import { getFirestore, collection } from 'firebase/firestore';

export const INITIAL_EVENTS = [
    {
        id: createEventId(),
        title: 'All-day event',
        start: todayStr
    },
    {
        id: createEventId(),
        title: 'Timed event',
        start: todayStr + 'T12:00:00'
    }
];

export function createEventId() {
    console.log(todayStr);
    return String(eventGuid++);
}
