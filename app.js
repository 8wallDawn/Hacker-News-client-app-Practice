const container = document.getElementById('root')
const ajax = new XMLHttpRequest();
const content = document.createElement('div');
const NEWS_URL = 'https://api.hnpwa.com/v0/news/1.json'
const CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json';
const store = {
	currentPage: 1
}
function getData(url) {
	ajax.open('GET', url, false) // 데이터를 동기적으로 가져오겠다.
	ajax.send(); // 데이터를 가져온다.

	return JSON.parse(ajax.response);
}

function newsFeed() {
	const newsFeed = getData(NEWS_URL);
	const newsList = [];
	const maxPage = newsFeed.length%10 === 0 ? newsFeed.length/10 : newsFeed.length/10+1;

	let template = `
		<div class="container mx-auto p-4">
			<h1>Hacker News</h1>
			<ul>
				{{__news_feed__}}
			</ul>
			<div>
				<a href="#/page/{{__prev_page__}}">이전 페이지</a>
				<a href="#/page/{{__next_page__}}">다음 페이지</a>
			</div>
		</div>
	`

	for(let i = (store.currentPage -1) * 10; i < store.currentPage*10; ++i) {
		newsList.push(`
			<li>
				<a href='#/show/${newsFeed[i].id}'>
					${newsFeed[i].title} (${newsFeed[i].comments_count})
				</a>
			</li>
		`)
	};
	template = template.replace('{{__news_feed__}}', newsList.join(''))
	template = template.replace('{{__prev_page__}}', store.currentPage > 1 ? store.currentPage-1 : 1)
	template = template.replace('{{__next_page__}}', store.currentPage !== maxPage ? store.currentPage+1 : maxPage)
	container.innerHTML = template;
}

function newsDetail() {
	// console.log('해시가 변경되었습니다.')
	// console.log(this.location) url 주소에 대한 정보로 hash에 대한 값을 추출 가능.
	const id = location.hash.substr(7) // #으로 시작하는 해쉬값에서 #을 제거하여 id 값만을 순수하게 추출하여 저장
	const newsContent = getData(CONTENT_URL.replace('@id', id));

	container.innerHTML = `<h1>${newsContent.title}</h1><div><a href='#/page/${store.currentPage}'>목록으로</div>`;
}


// 해쉬값에 따라 어떤 함수를 실행하여 사용자에게 제공할 것인지리를 판단하는 함수.
// 화면 전환의 주요 쟁점
function router() {
	const routePath = location.hash;
	// console.log(routePath); // #/page/(number)

	if (routePath === '') {
		newsFeed();
	} else if(routePath.indexOf('#/page/') >= 0){
		store.currentPage = +routePath.substr(7);
		newsFeed();
	} else {
		newsDetail();
	}
}

window.addEventListener('hashchange', router);

router();