// 디렉토리 캡슐화를 통해 app.ts에 두 파일에서 보내는 export를 모두 하나의 import로 엮어줌.
export { default as NewsDetailView} from './news-detail-view';
export { default as NewsFeedView} from './news-feed-view';