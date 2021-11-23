import Router from './core/router';
import { NewsDetailView, NewsFeedView } from './page';
import { Store } from './types';

const store: Store = {
	currentPage: 1,
	feeds: [],
}

// 전역 객체 window(브라우저의 최상위 객체)에 타입을 선언.
declare global {
	interface Window {
		store: Store;
	}
}
// 선언한 전역객체에 값을 추가.
window.store = store;

const router : Router = new Router();
const newsFeedView = new NewsFeedView('root');
const newsDetailView = new NewsDetailView('root');

// 페이지 구성과 구현
router.setDefaultPage(newsFeedView); //초기 페이지 설정으로 router에서 인자가 없을 때 구현할 초기 페이지

router.addRoutePath('/page/', newsFeedView); // hash 값에 page가 있을 때엔 newsFeedView를 출력할 수 있도록 페이지 출력 설정
router.addRoutePath('/show/', newsDetailView); // hash 값에 show가 있을 때엔 newsDetailView를 출력할 수 있도록 페이지 출력 설정

router.route();